import {createClient} from '@supabase/supabase-js';
import {chacha20poly1305} from '@noble/ciphers/chacha';
// The publishable anon key is public by design; access is enforced by Row Level Security.
// The login session persists across page refreshes in localStorage and is ended by sign-out or by the idle timeout in App.tsx.
export const sb=createClient('https://jcmblpfnfffhnodvoone.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjbWJscGZuZmZmaG5vZHZvb25lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ5NTg1ODAsImV4cCI6MjExMDUzNDU4MH0.j7chMzc01KJiCggF7csj4mU5c5qzFcujAfgnMMW4A-4',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce',storageKey:'embun-auth',storage:typeof window!=='undefined'?window.localStorage:undefined}});
const te=new TextEncoder(),td=new TextDecoder();
export const NL=String.fromCharCode(10),CR=String.fromCharCode(13),QT=String.fromCharCode(34);
const b64=(u:Uint8Array)=>{let s='';u.forEach(b=>{s+=String.fromCharCode(b)});return btoa(s)};
const unb64=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
let aes:any=null,cha:any=null;
export const lock=()=>{aes=null;cha=null};
export const newSalt=()=>b64(crypto.getRandomValues(new Uint8Array(16)));
export async function deriveKeys(pass:string,salt:string,iter:number){const base=await crypto.subtle.importKey('raw',te.encode(pass),'PBKDF2',false,['deriveBits']);const bits=new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',salt:unb64(salt),iterations:iter,hash:'SHA-256'},base,512));aes=await crypto.subtle.importKey('raw',bits.slice(0,32),'AES-GCM',false,['encrypt','decrypt']);cha=bits.slice(32)}
export async function enc(p:string):Promise<string>{const iv=crypto.getRandomValues(new Uint8Array(12));const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},aes,te.encode(p)));const l1=new Uint8Array(12+ct.length);l1.set(iv);l1.set(ct,12);const nonce=crypto.getRandomValues(new Uint8Array(12));const l2=chacha20poly1305(cha,nonce).encrypt(l1);const out=new Uint8Array(12+l2.length);out.set(nonce);out.set(l2,12);return 'v1.'+b64(out)}
export async function dec(s:any):Promise<string>{if(!s)return '';try{const o=unb64(String(s).slice(3));const l1=chacha20poly1305(cha,o.slice(0,12)).decrypt(o.slice(12));const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:l1.slice(0,12)},aes,l1.slice(12));return td.decode(pt)}catch{return ''}}
export async function fetchAll(t:string){const out:any[]=[];for(let i=0;;i+=1000){const {data,error}=await sb.from(t).select('*').order('id').range(i,i+999);if(error)throw error;out.push(...(data||[]));if(!data||data.length<1000)break}return out}
export const pad=(n:number)=>String(n).padStart(2,'0');
export const todayStr=()=>{const x=new Date();return x.getFullYear()+'-'+pad(x.getMonth()+1)+'-'+pad(x.getDate())};
export const hexRgb=(h:string)=>{const n=parseInt(h.slice(1),16);return ((n>>16)&255)+' '+((n>>8)&255)+' '+(n&255)};
export const fmt=(v:number,cur='MYR')=>{try{return new Intl.NumberFormat('en-MY',{style:'currency',currency:cur}).format(v)}catch{return cur+' '+v.toFixed(2)}};
export function parseDate(s:string){const m=s.trim().match(/^([0-9]{1,2})[/.-]([0-9]{1,2})[/.-]([0-9]{4})/);if(m)return new Date(+m[3],+m[2]-1,+m[1],12);const d=new Date(s);return isNaN(+d)?new Date():d}
export function parseCSV(t:string){const r:string[][]=[];let row:string[]=[],f='',q=false;const end=()=>{row.push(f);f='';if(row.length>1||row[0]!=='')r.push(row);row=[]};for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c===QT){if(t[i+1]===QT){f+=QT;i++}else q=false}else f+=c}else if(c===QT)q=true;else if(c===','){row.push(f);f=''}else if(c===NL||c===CR){if(c===CR&&t[i+1]===NL)i++;end()}else f+=c}if(f!==''||row.length)end();return r}
export const toCSV=(rows:any[][])=>rows.map(r=>r.map(x=>{const s=String(x==null?'':x);return s.includes(',')||s.includes(QT)||s.includes(NL)?QT+s.split(QT).join(QT+QT)+QT:s}).join(',')).join(NL);
export function download(name:string,text:string,mime:string){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:mime}));a.download=name;document.body.appendChild(a);a.click();a.remove()}
export function deviceInfo(){const u=navigator.userAgent;const os=/Windows/.test(u)?'Windows':/Android/.test(u)?'Android':/iPhone|iPad/.test(u)?'iOS':/Mac/.test(u)?'macOS':/Linux/.test(u)?'Linux':'Unknown OS';const br=/Edg[/]/.test(u)?'Edge':/Firefox[/]/.test(u)?'Firefox':/Chrome[/]/.test(u)?'Chrome':/Safari[/]/.test(u)?'Safari':'Browser';const kind=/iPad|Tablet/.test(u)?'Tablet':/Mobi|iPhone|Android/.test(u)?'Phone':'PC';return {name:kind+' \u00b7 '+br,os:br+' on '+os}}
export async function regionHash(){const tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';const h=new Uint8Array(await crypto.subtle.digest('SHA-256',te.encode(tz)));return Array.from(h.slice(0,4)).map(b=>b.toString(16).padStart(2,'0')).join('')}
// Removes this browser's row from the device list. Used on sign-out and idle timeout.
export async function removeThisDevice(){try{const id=localStorage.getItem('embun_device');if(id)await sb.from('user_devices').delete().eq('device_id',id)}catch{}}
