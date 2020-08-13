import { ResolvedPackage, Resolver } from 'ethpm/package/resolver';
import { IpfsService } from "ethpm/storage/ipfs";
import { URL } from 'url';

const fs = require('fs')

const OWNED_URI = new URL('ipfs://QmcxvhkJJVpbxEAa6cgW3B6XwPJb79w9GpNUv2P2THUzZR')
const DSTOKEN_URI = new URL('ipfs://Qmb8rFWXyLhR9gvMKswvE2n5EHRKYWF4U46nsgFRNPi1dU')
const IPFS_OPTIONS = {
  host: 'ipfs.infura.io',
  port: '5001',
  protocol: 'https'
}

describe('the package resolver', () => {
  let resolver: Resolver

  beforeAll(() => {
    jest.setTimeout(30000);
    const ipfsService = new IpfsService(IPFS_OPTIONS)
    resolver = new Resolver(ipfsService)
  })

  it('resolves a simple uri', async() => {
    const pkg = await resolver.resolve(OWNED_URI)
    const ownedSource = fs.readFileSync('./src/installer/test/assets/multiple/owned/_src/Owned.sol','utf8')
    expect(pkg.contentURI).toEqual(OWNED_URI)
    expect(pkg.originalPackage.packageName).toEqual('owned')
    expect(pkg.sources['Owned.sol']['content']).toEqual(ownedSource)
  })

  it('resolves a uri with build dependencies and content addressed sources', async() => {
    const pkg = await resolver.resolve(DSTOKEN_URI)
    const tokenSource = fs.readFileSync('./src/package/test/assets/ds-token/contracts/token.sol','utf8')
    const baseSource = fs.readFileSync('./src/package/test/assets/ds-token/contracts/base.sol','utf8')
    const factorySource = fs.readFileSync('./src/package/test/assets/ds-token/contracts/factory.sol','utf8')
    const mathSource = fs.readFileSync('./src/package/test/assets/ds-token/contracts/ds-math/math.sol','utf8')
    const stopSource = fs.readFileSync('./src/package/test/assets/ds-token/contracts/ds-stop/stop.sol','utf8')
    const authSource = fs.readFileSync('./src/package/test/assets/ds-token/contracts/erc20/erc20.sol','utf8')
    expect(pkg.contentURI).toEqual(DSTOKEN_URI)
    expect(pkg.originalPackage.packageName).toEqual('ds-token')
    expect(pkg.buildDependencies).toHaveProperty('ds-math')
    expect(pkg.buildDependencies).toHaveProperty('ds-stop')
    expect(pkg.buildDependencies).toHaveProperty('erc20')
    expect(pkg.sources['./token.sol']['content']).toEqual(tokenSource)
    expect(pkg.sources['./base.sol']['content']).toEqual(baseSource)
    expect(pkg.sources['./factory.sol']['content']).toEqual(factorySource)
    expect(pkg.buildDependencies['ds-math'].sources['./math.sol']['content']).toEqual(mathSource)
    expect(pkg.buildDependencies['ds-stop'].sources['./stop.sol']['content']).toEqual(stopSource)
    expect(pkg.buildDependencies['erc20'].sources['./erc20/erc20.sol']['content']).toEqual(authSource)
  });
})
