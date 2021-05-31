type SourceMap = any;
import sourceMap from "source-map-js";

export default function mergeSourceMap(
  inputMap: SourceMap,
  map: SourceMap,
): SourceMap {
  const input = buildMappingData(inputMap);
  const output = buildMappingData(map);

  const mergedGenerator = new sourceMap.SourceMapGenerator();
  for (const { source } of input.sources) {
    if (typeof source.content === "string") {
      mergedGenerator.setSourceContent(source.path, source.content);
    }
  }

  if (output.sources.length === 1) {
    const defaultSource = output.sources[0];

    const insertedMappings = new Map();

    // Process each generated range in the input map, e.g. each range over the
    // code that Babel was originally given.
    eachInputGeneratedRange(input, (generated, original, source) => {
      // Then pick out each range over Babel's _output_ that corresponds with
      // the given range on the code given to Babel.
      eachOverlappingGeneratedOutputRange(defaultSource, generated, item => {
        // It's possible that multiple input ranges will overlap the same
        // generated range. Since sourcemap don't traditionally represent
        // generated locations with multiple original locations, we explicitly
        // skip generated locations once we've seen them the first time.
        const key = makeMappingKey(item);
        if (insertedMappings.has(key)) return;
        insertedMappings.set(key, item);

        mergedGenerator.addMapping({
          source: source.path,
          original: {
            line: original.line,
            column: original.columnStart,
          },
          generated: {
            line: item.line,
            column: item.columnStart,
          },
          name: original.name,
        });
      });
    });

    // Since mappings are manipulated using single locations, but are interpreted
    // as ranges, the insertions above may not actually have their ending
    // locations mapped yet. Here be go through each one and ensure that it has
    // a well-defined ending location, if one wasn't already created by the start
    // of a different range.
    for (const item of insertedMappings.values()) {
      if (item.columnEnd === Infinity) {
        continue;
      }

      const clearItem = {
        line: item.line,
        columnStart: item.columnEnd,
      };

      const key = makeMappingKey(clearItem);
      if (insertedMappings.has(key)) {
        continue;
      }

      // Insert mappings with no original position to terminate any mappings
      // that were found above, so that they don't expand beyond their correct
      // range.
      // @ts-expect-error todo(flow->ts) original and source field are missing
      mergedGenerator.addMapping({
        generated: {
          line: clearItem.line,
          column: clearItem.columnStart,
        },
      });
    }
  }

  const result = mergedGenerator.toJSON();
  // addMapping expects a relative path, and setSourceContent expects an
  // absolute path. To avoid this whole confusion, we leave the root out
  // entirely, and add it at the end here.
  if (typeof input.sourceRoot === "string") {
    result.sourceRoot = input.sourceRoot;
  }
  return result;
}

function makeMappingKey(item: { line: number; columnStart: number }) {
  return `${item.line}/${item.columnStart}`;
}

function eachOverlappingGeneratedOutputRange(
  outputFile: ResolvedFileMappings,
  inputGeneratedRange: ResolvedGeneratedRange,
  callback: (range: ResolvedGeneratedRange) => unknown,
) {
  // Find the Babel-generated mappings that overlap with this range in the
  // input sourcemap. Generated locations within the input sourcemap
  // correspond with the original locations in the map Babel generates.
  const overlappingOriginal = filterApplicableOriginalRanges(
    outputFile,
    inputGeneratedRange,
  );

  for (const { generated } of overlappingOriginal) {
    for (const item of generated) {
      callback(item);
    }
  }
}

function filterApplicableOriginalRanges(
  { mappings }: ResolvedFileMappings,
  { line, columnStart, columnEnd }: ResolvedGeneratedRange,
): OriginalMappings {
  // The mapping array is sorted by original location, so we can
  // binary-search it for the overlapping ranges.
  return filterSortedArray(mappings, ({ original: outOriginal }) => {
    if (line > outOriginal.line) return -1;
    if (line < outOriginal.line) return 1;

    if (columnStart >= outOriginal.columnEnd) return -1;
    if (columnEnd <= outOriginal.columnStart) return 1;

    return 0;
  });
}

