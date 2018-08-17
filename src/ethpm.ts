const debug = require("debug")("ethpm");

import { ManifestBuilder } from "ethpm/package";

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
