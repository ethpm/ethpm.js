/**
 * @module "ethpm"
 */

import * as config from 'ethpm/config';
import * as session from 'ethpm/session';

/**
 * This module provides the external interface for configuring an EthPM
 * session object.
 *
 * Usage:
 * ```javascript
 * import EthPM from "ethpm";
 *
 * ```
 */
export namespace EthPM {
  /**
   * Configure EthPM with specified Node modules to load for various
   * services
   *
   * Example Usage:
   * ```javascript
   * import EthPM from "ethpm";
   * const builder = EthPM.configure({
   *   manifests: "ethpm/manifests/v2",
   *   storage: "ethpm/storage/ipfs",
   *   registries: "ethpm/registries/web3"
   * })
   * ```
   *
   * EthPM.js will `require()` the specified modules from your project's
   * `node_modules/` folder.
   */
  export function configure<T extends config.Config>(
    config: config.RawConfig<T>,
  ): session.Builder<T> {
    return new session.Builder(config);
  }
}
