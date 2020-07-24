/**
 * @module "ethpm/package"
 */

import { URL } from 'url';

import { Maybe } from 'ethpm/types';
import { Meta } from './meta';
import { Link } from './link';

export type Address = string;
export type TransactionHash = string;
export type BlockHash = string;
export type PackageName = string;
export type Manifest = string;
export type Version = string;
export type RelativePath = string;
export type ChainURI = URL;
export type ContentURI = URL;
export type SourceString = string;
export type ContractAlias = string;
export type ContractName = string;
export type ContractTypeReference = string;
export type ContractInstanceName = string;
export type bytecode = string;
export type CompilerName = string;
export type CompilerVersion = string;
export type CompilerSettings = any; // this should be object

export type ABI = Array<any>;
export type Devdoc = object;
export type Userdoc = object;


export interface Compiler {
  name: CompilerName;
  version: CompilerVersion;
  settings?: CompilerSettings; // why doesn't Maybe work here?
  contractTypes?: Array<ContractTypeReference>; // why doesn't Maybe work here?
}

export interface Bytecode {
  bytecode: bytecode;
  linkReferences: Array<Link.Reference>;
  linkDependencies: Array<Link.Value>;
}

export interface ContractType {
  contractName: ContractName;
  deploymentBytecode: Maybe<Bytecode>;
  runtimeBytecode: Maybe<Bytecode>;
  abi: Maybe<ABI>;
  devdoc: Maybe<Devdoc>;
  userdoc: Maybe<Userdoc>;
  sourceId: Maybe<SourceId>;
}

export interface ContractInstance {
  contractType: ContractTypeReference;
  address: Address;
  transaction: Maybe<TransactionHash>;
  block: Maybe<BlockHash>;
  //deploymentBytecode: Maybe<Bytecode>;
  runtimeBytecode: Maybe<Bytecode>;
  //compiler: Maybe<Compiler>;
}

export type SourceId = string;

export interface SourceWithUrls {
  type: Maybe<string>;
  installPath: Maybe<RelativePath>;
  urls: Array<ContentURI>;
}

export interface SourceWithContent {
  type: Maybe<string>;
  installPath: Maybe<RelativePath>;
  content: SourceString;
}

export type Sources = Record<SourceId, SourceWithContent> | Record<SourceId, SourceWithUrls>;
export type ContractTypes = Record<ContractAlias, ContractType>;
export type Compilers = Array<Compiler>;
export type Deployment = Record<ContractInstanceName, ContractInstance>;
export type Deployments = Map<ChainURI, Deployment>;
export type BuildDependencies = Record<PackageName, ContentURI>;

export interface Package {
  packageName: Maybe<PackageName>;
  version: Maybe<Version>;
  manifest: Manifest;
  meta: Meta.PackageMeta;
  sources: Sources;
  compilers: Compilers;
  contractTypes: ContractTypes;
  deployments: Deployments;
  buildDependencies: BuildDependencies;
}
