import * as pkg from "ethpm/package/package";
import manifests from "./manifests";
import v2 from "ethpm/manifest/v2";

interface PackageMap {
  [name: string]: pkg.Package
}

function getPackages(): PackageMap {
  const map: PackageMap = {};

  for (let [name, manifest] of Object.entries(manifests)) {
    map[name] = v2.readSync(manifest);
  }

  return map;
}

const packages: PackageMap = getPackages();

export default packages;

