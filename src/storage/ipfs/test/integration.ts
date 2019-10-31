import { EthPM } from 'ethpm';
import { URL } from 'url';

const IPFSFactory = require('ipfsd-ctl');

describe('IPFS integration', () => {
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

  it('should write to the IPFS daemon', async () => {
    const ethpm = await EthPM.configure({
      storage: 'ethpm/storage/ipfs',
    }).connect({
      ipfs: { host, port, protocol: 'http' },
    });

    const expectedHref = 'ipfs://Qmf412jQZiuVUtdgnB36FXFX7xg5V6KEbSJ4dpQuhkLyfD';

    const url = await ethpm.storage.write('hello world');
    expect(url.href).toBe(expectedHref);
  });

  it('should read from the IPFS daemon', async () => {
    const ethpm = await EthPM.configure({
      storage: 'ethpm/storage/ipfs',
    }).connect({
      ipfs: { host, port, protocol: 'http' },
    });

    const url = new URL(
      'ipfs://Qmf412jQZiuVUtdgnB36FXFX7xg5V6KEbSJ4dpQuhkLyfD',
    );
    const expectedContent = 'hello world';

    const content = await ethpm.storage.read(url);
    expect(content).toBe(expectedContent);
  });
});
