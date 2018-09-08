import ExamplesConnector from "test/stub/manifest/examples";
import packages from "test/examples/packages";

it("retrives examples", async () => {
  const service = await ExamplesConnector.connect({});

  const owned = packages["owned"];

  expect(await service.read("owned")).toEqual(owned);
});
