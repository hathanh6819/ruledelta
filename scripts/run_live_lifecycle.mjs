#!/usr/bin/env node
import { createAccount, createClient } from "genlayer-js";
import { studioDevnet } from "genlayer-js/chains";

const CONTRACT="0x52c6803B9Dcb8d5D578E0b85dA081c181a4D0910";
const DEPLOYER="0xa365F55A3bf352767bc5c5739FfDDAee8FcF3a19";
const PROPOSED="2023-00414";
const FINAL="2024-09171";
const QUESTION="Did the final rule materially change the proposed ban on worker non-compete clauses?";
const chain={...studioDevnet,id:61997,name:"GenLayer Studio Next",rpcUrls:{default:{http:["https://studio-next.genlayer.com/api"]}}};

function hidden(prompt){return new Promise((resolve,reject)=>{process.stdout.write(prompt);process.stdin.setRawMode(true);process.stdin.resume();process.stdin.setEncoding("utf8");let value="";const done=()=>{process.stdin.off("data",onData);process.stdin.setRawMode(false);process.stdin.pause()};const onData=chunk=>{for(const char of chunk){if(char==="\u0003"){done();reject(new Error("Interrupted"));return}if(char==="\r"||char==="\n"){done();process.stdout.write("\n");resolve(value.trim());return}if(char==="\u007f"||char==="\b")value=value.slice(0,-1);else value+=char}};process.stdin.on("data",onData)})}
async function signer(label){const raw=await hidden(`${label} private key: `);const account=createAccount(raw.startsWith("0x")?raw:`0x${raw}`);if(account.address.toLowerCase()===DEPLOYER.toLowerCase())throw new Error(`${label} must not be the deployment wallet`);console.log(`SIGNER ${label}=${account.address}`);return{account,client:createClient({chain,account})}}
async function write(s,name,args){const fees=await s.client.estimateTransactionFees({leaderTimeunitsAllocation:260n,validatorTimeunitsAllocation:600n});const hash=await s.client.writeContract({account:s.account,address:CONTRACT,functionName:name,args,value:0n,fees:{distribution:fees.distribution,feeValue:fees.feeValue}});console.log(`WRITE ${name} tx=${hash}`);const receipt=await s.client.waitForTransactionReceipt({hash,waitUntil:"finalized",interval:3000,retries:600,fullTransaction:false});console.log(`FINALIZED ${name} execution=${receipt?.txExecutionResultName||"unknown"}`);if(receipt?.txExecutionResultName!=="FINISHED_WITH_RETURN")throw new Error(`${name} failed: ${receipt?.txExecutionResultName}`);return hash}
async function read(client,name,args=[]){return client.readContract({address:CONTRACT,functionName:name,args,stateStatus:"finalized",jsonSafeReturn:true})}
async function main(){
 const creator=await signer("creator");const assessor=await signer("assessor");
 if(creator.account.address.toLowerCase()===assessor.account.address.toLowerCase())throw new Error("Creator and assessor must differ");
 const tx={};tx.anchor=await write(creator,"anchor_source_pair",[PROPOSED,FINAL]);
 const afterAnchor=await read(creator.client,"get_totals");const snapshotId=Number(afterAnchor.snapshots);if(snapshotId<1)throw new Error("No source snapshot persisted");
 tx.create=await write(creator,"create_comparison",[snapshotId,QUESTION,0]);
 const afterCreate=await read(creator.client,"get_totals");const jobId=Number(afterCreate.jobs);if(jobId<1)throw new Error("No comparison job persisted");
 tx.assess=await write(assessor,"assess_comparison",[jobId]);
 const snapshot=await read(creator.client,"get_snapshot",[snapshotId]);const job=await read(creator.client,"get_job",[jobId]);
 if(job.status!=="CERTIFIED"&&job.status!=="UNRESOLVED")throw new Error(`Unexpected terminal status: ${job.status}`);
 console.log("LIFECYCLE_COMPLETE="+JSON.stringify({contract:CONTRACT,creator:creator.account.address,assessor:assessor.account.address,snapshot,job,transactions:tx}));
}
main().catch(error=>{console.error(error?.stack||error);process.exitCode=1});
