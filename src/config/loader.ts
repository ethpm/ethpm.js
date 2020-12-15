/**
 * @module "ethpm/config"
 */

import * as config from './config';
import * as v3 from 'ethpm/manifests/v3';
import * as ipfs from 'ethpm/storage/ipfs';
import * as installer from 'ethpm/installer/truffle';
import * as registries from 'ethpm/registries/web3';


const originalRequire: any = require("original-require");

const cleanPackagePath = (plugin: string): string => plugin.replace(
  /^ethpm\//,
  "../"
);

// This is required to enable webpack to include these modules when bundling
const mappings: { [key: string]: any; } = {
  "ethpm/manifests/v3": v3,
  "ethpm/storage/ipfs": ipfs,
  "ethpm/installer/truffle": installer,
  "ethpm/registries/web3": registries,
}

export function load<S>(plugin: config.ConfigValue<S>): config.Connector<S> {
  const required = (typeof plugin === 'string')
    ? plugin.startsWith("ethpm/")
      ? mappings[plugin]
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
