import { Erc1319URI } from "ethpm/utils/uri";

describe("validates URIs", () => {
  const validRegistryUris = [
	"erc1319://snakecharmers.eth:1",
	"erc1319://snakecharmers.eth:1/",
  ]

  test.each(validRegistryUris)(
	"for valid registry URIs",
	(uri) => {
	  const erc1319URI = new Erc1319URI(uri);
	  expect(erc1319URI).toHaveProperty("scheme");
	  expect(erc1319URI).toHaveProperty("address");
	  expect(erc1319URI).toHaveProperty("chainId");
	  expect(erc1319URI).toHaveProperty("packageName");
	  expect(erc1319URI).toHaveProperty("version");
	  expect(erc1319URI.scheme).toEqual("erc1319");
	  expect(erc1319URI.address).toEqual("snakecharmers.eth");
	  expect(erc1319URI.chainId).toEqual(1);
	  expect(erc1319URI.packageName).toEqual("");
	  expect(erc1319URI.version).toEqual("");
	});
});


describe("parses package names and versions", () => {
  const validPackageIdUris = [
	"erc1319://snakecharmers.eth:1/dai@1.0.0",
	"erc1319://snakecharmers.eth:1/dai@1.0.0/",
  ]

  test.each(validPackageIdUris)(
	"for valid package URIs",
	(uri) => {
	  const erc1319URI = new Erc1319URI(uri);
	  expect(erc1319URI).toHaveProperty("scheme");
	  expect(erc1319URI).toHaveProperty("address");
	  expect(erc1319URI).toHaveProperty("chainId");
	  expect(erc1319URI).toHaveProperty("packageName");
	  expect(erc1319URI).toHaveProperty("version");
	  expect(erc1319URI.scheme).toEqual("erc1319");
	  expect(erc1319URI.address).toEqual("snakecharmers.eth");
	  expect(erc1319URI.chainId).toEqual(1);
	  expect(erc1319URI.packageName).toEqual("dai");
	  expect(erc1319URI.version).toEqual("1.0.0");
  });
});

describe("invalidates ", () => {
  const invalidSchemes = [
	'snakecharmers.eth:1',
	'snakecharmers.eth:1/',
	'http://snakecharmers.eth:1/',
	'https://snakecharmers.eth:1/',
	'ipfs://snakecharmers.eth:1',
	'ipfs://snakecharmers.eth:1/',
	'ercxxx://snakecharmers.eth:1',
	'ercxxx://snakecharmers.eth:1/',
  ]
  test.each(invalidSchemes)(
	"invalid uri schemes",
	(uri) => {
	  expect(() => { 
		new Erc1319URI(uri);
	  }).toThrow('Invalid scheme: ');
	}
  );

  const invalidChainIds = [
	'erc1319://snakecharmers.eth',
	'erc1319://snakecharmers.eth/',
	'erc1319://snakecharmers.eth:2',
	'erc1319://snakecharmers.eth:2/',
	'erc1319://snakecharmers.eth:41',
	'erc1319://snakecharmers.eth:41/',
  ]
  test.each(invalidChainIds)(
	'invalid chain IDs',
	(uri) => {
	  expect(() => {
		new Erc1319URI(uri);
	  }).toThrow('Invalid chain ID: ');
	}
  );

  const invalidPackageIds = [
	'erc1319://snakecharmers.eth:1/dai',
	'erc1319://snakecharmers.eth:1/dai/',
	'erc1319://snakecharmers.eth:1/dai/1',
	'erc1319://snakecharmers.eth:1/@1',
	'erc1319://snakecharmers.eth:1/@1/',
  ]
  test.each(invalidPackageIds)(
	'invalid package IDs',
	(uri) => {
	  expect(() => {
		new Erc1319URI(uri);
	  }).toThrow('Invalid package ID: ');
	}
  );
});
