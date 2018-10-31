// import { EthPM } from "ethpm";

const IPFSFactory = require("ipfsd-ctl");

describe("IPFS integration", () => {
  let daemon: any;
  let host: string;
  let port: string;

  const startDaemon = () =>
    new Promise(resolve => {
      const f = IPFSFactory.create({ type: "js" });
      f.spawn((err: any, ipfsd: any) => {
        daemon = ipfsd;
        host = daemon.api.apiHost;
        port = daemon.api.apiPort;
        resolve();
      });
    });

  beforeAll(() => startDaemon(), 20000);
  afterAll(() => daemon.stop());

  it("should initialize the IPFS daemon properly", () => {
    expect(daemon.initialized).toBe(true);
  });
});
