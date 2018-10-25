import predictUri from "ethpm/storage/ipfs/predictUri";

import { URL } from "url";

// TODO - write real tests that reflect actual usage
it("exists", async () => {
  const expected: URL = new URL("ipfs://my_test_url");
  const actual: URL = await predictUri("my_test_content");

  expect(actual).toEqual(expected);
});
