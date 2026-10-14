import type { AnswerRecord, RankRow } from './game';

const DEMO_KEY = 'incca-demo-ranking-v3';
const hasServerBackend = () => !location.hostname.endsWith('github.io');
export const isDemo = () => !hasServerBackend() || !navigator.onLine || localStorage.getItem('incca-force-demo') === '1';

function demoRows(): RankRow[] {
  try { return JSON.parse(localStorage.getItem(DEMO_KEY) || '[]'); } catch { return []; }
}
function saveDemo(row: RankRow) {
  const rows = [...demoRows(), row].sort((a,b)=>b.score-a.score || a.duration_seconds-b.duration_seconds || String(a.created_at).localeCompare(String(b.created_at))).slice(0,100);
  localStorage.setItem(DEMO_KEY, JSON.stringify(rows));
  return rows.findIndex(x=>x===row)+1;
}

async function jsonFetch(path: string, init?: RequestInit) {
  const response = await fetch(path, { ...init, headers: {'Content-Type':'application/json', ...(init?.headers || {})} });
  if (!response.ok) throw new Error((await response.json().catch(()=>({}))).error || 'No fue posible conectar con el servicio.');
  return response.json();
}

export async function startRun(alias: string) {
  if (isDemo()) return { mode:'demo', token:`demo-${crypto.randomUUID()}` };
  try { return await jsonFetch('/api/start', {method:'POST', body:JSON.stringify({alias})}); }
  catch { localStorage.setItem('incca-force-demo','1'); return {mode:'demo',token:`demo-${crypto.randomUUID()}`}; }
}

export async function submitRun(alias:string, token:string, answers:AnswerRecord[], duration:number, score:number) {
  if (token.startsWith('demo-') || isDemo()) {
    const row={alias,score,duration_seconds:duration,created_at:new Date().toISOString()};
    return {mode:'demo',score,position:saveDemo(row)};
  }
  return jsonFetch('/api/submit',{method:'POST',body:JSON.stringify({alias,token,answers,duration})});
}

export async function getRanking(): Promise<{mode:string;rows:RankRow[]}> {
  if (isDemo()) return {mode:'demo',rows:demoRows().slice(0,10)};
  try { return await jsonFetch('/api/ranking'); }
  catch { return {mode:'demo',rows:demoRows().slice(0,10)}; }
}

export async function adminRequest(token:string, action='stats', id='') {
  return jsonFetch(`/api/admin?action=${encodeURIComponent(action)}${id?`&id=${encodeURIComponent(id)}`:''}`,{headers:{Authorization:`Bearer ${token}`}});
}

export function setDemo(enabled:boolean) {
  if(enabled) localStorage.setItem('incca-force-demo','1'); else localStorage.removeItem('incca-force-demo');
  window.dispatchEvent(new Event('incca-mode'));
}
