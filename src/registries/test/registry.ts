import BN from "bn.js";
import { URL } from "url";

import { EthPM } from "ethpm"
import Web3 from "web3";

const ensRegistryAddress = "0x808B53bF4D70A24bA5cb720D37A4835621A9df00";

describe("registry functions", () => {
  let provider
  let ethpm: any

  beforeAll(async () => {
	provider = new Web3.providers.HttpProvider("https://mainnet.infura.io/truffle")
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

  // test with registry with more numbers
  it("can get all packages on registry", async() => {
	const packages = await ethpm.registries.packages()
	expect(packages).toEqual(['resolvers', 'ethregistrar', 'ens'])
  })

  it("can get a package's specific release", async() => {
	const releases = await ethpm.registries.package('resolvers').release('1.0.0')
	expect(releases).toEqual(new URL('ipfs://QmYq3Qnjxo5SQ9eofdiYUSa2st1cCXkNVhEwMVi1XwWMdG'))
  })

  it("can get all of a package's releases", async() => {
	const releases = await ethpm.registries.package('resolvers').releases()
	expect(releases).toEqual({
	  '1.0.0': 'ipfs://QmYq3Qnjxo5SQ9eofdiYUSa2st1cCXkNVhEwMVi1XwWMdG',
	  '1.0.1': 'ipfs://QmZdmGqADUeDdrAthdQZ375gC5pT8i2nKJivXJc5dDgt6E'
	})
  })
});
