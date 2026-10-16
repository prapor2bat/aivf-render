import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame } from "remotion";
import { Captions, Cut, EndCard, Iris, RedWipe, Sfx, Stage, Tag, ez, float } from "../brand/kit";
import { B, FONT, isDark, Tone } from "../brand/tokens";
import { COVER_F } from "../brand/cover";
import { ORDER, Id, T, WIN, LEAD_F, wf, af } from "./timeline";
import { Plot, Tangent, Dot, Seg, deriv, mapX, mapY, type Box } from "./plot";

/* ─── Епізод 1: Що таке похідна простими словами (16:9). ─── */
const SERIES_MATH = "МАТЕМАТИКА ПРОСТИМИ СЛОВАМИ";
const N_TOTAL = 11;

const TONE: Record<Id, Tone> = {
  hook: "paper", idea: "night", geometry: "paper", slope: "paper", limit: "night", mechanics: "paper", notation: "paper", rule: "night",
  example: "paper", graph: "night", meaning: "paper", misconception: "blush", why: "paper", nmt: "night", history: "paper", cta: "paper",
};

const Scene: React.FC<{ id: Id; children?: React.ReactNode; arc?: number | false; caps?: boolean }> = ({ id, children, arc = false, caps = true }) => (
  <Sequence from={WIN[id].s} durationInFrames={WIN[id].d}>
    <Stage tone={TONE[id]} dur={WIN[id].d} push={0.02} arc={arc} tag={false}>
      {children}
    </Stage>
    <Tag tone={TONE[id]} series={SERIES_MATH} />
    <LessonMark id={id} />
    {caps && <Captions items={T.captions(id)} tone={TONE[id]} top={566} size={44} />}
  </Sequence>
);

const LessonMark: React.FC<{ id: Id }> = ({ id }) => {
  const f = useCurrentFrame();
  const dark = isDark(TONE[id]);
  const p = ez(f, 0, 10, [0, 1]);
  if (id === "hook" || id === "cta") return null;
  return (
    <div style={{ position: "absolute", right: 96, top: 66, display: "flex", alignItems: "center", gap: 10, fontFamily: FONT.sans, fontWeight: 800, fontSize: 17, color: dark ? "rgba(255,255,255,.72)" : "rgba(0,0,0,.55)", opacity: p }}>
      <span style={{ padding: "4px 10px", borderRadius: 999, background: B.red, color: B.white, fontWeight: 900 }}>ПОХІДНА {1}/{N_TOTAL}</span>що це таке
    </div>
  );
};

