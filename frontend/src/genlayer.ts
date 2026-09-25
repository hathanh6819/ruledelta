import{createClient}from'genlayer-js';import{studioDevnet}from'genlayer-js/chains';
const studioNext={...studioDevnet,id:61997,name:'GenLayer Studio Next',rpcUrls:{default:{http:['https://studio-next.genlayer.com/api']}}};
export const CONTRACT=(import.meta.env.VITE_CONTRACT_ADDRESS||'').trim();export const configured=/^0x[0-9a-fA-F]{40}$/.test(CONTRACT);
export const reader=createClient({chain:studioNext});
export const writer=()=>{if(!window.ethereum)throw Error('No injected wallet found.');return createClient({chain:studioNext,account:window.ethereum as never})};
export const normalizeTx=(value:unknown)=>typeof value==='string'?value:(value as{hash:string}).hash;
export const short=(v:string)=>v&&v.startsWith('0x')?`${v.slice(0,6)}...${v.slice(-4)}`:v||'—';
export const explorer=configured?`https://explorer-studio-dev.genlayer.com/address/${CONTRACT}`:'';
export const txUrl=(hash:string)=>`https://explorer-studio-dev.genlayer.com/tx/${hash}`;
