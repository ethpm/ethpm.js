/**
 * @module "ethpm/package"
 */

import * as pkg from "./package";

export interface PackageQuery {
  package: pkg.Package

  contractType(ref: pkg.ContractTypeReference)
    : Promise<pkg.ContractType>;

  contractInstance(chain: pkg.ChainURI, instance: pkg.ContractInstanceName)
    : Promise<pkg.ContractInstance>;

  buildDependency(name: pkg.PackageName)
    : Promise<pkg.Package>;
}
