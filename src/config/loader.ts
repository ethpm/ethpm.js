/**
 * @module "ethpm/config"
 */

const originalRequire: any = require("original-require");

export function load<T>(path: string): T {
  const required = originalRequire.main.require(path);

  // HACK check for .default
  if (typeof required == "object" && required.default) {
    return required.default;
  }

  return required;
}
