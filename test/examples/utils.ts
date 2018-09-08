/**
 * @module "test/examples"
 */

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
