/**
 * @module "ethpm/manifest/v2"
 */

import * as t from "io-ts";
import { ThrowReporter } from "io-ts/lib/ThrowReporter";

import { URL } from "url";
import * as stringify from "json-stable-stringify";

import { lift, lift2 } from "types";
import * as schema from "ethpm-spec";
import * as config from "ethpm/config";
import * as pkg from "ethpm/package";
import * as manifest from "ethpm/manifest/service";

const VERSION = "2";

namespace Fields {
  export function readContractTypes (contractTypes: schema.ContractTypes): pkg.ContractTypes {
    return Object.assign(
      {},
      ...Object.entries(contractTypes)
        .map(
          ([ alias, contractType ]) => ({
            [alias]: readContractType(contractType, alias)
          })
        )
    );
  }

  export function readDeployments (
    deployments: schema.Deployments,
    types: pkg.ContractTypes
  ): pkg.Deployments {
    return new Map(
      Object.entries(deployments)
        .map(
          ([ chainURI, deployment ]) => ([
            new URL(chainURI),
            readDeployment(deployment, types)
          ] as [pkg.ChainURI, pkg.Deployment])
        )
    );
  }

  export function readContractType (
    contractType: schema.ContractType,
    alias: string
  ): pkg.ContractType {
    return {
      contractName: contractType.contract_name || alias,
      deploymentBytecode: lift(readUnlinkedBytecode)(contractType.deployment_bytecode),
      runtimeBytecode: lift(readUnlinkedBytecode)(contractType.runtime_bytecode),
      abi: contractType.abi,
      natspec: contractType.natspec,
      compiler: lift(readCompiler)(contractType.compiler)
    };
  }

  export function readUnlinkedBytecode(
    bytecode: schema.UnlinkedBytecodeObject
  ): pkg.UnlinkedBytecode {
    return {
      bytecode: bytecode.bytecode,
      linkReferences: [...(bytecode.link_references || [])]
    };
  }

  export function readLinkedBytecode(
    bytecode?: schema.LinkedBytecodeObject,
    parent?: pkg.UnlinkedBytecode
  ): pkg.LinkedBytecode | undefined {
    // bytecode of some kind is required
    if (!bytecode) {
      return undefined;
    }

    const bytestring = (bytecode.bytecode)
      ? bytecode.bytecode
      : parent && parent.bytecode;

    // needs bytestring itself or from parent
    if (!bytestring) {
      return undefined;
    }

    return {
      bytecode: bytestring,
      linkReferences: [...(
        (bytecode.link_references)
          ? bytecode.link_references
          : (parent && parent.linkReferences)
            ? parent.linkReferences
            : []
      )],
      linkDependencies: readLinkDependencies(bytecode.link_dependencies),
    };
  }

  export function readLinkDependencies(
    linkDependencies: schema.LinkDependencies
  ): Array<pkg.Link.Value> {
    return [
      ...(linkDependencies || [])
        .map(
          ({ offsets, value, type }) => ({
            offsets,
            value: (type === "literal")
              ? {
                value: value as string,
                type: type as "literal"
              }
              : {
                value: value as string,
                type: type as "reference"
              }
          })
        )
      ];
  }

  export function readCompiler(compiler: schema.CompilerInformation): pkg.Compiler {
    return {
      name: compiler.name,
      version: compiler.version,
      settings: compiler.settings || {},
    };
  }

  export function readDeployment (
    deployment: schema.Deployment,
    types: pkg.ContractTypes
  ): pkg.Deployment {
    return Object.assign(
      {}, ...Object.entries(deployment) .map(
        ([ name, instance ]) => ({
          [name]: readInstance(instance, types)
        })
      )
    );
  }

  export function readInstance (
    instance: schema.ContractInstance,
    types: pkg.ContractTypes
  ): pkg.ContractInstance {
    return {
      contractType: instance.contract_type,
      address: instance.address,
      transaction: instance.transaction,
      block: instance.block,
      deploymentBytecode: readLinkedBytecode(
        instance.deployment_bytecode,
        (types[instance.contract_type] || {}).deploymentBytecode
      ),
      runtimeBytecode: readLinkedBytecode(
        instance.runtime_bytecode,
        (types[instance.contract_type] || {}).runtimeBytecode
      ),
      compiler: lift(readCompiler)(instance.compiler),
    }
  }
}

export class Reader {
  private manifest: schema.PackageManifest;

  constructor (manifest: schema.PackageManifest) {
    this.manifest = manifest;
  }

  read (): pkg.Package {
    return {
      packageName: this.packageName,
      version: this.version,
      meta: this.meta,
      sources: this.sources,
      contractTypes: this.contractTypes,
      deployments: this.deployments,
      buildDependencies: this.buildDependencies
    };
  }

  get packageName () {
    return this.manifest.package_name;
  }

  get version () {
    return this.manifest.version;
  }

  get meta () {
    const metadata = this.manifest.meta || {};

    return {
      authors: metadata.authors,
      license: metadata.license,
      description: metadata.description as pkg.Meta.Description,
      keywords: metadata.keywords as Array<pkg.Meta.Keyword>,
      links: Object.entries(metadata.links || {}).map(
        ([ resource, uri ]) => ({ resource, uri })
      ),
    };
  }

  get sources () {
    const sources = this.manifest.sources || {};

    return Object.assign(
      {},
      ...Object.entries(sources)
        .map( ([ path, source ]) => {
          try {
            return { [path]: new URL(source) as pkg.ContentURI };
          } catch (e) {
            return { [path]: source as pkg.SourceString }
          }
        })
    );
  }

  get contractTypes () {
    return Fields.readContractTypes(this.manifest.contract_types || {});
  }

  get deployments () {
    return Fields.readDeployments(
      this.manifest.deployments || {},
      this.contractTypes
    );
  }

  get buildDependencies () {
    return Object.assign(
      {},
      ...Object.entries(this.manifest.build_dependencies || {})
        .map(
          ([ name, contentURI ]) => ({
            [name]: new URL(contentURI)
          })
        )
    );
  }
}

export class Writer {
  private package: pkg.Package;

  constructor (package_: pkg.Package) {
    this.package = package_;
  }

  write (): schema.PackageManifest {
    return {
      manifest_version: VERSION,
      package_name: this.package.packageName,
      version: this.package.version,
    };
  }
}

const v2 = {
  version: VERSION,

  readSync: (json: string) =>
    new Reader(JSON.parse(json) as schema.PackageManifest).read(),

  read: async (json: string) =>
    new Reader(JSON.parse(json) as schema.PackageManifest).read(),

  write: async (pkg: pkg.Package) =>
    stringify(await new Writer(pkg).write())
}

export { v2 };

export default class Connector extends config.Connector<manifest.Service> {
  optionsType = t.interface({});

  async init (): Promise<manifest.Service> {
    return v2;
  }
}
