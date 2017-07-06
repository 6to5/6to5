// @flow

type CacheConfigurator = CacheConfiguratorFn & CacheConfiguratorObj;

type CacheConfiguratorFn = {
  (boolean): void,
  <T>(handler: () => T): T,
};
type CacheConfiguratorObj = {
  forever: () => void,
  never: () => void,
  using: <T>(handler: () => T) => T,
  invalidate: <T>(handler: () => T) => T,
};

type CacheEntry<ResultT> = Array<[ResultT, () => boolean]>;

/**
 * Given a function with a single argument, cache its results based on its argument and how it
 * configures its caching behavior. Cached values are stored strongly.
 */
export function makeStrongCache<ArgT, ResultT>(
  handler: (ArgT, CacheConfigurator) => ResultT,
  autoPermacache?: boolean,
): ArgT => ResultT {
  return makeCachedFunction(new Map(), handler, autoPermacache);
}

/**
 * Given a function with a single argument, cache its results based on its argument and how it
 * configures its caching behavior. Cached values are stored weakly and the function argument must be
 * an object type.
 */
export function makeWeakCache<ArgT: {}, ResultT>(
  handler: (ArgT, CacheConfigurator) => ResultT,
  autoPermacache?: boolean,
): ArgT => ResultT {
  return makeCachedFunction(new WeakMap(), handler, autoPermacache);
}

type CacheMap<ArgT, ResultT> =
  | Map<ArgT, CacheEntry<ResultT>>
  | WeakMap<ArgT, CacheEntry<ResultT>>;

function makeCachedFunction<ArgT, ResultT, Cache: CacheMap<ArgT, ResultT>>(
  callCache: Cache,
  handler: (ArgT, CacheConfigurator) => ResultT,
  autoPermacache: boolean = true,
): ArgT => ResultT {
  return function cachedFunction(arg) {
    let cachedValue: CacheEntry<ResultT> | void = callCache.get(arg);

    if (cachedValue) {
      for (const [value, valid] of cachedValue) {
        if (valid()) return value;
      }
    }

    const { cache, result, deactivate } = makeCacheConfig();

    const value = handler(arg, cache);

    if (autoPermacache && !result.configured) cache.forever();

    deactivate();

    if (!result.configured) {
      // eslint-disable-next-line max-len
      throw new Error(
        [
          "Caching was left unconfigured. Babel's plugins, presets, and .babelrc.js files can be configured",
          "for various types of caching, using the first param of their handler functions:",
          "",
          "module.exports = function(api) {",
          "  // The API exposes the following:",
          "",
          "  // Cache the returned value forever and don't call this function again.",
          "  api.cache(true);",
          "",
          "  // Don't cache at all. Not recommended because it will be very slow.",
          "  api.cache(false);",
          "",
          "  // Cached based on the value of some function. If this function returns a value different from",
          "  // a previously-encountered value, the plugins will re-evaluate.",
          "  var env = api.cache(() => process.env.NODE_ENV);",
          "",
          "  // If testing for a specific env, we recommend specifics to avoid instantiating a plugin for",
          "  // any possible NODE_ENV value that might come up during plugin execution.",
          '  var isProd = api.cache(() => process.env.NODE_ENV === "production");',
          "",
          "  // .cache(fn) will perform a linear search though instances to find the matching plugin based",
          "  // based on previous instantiated plugins. If you want to recreate the plugin and discard the",
          "  // previous instance whenever something changes, you may use:",
          '  var isProd = api.cache.invalidate(() => process.env.NODE_ENV === "production");',
          "",
          "  // Note, we also expose the following more-verbose versions of the above examples:",
          "  api.cache.forever(); // api.cache(true)",
          "  api.cache.never();   // api.cache(false)",
          "  api.cache.using(fn); // api.cache(fn)",
          "",
          "  // Return the value that will be cached.",
          "  return { };",
          "};",
        ].join("\n"),
      );
    }

    if (!result.never) {
      if (result.forever) {
        cachedValue = [[value, () => true]];
      } else if (result.invalidate) {
        cachedValue = [[value, result.valid]];
      } else {
        cachedValue = cachedValue || [];
        cachedValue.push([value, result.valid]);
      }
      callCache.set(arg, cachedValue);
    }

    return value;
  };
}

function makeCacheConfig(): {
  cache: CacheConfigurator,
  result: *,
  deactivate: () => void,
} {
  const pairs = [];

  const result = {
    configured: false,
    never: false,
    forever: false,
    invalidate: false,
    valid: () => pairs.every(([key, fn]) => key === fn()),
  };

  let active = true;
  const deactivate = () => {
    active = false;
  };

  const cache: CacheConfigurator = Object.assign(
    (function cacheFn(val) {
      if (typeof val === "boolean") {
        if (val) cache.forever();
        else cache.never();
        return;
      }

      return cache.using(val);
    }: any),
    ({
      forever() {
        if (!active) {
          throw new Error(
            "Cannot change caching after evaluation has completed.",
          );
        }
        if (result.never) {
          throw new Error("Caching has already been configured with .never()");
        }
        result.forever = true;
        result.configured = true;
      },
      never() {
        if (!active) {
          throw new Error(
            "Cannot change caching after evaluation has completed.",
          );
        }
        if (result.forever) {
          throw new Error(
            "Caching has already been configured with .forever()",
          );
        }
        result.never = true;
        result.configured = true;
      },
      using<T>(handler: () => T): T {
        if (!active) {
          throw new Error(
            "Cannot change caching after evaluation has completed.",
          );
        }
        if (result.never || result.forever) {
          throw new Error(
            "Caching has already been configured with .never or .forever()",
          );
        }
        result.configured = true;

        const key = handler();
        pairs.push([key, handler]);
        return key;
      },
      invalidate<T>(handler: () => T): T {
        if (!active) {
          throw new Error(
            "Cannot change caching after evaluation has completed.",
          );
        }
        if (result.never || result.forever) {
          throw new Error(
            "Caching has already been configured with .never or .forever()",
          );
        }
        result.invalidate = true;
        result.configured = true;

        const key = handler();
        pairs.push([key, handler]);
        return key;
      },
    }: CacheConfiguratorObj),
  );

  return { cache, result, deactivate };
}
