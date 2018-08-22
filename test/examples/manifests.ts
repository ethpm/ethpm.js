function example(
  name: string,
  version: string = "1.0.0",
  pretty: boolean = false
): string {
  const basename = (pretty)
    ? `${version}-pretty.json`
    : `${version}.json`;

  return `ethpm-spec/examples/${name}/${basename}`;
}


const manifests = Object.assign(
  {},
  ...[
    "owned",
    "transferable",
    "standard-token",
    "safe-math-lib",
    "piper-coin",
    "escrow",
    "wallet",
    "wallet-with-send",
  ].map(name => ({
    [name]: JSON.stringify(require(example(name)))
  }))
);

export default manifests;
