/**
 * @module "test/stub/storage"
 */

import { URL } from "url";
import * as t from "io-ts";
import { ThrowReporter } from "io-ts/lib/ThrowReporter";

import { Maybe } from "types";
import getHash from "ethpm/storage/ipfs/hash";
import * as storage from "ethpm/storage";

export const OptionsType = t.interface({
  contents: t.array(t.string)
});

export class StubService {
  contents: Record<string, string>;

  constructor () {
    this.contents = {};
  }

  async add (content: string) {
    const uri = await this.predictUri(content);
    this.contents[uri.href] = content;
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

export default class StubConnector {
  static async connect(options: t.mixed): Promise<storage.Service> {
    const validation = OptionsType.decode(options)
    if (validation.isLeft()) {
      ThrowReporter.report(validation);
    }

    const service = new StubService();
    if (validation.isRight()) {
      for (let content of validation.value.contents) {
        await service.add(content);
      }
    }

    return service;
  }
}
