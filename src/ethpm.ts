/**
 * @module "ethpm/ethpm"
 */
const debug = require("debug")("ethpm");
require("source-map-support/register");

import { Config, RawConfig } from "ethpm/config";
import { Session, Workspace } from "ethpm/session";

namespace EthPM {
  export function configure<T extends Config> (config_: RawConfig<T>): Session<T> {
    return new Session(config_);
  }
}

export default EthPM;
