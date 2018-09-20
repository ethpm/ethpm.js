import ExamplesConnector from "test/stub/manifests/examples";
import packages from "test/examples/packages";

it("retrives examples", async () => {
  const service = await (new ExamplesConnector()).connect({});

  const owned = packages["owned"];

  expect(await service.read("owned")).toEqual(owned);
});
