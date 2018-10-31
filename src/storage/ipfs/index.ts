/**
 * @module "ethpm/storage/ipfs"
 */

const IPFS = require("ipfs-mini");

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
  port: number | string;
  protocol: string;
}

export class IpfsService implements storage.Service {
  private host: string;
  private port: number;
  private protocol: string;
  private ipfs: any;

  constructor(options: IpfsOptions) {
    this.host = options.host;
    this.port = Number(options.port);
    this.protocol = options.protocol;

    this.ipfs = new IPFS({
      host: this.host,
      port: this.port,
      protocol: this.protocol
    });
  }

  write(content: string): Promise<URL> {
    return new Promise((resolve, reject) => {
      this.ipfs.add(content, (err: Error, result: any) => {
        if (err) throw reject(err);
        resolve(new URL(`ipfs://${result}`));
      });
    });
  }

  read(uri: URL): Promise<Maybe<string>> {
    const hashUri = uri.href.substr(uri.origin.length);

    return new Promise((resolve, reject) => {
      this.ipfs.cat(hashUri, (err: Error, result: any) => {
        if (err) throw reject(err);
        resolve(result);
      });
    });
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
    ipfs: t.interface({
      host: t.string,
      port: t.union([t.number, t.string]),
      protocol: t.string
    })
  });

  /**
   * Construct IpfsService and load with specified contents
   */
  async init(options: { ipfs: IpfsOptions }): Promise<IpfsService> {
    const service = new IpfsService(options.ipfs);
    return service;
  }
}
