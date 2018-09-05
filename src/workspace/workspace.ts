import { Config, Configurable } from "ethpm/config";
import * as manifest from "ethpm/manifest";
import * as storage from "ethpm/storage";

export type Services<T extends Configurable> = {
  [K in keyof T]:
    K extends "manifest" ? manifest.Service :
    K extends "storage" ? storage.Service :
    // K extends "registry" ? object :
    never
}

export type Workspace<T extends Configurable> = {
  [K in keyof Services<T>]: Services<T>[K]
}
