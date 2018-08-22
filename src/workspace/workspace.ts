import * as pkg from "ethpm/package/package";

export type PackageReference = Array<pkg.PackageName>;

export interface WorkspacePackage {
  knownPaths: Set<PackageReference>,
  package: pkg.Package
}

export interface Workspace {
  packages: Array<WorkspacePackage>
}
