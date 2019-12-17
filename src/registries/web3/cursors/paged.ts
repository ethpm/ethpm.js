/**
 * @module "ethpm/registries/web3"
 */

import BN from 'bn.js';

interface PagedIds {
    [k: number]: Array<string>;
}

export default class Paged<T> {
  protected pageSize: BN;

  public pages: PagedIds

  constructor(pageSize: BN) {
    this.pageSize = pageSize.clone();
    this.pages = {};
  }

  pointerToPage(pointer: BN): BN {
    return pointer.div(this.pageSize);
  }

  setPage(page: BN, value: string[]) {
    this.pages[page.toNumber()] = value;
  }

  setPages(pageIds: PagedIds) {
    this.pages = pageIds;
  }

  hasPage(pointer: BN): boolean {
    return typeof this.pages[this.pointerToPage(pointer).toNumber()] !== 'undefined';
  }

  getDatum(pointer: BN): string | null {
    if (this.hasPage(pointer)) {
      const page = this.pages[this.pointerToPage(pointer).toNumber()];
      const index = pointer.mod(this.pageSize).toNumber();
      return page[index];
    }

    return null;
  }
}
