import crypto from 'node:crypto';

export const ANSWERS=['Llave combinada','Antihorario','20','Fuerzas equilibradas','Aparejo de 4 tramos: 30 N','36','200','400','12→36','Desconectar y bloquear; revisar tensión, desgaste y alineación'];
export const BASE=[100,100,100,140,140,140,140,190,190,250];
export function aliasOf(v){return String(v||'').replace(/[<>]/g,'').replace(/\s+/g,' ').trim().slice(0,20)}
export function scoreAnswers(records){
  if(!Array.isArray(records)||records.length!==10)return null;
  const ids=new Set(records.map(x=>x.levelId)); if(ids.size!==10||![...ids].every(x=>Number.isInteger(x)&&x>=1&&x<=10))return null;
  return records.reduce((total,r)=>{const i=r.levelId-1;if(String(r.answer).trim()!==ANSWERS[i])return total;const t=Math.max(0,Math.min(120,Math.floor(Number(r.elapsedSeconds)||0)));return total+BASE[i]+Math.max(0,30-Math.floor(t/3))},0);
}
function secret(){if(!process.env.RESULT_SIGNING_SECRET)throw new Error('RESULT_SIGNING_SECRET no configurado');return process.env.RESULT_SIGNING_SECRET}
export function sign(payload){const body=Buffer.from(JSON.stringify(payload)).toString('base64url');const mac=crypto.createHmac('sha256',secret()).update(body).digest('base64url');return `${body}.${mac}`}
export function verify(token){const [body,mac]=String(token||'').split('.');if(!body||!mac)return null;const expected=crypto.createHmac('sha256',secret()).update(body).digest('base64url');if(mac.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(mac),Buffer.from(expected)))return null;try{return JSON.parse(Buffer.from(body,'base64url').toString())}catch{return null}}
export async function db(path,options={}){
  const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error('Supabase no configurado');
  const auth=key.startsWith('sb_secret_')?{}:{Authorization:`Bearer ${key}`};
  const r=await fetch(`${url}/rest/v1/${path}`,{...options,headers:{apikey:key,...auth,'Content-Type':'application/json',...(options.headers||{})}});
  if(!r.ok)throw new Error(`Error de base de datos (${r.status})`);const text=await r.text();return text?JSON.parse(text):null;
}
export function admin(req){const got=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');const expected=process.env.ADMIN_TOKEN||'';if(!got||!expected||got.length!==expected.length)return false;return crypto.timingSafeEqual(Buffer.from(got),Buffer.from(expected))}
export function allow(req,res,methods=['GET']){res.setHeader('Cache-Control','no-store');if(!methods.includes(req.method)){res.status(405).json({error:'Método no permitido'});return false}return true}

