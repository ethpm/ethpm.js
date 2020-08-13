ethpm.js
========

[![API Documentation](https://img.shields.io/badge/api-documentation-blue.svg)](https://ethpm.github.io/ethpm.js/index.html)
[![Build Status](https://travis-ci.org/ethpm/ethpm.js.svg?branch=master)](https://travis-ci.org/ethpm/ethpm.js)

Work in progress library for interacting with EthPM packages in
Javascript and TypeScript.

Check out a short guided tutorial [here](tutorial/README.md).

## Usage Example

```typescript
const ethpm: Session = await EthPM.configure<HasManifests>({
  manifests: "ethpm/manifests/v3",
}).connect();

const pkg = await ethpm.manifests.read(examples["wallet-with-send"]);
```

## Available APIs
There are multiple APIs that you can enable on your `ethpm` instance. Each api can be enabled by passing it's corresponding string into your `ethpm` object's configuration.

### `ethpm/manifests/v3`

Description: Enables reading & writing of V3 manifests to/from JSON and `Package` instances.

Configuration: 
```typescript
const ethpm = await EthPM.configure({
  manifests: "ethpm/manifests/v3",
}).connect();
```

Usage:
```typescript
// to generate a `Package` instance from a manifest JSON string
const package = await v3.read(manifestJson);

// to generate a manifest JSON string from a `Package` instance
const manifestJson = await v3.write(package)
```

### `ethpm/installer/truffle`

Description: Writes ethpm package assets to disk, according to the written [specification](https://ethpm-cli.readthedocs.io/en/latest/disk.html). 

Configuration: 
```typescript
const ethpm = await EthPM.configure({
  installer: "ethpm/installer/truffle",
  storage: "ethpm/storage/ipfs",
}).connect({
  workingDirectory: '/path/to/working/directory',
  ipfs: {
    host: 'ipfs.infura.io',
	port: '5001',
	protocol: 'https'
  }
});
```

Usage:
- Currently only IPFS uris are supported.

```typescript
// to install the target package in the working directory
var manifestUri = "ipfs://Qm..."
var registryAddress = "0x123abc..."
await ethpm.install(manifestUri, registryAddress)

// to install the target package under an alias in the working directory
var alias = "alternate-name"
await ethpm.install(manifestUri, registryAddress, alias)
```

### `ethpm/storage/ipfs`

Description: Reads & writes files from IPFS.

Configuration: 
```typescript
const ethpm = await EthPM.configure({
  storage: "ethpm/storage/ipfs",
}).connect({
  ipfs: {
    host: 'ipfs.infura.io',
	port: '5001',
	protocol: 'https'
  }
});
```

Usage:
```typescript
const content = "wordswordswordswordspunchline"

const uri = await ethpm.storage.write(content)

const readContent = await ethpm.storage.read(uri)

const predictedUri = await ethpm.storage.predictUri(content)

const hash = await ethpm.storage.hash(content)
```

### `ethpm/registries/web3`

Description: Publishes packages to on-chain package registries, and fetches release data from these registries.

Configuration: 
```typescript
const ethpm = await EthPM.configure({
  storage: "ethpm/storage/ipfs",
}).connect({
  provider: web3,
  registryAddress: '0x123abc...'
});
```

Usage:
```typescript
// list all packages
const packages = await ethpm.registries.packages()

// list all release data for a particular package's releases
const ownedReleases = await ethpm.registries.package('owned').releases()

// get manifest uri for a specific release
const manifestUri = await ethpm.registries.package('owned').release('1.0.0')

// cut a release to the connected registry
await ethpm.registries.publish('owned', '1.0.0', 'ipfs://Qm...')
```

### ethpm URI util
``` typescript
import { EthpmURI } from 'ethpm/utils/uri';

const rawUri = 'ethpm://snakecharmers.eth/owned@1.0.0'
const ethpmUri = new EthpmURI(rawUri)

ethpmUri.raw
> 'ethpm://snakecharmers.eth/owned@1.0.0'

ethpmUri.scheme
> 'ethpm'

ethpmUri.address
> 'snakecharmers.eth'

// defaults to 1 if no chain id included in rawUri
ethpmUri.chainId
> 1

ethpmUri.packageName
> 'owned'

ethpmUri.version
> '1.0.0'

ethpmUri.namespacedAsset
> ''
```
