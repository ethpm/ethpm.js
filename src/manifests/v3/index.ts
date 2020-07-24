
/**
 * @module "ethpm/manifests/v3"
 */

import * as t from 'io-ts';

import { URL } from 'url';
import stringify from 'json-stable-stringify';

import { lift } from 'ethpm/types';
import * as schema from 'ethpm-spec';
import * as config from 'ethpm/config';
import * as pkg from 'ethpm/package';
import * as manifests from 'ethpm/manifests/service';

const deepEqual = require('deep-equal');

const VERSION = 'ethpm/3';

namespace Fields {
  export function readContractTypes(contractTypes: schema.ContractTypes): pkg.ContractTypes {
    return Object.assign(
      {},
      ...Object.entries(contractTypes)
        .map(
          ([alias, contractType]) => ({
            [alias]: readContractType(contractType, alias),
          }),
        ),
    );
  }

  export function readDeployments(
    deployments: schema.Deployments,
    types: pkg.ContractTypes,
  ): pkg.Deployments {
    return new Map(
      Object.entries(deployments)
        .map(
          ([chainURI, deployment]) => ([
            new URL(chainURI),
            readDeployment(deployment, types),
          ] as [pkg.ChainURI, pkg.Deployment]),
        ),
    );
  }

  export function readContractType(
    contractType: schema.ContractType,
    alias: string,
  ): pkg.ContractType {
    return {
      contractName: contractType.contractName || alias,
      deploymentBytecode: lift(readBytecode)(contractType.deploymentBytecode),
      runtimeBytecode: lift(readBytecode)(contractType.runtimeBytecode),
      abi: contractType.abi,
      userdoc: contractType.userdoc,
      devdoc: contractType.devdoc,
      sourceId: contractType.sourceId,
      //compiler: lift(readCompiler)(contractType.compiler),
    };
  }

  export function readCompilers(
    compilers: schema.Compilers,
  ): pkg.Compilers {
    return compilers
  }

