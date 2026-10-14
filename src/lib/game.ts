export type Difficulty = "Fácil" | "Intermedia" | "Avanzada" | "Final";
export type LevelKind =
  | "tools"
  | "gears"
  | "lever"
  | "forces"
  | "pulleys"
  | "torque"
  | "hydraulic"
  | "efficiency"
  | "transmission"
  | "repair";

export interface Level {
  id: number;
  title: string;
  difficulty: Difficulty;
  kind: LevelKind;
  prompt: string;
  instruction: string;
  options?: string[];
  correct: string;
  explanation: string;
  application: string;
}

export interface AnswerRecord {
  levelId: number;
  answer: string;
  elapsedSeconds: number;
}
export interface RankRow {
  id?: string;
  alias: string;
  score: number;
  duration_seconds: number;
  created_at?: string;
  rank?: number;
}

export const levels: Level[] = [
  {
    id: 1,
    title: "Reconoce las herramientas",
    difficulty: "Fácil",
    kind: "tools",
    prompt: "Debes ajustar una tuerca hexagonal sin dañarla.",
    instruction: "Selecciona la herramienta correcta.",
    options: ["Llave combinada", "Martillo", "Segueta", "Lima"],
    correct: "Llave combinada",
    explanation:
      "La llave abraza bien la tuerca y permite hacerla girar sin golpearla ni dañar sus bordes.",
    application:
      "En un taller se usa una llave de la medida correcta para apretar o aflojar la tuerca con seguridad.",
  },
  {
    id: 2,
    title: "Engranajes en movimiento",
    difficulty: "Fácil",
    kind: "gears",
    prompt: "El engranaje conductor A gira en sentido horario.",
    instruction:
      "Indica el sentido de giro del engranaje B, que está engranado directamente con A.",
    options: ["Horario", "Antihorario", "Se detiene"],
    correct: "Antihorario",
    explanation:
      "Cuando dos engranajes se tocan, uno empuja los dientes del otro. Por eso giran en sentidos contrarios.",
    application:
      "Así funcionan muchos relojes, cajas de cambios y máquinas.",
  },
  {
    id: 3,
    title: "El poder de las palancas",
    difficulty: "Fácil",
    kind: "lever",
    prompt: "Necesitas levantar una carga con el menor esfuerzo posible.",
    instruction:
      "Mueve el punto de apoyo y déjalo en la posición más conveniente.",
    correct: "20",
    explanation:
      "La palanca necesita menos fuerza cuando el apoyo está cerca de la carga y tú empujas desde lejos.",
    application:
      "Una barra larga puede ayudarte a levantar una piedra pesada con menos esfuerzo.",
  },
  {
    id: 4,
    title: "Fuerzas en movimiento",
    difficulty: "Intermedia",
    kind: "forces",
    prompt:
      "El vehículo se desplaza a velocidad constante sobre una vía horizontal.",
    instruction: "Selecciona el diagrama que representa la fuerza neta.",
    options: [
      "Fuerzas equilibradas",
      "Fuerza mayor hacia adelante",
      "Solo actúa el peso",
    ],
    correct: "Fuerzas equilibradas",
    explanation:
      "Si el vehículo mantiene la misma velocidad, no está acelerando. Eso significa que las fuerzas se compensan.",
    application:
      "El motor vence el roce y el aire mientras el piso sostiene el peso del vehículo.",
  },
  {
    id: 5,
    title: "Desafío de poleas",
    difficulty: "Intermedia",
    kind: "pulleys",
    prompt: "La carga pesa 120 N. Los sistemas se consideran ideales.",
    instruction: "Elige el montaje que necesita menos fuerza.",
    options: [
      "Polea fija: 120 N",
      "1 polea móvil: 60 N",
      "Aparejo de 4 tramos: 30 N",
    ],
    correct: "Aparejo de 4 tramos: 30 N",
    explanation:
      "Cuatro tramos de cuerda comparten el peso: 120 N ÷ 4 = 30 N.",
    application:
      "Las grúas usan varias poleas para levantar cargas pesadas con menos fuerza.",
  },
  {
    id: 6,
    title: "Controla la transmisión",
    difficulty: "Intermedia",
    kind: "torque",
    prompt:
      "El engranaje del motor tiene 12 dientes. Buscas triplicar el torque ideal.",
    instruction: "Ajusta el número de dientes del engranaje de salida.",
    correct: "36",
    explanation:
      "Un engranaje de salida tres veces más grande entrega cerca de tres veces más fuerza de giro, aunque gira más lento.",
    application:
      "Los reductores permiten que un motor rápido mueva una banda o mezcladora con más fuerza.",
  },
  {
    id: 7,
    title: "Ingeniería hidráulica",
    difficulty: "Intermedia",
    kind: "hydraulic",
    prompt:
      "Aplicas 40 N sobre un pistón de 2 cm². El pistón de salida tiene 10 cm².",
    instruction:
      "Ajusta la fuerza de salida que predice el principio de Pascal.",
    correct: "200",
    explanation:
      "La presión pasa por todo el líquido. Como el pistón grande tiene cinco veces más área, entrega 40 × 5 = 200 N.",
    application:
      "Este principio permite que un gato hidráulico levante un automóvil.",
  },
  {
    id: 8,
    title: "Eficiencia energética",
    difficulty: "Avanzada",
    kind: "efficiency",
    prompt:
      "Una máquina recibe 500 W. Ajusta su potencia útil para alcanzar exactamente 80 % de eficiencia.",
    instruction: "Mueve el control y observa cómo cambia la eficiencia.",
    correct: "400",
    explanation:
      "De los 500 W que entran, 400 W se aprovechan: 400 ÷ 500 = 0,8, es decir, 80 %.",
    application:
      "La energía restante se pierde principalmente como calor, ruido o vibración.",
  },
  {
    id: 9,
    title: "Diseña una transmisión",
    difficulty: "Avanzada",
    kind: "transmission",
    prompt: "Motor: 1200 rpm. Objetivo: 400 rpm.",
    instruction:
      "Toca dos engranajes en orden: primero el conductor y luego el conducido.",
    correct: "12→36",
    explanation:
      "El engranaje de 12 dientes mueve uno de 36: la salida gira a la tercera parte, 400 rpm.",
    application:
      "Se usa cuando una máquina necesita menos velocidad y más fuerza.",
  },
  {
    id: 10,
    title: "¡Salva la máquina!",
    difficulty: "Final",
    kind: "repair",
    prompt:
      "El motor gira, pero la banda patina, chirría y el transportador no mueve la carga.",
    instruction: "Aplica el diagnóstico y la acción segura correctos.",
    options: [
      "Aumentar la velocidad",
      "Tocar la banda para guiarla",
      "Desconectar y bloquear; revisar tensión, desgaste y alineación",
    ],
    correct: "Desconectar y bloquear; revisar tensión, desgaste y alineación",
    explanation:
      "Una banda que patina puede estar floja, gastada o desalineada. Primero hay que detener y bloquear la máquina.",
    application:
      "En un taller nadie debe tocar una transmisión en movimiento; primero se verifica que no tenga energía.",
  },
];

export const BASE_POINTS = [100, 100, 100, 140, 140, 140, 140, 190, 190, 250];

export function normalizeAnswer(value: string | number) {
  return String(value).trim();
}
export function isCorrect(levelId: number, answer: string | number) {
  const level = levels[levelId - 1];
  return Boolean(level) && normalizeAnswer(answer) === level.correct;
}
export function scoreAnswer(
  levelId: number,
  answer: string | number,
  elapsedSeconds: number,
) {
  if (!isCorrect(levelId, answer)) return 0;
  const base = BASE_POINTS[levelId - 1] ?? 0;
  const safeTime = Math.max(0, Math.min(120, Math.floor(elapsedSeconds)));
  const bonus = Math.max(0, 30 - Math.floor(safeTime / 3));
  return base + bonus;
}
export function totalScore(records: AnswerRecord[]) {
  const unique = new Map(records.map((r) => [r.levelId, r]));
  if (unique.size !== 10) return 0;
  return levels.reduce(
    (sum, l) =>
      sum +
      scoreAnswer(
        l.id,
        unique.get(l.id)?.answer ?? "",
        unique.get(l.id)?.elapsedSeconds ?? 120,
      ),
    0,
  );
}
export function cleanAlias(input: string) {
  return input.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 20);
}

