/**
 * @module "test/examples"
 */

import * as pkg from "ethpm/package";
import { v3 } from "ethpm/manifests/v3";

import manifests from "./manifests";

interface PackageMap {
  [name: string]: pkg.Package
}

function getPackages(): PackageMap {
  const map: PackageMap = {};

  for (let [name, manifest] of Object.entries(manifests)) {
    map[name] = v3.readSync(manifest);
  }

  return map;
}

const packages: PackageMap = getPackages();

export default packages;

