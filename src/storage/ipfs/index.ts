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

interface IpfsOptions {
  host: string;
  port: number;
  protocol: string;
}

export class IpfsService implements storage.Service {
  private host: string;
  private port: number;
  private protocol: string;

  constructor(options: IpfsOptions) {
    this.host = options.host;
    this.port = options.port;
    this.protocol = options.protocol;
  }

  async write(content: string): Promise<URL> {
    const uri = await this.predictUri(content);
    // TODO - actually write to IPFS
    return uri;
  }

  async read(uri: URL): Promise<Maybe<string>> {
    // TODO - actually read from IPFS
    return "dummy_content"
    // return this.contents[uri.href];
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
    ipfs: t.interface({ host: t.string, port: t.number, protocol: t.string })
  });

  /**
   * Construct IpfsService and load with specified contents
   */
  async init(options: { ipfs: IpfsOptions }): Promise<IpfsService> {
    const service = new IpfsService(options.ipfs);
    return service;
  }
}
