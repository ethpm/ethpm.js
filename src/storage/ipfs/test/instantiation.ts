import { EthPM } from "ethpm";
import { IpfsService } from "../index";

describe("IPFS instantiation", () => {
  it("fails to load plugin without any options passed in", async () => {
    const missingOptions = EthPM.configure({
      storage: "ethpm/storage/ipfs"
    }).connect({
      /* ... ??? ... */
    });

    await expect(missingOptions).rejects.toBeTruthy();
  });

  it("fails to load plugin with partial options passed in", async () => {
    const missingOptions = EthPM.configure({
      storage: "ethpm/storage/ipfs"
    }).connect({
      ipfs: { host: "ipfs.infura.io" }
    });

    await expect(missingOptions).rejects.toBeTruthy();
  });

  it("loads plugin with required options", async () => {
    const ethpm = await EthPM.configure({
      storage: "ethpm/storage/ipfs"
    }).connect({
      ipfs: { host: "ipfs.infura.io", port: 5001, protocol: "https" }
    });

    expect(ethpm.storage).toBeInstanceOf(IpfsService);
    expect(ethpm.storage.host).toBe("ipfs.infura.io")
    expect(ethpm.storage.port).toBe(5001)
    expect(ethpm.storage.protocol).toBe("https")
  });
});
