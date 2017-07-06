import type SourceMap from "./source-map";
import trimRight from "trim-right";

const SPACES_RE = /^[ \t]+$/;

/**
 * The Buffer class exists to manage the queue of tokens being pushed onto the output string
 * in such a way that the final string buffer is treated as write-only until the final .get()
 * call. This allows V8 to optimize the output efficiently by not requiring it to store the
 * string in contiguous memory.
 */

export default class Buffer {
  constructor(map: ?SourceMap) {
    this._map = map;
  }

  _map: SourceMap = null;
  _buf: Array = [];
  _last: string = "";
  _queue: Array = [];

  _position: Object = {
    line: 1,
    column: 0,
  };
  _sourcePosition: Object = {
    identifierName: null,
    line: null,
    column: null,
    filename: null,
  };

  /**
   * Get the final string output from the buffer, along with the sourcemap if one exists.
   */

  get(): Object {
    this._flush();

    const map = this._map;
    const result = {
      // Whatever trim is used here should not execute a regex against the
      // source string since it may be arbitrarily large after all transformations
      code: trimRight(this._buf.join("")),
      map: null,
      rawMappings: map && map.getRawMappings(),
    };

    if (map) {
      // The `.map` property is lazy to allow callers to use the raw mappings
      // without any overhead
      Object.defineProperty(result, "map", {
        configurable: true,
        enumerable: true,
        get() {
          return (this.map = map.get());
        },
        set(value) {
          Object.defineProperty(this, "map", { value, writable: true });
        },
      });
    }

    return result;
  }

  /**
   * Add a string to the buffer that cannot be reverted.
   */

  append(str: string): void {
    this._flush();
    const { line, column, filename, identifierName } = this._sourcePosition;
    this._append(str, line, column, identifierName, filename);
  }

  /**
   * Add a string to the buffer than can be reverted.
   */

  queue(str: string): void {
    // Drop trailing spaces when a newline is inserted.
    if (str === "\n") {
      while (this._queue.length > 0 && SPACES_RE.test(this._queue[0][0])) {
        this._queue.shift();
      }
    }

    const { line, column, filename, identifierName } = this._sourcePosition;
    this._queue.unshift([str, line, column, identifierName, filename]);
  }

  _flush(): void {
    let item;
    while ((item = this._queue.pop())) this._append(...item);
  }

  _append(
    str: string,
    line: number,
    column: number,
    identifierName: ?string,
    filename: ?string,
  ): void {
    // If there the line is ending, adding a new mapping marker is redundant
    if (this._map && str[0] !== "\n") {
      this._map.mark(
        this._position.line,
        this._position.column,
        line,
        column,
        identifierName,
        filename,
      );
    }

    this._buf.push(str);
    this._last = str[str.length - 1];

    for (let i = 0; i < str.length; i++) {
      if (str[i] === "\n") {
        this._position.line++;
        this._position.column = 0;
      } else {
        this._position.column++;
      }
    }
  }

  removeTrailingNewline(): void {
    if (this._queue.length > 0 && this._queue[0][0] === "\n") {
      this._queue.shift();
    }
  }

  removeLastSemicolon(): void {
    if (this._queue.length > 0 && this._queue[0][0] === ";") {
      this._queue.shift();
    }
  }

  endsWith(suffix: string): boolean {
    // Fast path to avoid iterating over this._queue.
    if (suffix.length === 1) {
      let last;
      if (this._queue.length > 0) {
        const str = this._queue[0][0];
        last = str[str.length - 1];
      } else {
        last = this._last;
      }

      return last === suffix;
    }

    const end =
      this._last + this._queue.reduce((acc, item) => item[0] + acc, "");
    if (suffix.length <= end.length) {
      return end.slice(-suffix.length) === suffix;
    }

    // We assume that everything being matched is at most a single token plus some whitespace,
    // which everything currently is, but otherwise we'd have to expand _last or check _buf.
    return false;
  }

  hasContent(): boolean {
    return this._queue.length > 0 || !!this._last;
  }

  /**
   * Sets a given position as the current source location so generated code after this call
   * will be given this position in the sourcemap.
   */

  source(prop: string, loc: Location): void {
    if (prop && !loc) return;

    const pos = loc ? loc[prop] : null;

    this._sourcePosition.identifierName = (loc && loc.identifierName) || null;
    this._sourcePosition.line = pos ? pos.line : null;
    this._sourcePosition.column = pos ? pos.column : null;
    this._sourcePosition.filename = (loc && loc.filename) || null;
  }

  /**
   * Call a callback with a specific source location and restore on completion.
   */

  withSource(prop: string, loc: Location, cb: () => void): void {
    if (!this._map) return cb();

    // Use the call stack to manage a stack of "source location" data.
    const originalLine = this._sourcePosition.line;
    const originalColumn = this._sourcePosition.column;
    const originalFilename = this._sourcePosition.filename;
    const originalIdentifierName = this._sourcePosition.identifierName;

    this.source(prop, loc);

    cb();

    this._sourcePosition.line = originalLine;
    this._sourcePosition.column = originalColumn;
    this._sourcePosition.filename = originalFilename;
    this._sourcePosition.identifierName = originalIdentifierName;
  }

  getCurrentColumn(): number {
    const extra = this._queue.reduce((acc, item) => item[0] + acc, "");
    const lastIndex = extra.lastIndexOf("\n");

    return lastIndex === -1
      ? this._position.column + extra.length
      : extra.length - 1 - lastIndex;
  }

  getCurrentLine(): number {
    const extra = this._queue.reduce((acc, item) => item[0] + acc, "");

    let count = 0;
    for (let i = 0; i < extra.length; i++) {
      if (extra[i] === "\n") count++;
    }

    return this._position.line + count;
  }
}
