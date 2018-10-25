/**
 * @module "ethpm/storage/ipfs"
 */

import { URL } from "url";

export default async function predictUri(content: string): Promise<URL> {
  // TODO - figure out how to retrieve URI from content on IPFS
  return Promise.resolve(new URL("ipfs://my_test_url"));
}
