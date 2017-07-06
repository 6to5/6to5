import { expect } from "chai";
import fs from "fs";
import path from "path";
import decache from "decache";

const testCacheFilename = path.join(__dirname, ".babel");
const oldBabelDisableCacheValue = process.env.BABEL_DISABLE_CACHE;

process.env.BABEL_CACHE_PATH = testCacheFilename;
delete process.env.BABEL_DISABLE_CACHE;

function writeCache(data) {
  if (typeof data === "object") {
    data = JSON.stringify(data);
  }

  fs.writeFileSync(testCacheFilename, data);
}

function cleanCache() {
  try {
    fs.unlinkSync(testCacheFilename);
  } catch (e) {
    // It is convenient to always try to clear
  }
}

function resetCache() {
  process.env.BABEL_CACHE_PATH = null;
  process.env.BABEL_DISABLE_CACHE = oldBabelDisableCacheValue;
}

describe("babel register", () => {
  describe("cache", () => {
    let load, get, save;

    beforeEach(() => {
      // Since lib/cache is a singleton we need to fully reload it
      decache("../lib/cache");
      const cache = require("../lib/cache");

      load = cache.load;
      get = cache.get;
      save = cache.save;
    });

    afterEach(cleanCache);
    after(resetCache);

    it("should load and get cached data", () => {
      writeCache({ foo: "bar" });

      load();

      expect(get()).to.be.an("object");
      expect(get()).to.deep.equal({ foo: "bar" });
    });

    it("should load and get an object with no cached data", () => {
      load();

      expect(get()).to.be.an("object");
      expect(get()).to.deep.equal({});
    });

    it("should load and get an object with invalid cached data", () => {
      writeCache("foobar");

      load();

      expect(get()).to.be.an("object");
      expect(get()).to.deep.equal({});
    });

    it("should create the cache on save", () => {
      save();

      expect(fs.existsSync(testCacheFilename)).to.be.true;
      expect(get()).to.deep.equal({});
    });
  });
});
