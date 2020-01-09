/**
 * @module "ethpm/session"
 */

import * as config from 'ethpm/config';
import {
  Config, HasInstaller, HasManifests, HasStorage, HasRegistries,
} from 'ethpm/config';

import * as pkg from 'ethpm/package';

import { Query } from './query';

export class Builder<T extends config.Config> {
  private connectors: config.Connectors<T>;

  constructor(config_: config.RawConfig<T>) {
    this.connectors = Object.assign(
      {}, ...Object.keys(config_)
        .map((service) => ({
          [service]: config.load(config_[service]),
        })),
    );
  }

  async connect(options: any = {}): Promise<Session<T>> {
    const workspace = Object.assign({}, ...await Promise.all(
      Object.keys(this.connectors).map(async (service) => ({
        [service]: await this.connectors[service].connect(options),
      })),
    ));

    return new Session(workspace);
  }
}

export class Session<T extends Config> {
  private workspace: config.Workspace<T>;

  constructor(workspace: config.Workspace<T>) {
    this.workspace = workspace;
  }

  query(package_: pkg.Package): Query<T> {
    return new Query({
      package: package_,
      workspace: this.workspace,
    });
  }

  get manifests(): config.Workspace<HasManifests>['manifests'] | never {
    if ('manifests' in this.workspace) {
      return (<config.Workspace<HasManifests>> this.workspace).manifests;
    }

    throw new Error('No manifests');
  }

  get storage(): config.Workspace<HasStorage>['storage'] | never {
    if ('storage' in this.workspace) {
      return (<config.Workspace<HasStorage>> this.workspace).storage;
    }

    throw new Error('No storage');
  }

  get installer(): config.Workspace<HasInstaller>['installer'] | never {
    if ('installer' in this.workspace) {
      return (<config.Workspace<HasInstaller>> this.workspace).installer;
    }

    throw new Error('No installer');
  }

  get registries(): config.Workspace<HasRegistries>['registries'] | never {
    if ('registries' in this.workspace) {
      return (<config.Workspace<HasRegistries>> this.workspace).registries;
    }

    throw new Error('No registries');
  }
}
