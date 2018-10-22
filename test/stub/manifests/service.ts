/**
 * @module "test/stub/manifests"
 */

import { URL } from "url";
import * as t from "io-ts";
import { ThrowReporter } from "io-ts/lib/ThrowReporter";

import * as config from "ethpm/config";
import * as manifests from "ethpm/manifests";
import { Package } from "ethpm/package";

/**
 * @dev Preloaded packages where "manifest" is the raw package name string
 */
export class StubService implements manifests.Service {
  packages: Record<string, Package>;

  constructor () {
    this.packages = {};
  }

  add (pkg: Package) {
    this.packages[pkg.packageName] = pkg;
  }

  async read (packageName: string): Promise<Package> {
    return this.packages[packageName];
  }

  async write (pkg: Package): Promise<string> {
    return pkg.packageName;
  }
}

export default class StubConnector extends config.Connector<manifests.Service> {
  optionsType = t.interface({
    packages: t.Array
  });

  async init (
    { packages }: { packages: Array<Package> }
  ): Promise<manifests.Service> {
    const service = new StubService();
    for (let package_ of packages) {
      await service.add(package_);
    }

    return service;
  }
}
