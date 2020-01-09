/**
 * @module "ethpm/installer"
 */
import { URL } from "url";

export interface Service {
  install (contentURI: URL, registryAddress: string): Promise<void>;
}
