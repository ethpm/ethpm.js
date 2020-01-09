/**
 * @module "ethpm/config"
 */

import * as t from 'io-ts';
import { ThrowReporter } from 'io-ts/lib/ThrowReporter';

import * as manifests from 'ethpm/manifests/service';
import * as storage from 'ethpm/storage/service';
import * as registries from 'ethpm/registries/service';
import * as installer from 'ethpm/installer/service';

export type ConfigValue<S = any> =
  string | (() => Connector<S>) | ({ default: () => Connector<S> });

export type HasManifests = { manifests: any };
export type HasStorage = { storage: any };
export type HasRegistries = { registries: any };
export type HasInstaller = { installer: any };
export type Complete = HasManifests & HasStorage & HasRegistries & HasInstaller;

/**
 * Polymorphic type alias for any object that exposes keys for any or all
 * available services, i.e. `manifests`, `registries`, `storage`, `installer`
 */
export type Config =
    HasManifests | HasStorage | HasRegistries | HasInstaller |
    HasManifests & HasStorage |
    HasManifests & HasRegistries |
    HasManifests & HasInstaller |
    HasStorage & HasRegistries |
    HasStorage & HasInstaller |
    HasRegistries & HasInstaller |
    HasManifests & HasStorage & HasRegistries |
    HasManifests & HasStorage & HasInstaller |
    HasManifests & HasRegistries & HasInstaller |
    HasStorage & HasRegistries & HasInstaller |
    HasManifests & HasStorage & HasRegistries & HasInstaller

export type RawConfig<T extends Config> = {
  [K in keyof T]: ConfigValue<Workspace<T>[K]>
} & { [k: string]: ConfigValue };

export abstract class Connector<S> {
  abstract optionsType: any;

  abstract async init (...args: any[]): Promise<S>;

  async connect(options: t.mixed): Promise<S> {
    const validation = this.optionsType.decode(options);
    if (!validation.isRight()) {
      ThrowReporter.report(validation);
    }

    return this.init(validation.value);
  }
}

export type Workspace<T extends Config> = {
  [K in keyof T]:
    K extends 'manifests' ? manifests.Service :
    K extends 'storage' ? storage.Service :
    K extends 'registries' ? registries.Service :
    K extends 'installer' ? installer.Service :
    never
}

export type Connectors<T extends Config> = {
  [K in keyof Workspace<T>]: Connector<Workspace<T>[K]>
} & { [k: string]: Connector<any> }
