import { useEffect, useRef, useState } from "react";
import { LevelInteraction } from "./components/LevelInteraction";
import {
  levels,
  cleanAlias,
  isCorrect,
  scoreAnswer,
  type AnswerRecord,
  type RankRow,
} from "./lib/game";
import {
  adminRequest,
  getRanking,
  isDemo,
  setDemo,
  startRun,
  submitRun,
} from "./lib/data";

type Screen = "home" | "instructions" | "game" | "finish" | "ranking" | "admin";
const PROGRAM_URL = import.meta.env.VITE_PROGRAM_URL || "";
const ADMISSIONS_URL = import.meta.env.VITE_ADMISSIONS_URL || "";

function Logo() {
  return (
    <div className="brand">
      <div className="brand-mark">⚙</div>
      <div>
        <strong>DESAFÍO MECÁNICO</strong>
        <span>INGENIERÍA MECÁNICA · INCCA</span>
      </div>
    </div>
  );
}
function ModeBadge({ demo }: { demo: boolean }) {
  return (
    <div className={`mode-badge ${demo ? "demo" : ""}`}>
      {demo ? "MODO DEMOSTRACIÓN · DATOS LOCALES" : "RANKING EN LÍNEA"}
    </div>
  );
}

export default function App() {
  const path = location.pathname;
  const view = new URLSearchParams(location.search).get("view");
  const initial: Screen =
    path.endsWith("/ranking-display") || view === "ranking"
      ? "ranking"
      : path.endsWith("/admin") || view === "admin"
        ? "admin"
        : "home";
  const [screen, setScreen] = useState<Screen>(initial),
    [alias, setAlias] = useState(""),
    [demo, setDemoState] = useState(isDemo());
  const [sounds, setSounds] = useState(true),
    [reduced, setReduced] = useState(
      matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  const [idx, setIdx] = useState(0),
    [answer, setAnswer] = useState(""),
    [records, setRecords] = useState<AnswerRecord[]>([]);
  const [feedback, setFeedback] = useState<{
      correct: boolean;
      points: number;
    } | null>(null),
    [score, setScore] = useState(0),
    [token, setToken] = useState("");
  const [duration, setDuration] = useState(0),
    [position, setPosition] = useState<number | undefined>(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const gameStart = useRef(0),
    levelStart = useRef(0);
  useEffect(() => {
    const f = () => setDemoState(isDemo());
    addEventListener("incca-mode", f);
    return () => removeEventListener("incca-mode", f);
  }, []);
  function beep(ok = true) {
    if (!sounds) return;
    try {
      const c = new AudioContext(),
        o = c.createOscillator(),
        g = c.createGain();
      o.frequency.value = ok ? 720 : 230;
      g.gain.setValueAtTime(0.06, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.18);
      o.connect(g).connect(c.destination);
      o.start();
      o.stop(c.currentTime + 0.18);
    } catch {}
  }
  async function begin() {
    const safe = cleanAlias(alias);
    if (safe.length < 2) {
      setError("Escribe un alias de 2 a 20 caracteres.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const run = await startRun(safe);
      setAlias(safe);
      setToken(run.token);
      setDemoState(run.mode === "demo");
      setIdx(0);
      setAnswer("");
      setRecords([]);
      setScore(0);
      setFeedback(null);
      gameStart.current = Date.now();
      levelStart.current = Date.now();
      setScreen("game");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No fue posible iniciar.");
    } finally {
      setBusy(false);
    }
  }
  function check() {
    if (!answer || feedback) return;
    const elapsed = Math.max(
      1,
      Math.floor((Date.now() - levelStart.current) / 1000),
    );
    const record = { levelId: levels[idx].id, answer, elapsedSeconds: elapsed };
    const ok = isCorrect(record.levelId, answer);
    const points = scoreAnswer(record.levelId, answer, elapsed);
    setRecords((r) => [...r, record]);
    setScore((s) => s + points);
    setFeedback({ correct: ok, points });
    beep(ok);
  }
  async function next() {
    if (!feedback) return;
    if (idx < 9) {
      setIdx((i) => i + 1);
      setAnswer("");
      setFeedback(null);
      levelStart.current = Date.now();
      return;
    }
    const totalDuration = Math.max(
      1,
      Math.floor((Date.now() - gameStart.current) / 1000),
    );
    setDuration(totalDuration);
    setBusy(true);
    try {
      const result = await submitRun(
        alias,
        token,
        records,
        totalDuration,
        score,
      );
      setPosition(result.position);
      setDemoState(result.mode === "demo");
      setScreen("finish");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No se pudo registrar el resultado.",
      );
      setScreen("finish");
    } finally {
      setBusy(false);
    }
  }
  function restart() {
    setAlias("");
    setIdx(0);
    setAnswer("");
    setFeedback(null);
    setScore(0);
    setScreen("home");
  }
  const nav = (s: Screen) => {
    setError("");
    setScreen(s);
  };
  return (
    <div className="site-shell">
      <header>
        <Logo />
        <nav>
          <button onClick={() => nav("instructions")}>Cómo jugar</button>
          <button onClick={() => nav("ranking")}>Ranking</button>
          <button
            className="icon-btn"
            aria-label={sounds ? "Silenciar" : "Activar sonido"}
            onClick={() => setSounds((x) => !x)}
          >
            {sounds ? "🔊" : "🔇"}
          </button>
        </nav>
      </header>
      <ModeBadge demo={demo} />
      <main>
        {screen === "home" && (
          <Home
            alias={alias}
            setAlias={setAlias}
            begin={begin}
            busy={busy}
            error={error}
            nav={nav}
            reduced={reduced}
            setReduced={setReduced}
          />
        )}
        {screen === "instructions" && <Instructions nav={nav} />}
        {screen === "game" && (
          <Game
            idx={idx}
            answer={answer}
            setAnswer={setAnswer}
            feedback={feedback}
            score={score}
            check={check}
            next={next}
            reduced={reduced}
            busy={busy}
          />
        )}
        {screen === "finish" && (
          <Finish
            alias={alias}
            score={score}
            duration={duration}
            position={position}
            error={error}
            nav={nav}
            restart={restart}
          />
        )}
        {screen === "ranking" && (
          <Ranking
            nav={nav}
            projection={path.endsWith("/ranking-display") || view === "ranking"}
          />
        )}
        {screen === "admin" && (
          <Admin
            demo={demo}
            onDemo={(v) => {
              setDemo(v);
              setDemoState(v);
            }}
          />
        )}
      </main>
      <footer>
        <span>Universidad INCCA de Colombia · Corferias 2026</span>
        <button onClick={() => nav("admin")}>Acceso organizadores</button>
      </footer>
    </div>
  );
}

function Home({
  alias,
  setAlias,
  begin,
  busy,
  error,
  nav,
  reduced,
  setReduced,
}: {
  alias: string;
  setAlias: (v: string) => void;
  begin: () => void;
  busy: boolean;
  error: string;
  nav: (s: Screen) => void;
  reduced: boolean;
  setReduced: (v: boolean) => void;
}) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">CORFERIAS 2026 · EXPERIENCIA INTERACTIVA</p>
        <h1>
          ¿Tienes mente de <em>ingeniero?</em>
        </h1>
        <p className="lead">
          Pon a prueba tu lógica con mecanismos, fuerzas y energía. Diez
          misiones. Una máquina por salvar.
        </p>
        <div className="quick-stats">
          <span>
            <b>10</b> desafíos
          </span>
          <span>
            <b>4–6</b> minutos
          </span>
          <span>
            <b>1</b> gran misión
          </span>
        </div>
        <label className="alias-field">
          Elige tu alias
          <input
            value={alias}
            maxLength={20}
            autoComplete="off"
            placeholder="Ej. TorqueMaster"
            onChange={(e) => setAlias(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && begin()}
          />
          <small>Usa un alias, no datos personales.</small>
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className="actions">
          <button className="primary" onClick={begin} disabled={busy}>
            {busy ? "Preparando…" : "¡Comenzar desafío!"} <span>→</span>
          </button>
          <button className="secondary" onClick={() => nav("instructions")}>
            Ver instrucciones
          </button>
        </div>
        <label className="toggle">
          <input
            type="checkbox"
            checked={reduced}
            onChange={(e) => setReduced(e.target.checked)}
          />{" "}
          Reducir animaciones
        </label>
      </div>
      <div
        className={`hero-machine ${reduced ? "reduced" : ""}`}
        aria-hidden="true"
      >
        <div className="orbit"></div>
        <div className="big-gear">⚙</div>
        <div className="small-gear">⚙</div>
        <div className="core">
          <span>10</span>
          <small>NIVELES</small>
        </div>
        <div className="tech-label l1">TORQUE</div>
        <div className="tech-label l2">ENERGÍA</div>
        <div className="tech-label l3">INGENIO</div>
      </div>
    </section>
  );
}

function Instructions({ nav }: { nav: (s: Screen) => void }) {
  return (
    <section className="page">
      <p className="eyebrow">ANTES DE EMPEZAR</p>
      <h2>Cómo funciona el desafío</h2>
      <div className="instruction-grid">
        {[
          ["01", "Observa", "Lee la misión y explora el mecanismo."],
          ["02", "Decide", "Toca, desliza o conecta los elementos."],
          ["03", "Aprende", "Recibe una explicación, incluso si fallas."],
          ["04", "Avanza", "Todos continúan; nunca hay puntos negativos."],
        ].map((x) => (
          <article key={x[0]}>
            <b>{x[0]}</b>
            <h3>{x[1]}</h3>
            <p>{x[2]}</p>
          </article>
        ))}
      </div>
      <div className="info-strip">
        <span>🎯 La precisión vale más que la velocidad.</span>
        <span>🏆 Los empates se resuelven por menor tiempo.</span>
        <span>🔒 Solo guardamos alias, puntaje, duración y fecha.</span>
      </div>
      <button className="primary" onClick={() => nav("home")}>
        Entendido, ir al inicio
      </button>
    </section>
  );
}

function Game({
  idx,
  answer,
  setAnswer,
  feedback,
  score,
  check,
  next,
  reduced,
  busy,
}: {
  idx: number;
  answer: string;
  setAnswer: (v: string) => void;
  feedback: { correct: boolean; points: number } | null;
  score: number;
  check: () => void;
  next: () => void;
  reduced: boolean;
  busy: boolean;
}) {
  const level = levels[idx];
  return (
    <section className="game">
      <div className="game-hud">
        <div>
          <span>NIVEL {idx + 1} DE 10</span>
          <b>{level.title}</b>
        </div>
        <div className="score">★ {score.toLocaleString("es-CO")}</div>
      </div>
      <div className="progress">
        <i style={{ width: `${(idx + 1) * 10}%` }} />
      </div>
      <div className="mission">
        <div className="mission-head">
          <span className={`difficulty d${idx}`}>{level.difficulty}</span>
          <h2>{level.prompt}</h2>
          <p>{level.instruction}</p>
        </div>
        <LevelInteraction
          level={level}
          value={answer}
          onChange={setAnswer}
          disabled={Boolean(feedback)}
          reduced={reduced}
        />
        {feedback && (
          <div
            className={`feedback ${feedback.correct ? "ok" : "try"}`}
            role="status"
          >
            <div className="feedback-icon">{feedback.correct ? "✓" : "!"}</div>
            <div className="feedback-content">
              <strong>
                {feedback.correct
                ? `¡Muy bien! +${feedback.points} puntos`
                : "No era esa, pero seguimos aprendiendo."}
              </strong>
              <p className="correct-answer">
              <b>La respuesta correcta es:</b> {level.correct}
              </p>
              <p>
              <b>¿Por qué?</b> {level.explanation}
              </p>
              <p>
              <b>Ejemplo real:</b> {level.application}
              </p>
            </div>
          </div>
        )}
        <div className="game-actions">
          {!feedback ? (
            <button className="primary" disabled={!answer} onClick={check}>
              Comprobar respuesta
            </button>
          ) : (
            <button className="primary" disabled={busy} onClick={next}>
              {idx === 9 ? "Ver resultado final" : "Siguiente nivel"}{" "}
              <span>→</span>
            </button>
          )}
          <span>Los errores no restan puntos</span>
        </div>
      </div>
    </section>
  );
}

function Finish({
  alias,
  score,
  duration,
  position,
  error,
  nav,
  restart,
}: {
  alias: string;
  score: number;
  duration: number;
  position?: number;
  error: string;
  nav: (s: Screen) => void;
  restart: () => void;
}) {
  return (
    <section className="finish">
      <div className="final-gear">⚙</div>
      <p className="eyebrow">MISIÓN COMPLETADA</p>
      <h1>
        ¡Tu ingenio puede <em>transformar el mundo!</em>
      </h1>
      <p className="lead">
        En Ingeniería Mecánica de la Universidad INCCA de Colombia puedes
        desarrollar habilidades para diseñar, analizar y mejorar máquinas,
        sistemas mecánicos y procesos tecnológicos.
      </p>
      <div className="result-grid">
        <article>
          <span>PUNTAJE</span>
          <b>{score.toLocaleString("es-CO")}</b>
        </article>
        <article>
          <span>TIEMPO</span>
          <b>
            {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}
          </b>
        </article>
        <article>
          <span>POSICIÓN</span>
          <b>{position ? `#${position}` : "—"}</b>
        </article>
      </div>
      {error && (
        <p className="error">
          {error} Tu resultado permanece visible en este dispositivo.
        </p>
      )}
      <div className="actions center">
        <button className="primary" onClick={() => nav("ranking")}>
          Ver mi clasificación
        </button>
        <button className="secondary" onClick={restart}>
          Volver a jugar
        </button>
        {PROGRAM_URL && (
          <a
            className="secondary button"
            href={PROGRAM_URL}
            target="_blank"
            rel="noreferrer"
          >
            Conocer Ingeniería Mecánica
          </a>
        )}
        {ADMISSIONS_URL && (
          <a
            className="secondary button"
            href={ADMISSIONS_URL}
            target="_blank"
            rel="noreferrer"
          >
            Solicitar información
          </a>
        )}
      </div>
      {(!PROGRAM_URL || !ADMISSIONS_URL) && (
        <p className="config-note">
          Los enlaces institucionales se habilitan al configurar las variables
          de entorno verificadas.
        </p>
      )}
    </section>
  );
}

function Ranking({
  nav,
  projection,
}: {
  nav: (s: Screen) => void;
  projection: boolean;
}) {
  const [rows, setRows] = useState<RankRow[]>([]),
    [mode, setMode] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    let live = true;
    const load = () =>
      getRanking().then((r) => {
        if (live) {
          setRows(r.rows);
          setMode(r.mode);
          setLoading(false);
        }
      });
    load();
    const t = setInterval(load, 15000);
    return () => {
      live = false;
      clearInterval(t);
    };
  }, []);
  return (
    <section className={`page ranking-page ${projection ? "projection" : ""}`}>
      <p className="eyebrow">
        TABLA DE CAMPEONES · {mode === "demo" ? "DEMOSTRACIÓN" : "EN VIVO"}
      </p>
      <h2>Ranking mecánico</h2>
      <p>
        Mayor puntaje primero. En empate, gana el menor tiempo; luego, el
        registro más antiguo.
      </p>
      {loading ? (
        <div className="loader">Cargando clasificación…</div>
      ) : (
        <div className="rank-list">
          {rows.length ? (
            rows.map((r, i) => (
              <article
                key={`${r.alias}-${r.created_at}-${i}`}
                className={i < 3 ? "podium" : ""}
              >
                <b className="place">{i + 1}</b>
                <span className="rank-alias">{r.alias}</span>
                <strong>{r.score.toLocaleString("es-CO")} pts</strong>
                <small>{r.duration_seconds}s</small>
              </article>
            ))
          ) : (
            <div className="empty">
              Aún no hay participantes. ¡Sé el primero!
            </div>
          )}
        </div>
      )}
      {!projection && (
        <button className="secondary" onClick={() => nav("home")}>
          Volver al inicio
        </button>
      )}
      {projection && (
        <p className="auto-refresh">
          Actualización automática cada 15 segundos
        </p>
      )}
    </section>
  );
}

