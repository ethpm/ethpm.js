/**
 * @module "ethpm/session/packages"
 */

import * as config from "ethpm/config";
import * as pkg from "ethpm/package";

export class Packages<T extends config.Config> {
  private workspace: config.Workspace<T>;

  constructor (workspace: config.Workspace<T>) {
    this.workspace = workspace;
  }
}
