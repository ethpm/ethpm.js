import { URL } from 'url';
import * as schema from 'ethpm-spec';
import { v3 } from 'ethpm/manifests/v3';

import { Package } from 'ethpm/package';

import examples from 'test/examples/manifests';

// to test
// name / version not required

it('reads examples', async () => {
  const wallet = examples['wallet-with-send'];

  const pkg: Package = await v3.read(wallet);

  expect(pkg.packageName).toEqual('wallet-with-send');
  expect(pkg.version).toEqual('1.0.0');
  expect(pkg.manifest).toEqual('ethpm/3');
  expect(Object.keys(pkg.sources)).toContain('WalletWithSend.sol');
  expect(Object.keys(pkg.contractTypes)).toContain("WalletWithSend");
  expect(Object.keys(pkg.buildDependencies)).toContain("wallet");
  expect(Object.keys(pkg.compilers[0])).toContain("contractTypes");
  expect(Array.from(pkg.deployments.keys())).toContainEqual(new URL("blockchain://41941023680923e0fe4d74a34bdac8141f2540e3ae90623718e47d66d1ca4a2d/block/b6d0d43f61e5e36d20eb3d5caca12220b024ed2861a814795d1fd6596fe041bf"));
});

it('converts name', async () => {
  const manifest: schema.PackageManifest = {
    manifest: 'ethpm/3',
    name: 'foo',
    version: '1.0.0',
  };

  const pkg: Package = await v3.read(JSON.stringify(manifest));

  expect(pkg).toHaveProperty('packageName');
  expect(pkg).toHaveProperty('version');
  expect(pkg).toHaveProperty('manifest');
  expect(pkg.packageName).toEqual(manifest.name);
  expect(pkg.version).toEqual(manifest.version);
  expect(pkg.manifest).toEqual(manifest.manifest);
});

it('inserts manifest field if not provided', async () => {
  const manifest = {
    name: 'foo',
    version: '1.0.0',
  };

  const pkg: Package = await v3.read(JSON.stringify(manifest));

  expect(pkg).toHaveProperty('manifest');
  expect(pkg.manifest).toEqual('ethpm/3');
});

describe('read -> write isomorphism', () => {
  for (const [packageName, manifest] of Object.entries(examples)) {
    it(`holds true for example "${packageName}"`, async () => {
      const actual = await v3.write(await v3.read(manifest));

      expect(JSON.parse(actual)).toEqual(JSON.parse(manifest));
      expect(actual).toEqual(manifest);
    });
  }
});


it('builds owned example from a template', async() => {
  const owned_template = {
    packageName: "owned", // THIS KEY NAMING IS INCONSISTENT
    version: "1.0.0",
    manifest: "ethpm/3",
    meta: {
      authors: ["Piper Merriam <pipermerriam@gmail.com>"],
      license: "MIT",
      description:
        "Reusable contracts which implement a privileged 'owner' model for authorization.",
      keywords: ["authorization"],
      links: [
        {
          resource: "documentation",
          uri: "ipfs://QmUYcVzTfSwJoigggMxeo2g5STWAgJdisQsqcXHws7b1FW"
        }
      ]
    },
    sources: {
      /* Embed source code inside manifest for now */
      ["Owned.sol"]: {
        type: "solidity",
        "installPath": "./Owned.sol",
        "urls": ["ipfs://QmU8QUSt56ZoBDJgjjXvAZEPro9LmK1m2gjVG5Q4s9x29W"]
      }
    },
    compilers: [],
    contractTypes: {},
    deployments: new Map(),
    buildDependencies: {}
  };

  const manifest = await v3.write(owned_template)
  expect(JSON.parse(examples['owned'])).toEqual(JSON.parse(manifest));
});


it('builds example with compilers from a template', async() => {
  const compilers_template = {
    sources: {},
    meta: {},
    compilers: [
      {
        "contractTypes": [
          "Escrow",
          "SafeSendLib"
        ],
        "name": "solc",
        "settings": {
          "optimize": false
        },
        "version": "0.6.8+commit.0bbfe453"
      }
    ],
    contractTypes: {},
    deployments: new Map(),
    buildDependencies: {}
  }

  const expected = {"manifest": "ethpm/3", "compilers": [
      {
        "contractTypes": [
          "Escrow",
          "SafeSendLib"
        ],
        "name": "solc",
        "settings": {
          "optimize": false
        },
        "version": "0.6.8+commit.0bbfe453"
      }
    ]}

  const manifest = await v3.write(compilers_template)
  expect(expected).toEqual(JSON.parse(manifest));
});
