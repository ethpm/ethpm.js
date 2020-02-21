import { EthpmURI } from 'ethpm/utils/uri';

describe('validates URIs', () => {
  const validRegistryUris = [
    'erc1319://snakecharmers.eth',
    'erc1319://snakecharmers.eth:1',
    'erc1319://snakecharmers.eth:1/',
  ];

  test.each(validRegistryUris)(
    'for valid registry URIs',
    (uri) => {
      const ethpmURI = new EthpmURI(uri);
      expect(ethpmURI).toHaveProperty('scheme');
      expect(ethpmURI).toHaveProperty('address');
      expect(ethpmURI).toHaveProperty('chainId');
      expect(ethpmURI).toHaveProperty('packageName');
      expect(ethpmURI).toHaveProperty('version');
      expect(ethpmURI).toHaveProperty('namespacedAsset');
      expect(ethpmURI.scheme).toEqual('erc1319');
      expect(ethpmURI.address).toEqual('snakecharmers.eth');
      expect(ethpmURI.chainId).toEqual(1);
      expect(ethpmURI.packageName).toEqual('');
      expect(ethpmURI.version).toEqual('');
      expect(ethpmURI.namespacedAsset).toEqual('');
    },
  );
});


describe('parses package names and versions', () => {
  const validPackageIdUris = [
    'ethpm://snakecharmers.eth:1/dai@1.0.0',
    'ethpm://snakecharmers.eth:1/dai@1.0.0/',
  ];

  test.each(validPackageIdUris)(
    'for valid package URIs',
    (uri) => {
      const ethpmURI = new EthpmURI(uri);
      expect(ethpmURI).toHaveProperty('scheme');
      expect(ethpmURI).toHaveProperty('address');
      expect(ethpmURI).toHaveProperty('chainId');
      expect(ethpmURI).toHaveProperty('packageName');
      expect(ethpmURI).toHaveProperty('version');
      expect(ethpmURI).toHaveProperty('namespacedAsset');
      expect(ethpmURI.scheme).toEqual('ethpm');
      expect(ethpmURI.address).toEqual('snakecharmers.eth');
      expect(ethpmURI.chainId).toEqual(1);
      expect(ethpmURI.packageName).toEqual('dai');
      expect(ethpmURI.version).toEqual('1.0.0');
    },
  );
});

describe('supports namespaced assets', () => {
  const validPackageIdUris = [
    'ethpm://snakecharmers.eth:1/dai@1.0.0/deployments/DSToken',
    'ethpm://snakecharmers.eth:1/dai@1.0.0/deployments/DSToken/',
  ];

  test.each(validPackageIdUris)(
    'for valid package URIs',
    (uri) => {
      const ethpmURI = new EthpmURI(uri);
      expect(ethpmURI).toHaveProperty('scheme');
      expect(ethpmURI).toHaveProperty('address');
      expect(ethpmURI).toHaveProperty('chainId');
      expect(ethpmURI).toHaveProperty('packageName');
      expect(ethpmURI).toHaveProperty('version');
      expect(ethpmURI).toHaveProperty('namespacedAsset');
      expect(ethpmURI.scheme).toEqual('ethpm');
      expect(ethpmURI.address).toEqual('snakecharmers.eth');
      expect(ethpmURI.chainId).toEqual(1);
      expect(ethpmURI.packageName).toEqual('dai');
      expect(ethpmURI.version).toEqual('1.0.0');
      expect(ethpmURI.namespacedAsset).toEqual('deployments/DSToken');
    },
  );
});

describe('invalidates ', () => {
  const invalidSchemes = [
    'snakecharmers.eth:1',
    'snakecharmers.eth:1/',
    'http://snakecharmers.eth:1/',
    'https://snakecharmers.eth:1/',
    'ipfs://snakecharmers.eth:1',
    'ipfs://snakecharmers.eth:1/',
    'ercxxx://snakecharmers.eth:1',
    'ercxxx://snakecharmers.eth:1/',
  ];
  test.each(invalidSchemes)(
    'invalid uri schemes',
    (uri) => {
      expect(() => {
        new EthpmURI(uri);
      }).toThrow('Invalid scheme: ');
    },
  );

  const invalidChainIds = [
    'erc1319://snakecharmers.eth:2',
    'erc1319://snakecharmers.eth:2/',
    'erc1319://snakecharmers.eth:41',
    'erc1319://snakecharmers.eth:41/',
  ];
  test.each(invalidChainIds)(
    'invalid chain IDs',
    (uri) => {
      expect(() => {
        new EthpmURI(uri);
      }).toThrow('Invalid chain ID: ');
    },
  );

  const invalidPackageIds = [
    'erc1319://snakecharmers.eth:1/dai',
    'erc1319://snakecharmers.eth:1/dai/',
    'erc1319://snakecharmers.eth:1/dai/1',
    'erc1319://snakecharmers.eth:1/@1',
    'erc1319://snakecharmers.eth:1/@1/',
  ];
  test.each(invalidPackageIds)(
    'invalid package IDs',
    (uri) => {
      expect(() => {
        new EthpmURI(uri);
      }).toThrow('Invalid package ID: ');
    },
  );
});
