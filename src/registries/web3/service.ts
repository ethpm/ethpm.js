/**
 * @module "ethpm/registries/web3"
 */

import { URL } from 'url';
import * as t from 'io-ts';
import { WebsocketProvider as Web3Provider } from 'web3-providers-ws';
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract/types';

import * as config from 'ethpm/config';
import * as registries from 'ethpm/registries';
import * as pkg from 'ethpm/package';
import BN from 'bn.js';
import PackagesCursor from './cursors/packages';
import ReleasesCursor from './cursors/releases';

const registryManifest = require('./simple/registry.json');

const PAGE_SIZE = 10;

export class Web3RegistryService implements registries.Service {
  private web3: Web3;

  private address: string;

  private registry: Contract;

  constructor(provider: Web3Provider, address: string) {
    this.web3 = new Web3(provider as any);
    this.address = address;
    const registryABI = registryManifest.contract_types.PackageRegistry.abi;
    this.registry = new this.web3.eth.Contract(registryABI, this.address);
  }

  // needs testing
  async publish(
    packageName: pkg.PackageName,
    version: pkg.Version,
    manifest: URL,
  ): Promise<any> {
    await this.registry.methods.release(packageName, version, manifest).send({});
    // estimate gas requirement, and pad it a bit because some clients don't
    // handle gas refunds and such well
    // let gas = await this.web3.eth.estimateGas(txParams)
    // gas *= 1.2
    // await this.web3.eth.sendTransaction({
    // gas,
    // ...txParams
    // })
  }

  async numPackageIds(): Promise<BN> {
    const numPackages: number = await this.registry.methods.numPackageIds().call();
    return new BN(numPackages);
  }

  async getReleaseData(packageName: pkg.PackageName, version: pkg.Version): Promise<pkg.ContentURI> {
    const releaseId = await this.registry.methods.getReleaseId(packageName, version).call();
    const releaseData = await this.registry.methods.getReleaseData(releaseId).call();
    const ipfsHash = releaseData[2];
    return ipfsHash;
  }

  async packages(): Promise<pkg.PackageName[]> {
    const numPackages = await this.numPackageIds();
    const allPackageIds = await this.getAllPackageIds(numPackages);
    const cursor = new PackagesCursor(
      new BN(PAGE_SIZE),
      numPackages,
      this.web3,
      this.registry,
      allPackageIds,
    );
    const unsortedPackages = await Promise.all(Array.from(cursor));
    return unsortedPackages.sort();
  }

  async getAllPackageIds(numPackages: BN) {
    const pageToIds: any = {};
    let packageCounter = 0;
    const numPages = numPackages.toNumber() / PAGE_SIZE;
    for (let i = 0; i <= numPages; i++) {
      const slice = await this.registry.methods.getAllPackageIds(packageCounter, PAGE_SIZE).call();
      pageToIds[i] = slice;
      packageCounter += PAGE_SIZE;
    }
    const formattedPageToIds = Object.keys(pageToIds).reduce((result: any, key: string) => {
      result[key] = pageToIds[key].packageIds;
      return result;
    }, {});
    return formattedPageToIds;
  }

  async getAllReleaseIds(packageName: pkg.PackageName, numReleases: BN) {
    const pageToIds: any = {};
    let releaseCounter = 0;
    const numPages = numReleases.toNumber() / PAGE_SIZE;
    for (let i = 0; i <= numPages; i++) {
      const slice = await this.registry.methods.getAllReleaseIds(packageName, releaseCounter, PAGE_SIZE).call({});
      pageToIds[i] = slice;
      releaseCounter += PAGE_SIZE;
    }
    const formattedPageToIds = Object.keys(pageToIds).reduce((result: any, key: string) => {
      result[key] = pageToIds[key].releaseIds;
      return result;
    }, {});
    return formattedPageToIds;
  }

  package(packageName: pkg.PackageName) {
    return {
      releases: async (): Promise<object> => {
        const count = await this.registry.methods.numReleaseIds(packageName).call();
        const numReleases = new BN(count);
        try {
          numReleases.toNumber()
        } catch (_) {
          return {}
        }
        const allReleaseIds = await this.getAllReleaseIds(packageName, numReleases);
        const cursor = new ReleasesCursor(
          new BN(PAGE_SIZE),
          numReleases,
          this.web3,
          this.registry,
          packageName,
          allReleaseIds,
        );
        const allReleaseData = await Promise.all(Array.from(cursor));
        const formattedReleases = allReleaseData.reduce((map: any, obj) => {
          map[obj.version] = obj.manifestURI;
          return map;
        }, {});
        return formattedReleases;
      },

      release: async (version: pkg.Version): Promise<URL> => {
        const releaseId = await this.registry.methods.getReleaseId(packageName, version).call();
        const releaseData = await this.registry.methods.getReleaseData(releaseId).call();
        if (releaseData.manifestURI === '') {
          throw new Error('Package: ' + packageName + "@" + version + " not found.")
        } else {
          return new URL(releaseData[2]);
        }
      },
    };
  }
}

type Web3RegistryOptions = {
  provider: Web3Provider;
  registryAddress: string;
};

export default class Web3RegistryConnector
  extends config.Connector<registries.Service> {
  optionsType = t.interface({
    provider: t.object,
    registryAddress: t.string,
  });

  async init(
    { provider, registryAddress }: Web3RegistryOptions,
  ): Promise<registries.Service> {
    const service = new Web3RegistryService(provider, registryAddress);
    return service;
  }
}