  export function readBytecode(
    bytecode?: schema.BytecodeObject,
    parent?: pkg.Bytecode,
  ): pkg.Bytecode | undefined {
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
        (bytecode.linkReferences)
          ? bytecode.linkReferences
          : (parent && parent.linkReferences)
            ? parent.linkReferences
            : []
      )],
      linkDependencies: readLinkDependencies(bytecode.linkDependencies),
    };
  }

  export function readLinkDependencies(
    linkDependencies: schema.LinkDependencies,
  ): Array<pkg.Link.Value> {
    return [
      ...(linkDependencies || [])
        .map(
          ({ offsets, value, type }) => ({
            offsets,
            value: (type === 'literal')
              ? {
                value: value as string,
                type: type as 'literal',
              }
              : {
                value: value as string,
                type: type as 'reference',
              },
          }),
        ),
    ];
  }

  export function readCompiler(compiler: schema.CompilerInformation): pkg.Compiler {
    return { name: compiler.name, version: compiler.version,
      settings: compiler.settings || {},
    };
  }

  export function readDeployment(
    deployment: schema.Deployment,
    types: pkg.ContractTypes,
  ): pkg.Deployment {
    return Object.assign(
      {}, ...Object.entries(deployment).map(
        ([name, instance]) => ({
          [name]: readInstance(instance, types),
        }),
      ),
    );
  }

  export function readInstance(
    instance: schema.ContractInstance,
    types: pkg.ContractTypes,
  ): pkg.ContractInstance {
    return {
      contractType: instance.contractType,
      address: instance.address,
      transaction: instance.transaction,
      block: instance.block,
      runtimeBytecode: readBytecode(
        instance.runtimeBytecode,
        (types[instance.contractType] || {}).runtimeBytecode,
      ),
    };
  }


  export function writeContractTypes(contractTypes: pkg.ContractTypes): schema.ContractTypes {
    return Object.assign(
      {},
      ...Object.entries(contractTypes)
        .map(
          ([alias, contractType]) => ({
            [alias]: writeContractType(contractType, alias),
          }),
        ),
    );
  }

  export function writeDeployments(
    deployments: pkg.Deployments,
    types: pkg.ContractTypes,
  ): schema.Deployments {
    return Object.assign({}, ...Array.from(deployments.entries())
      .map(([chainURI, deployment]) => ({
        [chainURI.href]: writeDeployment(deployment, types),
      })));
  }

  export function writeContractType(
    contractType: pkg.ContractType,
    alias: pkg.ContractAlias,
  ): schema.ContractType {
    return {
      deploymentBytecode: lift(writeBytecode)(contractType.deploymentBytecode),
      runtimeBytecode: lift(writeBytecode)(contractType.runtimeBytecode),
      abi: contractType.abi,
      devdoc: contractType.devdoc,
      userdoc: contractType.userdoc,
      sourceId: contractType.sourceId,
      //compiler: lift(writeCompiler)(contractType.compiler),

      ...((contractType.contractName != alias)
        ? { contractName: contractType.contractName }
        : {}),
    };
  }

  export function writeCompilers(
    compilers: pkg.Compilers
  ): schema.Compilers {
    return compilers
  }

  export function writeBytecode(
    bytecode: pkg.Bytecode,
    parent?: pkg.Bytecode,
  ): schema.BytecodeObject {
    return {

      // possibly include bytecode
      ...((!parent || bytecode.bytecode != parent.bytecode)
        ? { bytecode: bytecode.bytecode }
        : {}),

      // possibly include link_references
      ...((
        bytecode.linkReferences.length > 0 && (
          !parent || !deepEqual(bytecode.linkReferences, parent.linkReferences)
        )
      )
        ? { linkReferences: [...bytecode.linkReferences] }
        : {}),

      // possibly include link_dependencies
      ...((
        bytecode.linkDependencies.length > 0 && (
          !parent
            || !deepEqual(bytecode.linkDependencies, parent.linkDependencies)
        )
      )
        ? { linkDependencies: writeLinkDependencies(bytecode.linkDependencies) }
        : {}),
    };
  }

  export function writeLinkDependencies(
    linkDependencies: Array<pkg.Link.Value>,
  ): schema.LinkDependencies {
    return [
      ...(linkDependencies || [])
        .map(
          ({ offsets, value }) => ({
            offsets,
            ...('type' in value ? { type: value.type } : {}),
            ...('value' in value ? { value: value.value } : {}),
          }),
        ),
    ];
  }

  export function writeCompiler(compiler: pkg.Compiler): schema.CompilerInformation {
    return {
      name: compiler.name,
      version: compiler.version,
      settings: compiler.settings,
    };
  }

  export function writeDeployment(
    deployment: pkg.Deployment,
    types: pkg.ContractTypes,
  ): schema.Deployment {
    return Object.assign(
      {}, ...Object.entries(deployment).map(
        ([name, instance]) => ({
          [name]: writeInstance(instance, types),
        }),
      ),
    );
  }

  export function writeInstance(
    instance: pkg.ContractInstance,
    types: pkg.ContractTypes,
  ): schema.ContractInstance {
    // type ignore b/c undefined case is handled on 295
    // @ts-ignore
    return {
      contractType: instance.contractType,
      address: instance.address as schema.Address,

      ...((instance.runtimeBytecode)
        ? {
          runtimeBytecode: writeBytecode(
            instance.runtimeBytecode,
            (types[instance.contractType] || {}).runtimeBytecode,
          ),
        }
        : {}),

      ...(instance.transaction ? { transaction: instance.transaction } : {}),

      ...(instance.block ? { block: instance.block } : {}),
    };
  }
}

export class Reader {
  private manifest: schema.PackageManifest;

  constructor(manifest: schema.PackageManifest) {
    this.manifest = manifest;
  }

  read(): pkg.Package {
    return {
      packageName: this.packageName,
      version: this.version,
      manifest: this.manifestVersion,
      meta: this.meta,
      sources: this.sources,
      contractTypes: this.contractTypes,
      compilers: this.compilers,
      deployments: this.deployments,
      buildDependencies: this.buildDependencies,
    };
  }

  get packageName() {
    return this.manifest.name;
  }

  get version() {
    return this.manifest.version;
  }

  get manifestVersion() {
    if (typeof this.manifest.manifest === 'undefined') {
      return VERSION;
    } else if (this.manifest.manifest !== VERSION) {
      throw new Error(`Unsupported manifest version ${this.manifest.manifest}`);
    } else {
      return this.manifest.manifest;
    }
  }

