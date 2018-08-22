import { URL } from "url";
import * as stringify from "json-stable-stringify";

import { lift, lift2 } from "types";
import * as schema from "ethpm-spec";
import * as meta from "ethpm/package/meta";
import * as pkg from "ethpm/package/package";

import { ManifestVersion } from "ethpm/manifest/types";

const VERSION = "2";

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
      description: metadata.description as meta.Description,
      keywords: metadata.keywords as Array<meta.Keyword>,
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
    return this.readContractTypes(this.manifest.contract_types || {});
  }

  get deployments () {
    return this.readDeployments(
      this.manifest.deployments || {},
      this.contractTypes
    );
  }

  get buildDependencies () {
    return Object.assign(
      {},
      ...Object.entries(this.manifest.build_dependencies || {})
        .map(
          ([ name, contentURI ]) => ([
            name,
            new URL(contentURI)
          ])
        )
    );
  }

  readContractTypes (contractTypes: schema.ContractTypes): pkg.ContractTypes {
    return Object.assign(
      {},
      ...Object.entries(contractTypes)
        .map(
          ([ alias, contractType ]) => ([
            alias,
            this.readContractType(contractType, alias)
          ])
        )
    );
  }

  private readDeployments (
    deployments: schema.Deployments,
    types: pkg.ContractTypes
  ): pkg.Deployments {
    return Object.assign(
      {},
      ...Object.entries(deployments)
        .map(
          ([ chainURI, deployment ]) => ([
            new URL(chainURI),
            this.readDeployment(deployment, types)
          ] as [pkg.ChainURI, pkg.Deployment])
        )
    );
  }

  private readContractType (
    contractType: schema.ContractType,
    alias: string
  ): pkg.ContractType {
    return {
      contractName: contractType.contract_name || alias,
      deploymentBytecode: lift(this.readUnlinkedBytecode)(contractType.deployment_bytecode),
      runtimeBytecode: lift(this.readUnlinkedBytecode)(contractType.runtime_bytecode),
      abi: contractType.abi,
      natspec: contractType.natspec,
      compiler: lift(this.readCompiler)(contractType.compiler)
    };
  }

  private readUnlinkedBytecode(
    bytecode: schema.UnlinkedBytecodeObject
  ): pkg.UnlinkedBytecode {
    return {
      bytecode: bytecode.bytecode,
      linkReferences: [...(bytecode.link_references || [])]
    };
  }

  private readLinkedBytecode(
    bytecode: schema.LinkedBytecodeObject,
    parent: pkg.UnlinkedBytecode
  ): pkg.LinkedBytecode {
    return {
      bytecode: bytecode.bytecode || parent.bytecode,
      linkReferences: [...(bytecode.link_references || parent.linkReferences)],
      linkDependencies: this.readLinkDependencies(bytecode.link_dependencies),
    };
  }


  private readLinkDependencies(
    linkDependencies: schema.LinkDependencies
  ): Array<pkg.link.Value> {
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

  private readCompiler(compiler: schema.CompilerInformation): pkg.Compiler {
    return {
      name: compiler.name,
      version: compiler.version,
      settings: compiler.settings || {},
    };
  }

  private readDeployment (
    deployment: schema.Deployment,
    types: pkg.ContractTypes
  ): pkg.Deployment {
    return Object.assign(
      {},
      ...Object.entries(deployment)
        .map(
          ([ name, instance ]) => ([
            name,
            this.readInstance(instance, types)
          ] as [pkg.ContractInstanceName, pkg.ContractInstance])
        )
    );
  }

  private readInstance (
    instance: schema.ContractInstance,
    types: pkg.ContractTypes
  ): pkg.ContractInstance {
    return {
      contractType: instance.contract_type,
      address: instance.address,
      transaction: instance.transaction,
      block: instance.block,
      runtimeBytecode: lift2(this.readLinkedBytecode)(
        instance.runtime_bytecode,
        (types[instance.contract_type] || {}).runtimeBytecode
      ),
      compiler: lift(this.readCompiler)(instance.compiler),
    }
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

const v2: ManifestVersion = {
  version: VERSION,

  read: (json: string) =>
    new Reader(JSON.parse(json) as schema.PackageManifest).read(),

  write: (pkg: pkg.Package) =>
    stringify(new Writer(pkg).write())
}


export default v2;
