/**
 * @module "ethpm/session"
 */
import * as config from "ethpm/config";
import * as manifest from "ethpm/manifest";
import * as storage from "ethpm/storage";
import * as registry from "ethpm/registry";

export type Workspace<T extends config.Config> = {
  [K in keyof T]:
    K extends "manifest" ? manifest.Service :
    K extends "storage" ? storage.Service :
    K extends "registry" ? registry.Service :
    never
}
