import { Package } from "ethpm/package";

export type Reader = (json: string) => Package;
export type Writer = (pkg: Package) => string;

export interface ManifestVersion {
  version: string;
  read: Reader;
  write: Writer;
}

export interface Service {
  read: Reader;
  write: Writer;
}
