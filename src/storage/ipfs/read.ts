/**
 * @module "ethpm/storage/ipfs"
 */

import { Maybe } from "ethpm/types";
import { URL } from "url";

export default async function read(uri: URL): Promise<Maybe<string>> {
  // TODO - figure out how to retrieve content by URI on IPFS
  const myContent: Maybe<string> = "my_content";
  return Promise.resolve(myContent);
}