function Admin({
  demo,
  onDemo,
}: {
  demo: boolean;
  onDemo: (v: boolean) => void;
}) {
  const [token, setToken] = useState(
      sessionStorage.getItem("incca-admin") || "",
    ),
    [data, setData] = useState<any>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function run(action = "stats", id = "") {
    setBusy(true);
    setError("");
    try {
      sessionStorage.setItem("incca-admin", token);
      const r = await adminRequest(token, action, id);
      if (action === "export") {
        const blob = new Blob([r.csv], { type: "text/csv" }),
          a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "resultados-incca.csv";
        a.click();
        URL.revokeObjectURL(a.href);
      } else if (action === "moderate" || action === "reset") {
        setData(await adminRequest(token));
      } else setData(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Acceso denegado");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="page admin">
      <p className="eyebrow">PANEL ORGANIZADORES</p>
      <h2>Control de la experiencia</h2>
      {!data ? (
        <div className="login-box">
          <label>
            Token administrativo
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <button
            className="primary"
            disabled={!token || busy}
            onClick={() => run()}
          >
            {busy ? "Verificando…" : "Ingresar"}
          </button>
          {error && <p className="error">{error}</p>}
          <p>
            El token se configura en Vercel y solo se conserva durante esta
            sesión.
          </p>
        </div>
      ) : (
        <>
          <div className="admin-stats">
            <article>
              <span>Participantes</span>
              <b>{data.participants}</b>
            </article>
            <article>
              <span>Puntaje promedio</span>
              <b>{data.averageScore}</b>
            </article>
            <article>
              <span>Tiempo promedio</span>
              <b>{data.averageDuration}s</b>
            </article>
          </div>
          <h3>Rendimiento por nivel</h3>
          <div className="level-stats">
            {data.levels?.map((l: any) => (
              <div key={l.level_id}>
                <span>Nivel {l.level_id}</span>
                <i>
                  <b style={{ width: `${l.accuracy}%` }} />
                </i>
                <strong>{l.accuracy}%</strong>
              </div>
            ))}
          </div>
          <h3>Participantes recientes</h3>
          <div className="moderation-list">
            {data.recent?.map((r: any) => (
              <div key={r.id}>
                <span>{r.alias}</span>
                <b>{r.score} pts</b>
                <button
                  disabled={r.moderated || busy}
                  onClick={() => run("moderate", r.id)}
                >
                  {r.moderated ? "Oculto" : "Ocultar alias"}
                </button>
              </div>
            ))}
          </div>
          <div className="admin-actions">
            <button className="secondary" onClick={() => run("export")}>
              Exportar CSV
            </button>
            <label className="toggle">
              <input
                type="checkbox"
                checked={demo}
                onChange={(e) => onDemo(e.target.checked)}
              />{" "}
              Modo demostración en este dispositivo
            </label>
            <button
              className="danger"
              onClick={() => {
                if (
                  confirm(
                    "¿Reiniciar todo el ranking? Esta acción no se puede deshacer.",
                  )
                )
                  run("reset");
              }}
            >
              Reiniciar ranking
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </>
      )}
    </section>
  );
}

