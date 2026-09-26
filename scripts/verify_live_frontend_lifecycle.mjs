#!/usr/bin/env node
import { createClient } from 'genlayer-js';
import { studioDevnet } from 'genlayer-js/chains';

const CONTRACT = '0x52c6803B9Dcb8d5D578E0b85dA081c181a4D0910';
const chain = { ...studioDevnet, id: 61997, name: 'GenLayer Studio Next', rpcUrls: { default: { http: ['https://studio-next.genlayer.com/api'] } } };
const client = createClient({ chain });
const writes = {
  anchor_source_pair: '0x660a3ec1889d7ec6209db74351873afd5e1edf77f5d92b86eee25499ab7c529a',
  create_comparison: '0xb7de1b6bef78da3fa68e4314155f9e79b74bfab4ae0c40c9eae42a1e78e48e07',
  assess_comparison: '0x78bc065bcf11349af806865d75841dcbc972ffbdd274b14dacf82593cb2fa008',
};

const read = (functionName, args = []) => client.readContract({ address: CONTRACT, functionName, args, stateStatus: 'finalized', jsonSafeReturn: true });
const keepAliveRead = (functionName, args = []) => Promise.race([
  read(functionName, args),
  new Promise((_, reject) => setTimeout(() => reject(Error(`${functionName} finalized readback timed out`)), 90000)),
]);

for (const [functionName, hash] of Object.entries(writes)) {
  const tx = await client.getTransaction({ hash });
  const status = tx.status_name ?? tx.status;
  const result = tx.result_name ?? tx.result;
  if (Number(status) !== 7 && !String(status).toUpperCase().includes('FINAL')) throw Error(`${functionName} is not finalized: ${status}`);
  if (result !== 'MAJORITY_AGREE') throw Error(`${functionName} did not reach validator consensus: ${result}`);
  console.log(`FINALIZED_WRITE ${functionName} ${hash}`);
}

const snapshot = await keepAliveRead('get_snapshot', [1]);
const job = await keepAliveRead('get_job', [1]);
const totals = await keepAliveRead('get_totals');
if (snapshot.id !== 1 || snapshot.revision !== 1) throw Error('Anchor readback mismatch.');
if (job.id !== 1 || job.snapshot_id !== 1 || !job.creator || !job.assessor) throw Error('Job write/readback mismatch.');
if (job.status !== 'CERTIFIED' || job.outcome !== 'MODIFIED' || job.reason !== 'SCOPE_CHANGED' || !job.certificate_digest) throw Error('Assessment write/readback mismatch.');
console.log('FINALIZED_READBACK=' + JSON.stringify({ snapshot: { id: snapshot.id, revision: snapshot.revision, pair_digest: snapshot.pair_digest }, job, totals }));
