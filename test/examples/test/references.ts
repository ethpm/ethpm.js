import hash from "ethpm/storage/ipfs/hash";

import exampleManifests from "test/examples/manifests";
import examplePackages from "test/examples/packages";

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
      for (let [dependency, reference] of Object.entries(references)) {
        describe(`dependency: "${dependency}"`, () => {
          const actual = (testcases[dependency] || {}).actual;

          it("is a known example", () => {
            expect(actual).toBeDefined();
          });

          if (actual) {
            it("uses correct hash", async () => {
              expect(reference).toEqual(await actual);
            })
          }
        });
      }
    });
  }
});
