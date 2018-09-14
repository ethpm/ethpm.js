/**
 * @module "ethpm/session"
 */

import * as config from "ethpm/config";
import {
  Config, RawConfig, HasManifest, HasStorage, HasRegistry
} from "ethpm/config";

import * as manifest from "ethpm/manifest";
import * as storage from "ethpm/storage";
import * as registry from "ethpm/registry";
import { Workspace } from "ethpm/session";

type Connectors<T extends Config> = {
  [K in keyof Workspace<T>]: config.Connector<Workspace<T>[K]>
} & { [k: string]: config.Connector<any> }

export class Session<T extends Config> {
  private workspace: Workspace<T>;

  constructor (workspace: Workspace<T>) {
    this.workspace = workspace;
  }

  get manifest(): Workspace<HasManifest>["manifest"] | never {
    if ("manifest" in this.workspace) {
      return (<Workspace<HasManifest>>this.workspace).manifest;
    }

    throw new Error("No manifest");
  }

  get storage(): Workspace<HasStorage>["storage"] | never {
    if ("storage" in this.workspace) {
      return (<Workspace<HasStorage>>this.workspace).storage;
    }

    throw new Error("No storage");
  }

  get registry(): Workspace<HasRegistry>["registry"] | never {
    if ("registry" in this.workspace) {
      return (<Workspace<HasRegistry>>this.workspace).registry;
    }

    throw new Error("No registry");
  }
}

export class Builder<T extends Config> {
  private connectors: Connectors<T>;

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
