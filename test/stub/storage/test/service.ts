import { URL } from "url";

import hash from "ethpm/storage/ipfs/hash";

import { StubService } from "test/stub/storage";

describe("StubService", () => {
  it("records and retrieves string values by hash", async () => {
    const service = new StubService()

    const contents = [
      'hello world',
      '{"manifest_version":"2","package_name":"owned","version":"1.0.0"}',
      'readme'
    ];

    // setup
    for (let content of contents) {
      await service.write(content);
    }

    const hashes = await Promise.all(contents.map(hash))
    const expectedUris = hashes.map(result => `ipfs://${result}`);

    // test URI lookup
    for (let [idx, uri] of expectedUris.entries()) {
      const retrieved = await service.read(new URL(uri));

      expect(retrieved).toEqual(contents[idx]);
    }
  });
});
