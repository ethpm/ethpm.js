import manifests from "./manifests";
import v2 from "ethpm/manifest/v2";

const packages = Object.assign(
  {}, ...Object.entries(manifests).map(
    ([ name, manifest ]) => ({
      [name]: v2.read(manifest)
    })
  )
);

export default packages;

