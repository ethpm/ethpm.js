/**
 * @module "ethpm/config"
 */

const originalRequire: any = require("original-require");

export function load<T>(path: string): T {
  const required = originalRequire.main.require(path);

  // HACK check for .default
  const connector = (typeof required == "object" && required.default)
    ? required.default
    : required;

  return new connector();
}
