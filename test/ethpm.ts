import EthPM from "ethpm";
import { Manifest, Storage, Registry } from "ethpm/config";

import examples from "test/examples/manifests";

describe("Configuration", () => {
  it("loads manifest plugin", async () => {
    const ethpm = await EthPM.configure<Manifest>({
      manifest: "ethpm/manifest/v2",
    }).connect();

    const pkg = ethpm.manifest.read(examples["wallet-with-send"]);

    expect(pkg.packageName).toEqual("wallet-with-send");

  });
});
