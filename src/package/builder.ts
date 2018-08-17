const debug = require("debug")("ethpm:package");

import stringify from "fast-json-stable-stringify";

import { PackageManifest } from "schema";
import * as schema from "schema";

export class ManifestBuilder {
  private partial: Partial<PackageManifest>;

  constructor (name, version) {
    this.partial = {
      manifest_version: "2",
      package_name: name,
      version: version
    };
  }

  setMeta (meta: schema.PackageMeta): ManifestBuilder {
    this.partial = {
      ...this.partial,
      meta
    }

    return this;
  }

  addType (name: string, type: schema.ContractType): ManifestBuilder {
    this.partial = {
      ...this.partial,

      contract_types: {
        ...(this.partial.contract_types || {}),

        [name]: type
      }
    };

    return this;
  }

  addInstance (
    chain: string, name: string, instance: schema.ContractInstance
  ): ManifestBuilder {
    this.partial = {
      ...this.partial,

      deployments: {
        [chain]: {
          ...(this.partial.deployments[chain] || {}),

          [name]: instance
        }
      }
    };

    return this;
  }

  addDependency (name: string, uri: schema.ContentUri) {
    this.partial = {
      ...this.partial,

      build_dependencies: {
        ...(this.partial.build_dependencies || {}),

        [name]: uri
      }
    };

    return this;
  }

  note (key: string, value: any) {
    this.partial = {
      ...this.partial,

      [`x-${key}`]: value
    };

    return this;
  }

  get manifest (): PackageManifest {
    return this.partial as PackageManifest;
  }
}
