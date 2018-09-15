/**
 * @module "ethpm/session"
 */

import * as config from "ethpm/config";
import { Config, HasManifest, HasStorage, HasRegistry } from "ethpm/config";

import * as pkg from "ethpm/package";
import * as manifest from "ethpm/manifest";
import * as storage from "ethpm/storage";
import * as registry from "ethpm/registry";

import { Query } from "./query";

export class Session<T extends Config> {
  private workspace: config.Workspace<T>;

  constructor (workspace: config.Workspace<T>) {
    this.workspace = workspace;
  }

  query (package_: pkg.Package): Query<T> {
    return new Query({
      package: package_,
      workspace: this.workspace
    });
  }

  get manifest(): config.Workspace<HasManifest>["manifest"] | never {
    if ("manifest" in this.workspace) {
      return (<config.Workspace<HasManifest>>this.workspace).manifest;
    }

    throw new Error("No manifest");
  }

  get storage(): config.Workspace<HasStorage>["storage"] | never {
    if ("storage" in this.workspace) {
      return (<config.Workspace<HasStorage>>this.workspace).storage;
    }

    throw new Error("No storage");
  }

  get registry(): config.Workspace<HasRegistry>["registry"] | never {
    if ("registry" in this.workspace) {
      return (<config.Workspace<HasRegistry>>this.workspace).registry;
    }

    throw new Error("No registry");
  }
}

