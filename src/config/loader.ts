/**
 * @module "ethpm/config"
 */

import * as config from './config';

const originalRequire: any = require("original-require");

const cleanPackagePath = (plugin: string): string => plugin.replace(
  /^ethpm\//,
  "../"
);

export function load<S>(plugin: config.ConfigValue<S>): config.Connector<S> {
  const required = (typeof plugin === 'string')
    ? plugin.startsWith("ethpm/")
      ? require(cleanPackagePath(plugin))
      : originalRequire(plugin)
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
