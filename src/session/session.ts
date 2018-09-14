/**
 * @module "ethpm/session"
 */

import * as config from "ethpm/config";
import { Config, HasManifest, HasStorage, HasRegistry } from "ethpm/config";

import * as manifest from "ethpm/manifest";
import * as storage from "ethpm/storage";
import * as registry from "ethpm/registry";
import { Workspace } from "ethpm/session";

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

