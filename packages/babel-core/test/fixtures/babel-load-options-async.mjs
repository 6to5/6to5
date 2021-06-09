#!/usr/bin/env node

// Usage:
// babel-load-options-async.js [filename]
import { loadOptionsAsync } from "../../lib/index.js";

const [, , filename, cwd] = process.argv;

(async () => {
  process.stdout.write(
    JSON.stringify(await loadOptionsAsync({ filename, cwd }))
  );
})();
