/**
 * @module "ethpm/session"
 */

import * as config from "ethpm/config";

import { Session } from "./session";

export class Builder<T extends config.Config> {
  private connectors: config.Connectors<T>;

  constructor (config_: config.RawConfig<T>) {
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
