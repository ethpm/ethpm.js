import { Maybe } from "types";
import { URL } from "url";

export interface Resolver {
  get(uri: URL): Promise<Maybe<string>>;
}
