import { Package } from "ethpm/package";

export type Read = (json: string) => Promise<Package>;
export type Write = (pkg: Package) => Promise<string>;

export interface ManifestVersion {
  version: string;
  read: Read;
  write: Write;
}

export interface Service {
  read: Read;
  write: Write;
}
