// import { EthPM } from "ethpm";

const IPFSFactory = require("ipfsd-ctl");

describe("IPFS integration", () => {
  let daemon: any;

  const startDaemon = () =>
    new Promise(resolve => {
      const f = IPFSFactory.create({ type: "js" });
      f.spawn((err: any, ipfsd: any) => {
        daemon = ipfsd
        resolve()
      });
    });

  beforeAll(() => startDaemon(), 20000);
  afterAll(() => daemon.stop());

  it("should show the IPFS daemon to be initialized", () => {
    expect(daemon.initialized).toBe(true);
  });
});
