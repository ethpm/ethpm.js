import { Maybe } from "types";
import { URL } from "url";

export type Reader = (uri: URL) => Promise<Maybe<string>>

export interface Service {
  read: Reader;
}
