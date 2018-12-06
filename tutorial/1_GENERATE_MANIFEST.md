# Generating a manifest

In this guide, we will demonstrate generating a package manifest with EthPM.

## Setup

```js
// Require modules
const fs = require("fs");
const { EthPM } = require("ethpm");

// Configure and initialize EthPM
const ethpm = await EthPM.configure({
  manifests: "ethpm/manifests/v2"
}).connect();

// Use the `fs` module to grab the contract source
const contractPath = "./contracts/Owned.sol";
const contract = fs.readFileSync(contractPath).toString(); // fromBuffer
```

First, we need to setup EthPM and grab the contract source. We do this by using the `fs` and `ethpm` modules.

Since we are trying to generate a manifest in this step, make sure to configure `ethpm` with a `manifests` property set to version 2.

The contract source and path will be saved to the `contract` and `contractPath` variables respectively. We will need these for generating our manifest.

## Template manifest object

Next, we will create a template manifest object.

```js
const owned = {
  packageName: "owned",
  version: "1.0.0",
  meta: {
    authors: ["Piper Merriam <pipermerriam@gmail.com>"],
    license: "MIT",
    description:
      "Reusable contracts which implement a privileged 'owner' model for authorization.",
    keywords: ["authorization"],
    links: [
      {
        resource: "documentation",
        uri: "ipfs://QmUYcVzTfSwJoigggMxeo2g5STWAgJdisQsqcXHws7b1FW"
      }
    ]
  },
  sources: {
    /* Embed source code inside manifest for now */
    [contractPath]: contract
  },
  contractTypes: {},
  deployments: new Map(),
  buildDependencies: {}
};
```

Note that the contract source (i.e. the variable `contract`) is stored under the `sources` property and is keyed by the `contractPath` variable we defined earlier.

Please check the documentation for more info about other properties in this manifest object.

## Generate the manifest

```js
const manifest = await ethpm.manifests.write(owned);
```

Finally, we generate the manifest by calling `ethpm.manifests.write()` with the template manifest object.

## Recap

Here is the full source with some properties ommitted from the template manifest object. Make sure you wrap these instructions inside an `async` function.

```js
// Require modules
const fs = require("fs");
const { EthPM } = require("ethpm");

// Configure EthPM
const ethpm = await EthPM.configure({
  manifests: "ethpm/manifests/v2"
}).connect();

// Use the `fs` module to grab the contract source
const contractPath = "./contracts/Owned.sol";
const contract = fs.readFileSync(contractPath).toString(); // fromBuffer

// Create template manifest object
const owned = {
  /* other properties omitted for brevity */
  sources: {
    /* Embed source code inside manifest for now */
    [contractPath]: contract
  },
};

// Generate the manifest
const manifest = await ethpm.manifests.write(owned);
```