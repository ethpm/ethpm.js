import readManifest from "ethpm/manifest/v2";
import { Workspace } from "ethpm/workspace";

import examples from "test/examples/manifests";

it("contains packages", () => {
  const workspace: Workspace = {
    packages: [{
      package: readManifest(examples["transferable"]),
      knownPaths: new Set([
        ["transferable"]
      ]),
    }, {
      package: readManifest(examples["owned"]),
      knownPaths: new Set([
        ["owned"],
        ["transferable", "owned"]
      ]),
    }]
  };

  expect(workspace.packages).toHaveLength(2);
})