/* ─── дрібні блоки ─── */
const Pop: React.FC<{ at: number; children: React.ReactNode; y?: number; style?: React.CSSProperties }> = ({ at, children, y = 22, style }) => {
  const f = useCurrentFrame();
  const p = spring({ frame: f - at, fps: 30, config: { damping: 13, stiffness: 170 } });
  if (f < at) return <div style={{ ...style, opacity: 0 }}>{children}</div>;
  return <div style={{ ...style, opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * y}px)` }}>{children}</div>;
};
const Heading: React.FC<{ at: number; children: React.ReactNode; dark?: boolean; size?: number; x?: number; y?: number; w?: number; center?: boolean }> = ({ at, children, dark, size = 46, x = 110, y = 130, w = 620, center }) => {
  const f = useCurrentFrame();
  const p = ez(f, at, at + 9, [0, 1]);
  return <div style={{ position: "absolute", left: x, top: y, width: w, fontFamily: FONT.sans, fontWeight: 900, fontSize: size, lineHeight: 1.0, letterSpacing: "-0.045em", color: dark ? B.white : B.ink, textAlign: center ? "center" : "left", opacity: p, filter: 1 - p > 0.004 ? `blur(${(1 - p) * 9}px)` : undefined, transform: `translateY(${(1 - p) * 18}px)` }}>{children}</div>;
};
const Chip: React.FC<{ at: number; children: React.ReactNode; red?: boolean; dark?: boolean; size?: number }> = ({ at, children, red, dark, size = 22 }) => (
  <Pop at={at} y={14}><span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 999, background: red ? B.red : dark ? "rgba(255,255,255,.10)" : B.white, color: red ? B.white : dark ? B.white : B.ink, border: dark && !red ? "1px solid rgba(255,255,255,.18)" : undefined, fontFamily: FONT.sans, fontWeight: 900, fontSize: size, whiteSpace: "nowrap", boxShadow: red || !dark ? "0 14px 26px -14px rgba(0,0,0,.45)" : undefined }}>{children}</span></Pop>
);
const Frac: React.FC<{ num: React.ReactNode; den: React.ReactNode; dark?: boolean; size?: number }> = ({ num, den, dark, size = 34 }) => (
  <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", verticalAlign: "middle", fontFamily: FONT.sans, fontWeight: 800, fontSize: size, color: dark ? B.white : B.ink, lineHeight: 1.1 }}>
    <span style={{ padding: "0 10px" }}>{num}</span>
    <span style={{ width: "100%", height: 3, background: dark ? "rgba(255,255,255,.7)" : B.ink, margin: "3px 0" }} />
    <span style={{ padding: "0 10px" }}>{den}</span>
  </span>
);

/* ─── 1. ХУК ─── */
const HookScene: React.FC = () => {
  const f = useCurrentFrame();
  const b: Box = { x: 130, y: 210, w: 430, h: 300, xmin: -2.6, xmax: 2.6, ymin: -1, ymax: 7 };
  const x0 = 1.4;
  return (
    <>
      <div style={{ position: "absolute", left: b.x - 20, top: b.y - 30, width: b.w + 40, height: b.h + 60, borderRadius: 22, background: B.white, boxShadow: "0 30px 60px -30px rgba(0,0,0,.45)" }} />
      <Plot b={b} f={(x) => x * x} at={wf("hook", "штрих")} />
      <Tangent b={b} f={(x) => x * x} x0={x0} at={wf("hook", "штрих") + 10} />
      <Dot b={b} X={x0} Y={x0 * x0} at={wf("hook", "штрих") + 16} label="точка" />
      <Heading at={wf("hook", "штрих")} x={640} y={190} w={560} size={120}>
        <span style={{ color: B.ink }}>похідна</span><span style={{ color: B.red }}>?</span>
      </Heading>
      <Pop at={wf("hook", "штрих") + 6} style={{ position: "absolute", left: 648, top: 330, fontFamily: FONT.serif, fontStyle: "italic", fontSize: 26, color: B.gray }}>отой самий штрих f′(x)</Pop>
      <div style={{ position: "absolute", left: 648, top: 400, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 14 }}>
        <Chip at={wf("hook", "зміни")} red>швидкість зміни</Chip>
        <Chip at={wf("hook", "прикладах")}>простий приклад</Chip>
      </div>
    </>
  );
};

/* ─── 2. ІДЕЯ: спідометр ─── */
const Gauge: React.FC<{ at: number; dur: number }> = ({ at, dur }) => {
  const f = useCurrentFrame();
  const v = interpolate(f, [at, at + dur], [0.18, 0.86], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cx = 320, cy = 400, R = 170;
  const a = -Math.PI * 0.82 + v * Math.PI * 0.64;
  const nx = cx + Math.cos(a) * (R - 26), ny = cy + Math.sin(a) * (R - 26);
  const ticks = [...Array(9)].map((_, i) => {
    const ta = -Math.PI * 0.82 + (i / 8) * Math.PI * 0.64;
    return { x1: cx + Math.cos(ta) * (R - 8), y1: cy + Math.sin(ta) * (R - 8), x2: cx + Math.cos(ta) * R, y2: cy + Math.sin(ta) * R };
  });
  return (
    <svg width={720} height={560} style={{ position: "absolute", left: 0, top: 120, pointerEvents: "none" }}>
      <path d={`M ${cx + Math.cos(-Math.PI * 0.82) * R} ${cy + Math.sin(-Math.PI * 0.82) * R} A ${R} ${R} 0 0 1 ${cx + Math.cos(-Math.PI * 0.18) * R} ${cy + Math.sin(-Math.PI * 0.18) * R}`} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth={16} strokeLinecap="round" />
      <path d={`M ${cx + Math.cos(-Math.PI * 0.82) * R} ${cy + Math.sin(-Math.PI * 0.82) * R} A ${R} ${R} 0 0 1 ${cx + Math.cos(a) * R} ${cy + Math.sin(a) * R}`} fill="none" stroke={B.red} strokeWidth={16} strokeLinecap="round" />
      {ticks.map((t, i) => <line key={i} {...t} stroke="rgba(255,255,255,.4)" strokeWidth={3} />)}
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#fff" strokeWidth={5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={12} fill="#fff" />
      <text x={cx} y={cy + 70} fill="#fff" fontFamily={FONT.sans} fontWeight={900} fontSize={54} textAnchor="middle">{Math.round(v * 160)}</text>
      <text x={cx} y={cy + 96} fill="rgba(255,255,255,.55)" fontFamily={FONT.sans} fontWeight={700} fontSize={18} textAnchor="middle">км/год прямо зараз</text>
    </svg>
  );
};
const IdeaScene: React.FC = () => (
  <>
    <Gauge at={wf("idea", "спідометр")} dur={70} />
    <Heading at={wf("idea", "уяви")} dark x={700} y={170} w={520} size={52}>середня чи<span style={{ color: B.red }}> миттєва</span>?</Heading>
    <div style={{ position: "absolute", left: 700, top: 300, display: "flex", flexDirection: "column", gap: 16 }}>
      <Chip at={wf("idea", "середню")} dark>середня — за всю дорогу</Chip>
      <Chip at={wf("idea", "миттєве")} red>миттєва — прямо зараз</Chip>
      <Chip at={wf("idea", "питання")} dark>наскільки швидко змінюється</Chip>
    </div>
  </>
);

/* ─── 3. ГЕОМЕТРІЯ: нахил прямої ─── */
const GeometryScene: React.FC = () => {
  const b: Box = { x: 150, y: 200, w: 470, h: 300, xmin: -1, xmax: 6, ymin: -1, ymax: 6 };
  const g = (x: number) => 0.6 * x + 1;
  const xa = 1, xb = 5;
  return (
    <>
      <Plot b={b} f={g} at={wf("geometry", "пряму")} />
      <Seg b={b} x1={xa} y1={g(xa)} x2={xb} y2={g(xa)} color="#2E7DFF" width={4} grow at={wf("geometry", "коефіцієнт")} />
      <Seg b={b} x1={xb} y1={g(xa)} x2={xb} y2={g(xb)} color={B.red} width={4} grow at={wf("geometry", "коефіцієнт") + 6} />
      <Dot b={b} X={xa} Y={g(xa)} at={wf("geometry", "пряму") + 8} color={B.ink} r={7} />
      <Dot b={b} X={xb} Y={g(xb)} at={wf("geometry", "пряму") + 8} color={B.ink} r={7} />
      <div style={{ position: "absolute", left: mapX(b, xb) - 96, top: mapY(b, g(xa)) + 14, fontFamily: FONT.sans, fontWeight: 900, fontSize: 22, color: "#2E7DFF" }}>Δx вправо</div>
      <div style={{ position: "absolute", left: mapX(b, xb) + 16, top: mapY(b, g(xb)) + 6, fontFamily: FONT.sans, fontWeight: 900, fontSize: 22, color: B.red }}>Δy вгору</div>
      <Heading at={wf("geometry", "пряму")} x={680} y={180} w={520} size={46}>у прямої нахил<span style={{ color: B.red }}> усюди однаковий</span></Heading>
      <Pop at={wf("geometry", "коефіцієнт")} style={{ position: "absolute", left: 690, top: 320, fontFamily: FONT.sans, fontWeight: 900, fontSize: 40, color: B.ink }}>k = <Frac num="Δy" den="Δx" /></Pop>
      <Chip at={wf("geometry", "кривої")} >в кривої нахил міняється</Chip>
    </>
  );
};

/* ─── 4. ДОТИЧНА ─── */
const SlopeScene: React.FC = () => {
  const b: Box = { x: 190, y: 190, w: 500, h: 320, xmin: -2.2, xmax: 2.6, ymin: -1, ymax: 7 };
  const f = (x: number) => 0.95 * x * x;
  const to = 1.7, at = wf("slope", "дотична");
  return (
    <>
      <Plot b={b} f={f} at={wf("slope", "нахил")} />
      <Tangent b={b} f={f} x0={to} at={at} />
      <Dot b={b} X={to} Y={f(to)} at={at + 20} label="нахил = похідна" />
      <Heading at={wf("slope", "нахил")} x={760} y={180} w={440} size={44}>проводимо<span style={{ color: B.red }}> дотичну</span></Heading>
      <Pop at={wf("slope", "торкається")} style={{ position: "absolute", left: 760, top: 300, width: 400, display: "flex", flexDirection: "column", gap: 14 }}>
        <Chip at={wf("slope", "торкається")} size={20}>торкається графіка в одній точці</Chip>
        <Chip at={wf("slope", "такий")} size={20}>має той самий нахил, що й крива</Chip>
      </Pop>
    </>
  );
};

/* ─── 5. ГРАНИЦЯ ─── */
const LimitScene: React.FC = () => {
  const f = useCurrentFrame();
  const b: Box = { x: 160, y: 190, w: 540, h: 330, xmin: -0.2, xmax: 3.2, ymin: -0.5, ymax: 9 };
  const fn = (x: number) => x * x;
  const at = wf("limit", "зсуваємо");
  const d = interpolate(f, [at, at + 70], [1.7, 0.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x0 = 1, x1 = Math.max(1.02, x0 + d);
  const k = (fn(x1) - fn(x0)) / (x1 - x0);
  const g = (x: number) => fn(x0) + k * (x - x0);
  const p = ez(f, wf("limit", "границя"), wf("limit", "границя") + 10, [0, 1]);
  return (
    <>
      <Plot b={b} f={fn} at={wf("limit", "точки")} dark />
      <Seg b={b} x1={b.xmin} y1={g(b.xmin)} x2={b.xmax} y2={g(b.xmax)} color={p > 0.5 ? B.red : "#4FA3FF"} dash="10 8" />
      <Dot b={b} X={x0} Y={fn(x0)} at={wf("limit", "точки") + 6} dark />
      <Dot b={b} X={x1} Y={fn(x1)} at={wf("limit", "точки") + 6} color="#4FA3FF" dark />
      <div style={{ position: "absolute", left: mapX(b, x1) + 12, top: mapY(b, fn(x1)) - 20, fontFamily: FONT.sans, fontWeight: 900, fontSize: 20, color: "#4FA3FF" }}>друга точка</div>
      <Heading at={wf("limit", "нахил")} dark x={740} y={170} w={460} size={44}>нахил <span style={{ color: B.red }}>точно</span></Heading>
      <div style={{ position: "absolute", left: 740, top: 280, display: "flex", flexDirection: "column", gap: 14 }}>
        <Chip at={wf("limit", "точки")} dark>дві точки → січна</Chip>
        <Chip at={wf("limit", "нуля")} dark>Δx → 0</Chip>
      </div>
      <Pop at={wf("limit", "границя")} style={{ position: "absolute", left: 740, top: 430, fontFamily: FONT.sans, fontWeight: 900, fontSize: 64, color: B.red, opacity: p }}>→ 2 = границя</Pop>
    </>
  );
};

/* ─── 6. ФІЗИКА ─── */
const MechanicsScene: React.FC = () => {
  const b: Box = { x: 160, y: 200, w: 470, h: 300, xmin: -0.1, xmax: 3.2, ymin: -0.5, ymax: 10 };
  const s = (t: number) => t * t;
  return (
    <>
      <Plot b={b} f={s} at={wf("mechanics", "фізики")} />
      <Seg b={b} x1={1} y1={s(1)} x2={2} y2={s(1)} color="#2E7DFF" width={3} dash="7 6" />
      <Seg b={b} x1={2} y1={s(1)} x2={2} y2={s(2)} color="#2E7DFF" width={3} dash="7 6" />
      <Dot b={b} X={1} Y={s(1)} at={wf("mechanics", "шлях") + 6} color={B.ink} r={7} />
      <Dot b={b} X={2} Y={s(2)} at={wf("mechanics", "шлях") + 6} color={B.ink} r={7} />
      <div style={{ position: "absolute", left: mapX(b, 2) + 16, top: mapY(b, s(2)) + 4, fontFamily: FONT.sans, fontWeight: 900, fontSize: 20, color: "#2E7DFF" }}>Δt</div>
      <Heading at={wf("mechanics", "фізики")} x={680} y={180} w={520} size={44}>шлях за часом = <span style={{ color: B.red }}>швидкість</span></Heading>
      <div style={{ position: "absolute", left: 680, top: 300, display: "flex", flexDirection: "column", gap: 14 }}>
        <Chip at={wf("mechanics", "середня")} >середня: шлях / час</Chip>
        <Chip at={wf("mechanics", "миттєву")} red>миттєва: нескінченно малий Δt</Chip>
        <Chip at={wf("mechanics", "прискорення")} >похідна швидкості = прискорення</Chip>
      </div>
      <Cut src="assets/fl-stopwatch.png" at={wf("mechanics", "малий")} x={1110} y={470} w={96} seed={1} />
    </>
  );
};

/* ─── 7. ПОЗНАЧЕННЯ ─── */
const NotationScene: React.FC = () => {
  const cards = [
    { t: "f′(x)", s: "штрих", at: wf("notation", "штрих") },
    { t: "dy/dx", s: "Лейбніц", at: wf("notation", "ігрек") },
    { t: "′", s: "просто штрих", at: wf("notation", "просто") },
  ];
  return (
    <>
      <Heading at={wf("notation", "позначень")} x={110} y={140} w={1060} size={46} center>три записи — <span style={{ color: B.red }}>одне значення</span></Heading>
      {cards.map((c, i) => (
        <Pop key={c.t} at={c.at} style={{ position: "absolute", left: 150 + i * 340, top: 260, width: 300, height: 200, borderRadius: 20, background: B.white, boxShadow: "0 26px 50px -26px rgba(0,0,0,.5)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 66, color: B.ink, letterSpacing: "-0.04em" }}>{c.t}</div>
          <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontSize: 22, color: B.gray }}>{c.s}</div>
        </Pop>
      ))}
      <div style={{ position: "absolute", left: 110, top: 500, width: 1060, textAlign: "center" }}>
        <Chip at={wf("notation", "точці")} red>усе це — швидкість зміни функції в точці</Chip>
      </div>
    </>
  );
};

/* ─── 8. ПРАВИЛА ─── */
const RuleScene: React.FC = () => {
  const rows: [string, string, number][] = [
    ["сталий множник", "(c·f)′ = c·f′", wf("rule", "множник")],
    ["сума", "(f + g)′ = f′ + g′", wf("rule", "доданки")],
  ];
  const tbl: [string, string, number][] = [
    ["x²", "2x", wf("rule", "формулами")],
    ["x", "1", wf("rule", "формулами") + 8],
    ["c", "0", wf("rule", "формулами") + 16],
  ];
  return (
    <>
      <Heading at={wf("rule", "запамятай")} dark x={110} y={140} w={700} size={46}>у похідної є <span style={{ color: B.red }}>правила</span></Heading>
      <Pop at={wf("rule", "правила")} style={{ position: "absolute", left: 110, top: 240, width: 620 }}>
        <div style={{ background: "#151519", border: "1px solid rgba(255,255,255,.1)", borderRadius: 18, padding: 24, fontFamily: FONT.sans }}>
          {rows.map(([label, eq, at]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,.08)", opacity: ez(useCurrentFrame(), at, at + 8, [0, 1]) }}>
              <span style={{ color: "rgba(255,255,255,.6)", fontWeight: 700, fontSize: 20 }}>{label}</span>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 30 }}>{eq}</span>
            </div>
          ))}
        </div>
      </Pop>
      <div style={{ position: "absolute", left: 780, top: 240, width: 390 }}>
        <Chip at={wf("rule", "формулами")} dark>готова таблиця</Chip>
        <div style={{ marginTop: 16, fontFamily: FONT.sans }}>
          {tbl.map(([a, bb, at]) => (
            <div key={a} style={{ display: "flex", justifyContent: "space-between", padding: "10px 4px", fontSize: 34, fontWeight: 900, color: "#fff", opacity: ez(useCurrentFrame(), at, at + 8, [0, 1]) }}>
              <span>{a}</span><span style={{ color: B.red }}>→ {bb}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

/* ─── 9. ПРИКЛАД x² ─── */
const ExampleScene: React.FC = () => {
  const f = useCurrentFrame();
  const steps: [React.ReactNode, number][] = [
    [<span key="1">f(x) = x²</span>, wf("example", "квадраті")],
    [<span key="2" style={{ display: "inline-flex", alignItems: "center" }}>f′(x) = <Frac num="(x + h)² − x²" den="h" /></span>, wf("example", "приріст") + 6],
    [<span key="3" style={{ display: "inline-flex", alignItems: "center" }}>= <Frac num="2x·h + h²" den="h" /> = 2x + h</span>, wf("example", "обчислюємо") + 6],
    [<span key="4">коли h → 0 &nbsp; ⟹ &nbsp; f′(x) = <span style={{ color: B.red }}>2x</span></span>, wf("example", "залишається")],
  ];
  return (
    <>
      <Heading at={wf("example", "найпростіший")} x={110} y={130} w={900} size={42}>найпростіший приклад: <span style={{ color: B.red }}>x²</span></Heading>
      <div style={{ position: "absolute", left: 150, top: 230, display: "flex", flexDirection: "column", gap: 22 }}>
        {steps.map(([node, at], i) => {
          const p = ez(f, at, at + 9, [0, 1]);
          return <div key={i} style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 40, color: B.ink, opacity: p, transform: `translateX(${(1 - p) * -20}px)` }}>{node}</div>;
        })}
      </div>
      <Cut src="assets/fl-abacus.png" at={wf("example", "обчислюємо")} x={1080} y={430} w={150} seed={3} />
    </>
  );
};

/* ─── 10. ГРАФІК ПАРИ ─── */
const GraphScene: React.FC = () => {
  const bl: Box = { x: 120, y: 210, w: 420, h: 280, xmin: -2.2, xmax: 2.2, ymin: -1, ymax: 5.2 };
  const br: Box = { x: 720, y: 210, w: 420, h: 280, xmin: -2.2, xmax: 2.2, ymin: -3.2, ymax: 3.2 };
  const f = (x: number) => x * x;
  return (
    <>
      <Heading at={wf("graph", "графік")} dark x={110} y={112} w={900} size={44}>графік похідної поруч із функцією</Heading>
      <Plot b={bl} f={f} at={wf("graph", "графік")} dark />
      <Plot b={br} f={(x) => 2 * x} at={wf("graph", "додатна")} dark color={B.red} />
      <div style={{ position: "absolute", left: bl.x, top: bl.y - 40, fontFamily: FONT.sans, fontWeight: 900, fontSize: 22, color: "rgba(255,255,255,.75)" }}>f(x) = x²</div>
      <div style={{ position: "absolute", left: br.x, top: br.y - 40, fontFamily: FONT.sans, fontWeight: 900, fontSize: 22, color: B.red }}>f′(x) = 2x</div>
      <Dot b={bl} X={1.6} Y={f(1.6)} at={wf("graph", "росте") + 4} color="#4FA3FF" dark />
      <Dot b={br} X={1.6} Y={3.2} at={wf("graph", "додатна") + 8} color="#4FA3FF" dark />
      <div style={{ position: "absolute", left: br.x + 300, top: br.y + 30, fontFamily: FONT.sans, fontWeight: 800, fontSize: 20, color: "#4FA3FF" }}>росте → f′ &gt; 0</div>
      <div style={{ position: "absolute", left: br.x + 40, top: br.y + 150, fontFamily: FONT.sans, fontWeight: 800, fontSize: 20, color: B.red }}>f′ = 0 на вершині</div>
    </>
  );
};

/* ─── 11. ЕКСТРЕМУМ ─── */
const MeaningScene: React.FC = () => {
  const b: Box = { x: 150, y: 200, w: 470, h: 300, xmin: -2.2, xmax: 2.2, ymin: -1, ymax: 5.2 };
  const f = (x: number) => x * x;
  return (
    <>
      <Plot b={b} f={f} at={wf("meaning", "показує")} />
      <Tangent b={b} f={f} x0={0} at={wf("meaning", "нулю")} color="#2E7DFF" />
      <Dot b={b} X={0} Y={0} at={wf("meaning", "нулю") + 8} label="f′ = 0 → мінімум" color="#2E7DFF" />
      <Heading at={wf("meaning", "показує")} x={680} y={170} w={520} size={44}>де похідна <span style={{ color: B.red }}>нуль</span> — там екстремум</Heading>
      <div style={{ position: "absolute", left: 690, top: 300, display: "flex", flexDirection: "column", gap: 14 }}>
        <Chip at={wf("meaning", "росте")} >росте — похідна додатна</Chip>
        <Chip at={wf("meaning", "спадає")} >спадає — похідна відʼємна</Chip>
        <Chip at={wf("meaning", "максимум")} red>максимум або мінімум</Chip>
      </div>
    </>
  );
};

/* ─── 12. ПОМИЛКА ─── */
const MiniPlot: React.FC<{ b: Box; f: (x: number) => number; at: number; label: string; color?: string }> = ({ b, f, at, label, color }) => (
  <>
    <Plot b={b} f={f} at={at} color={color} />
    <div style={{ position: "absolute", left: b.x, top: b.y + b.h + 12, width: b.w, textAlign: "center", fontFamily: FONT.sans, fontWeight: 800, fontSize: 20, color: B.ink }}>{label}</div>
  </>
);
const MisconceptionScene: React.FC = () => {
  const bl: Box = { x: 150, y: 250, w: 380, h: 220, xmin: -1, xmax: 5, ymin: -1, ymax: 9 };
  const br: Box = { x: 740, y: 250, w: 380, h: 220, xmin: -1, xmax: 5, ymin: -1, ymax: 9 };
  return (
    <>
      <Heading at={wf("misconception", "помилка")} x={110} y={140} w={1060} size={46} center>величина ≠ <span style={{ color: B.red }}>швидкість зміни</span></Heading>
      <MiniPlot b={bl} f={(x) => Math.min(8, 0.2 * x + 6.5)} at={wf("misconception", "показує")} label="велика — але майже не змінюється" color={B.ink} />
      <MiniPlot b={br} f={(x) => Math.min(8.4, 1.7 * x + 0.6)} at={wf("misconception", "показує") + 8} label="маленька — але змінюється швидко" color={B.red} />
      <div style={{ position: "absolute", left: 110, top: 520, width: 1060, textAlign: "center" }}>
        <Chip at={wf("misconception", "величину")} size={22}>питай: міняється чи сама величина?</Chip>
      </div>
    </>
  );
};

/* ─── 13. ДЕ ЦЕ В ЖИТТІ ─── */
const WhyScene: React.FC = () => {
  const items = [
    { icon: "assets/fl-gear.png", t: "інженер", s: "як змінюється напруга", at: wf("why", "інженер") },
    { icon: "assets/fl-chart_increasing.png", t: "економіст", s: "як зростає прибуток", at: wf("why", "економіст") },
    { icon: "assets/fl-laptop.png", t: "програміст", s: "як швидко виконується код", at: wf("why", "програміст") },
  ];
  return (
    <>
      <Heading at={wf("why", "житті")} x={110} y={140} w={1060} size={46} center>де це <span style={{ color: B.red }}>в житті</span></Heading>
      {items.map((it, i) => (
        <Pop key={it.t} at={it.at} style={{ position: "absolute", left: 140 + i * 330, top: 260, width: 300, height: 220, borderRadius: 20, background: B.white, boxShadow: "0 26px 50px -26px rgba(0,0,0,.5)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <Cut src={it.icon} at={it.at} x={140 + i * 330 + 150} y={330} w={70} seed={i} />
          <div style={{ position: "absolute", top: 120, fontWeight: 900, fontSize: 28, fontFamily: FONT.sans, color: B.ink }}>{it.t}</div>
          <div style={{ position: "absolute", bottom: 22, width: 250, textAlign: "center", fontFamily: FONT.serif, fontStyle: "italic", fontSize: 20, color: B.gray }}>{it.s}</div>
        </Pop>
      ))}
    </>
  );
};

/* ─── 14. ВСТУПНІ ТЕСТИ ─── */
const NmtScene: React.FC = () => {
  const items: [string, number][] = [
    ["рівняння дотичної", wf("nmt", "дотичну")],
    ["дослідження на екстремуми", wf("nmt", "екстремуми")],
    ["швидкість зміни величини", wf("nmt", "швидкість")],
  ];
  return (
    <>
      <Heading at={wf("nmt", "речі")} dark x={110} y={140} w={1060} size={46} center>у вступних тестах — <span style={{ color: B.red }}>постійно</span></Heading>
      {items.map(([t, at], i) => (
        <Pop key={t} at={at} style={{ position: "absolute", left: 150 + i * 330, top: 280, width: 300 }}>
          <div style={{ background: "#151519", border: "1px solid rgba(255,255,255,.12)", borderRadius: 18, padding: "26px 20px", textAlign: "center", fontFamily: FONT.sans, fontWeight: 900, fontSize: 24, color: "#fff", minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ width: 34, height: 34, borderRadius: 34, background: B.red, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", marginRight: 12, flex: "none" }}>{i + 1}</span>{t}</div>
        </Pop>
      ))}
      <div style={{ position: "absolute", left: 110, top: 500, width: 1060, textAlign: "center" }}>
        <Chip at={wf("nmt", "бали")} red>це не теорія — це реальні бали</Chip>
      </div>
    </>
  );
};

/* ─── 15. ІСТОРІЯ ─── */
const HistoryScene: React.FC = () => (
  <>
    <Heading at={wf("history", "ідею")} x={110} y={140} w={1060} size={46} center>дві дороги — <span style={{ color: B.red }}>одна ідея</span></Heading>
    <Pop at={wf("history", "ньютон")} style={{ position: "absolute", left: 150, top: 260, width: 360, height: 220, borderRadius: 20, background: B.white, boxShadow: "0 26px 50px -26px rgba(0,0,0,.5)", padding: 24, boxSizing: "border-box" }}>
      <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 40, color: B.ink }}>Ньютон</div>
      <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontSize: 22, color: B.gray, marginTop: 8 }}>дивився на рух тіл</div>
      <div style={{ position: "absolute", left: 24, bottom: 20, fontWeight: 900, fontSize: 22, color: B.red }}>≈ 1665</div>
    </Pop>
    <Pop at={wf("history", "лейбніц")} style={{ position: "absolute", left: 770, top: 260, width: 360, height: 220, borderRadius: 20, background: B.white, boxShadow: "0 26px 50px -26px rgba(0,0,0,.5)", padding: 24, boxSizing: "border-box" }}>
      <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 40, color: B.ink }}>Лейбніц</div>
      <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontSize: 22, color: B.gray, marginTop: 8 }}>дивився на графік</div>
      <div style={{ position: "absolute", left: 24, bottom: 20, fontWeight: 900, fontSize: 22, color: B.red }}>≈ 1684</div>
    </Pop>
    <Pop at={wf("history", "одного")} style={{ position: "absolute", left: 540, top: 350, width: 200, textAlign: "center", fontFamily: FONT.sans, fontWeight: 900, fontSize: 40, color: B.gray }}>=</Pop>
  </>
);

/* ─── звук ─── */
const Sounds: React.FC = () => (
  <>
    <Sfx k="i18" at={af("hook", "штрих")} vol={0.4} />
    {ORDER.slice(1).map((id) => <Sfx key={id} k={isDark(TONE[id]) ? "k48" : "w03"} at={WIN[id].s} vol={0.24} />)}
    <Sfx k="d44" at={af("idea", "миттєве")} vol={0.3} />
    <Sfx k="w08" at={af("geometry", "коефіцієнт")} vol={0.2} />
    <Sfx k="p27" at={af("geometry", "коефіцієнт") + 6} vol={0.18} />
    <Sfx k="w07" at={af("slope", "дотична")} vol={0.2} />
    <Sfx k="p30" at={af("limit", "зсуваємо")} vol={0.16} />
    <Sfx k="d42" at={af("limit", "границя")} vol={0.26} />
    {["штрих", "ігрек", "просто"].map((k) => <Sfx key={k} k="p28" at={af("notation", k)} vol={0.24} />)}
    {["множник", "доданки", "формулами"].map((k) => <Sfx key={k} k="w08" at={af("rule", k)} vol={0.18} />)}
    {["приріст", "обчислюємо", "залишається"].map((k) => <Sfx key={k} k="c24" at={af("example", k)} vol={0.16} />)}
    <Sfx k="d39" at={af("example", "залишається") + 8} vol={0.24} />
    <Sfx k="p28" at={af("graph", "додатна")} vol={0.24} />
    <Sfx k="d39" at={af("meaning", "нулю")} vol={0.24} />
    {["інженер", "економіст", "програміст"].map((k) => <Sfx key={k} k="p27" at={af("why", k)} vol={0.2} />)}
    {["дотичну", "екстремуми", "швидкість"].map((k) => <Sfx key={k} k="p28" at={af("nmt", k)} vol={0.22} />)}
    {["ньютон", "лейбніц"].map((k) => <Sfx key={k} k="p28" at={af("history", k)} vol={0.24} />)}
    <Sfx k="d42" at={af("cta", "збережи")} vol={0.22} /><Sfx k="d40" at={af("cta", "підпишись")} vol={0.3} />
  </>
);

export const Pk1Video: React.FC = () => (
  <AbsoluteFill style={{ background: B.paper }}>
    <Scene id="hook" arc={0}><HookScene /></Scene>
    <Scene id="idea" arc={1}><IdeaScene /></Scene>
    <Scene id="geometry"><GeometryScene /></Scene>
    <Scene id="slope"><SlopeScene /></Scene>
    <Scene id="limit"><LimitScene /></Scene>
    <Scene id="mechanics"><MechanicsScene /></Scene>
    <Scene id="notation"><NotationScene /></Scene>
    <Scene id="rule"><RuleScene /></Scene>
    <Scene id="example"><ExampleScene /></Scene>
    <Scene id="graph"><GraphScene /></Scene>
    <Scene id="meaning"><MeaningScene /></Scene>
    <Scene id="misconception"><MisconceptionScene /></Scene>
    <Scene id="why"><WhyScene /></Scene>
    <Scene id="nmt"><NmtScene /></Scene>
    <Scene id="history"><HistoryScene /></Scene>
    <Scene id="cta" caps={false} arc={0}><EndCard at={LEAD_F} line="наступний епізод — похідна складеної функції" /></Scene>

    {ORDER.slice(1).map((id) => isDark(TONE[id]) ? <Iris key={id} at={WIN[id].s} x={900} y={330} /> : <RedWipe key={id} at={WIN[id].s} x={900} y={330} />)}

    {ORDER.map((id) => <Sequence key={id} from={WIN[id].s + LEAD_F} layout="none"><Audio src={staticFile(`audio03/${id}.mp3`)} /></Sequence>)}
    <Sounds />
  </AbsoluteFill>
);

export const PK1_F = COVER_F + T.TOTAL_F;
