// import { EthPM } from "ethpm";
const IPFS = require("ipfs");

describe("IPFS integration", () => {
  let node: any;

  const startNode = () =>
    new Promise(resolve => {
      node = new IPFS();
      node.on("ready", resolve);
      node.on("error", (err: any) => console.error(err));
    });

  const stopNode = async () => {
    await node.stop();
  };

  beforeAll(() => startNode());
  afterAll(() => stopNode());

  it("should show the IPFS node to be online", () => {
    expect(node.isOnline()).toBe(true);
  });
});
