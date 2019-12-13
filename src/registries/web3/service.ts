/**
 * @module "ethpm/registries/web3"
 */

import { URL } from 'url';
import * as t from 'io-ts';
import { Provider as Web3Provider } from 'web3/providers';
import Web3 from 'web3';
import Contract from "web3/eth/contract";

import * as config from 'ethpm/config';
import * as registries from 'ethpm/registries';
import * as pkg from 'ethpm/package';
import BN from 'bn.js';
import PackagesCursor from './cursors/packages';
import ReleasesCursor from './cursors/releases';

const manifest = require('./simple/registry.json');
const PAGE_SIZE = 10;


export class Web3RegistryService implements registries.Service {
  private web3: Web3;

  private address: string;

  private accounts: string[];
  private registry: Contract;

  constructor(provider: Web3Provider, address: string) {
    this.web3 = new Web3(provider);
    this.address = address;
    // use local Package type here
    // better manifest validation
    const registryABI = manifest.contract_types.PackageRegistry.abi;
    this.registry = new this.web3.eth.Contract(registryABI, this.address);
    this.accounts = [];
  }

  async init(): Promise<void> {
    this.accounts = await this.web3.eth.getAccounts();
  }

  async publish(
    packageName: pkg.PackageName,
    version: pkg.Version,
    manifest: URL,
  ): Promise<any> {
    const data = this.web3.eth.abi.encodeFunctionCall({
      name: 'release',
      type: 'function',
      inputs: [{
        type: 'string',
        name: 'packageName',
      }, {
        type: 'string',
        name: 'version',
      }, {
        type: 'string',
        name: 'manifestURI',
      }],
    }, [packageName, version, manifest.href]);

    const txParams: any = {
      from: this.accounts[0],
      to: this.address,
      data,
    };

    // estimate gas requirement, and pad it a bit because some clients don't
    // handle gas refunds and such well
    let gas = await this.web3.eth.estimateGas(txParams);
    console.log(gas);
    gas *= 1.2;

    await this.web3.eth.sendTransaction({
      gas,
      ...txParams,
    });
  }

  async numPackageIds(): Promise<BN> {
    let numPackages: string | BN = await this.registry.methods.numPackageIds().call();
    numPackages = new BN(numPackages);
    return numPackages;
  }

  async getReleaseData(packageName: string, version: string): Promise<string> {
    let releaseId = await this.registry.methods.getReleaseId(packageName, version).call();
    let releaseData = await this.registry.methods.getReleaseData(releaseId).call();
    const ipfsHash = releaseData[2];
    return ipfsHash;
  };

  async packages (): Promise<PackagesCursor> {
    const numPackages = await this.numPackageIds();
	let packageIdsBook = await this.getPackageIdsBook(numPackages)
    const cursor = new PackagesCursor(
      new BN(PAGE_SIZE),
      numPackages,
      this.web3,
      this.registry,
	  packageIdsBook,
    );
    return await Promise.all(Array.from(cursor));
  }

  async getPackageIdsBook(numPackages: BN) {
	let counter = 0
	let data = {}
	const numPages = numPackages.toNumber() / PAGE_SIZE
	while (counter < numPages) {
	  const inter = await this.registry.methods.getAllPackageIds(counter, PAGE_SIZE).call()
	  data[counter] = inter
	  counter += PAGE_SIZE
	}
	const actual = Object.keys(data).reduce(function(result, key) {
	  result[key] = data[key]['packageIds'];
	  return result
	}, {})
	return actual
  }

  async getReleaseIdsBook(packageName: string, numReleases: BN) {
	let counter = 0
	let data = {}
	const numpages = numReleases.toNumber() / PAGE_SIZE
	while (counter < numpages) {
	  const inter = await this.registry.methods.getAllReleaseIds(packageName, counter, PAGE_SIZE).call({})
	  data[counter] = inter
	  counter += PAGE_SIZE
	}
	const actual = Object.keys(data).reduce(function(result, key) {
	  result[key] = data[key]['releaseIds'];
	  return result
	}, {})
	return actual
  }

  package (packageName: pkg.PackageName) {
    return {
      releases: async (): Promise<ReleasesCursor> => {
		const count = await this.registry.methods.numReleaseIds(packageName).call()
        const numReleases = new BN(count);
		const releaseIdsBook = await this.getReleaseIdsBook(packageName, numReleases)
        const cursor = new ReleasesCursor(
          new BN(PAGE_SIZE),
          numReleases,
          this.web3,
		  this.registry,
          packageName,
		  releaseIdsBook,
        );
		const dict = await Promise.all(Array.from(cursor));
		const thing = dict.reduce(function(map, obj) {
		  map[obj.version] = obj.manifestURI;
		  return map;
		}, {});
		return thing
      },

      release: async (version: pkg.Version): Promise<URL> => {
        let releaseId = await this.registry.methods.getReleaseId(packageName, version).call()
		const releaseData = await this.registry.methods.getReleaseData(releaseId).call()
		return new URL(releaseData[2]);
      }
    }
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

    await service.init();

    return service;
  }
}
