import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { measureText } from "@remotion/layout-utils";
import { B, FONT } from "../brand/tokens";
import { Captions, EndCard, RedWipe, Tag } from "../brand/kit";
import { makeTimeline } from "../brand/timeline";
import { Badge } from "../news/overlays";
import META from "./audio_meta.json";
import PLAN from "./images-plan.json";
import {
  ArcTrail,
  Contrail,
  DriftClouds,
  FlyingBirds,
  Glow,
  HeatWaves,
  Motes,
  Propeller,
  Sparks,
  WindLines,
} from "./motion";

/* ─────────────────────────────────────────────────────────────────────────────
   Режим «Генерація» (проєкт 018 «Як людство навчилося літати»):
   AI-ілюстрації + ШАР РУХУ В КАДРІ на кожній сцені (MotionLayer): хмари пливуть,
   частинки летять, траєкторії малюються по дузі, пропелер крутиться, куля
   підіймається з тепловими хвилями, крила махають, іскри скачуть, контрейл
   тягнеться. Ken Burns лишається під рухом як база. Кросфейд, спалені
   субтитри, бейджі років, обкладинка 8 кадрів, фінальна картка.
   Озвучка: studio/public/flight/<id>.mp3 (Gemini, Charon).
   16:9, 30 fps, база 1280×720 (здача --scale=1.5 → 1080p).
   ───────────────────────────────────────────────────────────────────────────── */

const FPS = 30;
const AUDIO_DIR = "flight";     // studio/public/flight/<id>.mp3
const IMG_DIR = "flight/img";   // studio/public/flight/img/<shot>.jpg
const FADE = 12;                // кросфейд, кадрів
const TAIL = 120;               // хвіст під фінальну картку
const CAPS_TOP = 872;

const S = {
  channel: "Ron BaBa TV",
  series: "Цікаві факти",
  cta: ["Підпи", "шись"] as [string, string],
  end: "історії, які вражають",
};
const ORDER = (META as any).voices.map((v: any) => v.id) as string[];

const KEYS: Partial<Record<string, string[]>> = {
  hook: ["птахам", "літати"],
  s1: ["Ікар", "гординя"],
  s1b: ["Леонардо", "розумом"],
  s2: ["куля", "Парижем"],
  s2b: ["небо", "засіб"],
  s3: ["Лілієнталь", "керований"],
  s3b: ["зошити", "впертість"],
  s4: ["керування", "падінь"],
  s5: ["грудня", "Місяць"],
  s5b: ["дванадцять", "відірватись"],
  s6: ["гонка", "звуку"],
  s7: ["Реактивний", "струмінь"],
  s7b: ["реактивний", "космос"],
  s8: ["ланцюг", "швидкість"],
  s9: ["літаємо", "кілометрів"],
  s10: ["неможливе", "космосу"],
  s11: ["мрію", "спробу"],
  cta: ["підпишіться", "відео"],
};
const T = makeTimeline(META as any, ORDER, { fps: FPS, keys: KEYS });
const LAST = ORDER[ORDER.length - 1];
const END_AT = T.WIN[LAST].e;

type PlanShot = { id: string; line: string; prompt: string };
const BY_LINE = new Map<string, string[]>();
for (const sh of (PLAN as any).shots as PlanShot[]) {
  const list = BY_LINE.get(sh.line) ?? [];
  list.push(`${sh.id}.jpg`);
  BY_LINE.set(sh.line, list);
}

type Slide = { src: string; line: string; a: number; b: number };
const SLIDES: Slide[] = [];
for (const id of ORDER) {
  const imgs = BY_LINE.get(id) ?? [];
  const w = T.WIN[id];
  const n = Math.max(1, imgs.length);
  for (let i = 0; i < n; i++) {
    SLIDES.push({
      src: imgs[i] ?? (imgs[imgs.length - 1] ?? "hook-1.jpg"),
      line: id,
      a: w.s + Math.round((w.d * i) / n),
      b: w.s + Math.round((w.d * (i + 1)) / n),
    });
  }
}
for (let i = 1; i < SLIDES.length; i++) {
  SLIDES[i].a = Math.max(SLIDES[i - 1].a + 1, SLIDES[i].a - FADE);
}
const BODY_F = END_AT;
if (SLIDES.length) SLIDES[SLIDES.length - 1].b = Math.min(SLIDES[SLIDES.length - 1].b, BODY_F);

