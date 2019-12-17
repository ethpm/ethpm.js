/**
 * @module "ethpm/config"
 */

import * as config from './config';

// @ts-ignore
const requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;

export function load<S>(plugin: config.ConfigValue<S>): config.Connector<S> {
  const required = (typeof plugin === 'string')
    ? requireFunc(plugin)
    : (typeof plugin === 'function')
      ? plugin
      : (typeof plugin === 'object' && plugin.default)
        ? plugin.default : undefined;

  // HACK check for .default
  const connector = (typeof required === 'object' && required.default)
    ? required.default
    : required;

  return new connector();
}
