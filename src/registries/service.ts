/**
 * @module "ethpm/registries"
 */

import { URL } from "url";

import * as pkg from "ethpm/package";
import PackagesCursor from "./web3/cursors/packages";
import ReleasesCursor from "./web3/cursors/releases";

export type PackageCursor = {
  /**
   * List all releases
   */
  releases (): ReleasesCursor;


  /**
   * Retrieve manifest URI for specific version
   */
  release (version: pkg.Version): Promise<URL>;
};

export interface Service {
  /**
   * List all packages
   */
  packages (): Promise<PackagesCursor>;

  /**
   * Query a particular package
   */
  package (packageName: pkg.PackageName): PackageCursor;

  /**
   * Publish a release
   */
  publish (
    packageName: pkg.PackageName,
    version: pkg.Version,
    manifest: URL
  ): Promise<any>
}
