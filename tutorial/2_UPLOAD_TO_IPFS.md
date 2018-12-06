# Uploading contract and manifest to IPFS

In this guide, we will demonstrate uploading a contract and package manifest to IPFS with EthPM.

## Setup

```js
// Require modules
const fs = require("fs");
const { EthPM } = require("ethpm");

// Configure and initialize EthPM
const ethpm = await EthPM.configure({
  manifests: "ethpm/manifests/v2",
  storage: "ethpm/storage/ipfs",
}).connect({
  ipfs: {
    host: "ipfs.infura.io",
    port: "5001",
    protocol: "https"
  }
});

// Use the `fs` module to grab the contract source
const contractPath = "./contracts/Owned.sol";
const contract = fs.readFileSync(contractPath).toString();  // fromBuffer
```

First, we need to setup EthPM and grab the contract source. We do this by using the `fs` and `ethpm` modules.

We then configure `ethpm` with a `manifests` property set to version 2 and indicate that we are using IPFS for storage. We pass in the `ipfs` options into `connect()` where we have specified the `host`, `port`, and `protocol`.

The contract source and path will be saved to the `contract` and `contractPath` variables respectively. We will need these for generating our manifest.

## Write to IPFS

```js
const contractUri = await ethpm.storage.write(contract);
```

Now we write the contract souce (i.e. `contract`) to IPFS using the `ethpm.storage.write` method. We save the resulting URI into the `contractUri` variable, as we will need this later for our manifest.

## Create the template manifest object

Next, we will create a template manifest object.

```js
const owned = {
  packageName: "owned",
  version: "1.0.0",
  meta: {
    authors: [ "Piper Merriam <pipermerriam@gmail.com>" ],
    license: "MIT",
    description: "Reusable contracts which implement a privileged 'owner' model for authorization.",
    keywords: [ "authorization" ],
    links: [{
      resource: "documentation",
      uri: "ipfs://QmUYcVzTfSwJoigggMxeo2g5STWAgJdisQsqcXHws7b1FW"
    }]
  },
  sources: {
    /* use the IPFS URI for the contract file */
    [contractPath]: contractUri
  },
  contractTypes: {},
  deployments: new Map(),
  buildDependencies: {}
};
```

Note that we have included the `contractUri` variable under the `sources` property, keyed by the `contractPath` variable we defined earlier.

## Generate and upload manifest to IPFS

```js
// Generate the manifest object
const manifest = await ethpm.manifests.write(owned);

// Upload the manifest object to IPFS
const manifestUri = await ethpm.storage.write(manifest);

// The `manifestUri` is a URL object with an `href` property
console.log(manifestUri.href)
```

## Recap

After setting up, we first uploaded our contract source and retrieved the resulting IPFS URI. Then we created our manifest object with that URI and uploaded the manifest to IPFS.

Here is the full source with some properties ommitted from the template manifest object. Make sure you wrap these instructions inside an `async` function.

```js
// Require modules
const fs = require("fs");
const { EthPM } = require("ethpm");

// Configure EthPM
const ethpm = await EthPM.configure({
  manifests: "ethpm/manifests/v2",
  storage: "ethpm/storage/ipfs",
}).connect({
  ipfs: {
    host: "ipfs.infura.io",
    port: "5001",
    protocol: "https"
  }
});

// Use the `fs` module to grab the contract source
const contractPath = "./contracts/Owned.sol";
const contract = fs.readFileSync(contractPath).toString();  // fromBuffer

// Write contract souce to IPFS
const contractUri = await ethpm.storage.write(contract);

// Create template manifest object
const owned = {
  /* other properties omitted for brevity */
  sources: {
    /* use the IPFS URI for the contract file */
    [contractPath]: contractUri
  },
};

// Generate the manifest object
const manifest = await ethpm.manifests.write(owned);

// Upload the manifest object to IPFS
const manifestUri = await ethpm.storage.write(manifest);

// The `manifestUri` is a URL object with an `href` property
console.log(manifestUri.href)
```