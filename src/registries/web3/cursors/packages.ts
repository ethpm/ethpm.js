/**
 * @module "ethpm/registries/web3"
 */


import * as pkg from 'ethpm/package';
import BN from 'bn.js';
import Web3 from 'web3';
import Paged from './paged';
import { Contract } from 'web3-eth-contract/types';

type ResultType = Promise<pkg.PackageName>;

export default class PackagesCursor extends Paged<BN> implements IterableIterator<ResultType> {
  private pointer: BN;

  private length: BN;

  private web3: Web3;

  private registry: Contract;

  private packageIds: any;

  constructor(pageSize: BN, length: BN, web3: Web3, registry: Contract, packageIds: any) {
    super(pageSize);
    this.pointer = new BN(0);
    this.length = length.clone();
    this.web3 = web3;
    this.registry = registry;
    this.packageIds = packageIds;
    this.setPages(packageIds);
  }

  private getName(): IteratorResult<ResultType> {
    const promise: ResultType = new Promise((resolve) => {
      const packageId = this.getDatum(this.pointer);
      if (packageId === null) {
        resolve('');
      } else {
        this.registry.methods.getPackageName(packageId).call().then((result: any) => resolve(result));
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
      return this.getName();
    }
    return {
      done: true,
      value: undefined,
    };

    const promise: ResultType = new Promise((resolve) => {
      resolve(''); // TODO: empty string or something else?
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
