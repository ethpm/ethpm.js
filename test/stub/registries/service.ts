/**
 * @module "test/stub/registries"
 */

import { URL } from "url";
import * as t from "io-ts";
import { ThrowReporter } from "io-ts/lib/ThrowReporter";

import { Maybe } from "ethpm/types";
import * as config from "ethpm/config";
import * as registries from "ethpm/registries";
import * as pkg from "ethpm/package";

/**
 * @dev Preloaded packages where "manifest" is the raw package name string
 */
export class StubService implements registries.Service {
  private releases: Record<pkg.PackageName, Record<pkg.Version, URL>>;

  constructor () {
    this.releases = {};
  }

  async publish (
    packageName: pkg.PackageName,
    version: pkg.Version,
    manifest: URL
  ): Promise<any> {
    if (!this.releases[packageName]) {
      this.releases[packageName] = {};
    }
    this.releases[packageName][version] = manifest;
  }

  packages (): IterableIterator<Promise<pkg.PackageName>> {
    return Object.keys(this.releases).map(
      (packageName) => Promise.resolve(packageName)
    )[Symbol.iterator]();
  }

  package (packageName: pkg.PackageName): {
    releases (): IterableIterator<Promise<pkg.Version>>;
    release (version: pkg.Version): Promise<URL>;
  } {
    return {
      releases: () => Object.keys(this.releases[packageName]).map(
        (version) => Promise.resolve(version)
      )[Symbol.iterator](),

      release: (version: pkg.Version) => Promise.resolve(
        this.releases[packageName][version]
      )
    }

  }

}

export default class StubConnector extends config.Connector<registries.Service> {
  optionsType = t.interface({
    releases: t.array(t.interface({
      package: t.object,
      manifestUri: t.string,
    }))
  });

  async init(
    { releases }: { releases: Array<{package: pkg.Package, manifestUri: string}> }
  ): Promise<registries.Service> {
    const service = new StubService();
    for (let { package: { packageName, version } , manifestUri } of releases) {
      await service.publish(packageName, version, new URL(manifestUri));
    }

    return service;
  }
}