/* Ken Burns — база під шаром руху (кожен слайд трохи живе). */
const kb = (i: number, p: number): React.CSSProperties => {
  const dir = i % 4;
  const ease = p * p * (3 - 2 * p);
  if (dir === 0) return { transform: `scale(${1.03 + 0.09 * ease})` };
  if (dir === 1) return { transform: `scale(${1.12 - 0.09 * ease})` };
  if (dir === 2) return { transform: `scale(1.09) translate(${(-2.4 + 4.8 * ease).toFixed(2)}%, ${(-1 + 2 * ease).toFixed(2)}%)` };
  return { transform: `scale(1.09) translate(${(2.4 - 4.8 * ease).toFixed(2)}%, ${(1 - 2 * ease).toFixed(2)}%)` };
};

/* ── Шар руху поверх ілюстрації, ПЕР-СЦЕНА (line) ──
   Кожна сцена має власний набір живих елементів — не просто zoom/pan. */
const MotionLayer: React.FC<{ line: string; seed: number }> = ({ line, seed }) => {
  const f = useCurrentFrame();
  switch (line) {
    case "hook":
      return (
        <>
          <DriftClouds count={11} speed={1.25} op={0.16} />
          <FlyingBirds count={9} speed={1.3} op={0.65} scale={1.1} />
          <Motes count={40} color="#FFD98A" dir="up" speed={1.1} size={4} op={0.6} />
          <WindLines count={14} speed={0.9} op={0.14} />
        </>
      );
    case "s1":
      return (
        <>
          <Glow x={1000} y={150} r={230} color="#FFB43C" speed={1.2} op={0.42} />
          <DriftClouds count={8} speed={1.1} op={0.14} />
          <Motes count={44} color="#FFD27A" dir="up" speed={1.2} size={5} op={0.7} />
          <FlyingBirds count={6} speed={1} op={0.5} scale={0.9} />
        </>
      );
    case "s1b":
      return (
        <>
          <Motes count={46} color="#FFE7B0" dir="up" speed={0.8} size={4} op={0.5} />
          <WindLines count={10} speed={0.5} op={0.1} angle={-6} />
          <FlyingBirds count={4} speed={0.72} op={0.38} scale={0.8} />
          <Glow x={250} y={560} r={180} color="#FFC86A" speed={0.7} op={0.2} />
        </>
      );
    case "s2":
      return (
        <>
          <DriftClouds count={9} speed={1.5} op={0.15} />
          <HeatWaves x={640} y={430} w={280} count={16} color="#FFB347" />
          <Motes count={40} color="#FFCE7A" dir="up" speed={0.9} size={5} op={0.55} />
          <FlyingBirds count={5} speed={1.1} op={0.45} scale={0.95} />
        </>
      );
    case "s2b":
      return (
        <>
          <DriftClouds count={13} speed={1.9} op={0.2} />
          <Motes count={36} color="#FFF0C4" dir="up" speed={0.7} size={4} op={0.5} />
          <FlyingBirds count={8} speed={1.15} op={0.5} scale={0.9} />
        </>
      );
    case "s3":
      return (
        <>
          <WindLines count={20} speed={1.5} op={0.2} angle={-4} />
          <Motes count={38} color="#E8D6A8" dir="down" speed={1.1} size={4} op={0.5} />
          <DriftClouds count={7} speed={1.2} op={0.12} />
        </>
      );
    case "s3b":
      return (
        <>
          <Motes count={40} color="#FFE0A8" dir="up" speed={0.6} size={4} op={0.42} />
          <Glow x={330} y={330} r={150} color="#FFC46A" speed={0.55} op={0.26} />
          <WindLines count={8} speed={0.4} op={0.08} angle={-8} />
        </>
      );
    case "s4":
      return (
        <>
          <WindLines count={22} speed={1.6} op={0.2} />
          <Motes count={46} color="#F0DFA8" dir="down" speed={1.3} size={3} op={0.55} />
          <DriftClouds count={6} speed={1.3} op={0.11} />
        </>
      );
    case "s5":
      return (
        <>
          <Propeller x={470} y={330} r={62} spin={1.4} color="#20343A" />
          <WindLines count={18} speed={1.7} op={0.18} angle={-3} />
          <Motes count={44} color="#F2E2B0" dir="down" speed={1.4} size={3} op={0.5} />
          <Glow x={470} y={330} r={120} color="#FFD27A" speed={1.5} op={0.2} />
        </>
      );
    case "s5b":
      return (
        <>
          <WindLines count={14} speed={1} op={0.14} />
          <Motes count={34} color="#F2E2B0" dir="up" speed={0.7} size={3} op={0.42} />
          <Contrail x={200} y={190} len={620} angle={-4} color="#FFE9B8" />
        </>
      );
    case "s6":
      return (
        <>
          <Contrail x={330} y={230} len={760} angle={-8} color="#FFFFFF" />
          <DriftClouds count={12} speed={2.1} op={0.18} />
          <WindLines count={20} speed={1.8} op={0.16} angle={-2} />
        </>
      );
    case "s7":
      return (
        <>
          <HeatWaves x={640} y={380} w={260} count={18} color="#FF9E3D" />
          <Sparks x={640} y={420} count={26} color="#FFC94A" speed={1.3} />
          <Glow x={640} y={420} r={170} color="#FF9A3C" speed={1.4} op={0.4} />
          <WindLines count={10} speed={1.5} op={0.12} />
        </>
      );
    case "s7b":
      return (
        <>
          <Contrail x={180} y={160} len={900} angle={-6} color="#FFFFFF" />
          <DriftClouds count={14} speed={2.2} op={0.2} />
          <Motes count={30} color="#FFF1CE" dir="down" speed={0.6} size={3} op={0.4} />
        </>
      );
    case "s8":
      return (
        <>
          <ArcTrail from={[60, 560]} to={[1220, 90]} lift={-330} color={B.red} width={3} dur={90} />
          <Glow x={640} y={330} r={200} color="#FFC464" speed={0.9} op={0.24} />
          <Motes count={40} color="#FFE2A6" dir="up" speed={0.8} size={4} op={0.5} />
        </>
      );
    case "s9":
      return (
        <>
          <DriftClouds count={12} speed={1.6} op={0.18} />
          <Contrail x={240} y={210} len={700} angle={-5} color="#FFFFFF" />
          <Motes count={30} color="#FFEFC8" dir="up" speed={0.6} size={3} op={0.4} />
        </>
      );
    case "s10":
      return (
        <>
          <Glow x={640} y={300} r={260} color="#FFC24A" speed={0.8} op={0.32} />
          <DriftClouds count={10} speed={1.4} op={0.16} />
          <Motes count={44} color="#FFE7B0" dir="up" speed={0.7} size={4} op={0.5} />
          <FlyingBirds count={5} speed={0.9} op={0.4} scale={0.85} />
        </>
      );
    case "s11":
      return (
        <>
          <Glow x={980} y={180} r={220} color="#FFC866" speed={1} op={0.34} />
          <DriftClouds count={9} speed={1.3} op={0.15} />
          <FlyingBirds count={7} speed={1.05} op={0.5} scale={0.95} />
          <Motes count={34} color="#FFE7B0" dir="up" speed={0.7} size={3} op={0.45} />
        </>
      );
    case "cta":
      return (
        <>
          <DriftClouds count={10} speed={1.5} op={0.16} />
          <FlyingBirds count={6} speed={1} op={0.45} scale={0.9} />
          <Motes count={32} color="#FFE7B0" dir="up" speed={0.6} size={3} op={0.42} />
        </>
      );
    default:
      return <Motes count={30} color="#FFE7B0" dir="up" speed={0.7} size={3} op={0.4} />;
  }
};

