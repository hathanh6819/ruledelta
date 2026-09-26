import { createClient } from 'genlayer-js';
import { studioDevnet } from 'genlayer-js/chains';
import type { CalldataEncodable, TransactionHash } from 'genlayer-js/types';

export const studioNext = {
  ...studioDevnet,
  id: 61997,
  name: 'GenLayer Studio Next',
  rpcUrls: { default: { http: ['https://studio-next.genlayer.com/api'] } },
};

const env = (import.meta as ImportMeta & { env?: Record<string, string> }).env;
export const CONTRACT = (env?.VITE_CONTRACT_ADDRESS || '').trim();
export const configured = /^0x[0-9a-fA-F]{40}$/.test(CONTRACT);
export const reader = createClient({ chain: studioNext });

export type InjectedProvider = {
  request: (request: { method: string; params?: unknown[] }) => Promise<unknown>;
};

type ClientFactory = typeof createClient;

export async function connectedWallet(
  provider: InjectedProvider | undefined,
  expectedAccount = '',
  factory: ClientFactory = createClient,
) {
  if (!provider?.request) throw Error('Install a compatible injected wallet.');
  const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
  const account = accounts?.[0] || '';
  if (!/^0x[0-9a-fA-F]{40}$/.test(account)) throw Error('Wallet returned no valid account.');

  const chainId = BigInt(String(await provider.request({ method: 'eth_chainId' })));
  if (chainId !== 61997n) throw Error('Switch the wallet to GenLayer Studio Next (chain ID 61997).');
  if (expectedAccount && account.toLowerCase() !== expectedAccount.toLowerCase()) {
    throw Error('Wallet account changed. Reconnect before signing.');
  }

  return {
    account,
    client: factory({ chain: studioNext, provider: provider as never, account: account as `0x${string}` }),
  };
}

export async function connectWallet() {
  return (await connectedWallet(window.ethereum as InjectedProvider | undefined)).account;
}

export async function writeFinalized(
  expectedAccount: string,
  functionName: string,
  args: CalldataEncodable[],
) {
  if (!configured) throw Error('Contract address is not configured.');
  const { client } = await connectedWallet(
    window.ethereum as InjectedProvider | undefined,
    expectedAccount,
  );
  const fees = await client.estimateTransactionFees({
    leaderTimeunitsAllocation: 260n,
    validatorTimeunitsAllocation: 600n,
  });
  const raw = await client.writeContract({
    address: CONTRACT,
    functionName,
    args,
    value: 0n,
    fees: { distribution: fees.distribution, feeValue: fees.feeValue },
  });
  const hash = (typeof raw === 'string' ? raw : (raw as { hash: string }).hash) as TransactionHash;
  if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) throw Error('Wallet returned an invalid transaction hash.');

  const receipt = await reader.waitForTransactionReceipt({
    hash,
    waitUntil: 'finalized',
    interval: 4000,
    retries: 300,
  }) as any;
  if (receipt?.txExecutionResultName && receipt.txExecutionResultName !== 'FINISHED_WITH_RETURN') {
    throw Error(`${functionName} finalized with ${receipt.txExecutionResultName}.`);
  }
  const votes = (Array.isArray(receipt?.consensus_data?.validators)
    ? receipt.consensus_data.validators
    : []).filter((vote: any) => vote?.vote !== 'idle');
  if (votes.some((vote: any) => vote?.receipt?.execution_result !== 'SUCCESS')) {
    throw Error(`${functionName} did not receive successful validator execution.`);
  }
  return hash;
}

export const readFinalized = <T = unknown>(functionName: string, args: CalldataEncodable[] = []) =>
  reader.readContract({
    address: CONTRACT,
    functionName,
    args,
    jsonSafeReturn: true,
    stateStatus: 'finalized',
  } as any) as Promise<T>;

export const short = (value: string) => value && value.startsWith('0x')
  ? `${value.slice(0, 6)}...${value.slice(-4)}`
  : value || '—';
export const explorer = configured ? `https://explorer-studio-dev.genlayer.com/address/${CONTRACT}` : '';
export const txUrl = (hash: string) => `https://explorer-studio-dev.genlayer.com/tx/${hash}`;
