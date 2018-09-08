import { URL } from "url";
import * as t from "io-ts";
import { ThrowReporter } from "io-ts/lib/ThrowReporter";

import { Maybe } from "types";
import * as manifest from "ethpm/manifest";
import { Package } from "ethpm/package";

export const OptionsType = t.interface({
  packages: t.Array
});

/**
 * @dev Preloaded packages where "manifest" is the raw package name string
 */
export class StubService implements manifest.Service {
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

export default class StubConnector {
  static async connect(options: t.mixed): Promise<manifest.Service> {
    const validation = OptionsType.decode(options)
    if (validation.isLeft()) {
      ThrowReporter.report(validation);
    }

    const service = new StubService();
    if (validation.isRight()) {
      for (let content of validation.value.packages) {
        await service.add(<Package>content);
      }
    }

    return service;
  }
}
