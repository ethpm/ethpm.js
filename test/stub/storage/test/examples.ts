import { URL } from "url";

import hash from "ethpm/storage/ipfs/hash";

import { exampleStorage } from "test/stub/storage/examples";
import examples from "test/examples/manifests";

it("retrives examples", async () => {
  const owned = examples["owned"];
  const hashed = await hash(owned);
  const uri = new URL(`ipfs://${hashed}`);

  expect(await exampleStorage.read(uri)).toEqual(owned);
});
