import EthPM from "ethpm";
import { HasManifest, HasStorage, HasRegistry } from "ethpm/config";

import examples from "test/examples/manifests";
import packages from "test/examples/packages";

describe("Configuration", () => {
  it("loads manifest plugin", async () => {
    const ethpm = await EthPM.configure<HasManifest>({
      manifest: "ethpm/manifest/v2",
    }).connect();

    const pkg = await ethpm.manifest.read(examples["wallet-with-send"]);

    expect(pkg.packageName).toEqual("wallet-with-send");

  });

  it("loads storage plugin", async () => {
    const ethpm = await EthPM.configure<HasStorage>({
      storage: "test/stub/storage/examples",
    }).connect();

    const wallet = packages["wallet-with-send"].buildDependencies["wallet"];
    const manifest = await ethpm.storage.read(wallet);

    expect(manifest).toEqual(examples["wallet"]);
  });

  it("loads manifest and storage plugins", async () => {
    const ethpm = await EthPM.configure<HasManifest & HasStorage>({
      manifest: "ethpm/manifest/v2",
      storage: "test/stub/storage/examples",
    }).connect();

    const walletWithSend = await ethpm.manifest.read(examples["wallet-with-send"]);
    const manifest = await ethpm.storage.read(
      walletWithSend.buildDependencies["wallet"]
    );

    expect(manifest).toBeDefined();

    // to get past typecheck
    if (manifest === undefined) {
      return;
    }

    const wallet = await ethpm.manifest.read(manifest);

    expect(wallet).toEqual(packages["wallet"]);
  });
});
