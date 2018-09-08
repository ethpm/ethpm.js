/**
 * @module "ethpm/ethpm"
 */
const debug = require("debug")("ethpm");
require("source-map-support/register");

const originalRequire: any = require("original-require");
const Module = require("module");

import * as config from "ethpm/config";
import { Config, RawConfig } from "ethpm/config";
import { Workspace } from "ethpm/session";

namespace EthPM {
  export class Session<T extends Config> {
    private config: RawConfig<T>;

    constructor (config_: RawConfig<T>) {
      this.config = config_;
    }

    async connect (options?: any): Promise<Workspace<T>> {
      return Object.assign(
        {}, ...Object.keys(this.config)
          .map((service) => ({
            [service]: config.load(this.config[service])
          }))
      );
    }
  }

  export function configure<T extends Config> (config_: RawConfig<T>): Session<T> {
    return new Session(config_);
  }
}

export default EthPM;