const SlideImg: React.FC<{ src: string; line: string; dur: number; idx: number }> = ({ src, line, dur, idx }) => {
  const f = useCurrentFrame();
  const p = dur <= 1 ? 1 : f / (dur - 1);
  const op = interpolate(f, [0, FADE], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: B.night, overflow: "hidden" }}>
      <Img
        src={staticFile(`${IMG_DIR}/${src}`)}
        style={{ width: "100%", height: "100%", objectFit: "cover", ...kb(idx, p), opacity: op }}
      />
      <Sequence from={0} layout="none" name={`motion-${line}`}>
        <MotionLayer line={line} seed={idx} />
      </Sequence>
    </AbsoluteFill>
  );
};

/* ── Бейджі років (at — кадр слова) ── */
const OVL: Partial<Record<string, React.ReactNode>> = {
  s1: <Badge at={T.af("s1", "Ікар")} name="АНТИЧНІСТЬ" note="міф про Ікара: політ — це гординя" y={150} />,
  s1b: <Badge at={T.af("s1b", "Леонардо")} name="XV СТОЛІТТЯ" note="Леонардо: політ — задача розуму" y={150} />,
  s2: <Badge at={T.af("s2", "брати")} name="1783" note="брати Монгольфє: перша людина в небі" y={150} />,
  s3: <Badge at={T.af("s3", "Лілієнталь")} name="1890-ТІ" note="Лілієнталь: керований політ планера" y={150} />,
  s4: <Badge at={T.af("s4", "трубу")} name="1901" note="брати Райт: власна аеродинамічна труба" y={150} />,
  s5: <Badge at={T.af("s5", "грудня")} name="17 ГРУДНЯ 1903" note="12 секунд, 37 метрів — перший моторний політ" y={150} />,
  s7: <Badge at={T.af("s7", "Віттл")} name="1930-ТІ" note="Френк Віттл: реактивний двигун" y={150} />,
  s9: <Badge at={T.af("s9", "кілометрів")} name="СЬОГОДНІ" note="1000 км/год на висоті 11 км" y={150} />,
};

