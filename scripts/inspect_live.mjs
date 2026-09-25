import {createClient} from "genlayer-js";
import {studioDevnet} from "genlayer-js/chains";
const address="0x52c6803B9Dcb8d5D578E0b85dA081c181a4D0910";
const chain={...studioDevnet,id:61997,rpcUrls:{default:{http:["https://studio-next.genlayer.com/api"]}}};
const client=createClient({chain});
const read=(functionName,args=[])=>client.readContract({address,functionName,args,stateStatus:"finalized",jsonSafeReturn:true});
const totals=await read("get_totals");const snapshot=await read("get_snapshot",[1]);const job=await read("get_job",[1]);
console.log(JSON.stringify({totals,snapshot,job},null,2));
