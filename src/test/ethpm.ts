import EthPM from "ethpm";
import { Manifest, Storage, Registry } from "ethpm/config";

import examples from "test/examples/manifests";
import packages from "test/examples/packages";

describe("Configuration", () => {
  it("loads manifest plugin", async () => {
    const ethpm = await EthPM.configure<Manifest>({
      manifest: "ethpm/manifest/v2",
    }).connect();

    const pkg = ethpm.manifest.read(examples["wallet-with-send"]);

    expect(pkg.packageName).toEqual("wallet-with-send");

  });

  it("loads storage plugin", async () => {
    const ethpm = await EthPM.configure<Storage>({
      storage: "test/stub/ipfs",
    }).connect();

    const wallet = packages["wallet-with-send"].buildDependencies["wallet"];
    const manifest = await ethpm.storage.read(wallet);

    expect(manifest).toEqual(examples["wallet"]);
  });
});
