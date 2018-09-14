/**
 * @module "ethpm/session"
 */

import * as config from "ethpm/config";

import { Workspace } from "./workspace";
import { Session } from "./session";

type Connectors<T extends config.Config> = {
  [K in keyof Workspace<T>]: config.Connector<Workspace<T>[K]>
} & { [k: string]: config.Connector<any> }


export class Builder<T extends config.Config> {
  private connectors: Connectors<T>;

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
