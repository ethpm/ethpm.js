/**
 * @module "test/examples"
 */

import * as pkg from "ethpm/package";

import packages from "./packages";

const sources: Record<pkg.PackageName, Record<pkg.RelativePath, pkg.Source>>
  = Object.assign(
    {},
    ...Object.entries(packages)
      .map( ([ packageName, { sources } ]) => ({
        [packageName]: sources
      }))
  );

export default sources;
