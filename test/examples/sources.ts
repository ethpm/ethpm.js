/**
 * @module "test/examples"
 */

import * as pkg from "ethpm/package";

import packages from "./packages";
import { exampleSource } from "./utils";

const sources: Record<pkg.PackageName, Record<pkg.RelativePath, pkg.Source>>
  = Object.assign(
    {},
    ...Object.entries(packages)
      .map( ([ packageName, { sources } ]) => ({
        [packageName]: Object.assign(
          {},
          ...Object.entries(sources)
            .map(
              (
                [ relativePath, source ]:
                  [ pkg.RelativePath, string | pkg.ContentURI ]
              ) => ({
                [relativePath]: (typeof source === "string")
                  ? source
                  : exampleSource(packageName, relativePath)
              })
            )
        )
      }))
  );

export default sources;
