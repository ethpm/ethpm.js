import { EthPM } from 'ethpm';

import examples from 'test/examples/manifests';
import packages from 'test/examples/packages';
import sources from 'test/examples/sources';

const IPFSFactory = require('ipfsd-ctl');

describe('Configuration', () => {
  it('loads manifests plugin', async () => {
    const ethpm = await EthPM.configure({
      manifests: 'ethpm/manifests/v2',
    }).connect();

    const pkg = await ethpm.manifests.read(examples['wallet-with-send']);

    expect(pkg.packageName).toEqual('wallet-with-send');
  });

  it('loads storage plugin', async () => {
    const ethpm = await EthPM.configure({
      storage: 'test/stub/storage/examples',
    }).connect();

    const { wallet } = packages['wallet-with-send'].buildDependencies;
    const manifests = await ethpm.storage.read(wallet);

    expect(manifests).toEqual(examples.wallet);
  });

  it('loads manifests and storage plugins', async () => {
    const ethpm = await EthPM.configure({
      manifests: 'ethpm/manifests/v2',
      storage: 'test/stub/storage/examples',
    }).connect();

    const walletWithSend = await ethpm.manifests.read(examples['wallet-with-send']);
    const manifests = await ethpm.storage.read(
      walletWithSend.buildDependencies.wallet,
    );

    expect(manifests).toBeDefined();

    // to get past typecheck
    if (manifests === undefined) {
      return;
    }

    const wallet = await ethpm.manifests.read(manifests);

    expect(wallet).toEqual(packages.wallet);
  });

  it('fails to load plugin without required options', async () => {
    const missingOptions = EthPM.configure({
      storage: 'test/stub/storage',
    }).connect({
      /* ... ??? ... */
    });

    await expect(missingOptions).rejects.toBeTruthy();
  });

  it('loads plugins with required options', async () => {
    const storedContent = '{"package_name": "registry"}';
    const ethpm = await EthPM.configure({
      storage: 'test/stub/storage',
    }).connect({
      contents: [storedContent],
    });

    const uri = await ethpm.storage.predictUri(storedContent);
    const retrievedContent = await ethpm.storage.read(uri);

    expect(retrievedContent).toEqual(storedContent);
  });

  it('loads multiple plugins with required options', async () => {
    const storedContent = 'some file\n\n\n';

    const ethpm = await EthPM.configure({
      manifests: 'test/stub/manifests',
      storage: 'test/stub/storage',
    }).connect({
      packages: Object.values(packages),
      contents: [storedContent],
    });

    // test package lookup via fake manifest
    expect(packages.wallet).toEqual(await ethpm.manifests.read('wallet'));

    // test stored content retrieval
    const uri = await ethpm.storage.predictUri(storedContent);
    const retrievedContent = await ethpm.storage.read(uri);
    expect(retrievedContent).toEqual(storedContent);
  });

  it('loads pre-required plugins', async () => {
    const ethpm = await EthPM.configure({
      manifests: require('ethpm/manifests/v2'),
      storage: require('test/stub/storage/examples'),
    }).connect();

    const walletWithSend = await ethpm.manifests.read(examples['wallet-with-send']);
    const manifest = await ethpm.storage.read(
      walletWithSend.buildDependencies.wallet,
    );

    expect(manifest).toBeDefined();

    // to get past typecheck
    if (manifest === undefined) {
      return;
    }

    const wallet = await ethpm.manifests.read(manifest);

    expect(wallet).toEqual(packages.wallet);
  });
});

describe('Manual Packaging', () => {
  let daemon: any;
  let host: string;
  let port: string;

  const startDaemon = () => new Promise((resolve) => {
    const f = IPFSFactory.create({ type: 'js' });
    f.spawn((err: any, ipfsd: any) => {
      daemon = ipfsd;
      host = daemon.api.apiHost;
      port = daemon.api.apiPort;
      resolve();
    });
  });

  beforeAll(() => startDaemon(), 20000);
  afterAll((done) => daemon.stop(done));

  it('packages Owned.sol into owned and writes to IPFS', async () => {
    /*
     * initialize EthPM
     */
    const ethpm = await EthPM.configure({
      manifests: 'ethpm/manifests/v2',
      storage: 'ethpm/storage/ipfs',
      // registry: "ethpm/registries/web3"
    }).connect({
      /* ipfs: {
        host: "ipfs.infura.io",
        port: 5001,
        protocol: "https"
      } */
      ipfs: { host, port, protocol: 'http' },
    });

    /*
     * read Owned.sol from disk
     */
    const contractPath = './contracts/Owned.sol';
    const contractSource = sources.owned[contractPath];

    /*
     * write Owned.sol to IPFS
     */
    const contractUri = await ethpm.storage.write(contractSource);

    /*
     * test reading same file back out
     */
    expect(await ethpm.storage.read(contractUri)).toEqual(contractSource);

    /*
     * build package - stub example package for convenience
     */
    const owned = {
      ...packages.owned,

      packageName: 'owned',
      version: '1.0.0',
      sources: {
        [contractPath]: contractUri,
      },
    };

    /*
     * dump manifest
     */
    const manifest = await ethpm.manifests.write(owned);

    /*
     * test that manifest is the same as example
     */
    expect(manifest).toEqual(examples.owned);

    /*
     * write manifest to IPFS
     */
    const manifestUri = await ethpm.storage.write(manifest);

    /*
     * test reading same file back out
     */
    expect(await ethpm.storage.read(manifestUri)).toEqual(manifest);

    /*
     * test against "transferable"'s "owned" dependency
     */
    expect(manifestUri)
      .toEqual(packages.transferable.buildDependencies.owned);
  });
});
