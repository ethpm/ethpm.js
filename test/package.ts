const debug = require("debug")("test:package");

import { ManifestBuilder } from "ethpm/package";
import { PackageManifest } from "schema";

describe("Manifest Builder", () => {
  it("builds a package manifest", () => {
    const builder = new ManifestBuilder("escrow", "0.1.0");
    const manifest: PackageManifest = builder.manifest;

    expect(manifest).toHaveProperty("manifest_version");
    expect(manifest).toHaveProperty("package_name");
    expect(manifest).toHaveProperty("version");
  });

  it("records dependencies", () => {
    const dependency = {
      name: "standard-token",
      uri: "ipfs://QmVu9zuza5mkJwwcFdh2SXBugm1oSgZVuEKkph9XLsbUwg"
    };

    const manifest: PackageManifest = new ManifestBuilder("piper-coin", "1.0.0")
      .addDependency(dependency.name, dependency.uri)
      .manifest;

    expect(manifest).toHaveProperty("build_dependencies");
    expect(manifest.build_dependencies).toHaveProperty(dependency.name);
    expect(manifest.build_dependencies[dependency.name]).toEqual(dependency.uri);
  });

  it("supports vendor extensions", () => {
    const via = "Buffle@5.0.0-next.0";
    const manifest: PackageManifest = new ManifestBuilder("piper-coin", "1.0.0")
      .note("via", via)
      .manifest;

    expect(manifest).toHaveProperty("x-via");
    expect(manifest["x-via"]).toEqual(via);
  });
});
