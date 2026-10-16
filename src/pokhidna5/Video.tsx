import React from "react";
import { AbsoluteFill, Sequence, spring, useCurrentFrame } from "remotion";
import { Cut, EndCard, Iris, RedWipe, Sfx, Stage, Tag, ez } from "../brand/kit";
import { B, FONT, isDark, Tone } from "../brand/tokens";
import { COVER_F } from "../brand/cover";
import { ORDER, Id, WIN, P, A } from "./timeline";

/* ─── Епізод 5: Похідна складеної функції (16:9, без озвучки). ─── */
const SERIES_MATH = "МАТЕМАТИКА ПРОСТИМИ СЛОВАМИ";
const N_TOTAL = 11;

const TONE: Record<Id, Tone> = {
  hook: "paper", idea: "night", notation: "paper", rule: "night", steps: "paper", intuition: "blush",
  example: "paper", trig: "night", trig2: "paper", why: "night", mistake: "blush", check: "paper", recap: "night", cta: "paper",
};

const Scene: React.FC<{ id: Id; children?: React.ReactNode; arc?: number | false }> = ({ id, children, arc = false }) => (
  <Sequence from={WIN[id].s} durationInFrames={WIN[id].d}>
    <Stage tone={TONE[id]} dur={WIN[id].d} push={0.02} arc={arc} tag={false}>
      {children}
    </Stage>
    <Tag tone={TONE[id]} series={SERIES_MATH} />
    <LessonMark id={id} />
  </Sequence>
);

const LessonMark: React.FC<{ id: Id }> = ({ id }) => {
  const f = useCurrentFrame();
  const dark = isDark(TONE[id]);
  const p = ez(f, 0, 10, [0, 1]);
  if (id === "hook" || id === "cta") return null;
  return (
    <div style={{ position: "absolute", right: 96, top: 66, display: "flex", alignItems: "center", gap: 10, fontFamily: FONT.sans, fontWeight: 800, fontSize: 17, color: dark ? "rgba(255,255,255,.72)" : "rgba(0,0,0,.55)", opacity: p }}>
      <span style={{ padding: "4px 10px", borderRadius: 999, background: B.red, color: B.white, fontWeight: 900 }}>ПОХІДНА {5}/{N_TOTAL}</span>складена функція
    </div>
  );
};

/* ─── дрібні блоки ─── */
const Pop: React.FC<{ at: number; children?: React.ReactNode; y?: number; style?: React.CSSProperties }> = ({ at, children, y = 22, style }) => {
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
const Row: React.FC<{ at: number; children: React.ReactNode; dark?: boolean; size?: number; style?: React.CSSProperties }> = ({ at, children, dark, size = 40, style }) => {
  const f = useCurrentFrame();
  const p = ez(f, at, at + 9, [0, 1]);
  return <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: size, color: dark ? B.white : B.ink, opacity: p, transform: `translateX(${(1 - p) * -20}px)`, ...style }}>{children}</div>;
};
const Chip: React.FC<{ at: number; children: React.ReactNode; red?: boolean; dark?: boolean; size?: number; style?: React.CSSProperties }> = ({ at, children, red, dark, size = 22, style }) => (
  <Pop at={at} y={14} style={style}><span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 999, background: red ? B.red : dark ? "rgba(255,255,255,.10)" : B.white, color: red ? B.white : dark ? B.white : B.ink, border: dark && !red ? "1px solid rgba(255,255,255,.18)" : undefined, fontFamily: FONT.sans, fontWeight: 900, fontSize: size, whiteSpace: "nowrap", boxShadow: red || !dark ? "0 14px 26px -14px rgba(0,0,0,.45)" : undefined }}>{children}</span></Pop>
);
const Card: React.FC<{ at: number; x: number; y: number; w: number; h: number; dark?: boolean; children: React.ReactNode; style?: React.CSSProperties; y0?: number }> = ({ at, x, y, w, h, dark, children, style, y0 }) => (
  <Pop at={at} y={y0} style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 20, background: dark ? "#151519" : B.white, border: dark ? "1px solid rgba(255,255,255,.12)" : undefined, boxShadow: dark ? undefined : "0 26px 50px -26px rgba(0,0,0,.5)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 22, boxSizing: "border-box", ...style }}>{children}</Pop>
);

