// @flow

type ConfigFile = {
  filepath: string,
  dirname: string,
  options: {},
};

// eslint-disable-next-line no-unused-vars
export function findConfigs(dirname: string): Array<ConfigFile> {
  return [];
}

export function loadConfig(name: string, dirname: string): ConfigFile {
  throw new Error(`Cannot load ${name} relative to ${dirname} in a browser`);
}

// eslint-disable-next-line no-unused-vars
export function resolvePlugin(name: string, dirname: string): string | null {
  return null;
}

// eslint-disable-next-line no-unused-vars
export function resolvePreset(name: string, dirname: string): string | null {
  return null;
}

export function loadPlugin(
  name: string,
  dirname: string,
): { filepath: string, value: mixed } {
  throw new Error(
    `Cannot load plugin ${name} relative to ${dirname} in a browser`,
  );
}

export function loadPreset(
  name: string,
  dirname: string,
): { filepath: string, value: mixed } {
  throw new Error(
    `Cannot load preset ${name} relative to ${dirname} in a browser`,
  );
}

export function loadParser(
  name: string,
  dirname: string,
): { filepath: string, value: Function } {
  throw new Error(
    `Cannot load parser ${name} relative to ${dirname} in a browser`,
  );
}

export function loadGenerator(
  name: string,
  dirname: string,
): { filepath: string, value: Function } {
  throw new Error(
    `Cannot load generator ${name} relative to ${dirname} in a browser`,
  );
}
