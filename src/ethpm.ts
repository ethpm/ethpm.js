/**
 * @module "ethpm/ethpm"
 */
const debug = require("debug")("ethpm");
require("source-map-support/register");

debug("hello");

export interface Config {
}

export interface Options {
  config: string | Config;
}

export default class EthPM {
  options: Options;

  constructor (options: Options) {
    this.options = options;
  }
}
