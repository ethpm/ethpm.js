import { URL } from "url";
import manifests from "test/examples/manifests";
import getHash from "ethpm/storage/ipfs/hash";

import ExamplesConnector from "test/stub/registries/examples";

it("lists packages", async () => {
  const service = await (new ExamplesConnector()).connect({});

  const packageNames: Array<string> = await Promise.all(
    Array.from(await service.packages())
  );

  expect(packageNames).toEqual(Object.keys(manifests));
});

it("lists releases", async () => {
  const service = await (new ExamplesConnector()).connect({});

  const releases: Array<string> = await Promise.all(
    Array.from(await service.package("wallet").releases())
  );

  expect(releases).toEqual(["1.0.0"]);
});

it("retrives manifest URIs for a release", async () => {
  const service = await (new ExamplesConnector()).connect({});

  const owned = manifests["owned"];

  const manifestUri = await service.package("owned").release("1.0.0");

  expect(manifestUri).toEqual(new URL(`ipfs://${await getHash(owned)}`));
});

