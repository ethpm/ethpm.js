import { exampleStorage } from 'test/stub/storage/examples';
import examples from 'test/examples/packages';

import { Query } from 'ethpm/session/query';
import { v2 } from 'ethpm/manifests/v2';


it('resolves package-level contract types', async () => {
  const query = new Query({
    package: examples['standard-token'],
    workspace: {
      storage: exampleStorage,
      manifests: v2,
    },
  });

  const standardToken = await query.contractType('StandardToken');

  expect(standardToken).toEqual(
    examples['standard-token'].contractTypes.StandardToken,
  );
});

it('resolves deployed instances', async () => {
  const query = new Query({
    package: examples['piper-coin'],
    workspace: {
      storage: exampleStorage,
      manifests: v2,
    },
  });

  const [chain] = examples['piper-coin'].deployments.keys();
  const deployment = examples['piper-coin'].deployments.get(chain) || {};

  const expectedInstance = deployment.PiperCoin;

  const piperCoin = await query.contractInstance(chain, 'PiperCoin');

  expect(piperCoin).toEqual(expectedInstance);
});

it('resolves build dependencies', async () => {
  const query = new Query({
    package: examples['piper-coin'],
    workspace: {
      storage: exampleStorage,
      manifests: v2,
    },
  });

  const standardToken = await query.buildDependency('standard-token');

  expect(standardToken).toEqual(examples['standard-token']);
});


it('resolves contract types from a dependent package', async () => {
  const query = new Query({
    package: examples['piper-coin'],
    workspace: {
      storage: exampleStorage,
      manifests: v2,
    },
  });

  const standardToken = await query.contractType('standard-token:StandardToken');
  const expected = examples['standard-token'].contractTypes.StandardToken;

  expect(standardToken).toEqual(expected);
});

it("resolves contract types from a dependency's dependency", async () => {
  const query = new Query({
    package: examples['wallet-with-send'],
    workspace: {
      storage: exampleStorage,
      manifests: v2,
    },
  });

  const ref = 'wallet:safe-math-lib:SafeMathLib';

  const standardToken = await query.contractType(ref);
  const expected = examples['safe-math-lib'].contractTypes.SafeMathLib;

  expect(standardToken).toEqual(expected);
});
