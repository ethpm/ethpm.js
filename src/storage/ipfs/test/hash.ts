import { v3 } from 'ethpm/manifests/v3';

import hash from 'ethpm/storage/ipfs/hash';

import examples from 'test/examples/manifests';

it('hashes manifests', async () => {
  const standardToken = examples['standard-token'];
  const piperCoin = examples['piper-coin'];

  const { buildDependencies } = await v3.read(piperCoin);

  const { hostname: expected } = buildDependencies['standard-token'];
  const actual: string = await hash(standardToken);

  expect(actual).toEqual(expected);
});