/* Обкладинка: ілюстрація-фон + 1–2 слова (предмет із назви). */
const COVER_F = 8;
const COVER_SRC = "hook-2.jpg";
const fitCover = (text: string, maxW: number, max: number) =>
  Math.min(
    max,
    Math.floor((0.92 * maxW) / (measureText({ text, fontFamily: FONT.sans, fontWeight: "900", fontSize: 100, letterSpacing: "-0.05em" }).width / 100)),
  );
const FlightCover: React.FC = () => {
  const { width: W } = useVideoConfig();
  const maxW = W - 120;
  return (
    <AbsoluteFill style={{ background: B.night, overflow: "hidden" }}>
      <Img src={staticFile(`${IMG_DIR}/${COVER_SRC}`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.06)" }} />
      <DriftClouds count={8} speed={1.4} op={0.14} />
      <FlyingBirds count={6} speed={1.1} op={0.5} scale={1} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.7) 0%, rgba(0,0,0,.28) 46%, rgba(0,0,0,.78) 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, transparent 38%, rgba(0,0,0,.6) 100%)" }} />
      <Tag tone="night" channel={S.channel} series={S.series} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 60px", textAlign: "center" }}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: fitCover("ПОЛІТ", maxW, 150), letterSpacing: "-0.01em", lineHeight: 0.95, color: B.white, textShadow: "0 8px 30px rgba(0,0,0,.65)" }}>
          ПОЛІТ
        </div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: fitCover("ВІД ІКАРА ДО РЕАКТИВА", maxW, 80), letterSpacing: "-0.005em", lineHeight: 1.05, color: B.red, textShadow: "0 8px 30px rgba(0,0,0,.5)", marginTop: 26 }}>
          ВІД ІКАРА ДО РЕАКТИВА
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const WideProgress: React.FC<{ total: number }> = ({ total }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  if (width <= height) return null;
  const p = Math.max(0, Math.min(1, f / Math.max(1, total)));
  return (
    <div style={{ position: "absolute", left: 96, right: 96, bottom: 34, height: 5, background: "rgba(255,255,255,.18)", borderRadius: 5, overflow: "hidden" }}>
      <div style={{ width: `${p * 100}%`, height: "100%", background: B.red }} />
    </div>
  );
};

export const FLIGHT_F = COVER_F + BODY_F + TAIL;

const FlightBody: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const bgm = (fr: number) =>
    interpolate(fr, [0, 30, FLIGHT_F - 60, FLIGHT_F - 10], [0, 0.08, 0.08, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: B.night }}>
      <Audio src={staticFile(`${AUDIO_DIR}/bgm.mp3`)} loop volume={bgm} />

      {SLIDES.map((s, i) => (
        <Sequence key={`img-${i}`} from={s.a} durationInFrames={s.b - s.a} name={`img-${i}`}>
          <SlideImg src={s.src} line={s.line} dur={s.b - s.a} idx={i} />
        </Sequence>
      ))}

      {ORDER.map((id) => (
        <Sequence key={`c-${id}`} from={T.WIN[id].s} durationInFrames={T.WIN[id].d} name={`cap-${id}`}>
          <Captions items={T.captions(id)} tone="night" top={Math.round(height * 0.74)} size={58} />
          {OVL[id]}
        </Sequence>
      ))}

      {ORDER.slice(1).map((id) => (
        <RedWipe key={`w-${id}`} at={T.WIN[id].s} />
      ))}
      <RedWipe at={END_AT - 6} />

      <Sequence from={END_AT} durationInFrames={TAIL} name="end">
        <AbsoluteFill style={{ background: B.paper }} />
        <EndCard at={-10} line={S.end} cta={S.cta} />
      </Sequence>

      {f < END_AT - 4 && <Tag tone="night" channel={S.channel} series={S.series} />}
      {f < END_AT - 4 && <WideProgress total={END_AT} />}

      {ORDER.map((id) => (
        <Sequence key={`a-${id}`} from={T.WIN[id].s} layout="none">
          <Audio src={staticFile(`${AUDIO_DIR}/${id}.mp3`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const FlightVideo: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={COVER_F} name="cover">
      <FlightCover />
    </Sequence>
    <Sequence from={COVER_F} name="body">
      <FlightBody />
    </Sequence>
  </AbsoluteFill>
);
