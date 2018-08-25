import * as pkg from "ethpm/package/package";
import manifests from "./manifests";
import v2 from "ethpm/manifest/v2";

interface PackageMap {
  [name: string]: pkg.Package
}

const packages: PackageMap = Object.assign(
  {}, ...Object.entries(manifests).map(
    ([ name, manifest ]) => ({
      [name]: v2.read(manifest)
    })
  )
);

export default packages;

