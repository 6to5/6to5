// @flow

export function getEnv(defaultValue: string = "development"): string {
  return process.env.BABEL_ENV || process.env.NODE_ENV || defaultValue;
}
