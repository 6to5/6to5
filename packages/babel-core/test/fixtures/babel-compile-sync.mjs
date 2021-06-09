#!/usr/bin/env node

// Usage:
// babel-compile-async.js [filename]
import { transformSync } from "../../lib/index.js";

process.stdout.write(JSON.stringify(transformSync("")));
