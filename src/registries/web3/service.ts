/**
 * @module "src/registries/web3"
 */

import { URL } from "url";
import * as t from "io-ts";
import { ThrowReporter } from "io-ts/lib/ThrowReporter";
import { Provider as Web3Provider } from "web3/providers";
import Web3 from "web3";

import { Maybe } from "ethpm/types";
import * as config from "ethpm/config";
import * as registries from "ethpm/registries";
import * as pkg from "ethpm/package";
import { PackageCursor } from "../service";
import { Server } from "http";
import BN from "bn.js";
import PackagesCursor from "./cursors/packages";
import ReleasesCursor from "./cursors/releases";

const PAGE_SIZE: number = 10;

/**
 * @dev Preloaded packages where "manifest" is the raw package name string
 */
export class Web3RegistryService implements registries.Service {
  private web3: Web3;
  private address: string;
  private accounts: string[];

  constructor (provider: Web3Provider, address: string) {
    this.web3 = new Web3(provider);
    this.address = address;
    this.accounts = [];
  }

  async init (): Promise<void> {
    const accounts = await this.web3.eth.getAccounts();
  }

  async publish (
    packageName: pkg.PackageName,
    version: pkg.Version,
    manifest: URL
  ): Promise<any> {
    const data = this.web3.eth.abi.encodeFunctionCall({
      name: "release",
      type: "function",
      inputs: [{
        type: "string",
        name: "packageName",
      }, {
        type: "string",
        name: "version"
      }, {
        type: "string",
        name: "manifestURI"
      }]
    }, [packageName, version, manifest]);

    await this.web3.eth.sendTransaction({
      from: this.accounts[0],
      to: this.address,
      data
    });
  }

  async packages (): Promise<PackagesCursor> {
    return new Promise<PackagesCursor>((resolve) => resolve());
  }

  package (packageName: pkg.PackageName): PackageCursor {
    return {
      releases: (): ReleasesCursor => {
        return new ReleasesCursor();
      },
      release: (): Promise<URL> => {
        return new Promise((resolve) => resolve(new URL("localhost")));
      }
    }
  }

}

type Web3RegistryOptions = {
  releases: Array<{package: pkg.Package, manifest: URL}>;
  provider: Web3Provider;
  registryAddress: string;
};

export default class Web3RegistryConnector extends config.Connector<registries.Service> {
  optionsType = t.interface({
    releases: t.array(t.interface({
      package: t.object,
      manifest: t.interface({ href: t.string })
    }))
  });

  async init(
    { releases, provider, registryAddress }: Web3RegistryOptions
  ): Promise<registries.Service> {
    const service = new Web3RegistryService(provider, registryAddress);

    await service.init();

    for (let { package: { packageName, version } , manifest } of releases) {
      await service.publish(packageName, version, manifest);
    }

    return service;
  }
}
