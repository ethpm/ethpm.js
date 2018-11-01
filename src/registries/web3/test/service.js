import hash from "ethpm/storage/ipfs/hash";

import { URL } from "url";
import { execSync } from "child_process";

import { Web3RegistryService } from "ethpm/registries/web3/service";
import packages from "test/examples/packages";

import Ganache from "ganache-cli";

import fs from "fs";
import path from "path";

import Web3 from "web3";

describe.only("Web3RegistryService", () => {
  let provider;
  let registryAddress;
  let web3;
  let accounts;

  beforeAll(() => {
    provider = Ganache.provider({
      host: "127.0.0.1",
      port: "8547"
    });
    web3 = new Web3(provider);
  });

  beforeAll(() => {
    return web3.eth.getAccounts().then((accs) => {
      accounts = accs;
    });
  });

  beforeAll(() => {
    const execOptions = {cwd: path.join(__dirname, "../../../../node_modules", "escape-truffle")};
    console.log(execOptions);
    execSync("yarn", execOptions);
    execSync("yarn compile", execOptions);
    execSync("yarn deploy:ganache", execOptions);
  });

  it("represents packages via packageName as canonical manifest", async () => {
    const service = new Web3RegistryService(provider, registryAddress);

    service.publish("Awesomesauce", "1.0.0", new URL("ipfs://QmTkzDwWqPbnAh5YiV5VwcTLnGdwSNsNTn2aDxdXBFca7D"));
  });
});
