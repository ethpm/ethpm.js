/**
 * @module "ethpm/storage"
 */

import { Maybe } from "types";
import { URL } from "url";

export type Read = (uri: URL) => Promise<Maybe<string>>;
export type Hash = (content: string) => Promise<string>;
export type PredictUri = (content: string) => Promise<URL>;

export interface Service {
  read: Read;
  hash: Hash;
  predictUri: PredictUri;
}
