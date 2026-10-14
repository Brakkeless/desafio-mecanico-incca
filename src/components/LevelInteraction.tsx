import { useEffect, useMemo } from 'react';
import type { Level } from '../lib/game';
import { Mechanism } from './Mechanism';

export function LevelInteraction({level,value,onChange,disabled,reduced}:{level:Level;value:string;onChange:(v:string)=>void;disabled:boolean;reduced:boolean}) {
  const n=Number(value)||0;
  const transmission=useMemo(()=>value?value.split('→'):[],[value]);
  const options=level.options;
  useEffect(()=>{
    if(value) return;
    const defaults:Partial<Record<Level['kind'],string>>={lever:'50',torque:'12',hydraulic:'40',efficiency:'100'};
    if(defaults[level.kind]) onChange(defaults[level.kind]!);
  },[level.kind,value,onChange]);
  if(level.kind==='lever') return <><Mechanism kind={level.kind} value={n} reduced={reduced}/><div className="control-card"><label htmlFor="lever">Posición del apoyo: <b>{value||50}%</b></label><input id="lever" type="range" min="20" max="80" step="10" value={value||50} disabled={disabled} onChange={e=>onChange(e.target.value)}/><div className="range-labels"><span>Cerca de la carga</span><span>Lejos</span></div></div></>;
  if(level.kind==='torque') return <><Mechanism kind={level.kind} value={n} reduced={reduced}/><div className="control-card"><label htmlFor="teeth">Engranaje de salida: <b>{value||12} dientes</b></label><input id="teeth" type="range" min="12" max="48" step="12" value={value||12} disabled={disabled} onChange={e=>onChange(e.target.value)}/><p className="formula">Relación: {(n||12)/12}:1 · Torque ideal: ×{(n||12)/12}</p></div></>;
  if(level.kind==='hydraulic') return <><Mechanism kind={level.kind} value={n} reduced={reduced}/><div className="control-card"><label htmlFor="force">Fuerza de salida: <b>{value||40} N</b></label><input id="force" type="range" min="40" max="280" step="40" value={value||40} disabled={disabled} onChange={e=>onChange(e.target.value)}/><p className="formula">F₂ = 40 N × (10 cm² / 2 cm²)</p></div></>;
  if(level.kind==='efficiency') return <><Mechanism kind={level.kind} value={n||100} reduced={reduced}/><div className="control-card"><label htmlFor="power">Potencia útil: <b>{value||100} W</b></label><input id="power" type="range" min="100" max="500" step="50" value={value||100} disabled={disabled} onChange={e=>onChange(e.target.value)}/><p className="formula">Eficiencia: {Math.round(((n||100)/500)*100)}%</p></div></>;
  if(level.kind==='transmission') {
    const gears=['12','24','36','48'];
    return <><Mechanism kind={level.kind} reduced={reduced}/><div className="gear-picker"><p>Conductor: <b>{transmission[0]||'—'}</b> · Conducido: <b>{transmission[1]||'—'}</b></p>{gears.map(g=><button key={g} disabled={disabled||transmission.length>=2} className={transmission.includes(g)?'active':''} onClick={()=>onChange([...transmission,g].join('→'))}>{g}<small>dientes</small></button>)}<button className="reset" disabled={disabled||!value} onClick={()=>onChange('')}>Reiniciar</button>{transmission.length===2&&<p className="formula">Salida calculada: {Math.round(1200*Number(transmission[0])/Number(transmission[1]))} rpm</p>}</div></>;
  }
  return <><Mechanism kind={level.kind} reduced={reduced}/><div className="option-grid">{options?.map((option,i)=><button key={option} disabled={disabled} aria-pressed={value===option} className={value===option?'selected':''} onClick={()=>onChange(option)}><span>{String.fromCharCode(65+i)}</span>{option}</button>)}</div></>;
}