/* ─── 1. ХУК ─── */
const HookScene: React.FC = () => (
  <>
    <Pop at={P("hook", 0.05)} style={{ position: "absolute", left: 240, top: 150, width: 800, textAlign: "center", fontFamily: FONT.serif, fontStyle: "italic", fontSize: 30, color: B.gray }}>одна дія... всередині іншої</Pop>
    <Heading at={P("hook", 0.25)} x={140} y={250} w={1000} size={112} center><span style={{ color: B.ink }}>складена </span><span style={{ color: B.red }}>функція</span></Heading>
    <div style={{ position: "absolute", left: 140, top: 440, width: 1000, textAlign: "center" }}>
      <Chip at={P("hook", 0.62)} red size={26}>ланцюгове правило</Chip>
    </div>
    <div style={{ position: "absolute", left: 140, top: 520, width: 1000, textAlign: "center" }}>
      <Chip at={P("hook", 0.8)}>функція в функції</Chip>
    </div>
  </>
);

/* ─── 2. ІДЕЯ: матрьошка ─── */
const IdeaScene: React.FC = () => {
  const s = "idea";
  return (
    <>
      <Heading at={P(s, 0.05)} dark x={140} y={110} w={1000} size={50} center>функція <span style={{ color: B.red }}>в функції</span></Heading>
      <Pop at={P(s, 0.2)} style={{ position: "absolute", left: 440, top: 236, width: 420, height: 300, border: "3px solid rgba(255,255,255,.45)", borderRadius: 22 }} />
      <Pop at={P(s, 0.32)} style={{ position: "absolute", left: 486, top: 280, width: 328, height: 212, border: "3px solid rgba(255,255,255,.65)", borderRadius: 18 }} />
      <Pop at={P(s, 0.44)} style={{ position: "absolute", left: 532, top: 324, width: 236, height: 124, border: `3px solid ${B.red}`, borderRadius: 14, background: "rgba(227,32,43,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 40, color: B.white }}>g(x)</span>
      </Pop>
      <div style={{ position: "absolute", left: 900, top: 300, fontFamily: FONT.sans, fontWeight: 900, fontSize: 24, color: "rgba(255,255,255,.75)" }}>внутрішня</div>
      <div style={{ position: "absolute", left: 400, top: 552, width: 500, textAlign: "center", fontFamily: FONT.sans, fontWeight: 900, fontSize: 24, color: "rgba(255,255,255,.75)" }}>зовнішня f( … )</div>
      <div style={{ position: "absolute", left: 110, top: 300, display: "flex", flexDirection: "column", gap: 14 }}>
        <Chip at={P(s, 0.3)} dark>спочатку внутрішня дія</Chip>
        <Chip at={P(s, 0.5)} red>потім зовнішня</Chip>
        <Chip at={P(s, 0.7)} dark>результат першої → вхід другої</Chip>
      </div>
    </>
  );
};

/* ─── 3. ПОЗНАЧЕННЯ ─── */
const NotationScene: React.FC = () => {
  const s = "notation";
  return (
    <>
      <Heading at={P(s, 0.04)} x={110} y={104} w={1060} size={46} center>як це <span style={{ color: B.red }}>записують</span></Heading>
      <Pop at={P(s, 0.16)} style={{ position: "absolute", left: 110, top: 196, width: 1060, textAlign: "center", fontFamily: FONT.sans, fontWeight: 900, fontSize: 84, letterSpacing: "-0.04em", color: B.ink }}>
        y = f( <span style={{ color: B.red }}>g(x)</span> )
      </Pop>
      <Card at={P(s, 0.4)} x={150} y={330} w={460} h={180}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 26, color: B.gray }}>внутрішня</div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 52, color: B.red }}>g(x) = 2x + 1</div>
      </Card>
      <Card at={P(s, 0.56)} x={670} y={330} w={460} h={180}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 26, color: B.gray }}>зовнішня</div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 52, color: B.ink }}>f( … ) = ( … )⁵</div>
      </Card>
      <div style={{ position: "absolute", left: 110, top: 540, width: 1060, textAlign: "center" }}>
        <Chip at={P(s, 0.78)} red size={26}>разом: y = (2x + 1)⁵</Chip>
      </div>
    </>
  );
};

