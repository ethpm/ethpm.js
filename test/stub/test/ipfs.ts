import hash from "ethpm/storage/ipfs/hash";

import * as pkg from "ethpm/package/package";
import { Resolver as StubResolver, examplesResolver } from "test/stub/ipfs";
import exampleManifests from "test/examples/manifests";
import examplePackages from "test/examples/packages";

describe("StubResolver", () => {
  it("records and retrieves string values by hash", async () => {
    const resolver = new StubResolver()

    const contents = [
      'hello world',
      '{"manifest_version":"2","package_name":"owned","version":"1.0.0"}',
      'readme'
    ];

    // setup
    for (let content of contents) {
      resolver.add(content);
    }

    const hashes = await Promise.all(contents.map(hash))
    const expectedUris = hashes.map(result => `ipfs://${result}`);

    // test URI lookup
    for (let [idx, uri] of expectedUris.entries()) {
      const retrieved = await resolver.get(uri);

      expect(retrieved).toEqual(contents[idx]);
    }
  });
});

it("retrives examples", async () => {
  const owned = exampleManifests["owned"];
  const hashed = await hash(owned);
  const uri = `ipfs://${hashed}`;

  expect(await examplesResolver.get(uri)).toEqual(owned);
});

interface Testcase {
  actual?: Promise<string>,
  references: {
    [dependency: string]: string
  },
};

describe("cross-package referencing", () => {
  // generate testcases for each package name we find
  // record actual manifest hash
  const testcases: { [k: string]: Testcase } = {};
  for (let [example, manifest] of Object.entries(exampleManifests)) {
    testcases[example] = {
      actual: hash(manifest),
      references: {}
    }
  }

  // then record references that this package has to other packages
  for (let [example, package_] of Object.entries(examplePackages)) {
    const { buildDependencies } = package_;

    // existing testcase
    const existing = testcases[example];

    for (let [dependencyName, contentURI] of Object.entries(buildDependencies)) {
      const reference = contentURI.hostname;

      testcases[example] = {
        ...existing,  // to maybe copy actual
        references: {
          ...existing.references,
          [dependencyName]: reference
        }
      }
    }
  }

  // create test functions for reporting
  for (let [testcase, { references }] of Object.entries(testcases)) {
    describe(`package: "${testcase}"`, () => {
      it("references known packages", () => {
        for (let dependency of Object.keys(references)) {
          expect(testcases).toHaveProperty(dependency);
        }
      });

      for (let [dependency, reference] of Object.entries(references)) {
        it(`correctly references "${dependency}"`, async () => {
          const actual = await testcases[dependency].actual;
          expect(reference).toEqual(actual);
        });
      }
    });
  }



});