function eachInputGeneratedRange(
  map: ResolvedMappings,
  callback: (
    c: ResolvedGeneratedRange,
    b: ResolvedOriginalRange,
    a: ResolvedSource,
  ) => unknown,
) {
  for (const { source, mappings } of map.sources) {
    for (const { original, generated } of mappings) {
      for (const item of generated) {
        callback(item, original, source);
      }
    }
  }
}

type ResolvedMappings = {
  file: string | undefined | null;
  sourceRoot: string | undefined | null;
  sources: Array<ResolvedFileMappings>;
};

type ResolvedFileMappings = {
  source: ResolvedSource;
  mappings: OriginalMappings;
};

type OriginalMappings = Array<{
  original: ResolvedOriginalRange;
  generated: Array<ResolvedGeneratedRange>;
}>;

type ResolvedSource = {
  path: string;
  content: string | null;
};

type ResolvedOriginalRange = {
  line: number;
  columnStart: number;
  columnEnd: number;
  name: string | null;
};

type ResolvedGeneratedRange = {
  line: number;
  columnStart: number;
  columnEnd: number;
};

function buildMappingData(map: SourceMap): ResolvedMappings {
  const consumer = new sourceMap.SourceMapConsumer({
    ...map,

    // This is a bit hack. .addMapping expects source values to be relative,
    // but eachMapping returns mappings with absolute paths. To avoid that
    // incompatibility, we leave the sourceRoot out here and add it to the
    // final map at the end instead.
    sourceRoot: null,
  });

  const sources = new Map();
  const mappings = new Map();

  let last = null;

  consumer.computeColumnSpans();

  consumer.eachMapping(
    m => {
      if (m.originalLine === null) return;

      let source = sources.get(m.source);
      if (!source) {
        source = {
          path: m.source,
          content: consumer.sourceContentFor(m.source, true),
        };
        sources.set(m.source, source);
      }

      let sourceData = mappings.get(source);
      if (!sourceData) {
        sourceData = {
          source,
          mappings: [],
        };
        mappings.set(source, sourceData);
      }

      const obj = {
        line: m.originalLine,
        columnStart: m.originalColumn,
        columnEnd: Infinity,
        name: m.name,
      };

      if (
        last &&
        last.source === source &&
        last.mapping.line === m.originalLine
      ) {
        last.mapping.columnEnd = m.originalColumn;
      }

      last = {
        source,
        mapping: obj,
      };

      sourceData.mappings.push({
        original: obj,
        generated: consumer
          .allGeneratedPositionsFor({
            source: m.source,
            line: m.originalLine,
            column: m.originalColumn,
          })
          .map(item => ({
            line: item.line,
            columnStart: item.column,
            // source-map's lastColumn is inclusive, not exclusive, so we need
            // to add 1 to it.
            columnEnd: item.lastColumn + 1,
          })),
      });
    },
    null,
    sourceMap.SourceMapConsumer.ORIGINAL_ORDER,
  );

  return {
    file: map.file,
    sourceRoot: map.sourceRoot,
    sources: Array.from(mappings.values()),
  };
}

function findInsertionLocation<T>(
  array: Array<T>,
  callback: (item: T) => number,
): number {
  let left = 0;
  let right = array.length;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    const item = array[mid];

    const result = callback(item);
    if (result === 0) {
      left = mid;
      break;
    }
    if (result >= 0) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }

  // Ensure the value is the start of any set of matches.
  let i = left;
  if (i < array.length) {
    while (i >= 0 && callback(array[i]) >= 0) {
      i--;
    }
    return i + 1;
  }

  return i;
}

function filterSortedArray<T>(
  array: Array<T>,
  callback: (item: T) => number,
): Array<T> {
  const start = findInsertionLocation(array, callback);

  const results = [];
  for (let i = start; i < array.length && callback(array[i]) === 0; i++) {
    results.push(array[i]);
  }

  return results;
}
