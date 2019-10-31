/**
 * @module "ethpm/storage/ipfs"
 */

import { promisify } from 'util';

const Unixfs = require('ipfs-unixfs');
const { DAGNode } = require('ipld-dag-pb');

export type IpfsHash = string;

export default async function hash(content: string): Promise<IpfsHash> {
  const data = Buffer.from(content, 'ascii');
  const unixFs = new Unixfs('file', data);

  const dagNode = await promisify(DAGNode.create)(unixFs.marshal());
  return dagNode.toJSON().multihash;
}
