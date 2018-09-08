/**
 * @module "test/examples"
 */

import { exampleManifest } from "./utils";

const manifests: Record<string, string> = Object.assign(
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
    [name]: exampleManifest(name)
  }))
);

export default manifests;
