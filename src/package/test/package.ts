import { ResolvedPackage, Resolver } from 'ethpm/package/resolver';
import { IpfsService } from "ethpm/storage/ipfs";
import { URL } from 'url';

const fs = require('fs')

const DAI_URI = new URL('ipfs://QmTFxJbaJvpgASxxdqFPSvYr1XLWgXR9fv241jLXsELiXP')
const DSTOKEN_URI = new URL('ipfs://Qmd4xvKG8cKFDMCYdzgbGN5rf98VfP4bYwqArPQ7mdyEwf')
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
    const pkg = await resolver.resolve(DAI_URI)
    const daiSource = fs.readFileSync('./src/package/test/assets/dai/contracts/DSToken.sol','utf8')
    expect(pkg.contentURI).toEqual(DAI_URI)
    expect(pkg.originalPackage.packageName).toEqual('dai-dai')
    expect(pkg.sources['./DSToken.sol']).toEqual(daiSource)
  })

  it('resolves a uri with build dependencies and content addressed sources', async() => {
    const pkg = await resolver.resolve(DSTOKEN_URI)
    const tokenSource = fs.readFileSync('./src/package/test/assets/ds-token/contracts/token.sol','utf8')
    const baseSource = fs.readFileSync('./src/package/test/assets/ds-token/contracts/base.sol','utf8')
    const factorySource = fs.readFileSync('./src/package/test/assets/ds-token/contracts/factory.sol','utf8')
    const mathSource = fs.readFileSync('./src/package/test/assets/ds-token/contracts/ds-math/math.sol','utf8')
    const stopSource = fs.readFileSync('./src/package/test/assets/ds-token/contracts/ds-stop/stop.sol','utf8')
    const authSource = fs.readFileSync('./src/package/test/assets/ds-token/contracts/ds-auth/auth.sol','utf8')
    expect(pkg.contentURI).toEqual(DSTOKEN_URI)
    expect(pkg.originalPackage.packageName).toEqual('ds-token')
    expect(pkg.buildDependencies).toHaveProperty('ds-math')
    expect(pkg.buildDependencies).toHaveProperty('ds-stop')
    expect(pkg.buildDependencies).toHaveProperty('erc20')
    expect(pkg.sources['./token.sol']).toEqual(tokenSource)
    expect(pkg.sources['./base.sol']).toEqual(baseSource)
    expect(pkg.sources['./factory.sol']).toEqual(factorySource)
    expect(pkg.buildDependencies['ds-math'].sources['./ds-math/math.sol']).toEqual(mathSource)
    expect(pkg.buildDependencies['ds-stop'].sources['./ds-stop/stop.sol']).toEqual(stopSource)
    expect(pkg.buildDependencies['erc20'].sources['./ds-auth/auth.sol']).toEqual(authSource)
  });
})
