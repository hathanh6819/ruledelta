import test from 'node:test';
import assert from 'node:assert/strict';
import { connectedWallet } from './genlayer.ts';

const ADDRESS = '0x1111111111111111111111111111111111111111';

function provider(account = ADDRESS, chainId = '0xf22d') {
  return {
    async request({ method }: { method: string }) {
      if (method === 'eth_requestAccounts') return [account];
      if (method === 'eth_chainId') return chainId;
      throw Error(`unexpected method ${method}`);
    },
  };
}

test('passes the injected provider and verified account separately to genlayer-js', async () => {
  let configuration: any;
  const factory = ((value: any) => {
    configuration = value;
    return { marker: true };
  }) as any;
  const injected = provider();
  const result = await connectedWallet(injected, ADDRESS, factory);
  assert.equal(result.account, ADDRESS);
  assert.equal(configuration.provider, injected);
  assert.equal(configuration.account, ADDRESS);
  assert.equal(configuration.chain.id, 61997);
});

test('rejects a wallet account change before constructing the client', async () => {
  let constructed = false;
  await assert.rejects(
    connectedWallet(provider(), '0x2222222222222222222222222222222222222222', (() => {
      constructed = true;
      return {};
    }) as any),
    /Wallet account changed/,
  );
  assert.equal(constructed, false);
});

test('rejects the wrong chain before constructing the client', async () => {
  await assert.rejects(connectedWallet(provider(ADDRESS, '0x1'), ADDRESS, (() => ({})) as any), /chain ID 61997/);
});
