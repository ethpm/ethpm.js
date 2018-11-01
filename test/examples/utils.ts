/**
 * @module "test/examples"
 */

import fs from "fs";
import path from "path";

export function exampleSource(name: string, file: string): string {
  const absolutePath = require.resolve(path.join("ethpm-spec/examples", name, file));
  return fs.readFileSync(absolutePath).toString();
}

export function exampleManifest(
  name: string,
  version: string = "1.0.0",
  pretty: boolean = false
): string {
  const basename = (pretty)
    ? `${version}-pretty.json`
    : `${version}.json`;

  return JSON.stringify(require(`ethpm-spec/examples/${name}/${basename}`));
}
