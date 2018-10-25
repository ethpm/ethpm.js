import read from "ethpm/storage/ipfs/read";

import { Maybe } from "ethpm/types";
import { URL } from "url";

// TODO - write real tests that reflect actual usage
it("exists", async () => {
  const testUrl: URL = new URL("ipfs://my_test_url");

  const expected: string = "my_content";
  const actual: string = (await read(testUrl)) || "";

  expect(actual).toEqual(expected);
});
