import { Package } from "ethpm/package";

export interface ManifestVersion {
  version: string;
  read: (json: string) => Package;
  write: (pkg: Package) => string;
}
