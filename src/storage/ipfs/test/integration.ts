import { EthPM } from "ethpm";

describe("IPFS integration", () => {
  it("fails to load plugin without required options", async () => {
    const missingOptions = EthPM.configure({
      storage: "ethpm/storage/ipfs"
    }).connect({
      /* ... ??? ... */
    });

    await expect(missingOptions).rejects.toBeTruthy();
  });

  it("loads plugins with required options", async () => {
    const storedContent = '{"package_name": "registry"}';
    const ethpm = await EthPM.configure({
      storage: "ethpm/storage/ipfs"
    }).connect({
      contents: [storedContent]
    });

    const uri = await ethpm.storage.predictUri(storedContent);
    const retrievedContent = await ethpm.storage.read(uri);

    expect(retrievedContent).toEqual(storedContent);
  });
});
