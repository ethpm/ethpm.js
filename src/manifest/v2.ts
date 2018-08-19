import { URL } from "url";

import { lift } from "types";
import * as schema from "schema";
import * as meta from "ethpm/package/meta";
import * as pkg from "ethpm/package/package";

import { ManifestReader } from "./manifest";

export class Manifest implements pkg.Package {
  private manifest: schema.PackageManifest;

  constructor (manifest: schema.PackageManifest) {
    this.manifest = manifest;
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
    return this.readDeployments(this.manifest.deployments || {});
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

  private readDeployments (deployments: schema.Deployments): pkg.Deployments {
    return Object.assign(
      {},
      ...Object.entries(deployments)
        .map(
          ([ chainURI, deployment ]) => ([
            new URL(chainURI),
            this.readDeployment(deployment)
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
      deploymentBytecode: lift(this.readBytecode)(contractType.deployment_bytecode),
      runtimeBytecode: lift(this.readBytecode)(contractType.runtime_bytecode),
      abi: contractType.abi,
      natspec: contractType.natspec,
      compiler: lift(this.readCompiler)(contractType.compiler)
    };
  }

  private readBytecode(bytecode: schema.BytecodeObject): pkg.Bytecode {
    return {
      bytecode: bytecode.bytecode,
      linkReferences: [...(bytecode.link_references || [])],
      linkDependencies: this.readLinkDependencies(bytecode.link_dependencies || []),
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

  private readDeployment (deployment: schemaDeployment): pkg.Deployment {
    return Object.assign(
      {},
      ...Object.entries(deployment)
        .map(
          ([ name, instance ]) => ([
            name,
            this.readInstance(instance)
          ] as [pkg.ContractInstanceName, pkg.ContractInstance])
        )
    );
  }

  private readInstance (instance: schema.ContractInstance): pkg.ContractInstance {
    return {
      contractType: instance.contract_type,
      address: instance.address,
      transaction: instance.transaction,
      block: instance.block,
      runtimeBytecode: lift(this.readBytecode)(instance.runtime_bytecode),
      compiler: lift(this.readCompiler)(instance.compiler),
    }
  }
}

type schemaDeployment = { [k: string]: schema.ContractInstance };



const getPackage: ManifestReader = (json: string): pkg.Package => {
  const manifest = JSON.parse(json) as schema.PackageManifest;

  return new Manifest(manifest);
}

export default getPackage;
