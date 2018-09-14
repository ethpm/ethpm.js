/**
 * @module "ethpm/config"
 */

import * as t from "io-ts";
import { ThrowReporter } from "io-ts/lib/ThrowReporter";

export type ConfigValue = string;

export type HasManifest = { manifest: any };
export type HasStorage = { storage: any };
export type HasRegistry = { registry: any };

/**
 * Polymorphic type alias for any object that exposes keys for any or all
 * available services, i.e. `manifest`, `registry`, `storage`
 */
export type Config =
    HasManifest | HasStorage | HasRegistry |
      HasManifest & HasStorage |
      HasManifest & HasRegistry |
      HasStorage & HasRegistry |
      HasManifest & HasStorage & HasRegistry

export type RawConfig<T extends Config> = {
  [K in keyof T]: ConfigValue
} & { [k: string]: ConfigValue };

export abstract class Connector<S> {
  abstract optionsType: any;

  abstract async init (...args: any[]): Promise<S>;

  async connect (options: t.mixed): Promise<S> {
    const validation = this.optionsType.decode(options);
    if (!validation.isRight()) {
      ThrowReporter.report(validation);
    }

    return this.init(validation.value);
  }
}
