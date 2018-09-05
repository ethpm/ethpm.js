import hash from "ethpm/storage/ipfs/hash";

import { URL } from "url";

import { Resolver as StubResolver } from "test/stub/ipfs";
import exampleStorage from "test/stub/ipfs";
import examples from "test/examples/manifests";

describe("StubResolver", () => {
  it("records and retrieves string values by hash", async () => {
    const resolver = new StubResolver()

    const contents = [
      'hello world',
      '{"manifest_version":"2","package_name":"owned","version":"1.0.0"}',
      'readme'
    ];

    // setup
    for (let content of contents) {
      resolver.add(content);
    }

    const hashes = await Promise.all(contents.map(hash))
    const expectedUris = hashes.map(result => `ipfs://${result}`);

    // test URI lookup
    for (let [idx, uri] of expectedUris.entries()) {
      const retrieved = await resolver.read(new URL(uri));

      expect(retrieved).toEqual(contents[idx]);
    }
  });
});

it("retrives examples", async () => {
  const owned = examples["owned"];
  const hashed = await hash(owned);
  const uri = new URL(`ipfs://${hashed}`);

  expect(await exampleStorage.read(uri)).toEqual(owned);
});
