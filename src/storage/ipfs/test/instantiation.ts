import { EthPM } from 'ethpm';
import { IpfsService } from '../index';

const IPFSFactory = require('ipfsd-ctl');

describe('IPFS instantiation', () => {
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

  it('should initialize the IPFS daemon properly', () => {
    expect(daemon.initialized).toBe(true);
  });

  it('fails to load plugin without any options passed in', async () => {
    const missingOptions = EthPM.configure({
      storage: 'ethpm/storage/ipfs',
    }).connect({
      /* ... ??? ... */
    });

    await expect(missingOptions).rejects.toBeTruthy();
  });

  it('fails to load plugin with partial options passed in', async () => {
    const missingOptions = EthPM.configure({
      storage: 'ethpm/storage/ipfs',
    }).connect({
      ipfs: { host: 'ipfs.infura.io' },
    });

    await expect(missingOptions).rejects.toBeTruthy();
  });

  it('loads plugin with required options', async () => {
    const ethpm = await EthPM.configure({
      storage: 'ethpm/storage/ipfs',
    }).connect({
      ipfs: { host, port, protocol: 'http' },
    });

    expect(ethpm.storage).toBeInstanceOf(IpfsService);
    expect(ethpm.storage.host).toBe(host);
    expect(ethpm.storage.port).toBe(port.toString());
    expect(ethpm.storage.protocol).toBe('http');
  });
});
