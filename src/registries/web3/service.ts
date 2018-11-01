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
    this.accounts = await this.web3.eth.getAccounts();
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
    // this returns an iterable/iterator of promises to package names

    const numPackagesTx = this.web3.eth.abi.encodeFunctionCall({
      name: "getNumPackages",
      type: "function",
      inputs: []
    }, []);

    let numPackages: string | BN = await this.web3.eth.call({
      from: this.accounts[0],
      to: this.address,
      data: numPackagesTx
    });
    numPackages = new BN(this.web3.eth.abi.decodeParameter("uint", numPackages));

    // now paginate
    const cursor = new PackagesCursor(new BN(PAGE_SIZE), numPackages, this.web3, this.accounts[0], this.address);

    return cursor;
  }

  package (packageName: pkg.PackageName): PackageCursor {
    return {
      releases: async (): Promise<ReleasesCursor> => {
        const numReleasesTx = this.web3.eth.abi.encodeFunctionCall({
          name: "getPackageData",
          type: "function",
          inputs: [{
            type: "string",
            name: "name"
          }]
        }, [packageName]);

        let result: string = await this.web3.eth.call({
          from: this.accounts[0],
          to: this.address,
          data: numReleasesTx
        });
        const results = this.web3.eth.abi.decodeParameters([{
          type: "address",
          name: "packageOwner"
        }, {
          type: "uint",
          name: "createdAt"
        }, {
          type: "uint",
          name: "numReleases"
        }, {
          type: "uint",
          name: "updatedAt"
        }], result);
        const numReleases = new BN(results[2]);
        const cursor = new ReleasesCursor(new BN(PAGE_SIZE), numReleases, this.web3, this.accounts[0], this.address);

        return cursor;
      },

      release: async (version: pkg.Version): Promise<URL> => {
        let data = this.web3.eth.abi.encodeFunctionCall({
          name: "getReleaseId",
          type: "function",
          inputs: [{
            type: "string",
            name: "packageName"
          }, {
            type: "string",
            name: "version"
          }]
        }, [packageName, version]);

        let result = await this.web3.eth.call({
          from: this.accounts[0],
          to: this.address,
          data
        });
        let releaseId = this.web3.eth.abi.decodeParameter("bytes32", result);

        data = this.web3.eth.abi.encodeFunctionCall({
          name: "getReleaseData",
          type: "function",
          inputs: [{
            type: "bytes32",
            name: "releaseId"
          }]
        }, ["0x" + releaseId.toString("hex")]);

        result = await this.web3.eth.call({
          from: this.accounts[0],
          to: this.address,
          data
        });
        
        let parameters = this.web3.eth.abi.decodeParameters(["string", "string", "string"], result);
        return new URL(parameters[2]);
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
    provider: t.object,
    registryAddress: t.string
  });

  async init(
    { provider, registryAddress }: Web3RegistryOptions
  ): Promise<registries.Service> {
    const service = new Web3RegistryService(provider, registryAddress);

    await service.init();

    return service;
  }
}
