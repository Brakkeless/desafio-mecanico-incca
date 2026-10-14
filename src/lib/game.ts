export type Difficulty = 'Fácil' | 'Intermedia' | 'Avanzada' | 'Final';
export type LevelKind = 'tools' | 'gears' | 'lever' | 'forces' | 'pulleys' | 'torque' | 'hydraulic' | 'efficiency' | 'transmission' | 'repair';

export interface Level {
  id: number; title: string; difficulty: Difficulty; kind: LevelKind; prompt: string;
  instruction: string; options?: string[]; correct: string; explanation: string;
}

export interface AnswerRecord { levelId: number; answer: string; elapsedSeconds: number; }
export interface RankRow { id?: string; alias: string; score: number; duration_seconds: number; created_at?: string; rank?: number; }

export const levels: Level[] = [
  { id:1,title:'Reconoce las herramientas',difficulty:'Fácil',kind:'tools',prompt:'Debes ajustar una tuerca hexagonal sin dañarla.',instruction:'Selecciona la herramienta correcta.',options:['Llave combinada','Martillo','Segueta','Lima'],correct:'Llave combinada',explanation:'La llave combinada abraza las caras de la tuerca y permite aplicar torque de forma controlada.' },
  { id:2,title:'Engranajes en movimiento',difficulty:'Fácil',kind:'gears',prompt:'El engranaje conductor A gira en sentido horario.',instruction:'Indica el sentido de giro del engranaje B, que está engranado directamente con A.',options:['Horario','Antihorario','Se detiene'],correct:'Antihorario',explanation:'Dos engranajes externos en contacto giran en sentidos opuestos.' },
  { id:3,title:'El poder de las palancas',difficulty:'Fácil',kind:'lever',prompt:'Necesitas levantar una carga con el menor esfuerzo posible.',instruction:'Mueve el punto de apoyo y déjalo en la posición más conveniente.',correct:'20',explanation:'Acercar el apoyo a la carga aumenta el brazo de esfuerzo y la ventaja mecánica.' },
  { id:4,title:'Fuerzas en movimiento',difficulty:'Intermedia',kind:'forces',prompt:'El vehículo se desplaza a velocidad constante sobre una vía horizontal.',instruction:'Selecciona el diagrama que representa la fuerza neta.',options:['Fuerzas equilibradas','Fuerza mayor hacia adelante','Solo actúa el peso'],correct:'Fuerzas equilibradas',explanation:'Velocidad constante implica aceleración cero; por la segunda ley de Newton, la fuerza neta es cero.' },
  { id:5,title:'Desafío de poleas',difficulty:'Intermedia',kind:'pulleys',prompt:'La carga pesa 120 N. Los sistemas se consideran ideales.',instruction:'Elige el montaje que necesita menos fuerza.',options:['Polea fija: 120 N','1 polea móvil: 60 N','Aparejo de 4 tramos: 30 N'],correct:'Aparejo de 4 tramos: 30 N',explanation:'Cuatro tramos de cuerda sostienen la carga: F = 120 N / 4 = 30 N.' },
  { id:6,title:'Controla la transmisión',difficulty:'Intermedia',kind:'torque',prompt:'El engranaje del motor tiene 12 dientes. Buscas triplicar el torque ideal.',instruction:'Ajusta el número de dientes del engranaje de salida.',correct:'36',explanation:'Relación = 36/12 = 3. El torque ideal se triplica y la velocidad se reduce a un tercio.' },
  { id:7,title:'Ingeniería hidráulica',difficulty:'Intermedia',kind:'hydraulic',prompt:'Aplicas 40 N sobre un pistón de 2 cm². El pistón de salida tiene 10 cm².',instruction:'Ajusta la fuerza de salida que predice el principio de Pascal.',correct:'200',explanation:'La presión se transmite por igual: F₂ = F₁(A₂/A₁) = 40 × (10/2) = 200 N.' },
  { id:8,title:'Eficiencia energética',difficulty:'Avanzada',kind:'efficiency',prompt:'Una máquina recibe 500 W. Ajusta su potencia útil para alcanzar exactamente 80 % de eficiencia.',instruction:'Mueve el control y observa cómo cambia la eficiencia.',correct:'400',explanation:'η = P útil / P entrada = 400/500 = 0,80, es decir, 80 %.' },
  { id:9,title:'Diseña una transmisión',difficulty:'Avanzada',kind:'transmission',prompt:'Motor: 1200 rpm. Objetivo: 400 rpm.',instruction:'Toca dos engranajes en orden: primero el conductor y luego el conducido.',correct:'12→36',explanation:'n₂ = n₁(z₁/z₂) = 1200 × 12/36 = 400 rpm.' },
  { id:10,title:'¡Salva la máquina!',difficulty:'Final',kind:'repair',prompt:'El motor gira, pero la banda patina, chirría y el transportador no mueve la carga.',instruction:'Aplica el diagnóstico y la acción segura correctos.',options:['Aumentar la velocidad','Tocar la banda para guiarla','Desconectar y bloquear; revisar tensión, desgaste y alineación'],correct:'Desconectar y bloquear; revisar tensión, desgaste y alineación',explanation:'Primero se aísla y bloquea la energía. Después se inspeccionan tensión, desgaste y alineación de la banda.' }
];

export const BASE_POINTS = [100,100,100,140,140,140,140,190,190,250];

export function normalizeAnswer(value: string | number) { return String(value).trim(); }
export function isCorrect(levelId: number, answer: string | number) {
  const level = levels[levelId - 1];
  return Boolean(level) && normalizeAnswer(answer) === level.correct;
}
export function scoreAnswer(levelId: number, answer: string | number, elapsedSeconds: number) {
  if (!isCorrect(levelId, answer)) return 0;
  const base = BASE_POINTS[levelId - 1] ?? 0;
  const safeTime = Math.max(0, Math.min(120, Math.floor(elapsedSeconds)));
  const bonus = Math.max(0, 30 - Math.floor(safeTime / 3));
  return base + bonus;
}
export function totalScore(records: AnswerRecord[]) {
  const unique = new Map(records.map(r => [r.levelId, r]));
  if (unique.size !== 10) return 0;
  return levels.reduce((sum,l) => sum + scoreAnswer(l.id, unique.get(l.id)?.answer ?? '', unique.get(l.id)?.elapsedSeconds ?? 120), 0);
}
export function cleanAlias(input: string) {
  return input.replace(/[<>]/g,'').replace(/\s+/g,' ').trim().slice(0,20);
}
