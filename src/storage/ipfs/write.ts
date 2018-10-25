/**
 * @module "ethpm/storage/ipfs"
 */

import { URL } from "url";

export default async function write(content: string): Promise<URL> {
  // TODO - figure out how to write content to IPFS and return a URI
  return Promise.resolve(new URL("ipfs://my_test_url"));
}
