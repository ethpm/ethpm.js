/**
 * @module "ethpm"
 */

// to ensure source-maps turn on
require("source-map-support/register");

import * as config from "ethpm/config";
import { Config, RawConfig } from "ethpm/config";

import * as session from "ethpm/session";
import { Session, Workspace } from "ethpm/session";

namespace EthPM {
  export class Builder<T extends Config> {
    private connectors: session.Connectors<T>;

    constructor (config_: RawConfig<T>) {
      this.connectors = Object.assign(
        {}, ...Object.keys(config_)
          .map((service) => ({
            [service]: config.load(config_[service])
          }))
      );
    }

    async connect (options: any = {}): Promise<Session<T>> {
      const workspace = Object.assign({}, ...await Promise.all(
        Object.keys(this.connectors).map( async (service) => ({
          [service]: await this.connectors[service].connect(options)
        }))
      ));

      return new Session(workspace);
    }
  }

  export function configure<T extends Config> (
    config_: RawConfig<T>
  ): Builder<T> {
    return new Builder(config_);
  }
}

export default EthPM;
