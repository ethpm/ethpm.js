import * as schema from "ethpm-spec";
import readManifest from "ethpm/manifest/v2";

import { Package } from "ethpm/package";

import examples from "test/examples/manifests";


it("reads examples", () => {
  const wallet = examples["wallet-with-send"];

  const pkg: Package = readManifest(wallet);

  expect(pkg.packageName).toEqual("wallet-with-send");
  expect(Object.keys(pkg.sources)).toContain("./contracts/WalletWithSend.sol");
  // expect(Object.keys(pkg.contractTypes)).toContain("WalletWithSend");
});

it("converts package_name", () => {
  const manifest: schema.PackageManifest = {
    "manifest_version": "2",
    "package_name": "Foo",
    "version": "1.0.0",
  };

  const pkg: Package = readManifest(JSON.stringify(manifest));

  expect(pkg).toHaveProperty("packageName");
  expect(pkg).toHaveProperty("version");
  expect(pkg.packageName).toEqual(manifest.package_name);
  expect(pkg.version).toEqual(manifest.version);
});
