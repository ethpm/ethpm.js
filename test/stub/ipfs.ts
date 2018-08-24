import getHash from "ethpm/storage/ipfs/hash";

import { Maybe } from "types";

export class Resolver {
  private contents: Record<string, string>;

  constructor () {
    this.contents = {};
  }

  async add (content: string) {
    const hash = await getHash(content);
    this.contents[`ipfs://${hash}`] = content;
  }

  async get (uri: string): Promise<Maybe<string>> {
    return this.contents[uri];
  }
}
