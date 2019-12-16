import BN from 'bn.js';
import { URL } from 'url';

import Web3 from 'web3';
import { HttpProvider } from 'web3/providers';
import { EthPM } from 'ethpm';

const ensRegistryAddress = '0x808B53bF4D70A24bA5cb720D37A4835621A9df00';
const erc20RegistryAddress = '0x16763EaE3709e47eE6140507Ff84A61c23B0098A';
const resolversV1URI = 'ipfs://QmYq3Qnjxo5SQ9eofdiYUSa2st1cCXkNVhEwMVi1XwWMdG';
const resolversV101URI = 'ipfs://QmZdmGqADUeDdrAthdQZ375gC5pT8i2nKJivXJc5dDgt6E';

describe('registry functions', () => {
  let provider: HttpProvider;
  let ensRegistry: EthPM;
  let erc20Registry: EthPM;

  beforeAll(async () => {
    provider = new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/7707850c2fb7465ebe6f150d67182e22');
    ensRegistry = await EthPM.configure({
      registries: 'ethpm/registries/web3',
    }).connect({
      provider,
      registryAddress: ensRegistryAddress,
    });
    erc20Registry = await EthPM.configure({
      registries: 'ethpm/registries/web3',
    }).connect({
      provider,
      registryAddress: erc20RegistryAddress,
    });
  });

  it('gets the number of packages on registry', async () => {
    const numPackages = await ensRegistry.registries.numPackageIds();
    const expected = new BN(3);
    expect(numPackages).toEqual(expected);
  });

  it('returns the manifest uri for package name & version', async () => {
    const manifestURI = await ensRegistry.registries.getReleaseData('resolvers', '1.0.0');
    expect(manifestURI).toEqual(resolversV1URI);
  });

  it('can get all packages on registry', async () => {
    const packages = await ensRegistry.registries.packages();
    expect(packages).toEqual(['ens', 'ethregistrar', 'resolvers']);
  });

  it('can get all packages on a large registry', async () => {
    const packages = await erc20Registry.registries.packages();
    expect(packages).toEqual([
      'augurreputation-rep',
      'bitfinexleo-leo',
      'bnb-bnb',
      'brave-bat',
      'chainlink-link',
      'cryptocom-cro',
      'dai-dai',
      'egretia-egt',
      'hedgetrade-hedg',
      'huobitoken-ht',
      'inocoin-ino',
      'kucoinshares-kcs',
      'lambda-lamb',
      'maker-mkr',
      'omisego-omg',
      'paxosstandard-pax',
      'tether-usdt',
      'usdcoin-usdc',
      'vechain-ven',
      'zrx-zrx',
    ]);
  });

  it("can get a package's specific release", async () => {
    const releases = await ensRegistry.registries.package('resolvers').release('1.0.0');
    expect(releases).toEqual(new URL(resolversV1URI));
  });

  it("can get all of a package's releases", async () => {
    const releases = await ensRegistry.registries.package('resolvers').releases();
    expect(releases).toEqual({
      '1.0.0': resolversV1URI,
      '1.0.1': resolversV101URI,
    });
  });
});