  get meta() {
    const metadata = this.manifest.meta || {};

    return {
      authors: metadata.authors,
      license: metadata.license,
      description: metadata.description as pkg.Meta.Description,
      keywords: metadata.keywords as Array<pkg.Meta.Keyword>,
      links: Object.entries(metadata.links || {}).map(
        ([resource, uri]) => ({ resource, uri }),
      ),
    };
  }

  get sources() {
    const sources = this.manifest.sources || {};

    return Object.assign(
      {},
      ...Object.entries(sources)
        .map(([path, sourceObject]) => {
          try {
            return { 
              [path]: {
                urls: [new URL(sourceObject['urls'][0]) as pkg.ContentURI],
              }
            };
          } catch (e) {
            return { 
              [path]: {
                content: [sourceObject['content'] as pkg.SourceString],
              }
            };
          }
        }),
    );
  }

  get contractTypes() {
    return Fields.readContractTypes(this.manifest.contractTypes || {});
  }

  get compilers() {
    return Fields.readCompilers(this.manifest.compilers || []);
  }

  get deployments() {
    return Fields.readDeployments(
      this.manifest.deployments || {},
      this.contractTypes,
    );
  }

  get buildDependencies() {
    return Object.assign(
      {},
      ...Object.entries(this.manifest.buildDependencies || {})
        .map(
          ([name, contentURI]) => ({
            [name]: new URL(contentURI),
          }),
        ),
    );
  }
}

export class Writer {
  private package: pkg.Package;

  constructor(package_: pkg.Package) {
    this.package = package_;
  }

  get name() {
    return this.package.packageName;
  }

  get version() {
    return this.package.version;
  }

  get meta() {
    const metadata = this.package.meta;

    return Object.assign(
      (metadata.authors && metadata.authors.length > 0)
        ? { authors: metadata.authors }
        : {},

      (metadata.license)
        ? { license: metadata.license }
        : {},

      (metadata.description)
        ? { description: metadata.description }
        : {},

      (metadata.keywords && metadata.keywords.length > 0)
        ? { keywords: metadata.keywords }
        : {},

      (metadata.links && metadata.links.length > 0)
        ? {
          links: Object.assign({}, ...metadata.links.map(
            ({ resource, uri }) => ({ [resource]: uri }),
          )),
        }
        : {},
    );
  }

  get sources() {
    const { sources } = this.package;

    return Object.assign(
      {},
      ...Object.entries(sources)
        .map(
          ([path, source]) => ((source instanceof URL)
            ? { [path]: source.href }
            : { [path]: source }),
        ),
    );
  }

  get contractTypes() {
    return Fields.writeContractTypes(this.package.contractTypes);
  }

  get compilers() {
    return Fields.writeCompilers(this.package.compilers);
  }

  get deployments() {
    return Fields.writeDeployments(this.package.deployments, this.package.contractTypes);
  }

  get buildDependencies() {
    return Object.assign(
      {},
      ...Object.entries(this.package.buildDependencies)
        .map(
          ([name, contentURI]) => ({
            [name]: contentURI.href,
          }),
        ),
    );
  }

  write(): schema.PackageManifest {
    return Object.assign(
      {
        manifest: VERSION,
        name: this.name,
        version: this.version,
      },

      ...Object.entries({
        deployments: this.deployments,
        contractTypes: this.contractTypes,
        compilers: this.compilers,
        sources: this.sources,
        buildDependencies: this.buildDependencies,
        meta: this.meta,
      }).map(
        ([field, obj]) => ((Object.keys(obj).length > 0)
          ? { [field]: obj }
          : {}),
      ),
    ) as schema.PackageManifest;
  }
}

const v3 = {
  version: VERSION,

  readSync: (json: string) => new Reader(JSON.parse(json) as schema.PackageManifest).read(),

  read: async (json: string) => new Reader(JSON.parse(json) as schema.PackageManifest).read(),

  write: async (pkg: pkg.Package) => stringify(await new Writer(pkg).write()),
};

export { v3 };

export default class Connector extends config.Connector<manifests.Service> {
  optionsType = t.interface({});

  async init(): Promise<manifests.Service> {
    return v3;
  }
}
