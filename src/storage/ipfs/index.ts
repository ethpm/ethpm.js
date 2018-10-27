/**
 * @module "ethpm/storage/ipfs"
 */

import { URL } from "url";
import * as t from "io-ts";

import { Maybe } from "ethpm/types";
import * as config from "ethpm/config";
import * as storage from "ethpm/storage";

import hash from "./hash";
import read from "./read";
import write from "./write";

export class IpfsService implements storage.Service {
  private contents: Record<string, string>;

  constructor() {
    this.contents = {};
  }

  async write(content: string): Promise<URL> {
    const uri = await this.predictUri(content);
    this.contents[uri.href] = content;
    return uri;
  }

  async read(uri: URL): Promise<Maybe<string>> {
    return this.contents[uri.href];
  }

  async hash(content: string): Promise<string> {
    return await hash(content);
  }

  async predictUri(content: string): Promise<URL> {
    const hash = await this.hash(content);

    return new URL(`ipfs://${hash}`);
  }
}

export default class IpfsConnector extends config.Connector<storage.Service> {
  optionsType = t.interface({
    contents: t.array(t.string)
  });

  /**
   * Construct IpfsService and load with specified contents
   */
  async init({ contents }: { contents: Array<string> }): Promise<IpfsService> {
    const service = new IpfsService();

    for (let content of contents) {
      await service.write(content);
    }

    return service;
  }
}
