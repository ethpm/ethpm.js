/**
 * @module "ethpm/registries/web3"
 */


import * as pkg from 'ethpm/package';
import BN from 'bn.js';
import Web3 from 'web3';
import Contract from 'web3/eth/contract';
import Paged from './paged';

interface ReleaseData {
  packageName: pkg.PackageName;
  version: pkg.Version;
  manifestURI: pkg.ContentURI;
}

type ResultType = Promise<ReleaseData>;

export default class ReleasesCursor extends Paged<BN> implements IterableIterator<ResultType> {
  private pointer: BN;

  private length: BN;

  private web3: Web3;

  private packageName: pkg.PackageName;

  private registry: Contract;

  private releaseIds: any

  constructor(pageSize: BN, length: BN, web3: Web3, registry: Contract, packageName: string, releaseIds: any) {
    super(pageSize);
    this.pointer = new BN(0);
    this.length = length.clone();
    this.web3 = web3;
    this.packageName = packageName;
    this.registry = registry;
    this.releaseIds = releaseIds;
    this.setPages(this.releaseIds);
  }

  private getReleaseData(): IteratorResult<ResultType> {
    const promise: ResultType = new Promise((resolve) => {
      const releaseId = this.getDatum(this.pointer);
      if (releaseId === null) {
        resolve(undefined);
      } else {
        this.registry.methods.getReleaseData(releaseId).call().then((result) => resolve(result));
      }
    });
    this.pointer = this.pointer.addn(1);
    return {
      done: false,
      value: promise,
    };
  }

  public next(): IteratorResult<ResultType> {
    if (this.pointer.lt(this.length)) {
      return this.getReleaseData();
    }
    return {
      done: true,
      value: undefined,
    };

    const promise: ResultType = new Promise((resolve) => {
      resolve(undefined);
    });

    this.pointer = this.pointer.addn(1);

    return {
      done: true,
      value: promise,
    };
  }

  [Symbol.iterator](): IterableIterator<ResultType> {
    return this;
  }
}
