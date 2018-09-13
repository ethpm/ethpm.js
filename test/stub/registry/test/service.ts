import hash from "ethpm/storage/ipfs/hash";

import { URL } from "url";

import { StubService } from "test/stub/manifest";
import packages from "test/examples/packages";

describe("StubService", () => {
  it("represents packages via packageName as canonical manifest", async () => {
    const service = new StubService()

    // setup
    for (let package_ of Object.values(packages)) {
      await service.add(package_);
    }

    // test manifest "reading"
    for (let [packageName, expected] of Object.entries(packages)) {
      const actual = await service.read(packageName);

      expect(actual).toEqual(expected);
    }
  });
});
