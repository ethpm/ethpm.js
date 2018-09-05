/**
 * @module "ethpm/ethpm"
 */
const debug = require("debug")("ethpm");
require("source-map-support/register");

const originalRequire: any = require("original-require");
const Module = require("module");

import { Config, Configurable } from "ethpm/config";
import { Workspace } from "ethpm/workspace";

namespace Loader {
  export function load<T>(path: string): T {
    const required = originalRequire.main.require(path);

    // HACK check for .default
    if (typeof required == "object" && required.default) {
      return required.default;
    }

    return required;
  }
}

namespace EthPM {
  export class Session<T extends Configurable> {
    private config: Config<T>;

    constructor (config: Config<T>) {
      this.config = config;
    }

    async connect (options?: any): Promise<Workspace<T>> {
      return Object.assign(
        {}, ...Object.keys(this.config)
          .map((service) => ({
            [service]: Loader.load(this.config[service])
          }))
      );
    }
  }

  export function configure<T extends Configurable> (config: Config<T>): Session<T> {
    return new Session(config);
  }
}

export default EthPM;
