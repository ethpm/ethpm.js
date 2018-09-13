/**
 * @module "ethpm/registry"
 */

import { URL } from "url";
import { Maybe } from "types";

import * as pkg from "ethpm/package";

export interface Service {
  /**
   * List all packages
   */
  packages (): IterableIterator<Promise<pkg.PackageName>>;

  /**
   * Query a particular package
   */
  package (packageName: pkg.PackageName): {
    /**
     * List all releases
     */
    releases (): IterableIterator<Promise<pkg.Version>>;


    /**
     * Retrieve manifest URI for specific version
     */
    release (version: pkg.Version): Promise<URL>;
  };
}
