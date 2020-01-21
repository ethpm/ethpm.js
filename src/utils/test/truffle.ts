import { v2 } from 'ethpm/manifests/v2';
import { parseTruffleArtifacts } from 'ethpm/utils/truffle';
const fs = require("fs");

import { Package } from 'ethpm/package';

it('handles raw data', async () => {
  const manifest = {
    packageName: 'Foo',
    version: '1.0.0',
    sources: {},
    meta: {
      authors: ['one', 'two'],
      description: "pkg",
      keywords: ['abc', '123'],
      license: "MIT",
      links: [
        {resource: "repo", uri: "www.github.com"},
        {resource: "documentation", uri: "www.readthedocs.com"},
        {resource: "website", uri: "www.website.com"},
      ]
    },
    deployments: new Map(),
    contractTypes: {
      "TestAlias": {
        abi: [],
        // recognizes if aliased
        contractName: "Test",
        compiler: {
          name: "solc",
          version: "0.5.1abc",
          settings: {
            optimize: true
          }
        },
        natspec: {
          "author": "Piper Merriam <pipermerriam@gmail.com>",
          "methods": {
            "safeAdd(uint256,uint256)": {
              "details": "Adds a and b, throwing an error if the operation would cause an overflow.",
              "params": {
                "a": "The first number to add",
                "b": "The second number to add"
              }
            }
          }
          "title": "Safe Math Library"
        }
      }
    },
    buildDependencies: {}
  };

  const pkg: Package = await v2.read(JSON.stringify(manifest))
  //const pkg: Package = new Package(manifest)
  const actual = JSON.parse(await v2.write(manifest))
  expect(actual.package_name).toEqual(manifest.packageName)
  expect(actual.version).toEqual(manifest.version)
  expect(actual.meta.authors).toEqual(manifest.meta.authors)
  expect(actual.meta.description).toEqual(manifest.meta.description)
  expect(actual.meta.keywords).toEqual(manifest.meta.keywords)
  expect(actual.meta.license).toEqual(manifest.meta.license)
  expect(actual.meta.links).toEqual({
    repo: "www.github.com",
    documentation: "www.readthedocs.com",
    website: "www.website.com",
  })
  const actualContractType = actual.contract_types['TestAlias']
  const expectedContractType = manifest.contractTypes['TestAlias']
  expect(actualContractType.abi).toEqual(expectedContractType.abi)
  expect(actualContractType.compiler).toEqual(expectedContractType.compiler)
  expect(actualContractType.contract_name).toEqual(expectedContractType.contractName)
  expect(actualContractType.natspec).toEqual(expectedContractType.natspec)
})

// MetaCoin deployed bytecode in artifact is not accurate, but adjusted for testing multiple linkrefs
describe('generates contract type data', () => {
  it(`for an iterator of artifact files`, async() => {
    const iterator = ['ConvertLib', 'MetaCoin', 'Migrations']
    const artifacts = []
    for (let file of iterator) {
      const artifact = JSON.parse(fs.readFileSync(`./src/utils/test/assets/${file}.json`, 'utf8'))
      artifacts.push(artifact)
    }

    const actual = await parseTruffleArtifacts(artifacts)
    const expected = JSON.parse(fs.readFileSync("./src/utils/test/assets/pkg.json", 'utf8'))
    expect(actual).toEqual(expected)
  })
});

describe.skip('handles truffle artifacts with deployments', () => {
  expect(true).toEqual(false)
});