/* ─── 4. ПРАВИЛО ─── */
const RuleScene: React.FC = () => {
  const s = "rule";
  return (
    <>
      <Heading at={P(s, 0.05)} dark x={110} y={104} w={1060} size={46} center>ланцюгове <span style={{ color: B.red }}>правило</span></Heading>
      <Pop at={P(s, 0.2)} style={{ position: "absolute", left: 110, top: 220, width: 1060, textAlign: "center", fontFamily: FONT.sans, fontWeight: 900, fontSize: 68, letterSpacing: "-0.04em", color: B.white }}>
        f′(g(x)) <span style={{ color: B.red }}>·</span> g′(x)
      </Pop>
      <div style={{ position: "absolute", left: 110, top: 340, width: 1060, textAlign: "center", fontFamily: FONT.sans, fontWeight: 800, fontSize: 28, color: "rgba(255,255,255,.8)" }}>
        похідна <span style={{ color: B.red }}>зовнішньої</span> помножити на похідну <span style={{ color: B.red }}>внутрішньої</span>
      </div>
      <div style={{ position: "absolute", left: 110, top: 430, display: "flex", gap: 18, justifyContent: "center", width: 1060 }}>
        <Chip at={P(s, 0.5)} dark>спершу — зовнішній шар</Chip>
        <Chip at={P(s, 0.64)} red>потім — внутрішній</Chip>
      </div>
      <Pop at={P(s, 0.78)} style={{ position: "absolute", left: 110, top: 520, width: 1060, textAlign: "center", fontFamily: FONT.serif, fontStyle: "italic", fontSize: 26, color: "rgba(255,255,255,.6)" }}>як чистиш цибулину — шар за шаром</Pop>
    </>
  );
};

/* ─── 5. ТРИ КРОКИ ─── */
const StepsScene: React.FC = () => {
  const s = "steps";
  const steps: [string, string][] = [
    ["1", "виділи внутрішню g(x)"],
    ["2", "похідна зовнішньої"],
    ["3", "помнож на похідну внутрішньої"],
  ];
  return (
    <>
      <Heading at={P(s, 0.04)} x={110} y={120} w={1060} size={46} center>діємо у <span style={{ color: B.red }}>три кроки</span></Heading>
      {steps.map(([n, t], i) => (
        <Card key={n} at={P(s, 0.18 + i * 0.22)} x={150 + i * 380} y={300} w={320} h={240}>
          <div style={{ width: 56, height: 56, borderRadius: 56, background: B.red, color: B.white, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.sans, fontWeight: 900, fontSize: 30 }}>{n}</div>
          <div style={{ textAlign: "center", fontFamily: FONT.sans, fontWeight: 900, fontSize: 26, color: B.ink, lineHeight: 1.15 }}>{t}</div>
        </Card>
      ))}
    </>
  );
};

/* ─── 6. ЧОМУ МНОЖЕННЯ ─── */
const IntuitionScene: React.FC = () => {
  const s = "intuition";
  return (
    <>
      <Heading at={P(s, 0.05)} x={110} y={120} w={1060} size={46} center>а чому саме <span style={{ color: B.red }}>множення</span>?</Heading>
      <Cut src="assets/fl-gear.png" at={P(s, 0.24)} x={300} y={300} w={170} seed={1} />
      <Cut src="assets/fl-gear.png" at={P(s, 0.36)} x={760} y={330} w={120} seed={2} />
      <Pop at={P(s, 0.44)} style={{ position: "absolute", left: 560, top: 320, fontFamily: FONT.sans, fontWeight: 900, fontSize: 64, color: B.red }}>×</Pop>
      <div style={{ position: "absolute", left: 110, top: 540, width: 1060, textAlign: "center" }}>
        <Chip at={P(s, 0.6)} red size={24}>швидкості перемножуються</Chip>
      </div>
      <Pop at={P(s, 0.78)} style={{ position: "absolute", left: 110, top: 620, width: 1060, textAlign: "center", fontFamily: FONT.serif, fontStyle: "italic", fontSize: 26, color: B.gray }}>маленьке збільшення всередині → більше зовні</Pop>
    </>
  );
};

/* ─── 7. ПРИКЛАД (2x+1)⁵ ─── */
const ExampleScene: React.FC = () => {
  const s = "example";
  return (
    <>
      <Heading at={P(s, 0.03)} x={110} y={100} w={1060} size={44} center>приклад: y = <span style={{ color: B.red }}>(2x + 1)⁵</span></Heading>
      <div style={{ position: "absolute", left: 150, top: 214, display: "flex", flexDirection: "column", gap: 26 }}>
        <Row at={P(s, 0.12)} size={38}>зовнішня: ( … )⁵ <span style={{ color: B.gray }}>→</span> 5·(2x + 1)⁴</Row>
        <Row at={P(s, 0.32)} size={38}>внутрішня: (2x + 1)′ <span style={{ color: B.gray }}>=</span> 2</Row>
        <Row at={P(s, 0.52)} size={38}>перемножуємо: 5·(2x + 1)⁴ · 2</Row>
        <Row at={P(s, 0.7)} size={44}>f′(x) = <span style={{ color: B.red }}>10(2x + 1)⁴</span></Row>
      </div>
      <Cut src="assets/fl-abacus.png" at={P(s, 0.4)} x={1050} y={250} w={160} seed={3} />
    </>
  );
};

