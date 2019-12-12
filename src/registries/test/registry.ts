import BN from "bn.js";

import { EthPM } from "ethpm"
import Web3 from "web3";

const ensRegistryAddress = "0x808B53bF4D70A24bA5cb720D37A4835621A9df00";

describe("registry functions", () => {
  let provider
  let ethpm: any

  beforeAll(async () => {
	provider = new Web3.providers.HttpProvider("https://mainnet.infura.io/truffle", {
	  keepAlive: false
	});
	ethpm = await EthPM.configure({
	  registries: "ethpm/registries/web3"
	}).connect({
	  provider: provider,
	  registryAddress: ensRegistryAddress,
	});
  })

  it("gets the number of packages on registry", async () => {
	const numPackages = await ethpm.registries.numPackageIds();
	const expected = new BN(3);
	expect(numPackages).toEqual(expected);
  });

  it("returns the manifest uri for package name & version", async () => {
	const manifestURI = await ethpm.registries.getReleaseData("ens", "1.0.0");
	expect(manifestURI).toEqual("ipfs://QmeooZzPrT2hDWSkhGoyLeSecsSbU26E6RiYfkXfPoug9U");
  });

  it("can get a packages' releases", async() => {
	const packageName = 'ethregistrar'
	const releases = await Promise.all(
	  Array.from(await ethpm.registries.package("wallet").releases())
	);
	expect(releases).toEqual(['1.0.0'])
  })

});
