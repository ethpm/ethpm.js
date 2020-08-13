/**
 * @module "test/examples"
 */

import fs from "fs";
import path from "path";

export function exampleSource(name: string, file: string): string {
  const absolutePath = require.resolve(path.join("ethpm-spec/examples", name, "contracts", file));
  return fs.readFileSync(absolutePath).toString();
}

export function exampleManifest(
  name: string,
  version: string = "v3",
  pretty: boolean = false
): string {
  const basename = (pretty)
    ? `${version}-pretty.json`
    : `${version}.json`;

  return JSON.stringify(require(`ethpm-spec/examples/${name}/${basename}`));
}