/* ─── 8. ПРИКЛАД sin(3x) ─── */
const TrigScene: React.FC = () => {
  const s = "trig";
  return (
    <>
      <Heading at={P(s, 0.04)} dark x={110} y={110} w={1060} size={44} center>ще приклад: y = sin(3x)</Heading>
      <div style={{ position: "absolute", left: 170, top: 240, display: "flex", flexDirection: "column", gap: 30 }}>
        <Row at={P(s, 0.18)} dark size={38}>зовнішня: sin <span style={{ color: "rgba(255,255,255,.55)" }}>→</span> cos(3x)</Row>
        <Row at={P(s, 0.36)} dark size={38}>внутрішня: (3x)′ = 3</Row>
        <Row at={P(s, 0.56)} dark size={44}>y′ = <span style={{ color: B.red }}>3·cos(3x)</span></Row>
      </div>
      <div style={{ position: "absolute", left: 110, top: 560, width: 1060, textAlign: "center" }}>
        <Chip at={P(s, 0.78)} dark size={22}>той самий ланцюг працює й тут</Chip>
      </div>
    </>
  );
};

/* ─── 9. ПРИКЛАД cos(x²) ─── */
const Trig2Scene: React.FC = () => {
  const s = "trig2";
  return (
    <>
      <Heading at={P(s, 0.04)} x={110} y={110} w={1060} size={44} center>і складніше: y = cos(x²)</Heading>
      <div style={{ position: "absolute", left: 170, top: 240, display: "flex", flexDirection: "column", gap: 30 }}>
        <Row at={P(s, 0.18)} size={38}>зовнішня: cos <span style={{ color: B.gray }}>→</span> −sin(x²)</Row>
        <Row at={P(s, 0.36)} size={38}>внутрішня: (x²)′ = 2x</Row>
        <Row at={P(s, 0.56)} size={44}>y′ = <span style={{ color: B.red }}>−2x·sin(x²)</span></Row>
      </div>
      <div style={{ position: "absolute", left: 110, top: 560, width: 1060, textAlign: "center" }}>
        <Chip at={P(s, 0.78)} size={22}>мінус — від похідної косинуса</Chip>
      </div>
    </>
  );
};

/* ─── 10. ДЕ ЦЕ В ЖИТТІ ─── */
const WhyScene: React.FC = () => {
  const s = "why";
  const items: [string, string][] = [
    ["погода", "температура ← час ← місце"],
    ["економіка", "ціна ← попит ← сезон"],
    ["фізика", "швидкість ← шлях ← час"],
  ];
  return (
    <>
      <Heading at={P(s, 0.05)} dark x={110} y={130} w={1060} size={46} center>де це <span style={{ color: B.red }}>в житті</span></Heading>
      {items.map(([t, d], i) => (
        <Card key={t} at={P(s, 0.22 + i * 0.2)} x={150 + i * 380} y={300} w={320} h={210} dark>
          <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 30, color: B.white }}>{t}</div>
          <div style={{ textAlign: "center", fontFamily: FONT.serif, fontStyle: "italic", fontSize: 21, color: "rgba(255,255,255,.65)", lineHeight: 1.3 }}>{d}</div>
        </Card>
      ))}
      <div style={{ position: "absolute", left: 110, top: 560, width: 1060, textAlign: "center" }}>
        <Chip at={P(s, 0.82)} red size={22}>величини вкладені одна в одну</Chip>
      </div>
    </>
  );
};

/* ─── 11. ПОМИЛКА ─── */
const MistakeScene: React.FC = () => {
  const s = "mistake";
  return (
    <>
      <Heading at={P(s, 0.04)} x={110} y={130} w={1060} size={46} center>найчастіша <span style={{ color: B.red }}>помилка</span></Heading>
      <Card at={P(s, 0.2)} x={150} y={288} w={470} h={200} style={{ border: "3px solid rgba(13,13,13,.14)" }}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 24, color: B.gray }}>✗ забули внутрішню</div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 46, color: B.gray, textDecoration: "line-through" }}>5(2x + 1)⁴</div>
      </Card>
      <Card at={P(s, 0.42)} x={660} y={288} w={470} h={200} style={{ border: `3px solid ${B.red}` }}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 24, color: B.red }}>✓ обидва шари</div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 46, color: B.ink }}>10(2x + 1)⁴</div>
      </Card>
      <div style={{ position: "absolute", left: 110, top: 540, width: 1060, textAlign: "center" }}>
        <Chip at={P(s, 0.66)} red size={24}>питай себе: чи взяв я обидва шари?</Chip>
      </div>
    </>
  );
};

