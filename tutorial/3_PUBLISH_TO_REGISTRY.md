# Publishing a package

In this guide, we will demonstrate publishing a package to a registry with EthPM.

## Assumptions

It is assumed that you have followed the previous IPFS guide and already have a URI that refers to an uploaded manifest. In this guide, the manifest URI will be referred to as the `manifestUri` variable, which is a `URL` object.

## Setup

```js
// Require modules
const Web3 = require("web3");
const { EthPM } = require("ethpm");

// Create a web3 instance connected to a blockchain
const web3 = new Web3("http://127.0.0.1:8547");

// Configure and initialize EthPM
const ethpm = await EthPM.configure({
  registries: "ethpm/registries/web3"
}).connect({
  provider: web3.eth.currentProvider,
  registryAddress: "0xb0Ba0e96B78382A943E3aA4A581d19CFfFf9b3e9",
});
```

First, we require the `web3` and `ethpm` modules. We then create a `web3` instance with a connection to the blockchain that our registry lives on.

Then we configure EthPM with a `registries` property, indicating that we will be using a web3 provider. And finally, we connect to the registry by providing `connect()` with a web3 `provider` and `registryAddress`.

## Publishing

To publish a package, we call the `ethpm.registries.publish` method with the package name, version, and the manifest URI (this is the `manifestUri` object mentioned in the Assumptions section above).

```js
await ethpm.registries.publish("owned", "1.0.0", manifestUri);
```