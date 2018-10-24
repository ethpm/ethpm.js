import { EthPM } from "ethpm";

import manifests from "test/examples/manifests";
import packages from "test/examples/packages";
import sources from "test/examples/sources";

describe("Configuration", () => {
  it("loads manifests plugin", async () => {
    const ethpm = await EthPM.configure({
      manifests: "ethpm/manifests/v2",
    }).connect();

    const pkg = await ethpm.manifests.read(manifests["wallet-with-send"]);

    expect(pkg.packageName).toEqual("wallet-with-send");

  });

  it("loads storage plugin", async () => {
    const ethpm = await EthPM.configure({
      storage: "test/stub/storage/examples",
    }).connect();

    const wallet = packages["wallet-with-send"].buildDependencies["wallet"];
    const manifest = await ethpm.storage.read(wallet);

    expect(manifest).toEqual(manifests["wallet"]);
  });

  it("loads manifests and storage plugins", async () => {
    const ethpm = await EthPM.configure({
      manifests: "ethpm/manifests/v2",
      storage: "test/stub/storage/examples",
    }).connect();

    const walletWithSend = await ethpm.manifests.read(manifests["wallet-with-send"]);
    const manifest = await ethpm.storage.read(
      walletWithSend.buildDependencies["wallet"]
    );

    expect(manifest).toBeDefined();

    // to get past typecheck
    if (manifest === undefined) {
      return;
    }

    const wallet = await ethpm.manifests.read(manifest);

    expect(wallet).toEqual(packages["wallet"]);
  });

  it("fails to load plugin without required options", async () => {
    const missingOptions = EthPM.configure({
      storage: "test/stub/storage"
    }).connect({
      /* ... ??? ... */
    });

    await expect(missingOptions).rejects.toBeTruthy();
  });

  it("loads plugins with required options", async () => {
    const storedContent = '{"package_name": "registry"}';
    const ethpm = await EthPM.configure({
      storage: "test/stub/storage"
    }).connect({
      contents: [storedContent]
    });

    const uri = await ethpm.storage.predictUri(storedContent);
    const retrievedContent = await ethpm.storage.read(uri);

    expect(retrievedContent).toEqual(storedContent);
  });

  it("loads multiple plugins with required options", async () => {
    const storedContent = "some file\n\n\n";

    const ethpm = await EthPM.configure({
      manifests: "test/stub/manifests",
      storage: "test/stub/storage"
    }).connect({
      packages: Object.values(packages),
      contents: [storedContent]
    });

    // test package lookup via fake manifest
    expect(packages["wallet"]).toEqual(await ethpm.manifests.read("wallet"));

    // test stored content retrieval
    const uri = await ethpm.storage.predictUri(storedContent);
    const retrievedContent = await ethpm.storage.read(uri);
    expect(retrievedContent).toEqual(storedContent);
  });

  it("loads pre-required plugins", async () => {
    const ethpm = await EthPM.configure({
      manifests: require("ethpm/manifests/v2"),
      storage: require("test/stub/storage/examples"),
    }).connect();

    const walletWithSend = await ethpm.manifests.read(manifests["wallet-with-send"]);
    const manifest = await ethpm.storage.read(
      walletWithSend.buildDependencies["wallet"]
    );

    expect(manifest).toBeDefined();

    // to get past typecheck
    if (manifest === undefined) {
      return;
    }

    const wallet = await ethpm.manifests.read(manifest);

    expect(wallet).toEqual(packages["wallet"]);
  });
});

describe.skip("Packaging", () => {
  describe("owned", () => {
    it("allows defining the package from scratch", async () => {
      const ethpm = await EthPM.configure({
        manifests: require("ethpm/manifests/v2"),
        storage: require("test/stub/storage/examples"),
      }).connect();

      const { packageName, version } = packages["owned"];
      const {
        authors, description, keywords, license, links
      } = packages["owned"].meta;

      const buffer = ethpm.packages.create(packageName, version);

      // sources
      for (let [sourcePath, source] of Object.entries(sources[packageName])) {
        buffer.sources.include(sourcePath, source);
      }

      // meta
      buffer.meta.description.matches(description);
      buffer.meta.license.matches(license);

      for (let author of (authors || [])) {
        buffer.meta.authors.include(author);
      }

      for (let keyword of (keywords || [])) {
        buffer.meta.keywords.include(keyword);
      }

      for (let { resource, uri } of (links || [])) {
        buffer.meta.links.include(resource, uri);
      }

      // build complete package object and compare that it matches our original
      expect(await buffer.package()).toEqual(packages["owned"]);

    });
  });
});