/* ─── 12. САМОПЕРЕВІРКА ─── */
const CheckScene: React.FC = () => {
  const s = "check";
  return (
    <>
      <Heading at={P(s, 0.06)} x={110} y={150} w={1060} size={46} center>як <span style={{ color: B.red }}>перевірити</span> себе</Heading>
      <Pop at={P(s, 0.3)} style={{ position: "absolute", left: 110, top: 270, width: 1060, textAlign: "center", fontFamily: FONT.sans, fontWeight: 900, fontSize: 62, letterSpacing: "-0.04em", color: B.ink }}>
        скільки шарів — <span style={{ color: B.red }}>стільки множників</span>
      </Pop>
      <div style={{ position: "absolute", left: 110, top: 430, display: "flex", gap: 18, justifyContent: "center", width: 1060 }}>
        <Chip at={P(s, 0.52)}>зовнішній шар → множник 1</Chip>
        <Chip at={P(s, 0.68)} red>внутрішній шар → множник 2</Chip>
      </div>
    </>
  );
};

/* ─── 13. ПІДСУМОК ─── */
const RecapScene: React.FC = () => {
  const s = "recap";
  return (
    <>
      <Heading at={P(s, 0.05)} dark x={110} y={120} w={1060} size={46} center>підсумок</Heading>
      <div style={{ position: "absolute", left: 110, top: 240, width: 1060, textAlign: "center", display: "flex", flexDirection: "column", gap: 30 }}>
        <Row at={P(s, 0.2)} dark size={40} style={{ textAlign: "center" }}>складена функція = функція в функції</Row>
        <Row at={P(s, 0.42)} dark size={56} style={{ textAlign: "center" }}>f′(g(x)) <span style={{ color: B.red }}>·</span> g′(x)</Row>
        <Row at={P(s, 0.64)} dark size={32} style={{ textAlign: "center" }}>шар за шаром — від зовнішнього до внутрішнього</Row>
      </div>
    </>
  );
};

/* ─── звук ─── */
const Sounds: React.FC = () => (
  <>
    {ORDER.slice(1).map((id) => <Sfx key={id} k={isDark(TONE[id]) ? "k48" : "w03"} at={A(id)} vol={0.22} />)}
    <Sfx k="p28" at={A("notation", 0.4)} vol={0.2} />
    <Sfx k="d42" at={A("rule", 0.2)} vol={0.26} />
    {[0, 1, 2].map((i) => <Sfx key={i} k="p27" at={A("steps", 0.18 + i * 0.22)} vol={0.2} />)}
    {["example", "trig", "trig2"].map((id) => <Sfx key={id} k="d39" at={A(id as Id, 0.56)} vol={0.24} />)}
    <Sfx k="d40" at={A("cta", 0.2)} vol={0.28} />
  </>
);

export const Pk5Video: React.FC = () => (
  <AbsoluteFill style={{ background: B.paper }}>
    <Scene id="hook" arc={0}><HookScene /></Scene>
    <Scene id="idea" arc={1}><IdeaScene /></Scene>
    <Scene id="notation"><NotationScene /></Scene>
    <Scene id="rule"><RuleScene /></Scene>
    <Scene id="steps"><StepsScene /></Scene>
    <Scene id="intuition"><IntuitionScene /></Scene>
    <Scene id="example"><ExampleScene /></Scene>
    <Scene id="trig"><TrigScene /></Scene>
    <Scene id="trig2"><Trig2Scene /></Scene>
    <Scene id="why"><WhyScene /></Scene>
    <Scene id="mistake"><MistakeScene /></Scene>
    <Scene id="check"><CheckScene /></Scene>
    <Scene id="recap"><RecapScene /></Scene>
    <Scene id="cta" arc={0}><EndCard at={P("cta", 0.14)} line="наступний епізод — похідна добутку і частки" /></Scene>

    {ORDER.slice(1).map((id) => isDark(TONE[id]) ? <Iris key={id} at={WIN[id].s} x={900} y={330} /> : <RedWipe key={id} at={WIN[id].s} x={900} y={330} />)}
    <Sounds />
  </AbsoluteFill>
);

export const PK5_F = COVER_F + WIN.cta.e;
