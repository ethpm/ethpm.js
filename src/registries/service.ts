/**
 * @module "ethpm/registries"
 */

import { URL } from 'url';

import * as pkg from 'ethpm/package';

export interface Service {
  /**
   * List all packages
   */
  packages (): Promise<pkg.PackageName[]>;

  /**
   * Query a particular package
   */
  package (packageName: pkg.PackageName): {
    /**
     * List all releases
     */
    releases (): Promise<object>;


    /**
     * Retrieve manifest URI for specific version
     */
    release (version: pkg.Version): Promise<URL>;
  };

  /**
   * Publish a release
   */
  publish (
    packageName: pkg.PackageName,
    version: pkg.Version,
    manifest: URL
  ): Promise<any>;
}
