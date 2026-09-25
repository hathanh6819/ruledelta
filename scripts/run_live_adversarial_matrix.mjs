#!/usr/bin/env node
import {createAccount,createClient} from "genlayer-js";
import {studioDevnet} from "genlayer-js/chains";
const CONTRACT="0x52c6803B9Dcb8d5D578E0b85dA081c181a4D0910";
const DEPLOYER="0xa365F55A3bf352767bc5c5739FfDDAee8FcF3a19";
const PROPOSED="2023-00414",FINAL="2024-09171",QUESTION="Did the final rule materially change the proposed ban on worker non-compete clauses?";
const QUESTION2="Did the final rule change which workers fall within the proposed non-compete prohibition?";
const chain={...studioDevnet,id:61997,name:"GenLayer Studio Next",rpcUrls:{default:{http:["https://studio-next.genlayer.com/api"]}}};
function hidden(prompt){return new Promise((resolve,reject)=>{process.stdout.write(prompt);process.stdin.setRawMode(true);process.stdin.resume();process.stdin.setEncoding("utf8");let value="";const done=()=>{process.stdin.off("data",onData);process.stdin.setRawMode(false);process.stdin.pause()};const onData=chunk=>{for(const char of chunk){if(char==="\u0003"){done();reject(new Error("Interrupted"));return}if(char==="\r"||char==="\n"){done();process.stdout.write("\n");resolve(value.trim());return}if(char==="\u007f"||char==="\b")value=value.slice(0,-1);else value+=char}};process.stdin.on("data",onData)})}
async function signer(label){const raw=await hidden(`${label} private key: `);const account=createAccount(raw.startsWith("0x")?raw:`0x${raw}`);if(account.address.toLowerCase()===DEPLOYER.toLowerCase())throw Error(`${label} cannot be deployer`);return{account,client:createClient({chain,account})}}
const read=(c,n,args=[])=>c.readContract({address:CONTRACT,functionName:n,args,stateStatus:"finalized",jsonSafeReturn:true});
async function write(s,label,name,args){const fees=await s.client.estimateTransactionFees({leaderTimeunitsAllocation:220n,validatorTimeunitsAllocation:600n});const hash=await s.client.writeContract({account:s.account,address:CONTRACT,functionName:name,args,value:0n,fees:{distribution:fees.distribution,feeValue:fees.feeValue}});const receipt=await s.client.waitForTransactionReceipt({hash,waitUntil:"finalized",interval:3000,retries:600,fullTransaction:false});console.log(JSON.stringify({label,hash,execution:receipt?.txExecutionResultName||"unknown"}));return hash}
function stable(value){return JSON.stringify(value,Object.keys(value).sort())}
async function main(){
 const a=await signer("creator");const b=await signer("assessor");if(a.account.address.toLowerCase()===b.account.address.toLowerCase())throw Error("Distinct test wallets required");
 const before={totals:await read(a.client,"get_totals"),snapshot:await read(a.client,"get_snapshot",[1]),certificate:await read(a.client,"get_job",[1])};const tx={};
 tx.invalidDocument=await write(a,"invalid_document_number","anchor_source_pair",["bad",FINAL]);
 tx.identicalDocuments=await write(a,"identical_documents","anchor_source_pair",[PROPOSED,PROPOSED]);
 tx.duplicateSnapshot=await write(a,"duplicate_snapshot","anchor_source_pair",[PROPOSED,FINAL]);
 tx.snapshotMissing=await write(a,"snapshot_not_found","create_comparison",[999,QUESTION2,0]);
 tx.invalidQuestion=await write(a,"invalid_question","create_comparison",[1,"short",0]);
 tx.duplicateJob=await write(a,"duplicate_job","create_comparison",[1,QUESTION,0]);
 tx.jobMissing=await write(b,"job_not_found","assess_comparison",[999]);
 tx.assessmentReplay=await write(b,"assessment_closed_replay","assess_comparison",[1]);
 tx.staleSuccessor=await write(a,"newer_snapshot_required","create_comparison",[1,QUESTION2,1]);
 tx.createOpen=await write(a,"create_open_job_for_role_test","create_comparison",[1,QUESTION2,0]);
 const totalsAfterCreate=await read(a.client,"get_totals");const openJobId=Number(totalsAfterCreate.jobs);
 tx.creatorSelfAssess=await write(a,"creator_self_assessment","assess_comparison",[openJobId]);
 const after={totals:await read(a.client,"get_totals"),snapshot:await read(a.client,"get_snapshot",[1]),certificate:await read(a.client,"get_job",[1]),openJob:await read(a.client,"get_job",[openJobId])};
 const audit={snapshotImmutable:stable(before.snapshot)===stable(after.snapshot),certificateImmutable:stable(before.certificate)===stable(after.certificate),certifiedCountUnchanged:Number(before.totals.certified)===Number(after.totals.certified),openJobStayedOpen:after.openJob.status==="OPEN"&&after.openJob.assessor===""};
 if(!Object.values(audit).every(Boolean))throw Error(`Audit invariant failed: ${JSON.stringify(audit)}`);
 console.log("ADVERSARIAL_MATRIX_COMPLETE="+JSON.stringify({contract:CONTRACT,creator:a.account.address,assessor:b.account.address,openJobId,tx,audit,after}));
}
main().catch(e=>{console.error(e?.stack||e);process.exitCode=1});
