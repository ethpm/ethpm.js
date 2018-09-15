/**
 * @module "test/stub/storage"
 */

import { URL } from "url";
import * as t from "io-ts";
import { ThrowReporter } from "io-ts/lib/ThrowReporter";

import { Maybe } from "types";
import getHash from "ethpm/storage/ipfs/hash";
import * as config from "ethpm/config";
import * as storage from "ethpm/storage";

export class StubService implements storage.Service {
  private contents: Record<string, string>;

  constructor () {
    this.contents = {};
  }

  async write (content: string): Promise<URL> {
    const uri = await this.predictUri(content);
    this.contents[uri.href] = content;
    return uri;
  }

  async read (uri: URL): Promise<Maybe<string>> {
    return this.contents[uri.href];
  }

  async hash (content: string): Promise<string> {
    return await getHash(content);

  }

  async predictUri (content: string): Promise<URL> {
    const hash = await this.hash(content);

    return new URL(`ipfs://${hash}`);
  }
}

export default class StubConnector extends config.Connector<storage.Service> {
  optionsType = t.interface({
    contents: t.array(t.string)
  });

  /**
   * Construct StubService and load with specified contents
   */
  async init (
    { contents }: { contents: Array<string> }
  ): Promise<StubService> {
    const service = new StubService();

    for (let content of contents) {
      await service.write(content);
    }

    return service;
  }
}
