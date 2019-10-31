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
export type CompilerSettings = object;

export type ABI = Array<any>;
export type Natspec = object;


export interface Compiler {
  name: CompilerName,
  version: CompilerVersion,
  settings: CompilerSettings,
}

export interface Bytecode {
  bytecode: bytecode,
  linkReferences: Array<Link.Reference>,
  linkDependencies: Array<Link.Value>,
}

export interface ContractType {
  contractName: ContractName,
  deploymentBytecode: Maybe<Bytecode>,
  runtimeBytecode: Maybe<Bytecode>,
  abi: Maybe<ABI>,
  natspec: Maybe<Natspec>,
  compiler: Maybe<Compiler>,
}

export interface ContractInstance {
  contractType: ContractTypeReference,
  address: Address,
  transaction: Maybe<TransactionHash>,
  block: Maybe<BlockHash>,
  deploymentBytecode: Maybe<Bytecode>,
  runtimeBytecode: Maybe<Bytecode>,
  compiler: Maybe<Compiler>,
}

export type Source = ContentURI | SourceString;

export type Sources = Record<RelativePath, Source>;
export type ContractTypes = Record<ContractAlias, ContractType>;
export type Deployment = Record<ContractInstanceName, ContractInstance>;
export type Deployments = Map<ChainURI, Deployment>;
export type BuildDependencies = Record<PackageName, ContentURI>;

export interface Package {
  packageName: PackageName,
  version: Version,
  meta: Meta.PackageMeta,
  sources: Sources,
  contractTypes: ContractTypes,
  deployments: Deployments,
  buildDependencies: BuildDependencies,
}
