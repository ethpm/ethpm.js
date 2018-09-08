/**
 * @module "ethpm/session"
 */

const originalRequire: any = require("original-require");

import * as config from "ethpm/config";
import { Config, RawConfig } from "ethpm/config";
import { Workspace } from "./workspace";

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
