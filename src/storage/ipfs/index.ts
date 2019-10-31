/**
 * @module "ethpm/storage/ipfs"
 */

import { URL } from 'url';
import * as t from 'io-ts';

import { Maybe } from 'ethpm/types';
import * as config from 'ethpm/config';
import * as storage from 'ethpm/storage';

import hash from './hash';

const IPFS = require('ipfs-http-client');

interface IpfsOptions {
  host: string;
  port: number | string;
  protocol: string;
}

export class IpfsService implements storage.Service {
  private host: string;

  private port: string;

  private protocol: string;

  private ipfs: any;

  constructor(options: IpfsOptions) {
    this.host = options.host;
    this.port = options.port.toString();
    this.protocol = options.protocol;

    this.ipfs = new IPFS({
      host: this.host,
      port: this.port,
      protocol: this.protocol,
    });
  }

  async write(content: string): Promise<URL> {
    const buffer = this.ipfs.types.Buffer.from(content);
    const [{ hash }] = await this.ipfs.add(buffer);

    return new URL(`ipfs://${hash}`);
  }

  async read(uri: URL): Promise<Maybe<string>> {
    const hash = uri.host;

    const buffer = await this.ipfs.cat(hash);

    return buffer.toString();
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
      protocol: t.string,
    }),
  });

  /**
   * Construct IpfsService and load with specified contents
   */
  async init(options: { ipfs: IpfsOptions }): Promise<IpfsService> {
    const service = new IpfsService(options.ipfs);
    return service;
  }
}
