/**
 * @module "ethpm/session"
 */

import * as config from "ethpm/config";
import * as pkg from "ethpm/package";
import * as manifests from "ethpm/manifests";
import * as storage from "ethpm/storage";


export class Query<T extends config.Config> {
  package: pkg.Package;

  private workspace: config.Workspace<T>;

  constructor (options: {
    package: pkg.Package,
    workspace: config.Workspace<T>
  }) {
    this.package = options.package;
    this.workspace = options.workspace;
  }

  async scope (dependencyName: pkg.PackageName): Promise<Query<T>> {
    const dependency = await this.buildDependency(dependencyName);

    const resolver = new Query({
      package: dependency,
      workspace: this.workspace,
    });

    return resolver;
  }

  async contractType(ref: pkg.ContractTypeReference)
    : Promise<pkg.ContractType>
  {
    const terms = ref.split(":");

    const packages = terms.slice(0, -1);
    const type = terms.slice(-1);

    const [ dependencyName, ...rest ] = packages;

    if (dependencyName) {
      const subquery = await this.scope(dependencyName);
      const innerRef = [...rest, type].join(":");

      return await subquery.contractType(innerRef);
    }

    // plain type reference
    return this.package.contractTypes[ref];
  }

  async contractInstance(
    chain: pkg.ChainURI,
    name: pkg.ContractInstanceName
  )
    : Promise<pkg.ContractInstance>
  {
    const deployment = this.package.deployments.get(chain)
    if (deployment === undefined) {
      throw new Error(`Could not find deployment at chain ${chain.href}`);
    }

    const instance = deployment[name];
    if (instance === undefined) {
      throw new Error(`Could not find instance "${name}" on chain ${chain.href}`);
    }

    return instance;
  }

  async buildDependency(name: pkg.PackageName)
    : Promise<pkg.Package> | never
  {
    if (!("storage" in this.workspace)) {
      throw new Error("Storage not configured!");
    }

    if (!("manifests" in this.workspace)) {
      throw new Error("Manifests not configured!");
    }

    const workspace = <
      config.Workspace<config.HasManifests & config.HasStorage>
    >this.workspace;

    const uri = this.package.buildDependencies[name];
    const contents = await workspace.storage.read(uri);
    if (contents !== undefined) {
      return await workspace.manifests.read(contents);
    }

    throw new Error(`Could not find build dependency "${name}"`);
  }

}
