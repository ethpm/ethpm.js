/**
 * @module "ethpm/registries/web3"
 */

import BN from 'bn.js';

export default class Paged<T> {
  protected pageSize: BN;

  private pages: {
    [k: string]: T[]; // I'm assuming the page keys are hex strings
  }

  constructor(pageSize: BN) {
    this.pageSize = pageSize.clone();
    this.pages = {};
  }

  pointerToPage(pointer: BN): BN {
    return pointer.div(this.pageSize);
  }

  setPage(page: BN, value: T[]) {
    this.pages[page.toString('hex')] = value;
  }

  hasPage(pointer: BN): boolean {
    return typeof this.pages[this.pointerToPage(pointer).toString('hex')] !== 'undefined';
  }

  getDatum(pointer: BN): T | null {
    if (this.hasPage(pointer)) {
      const page = this.pages[this.pointerToPage(pointer).toString('hex')];
      const index = pointer.mod(this.pageSize).toNumber();
      return page[index];
    }

    return null;
  }
}
