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
  DriftClouds,
  Glow,
  Glyphs,
  HeatWaves,
  InkDrops,
  InkStroke,
  Motes,
  RuledLines,
  Sparks,
  SunDust,
  WarmLight,
  WindLines,
} from "./motion";

/* ─────────────────────────────────────────────────────────────────────────────
   Режим «Генерація» (проєкт 021 «Як людство винайшло гроші»):
   СТОКОВІ ФОТО (Pixabay/Serper) + ШАР РУХУ В КАДРІ на кожній сцені (MotionLayer):
   теплі хвилі, іскри, гліфи, краплі, пил у промені, ореоли світла.
   Ken Burns лишається під рухом як база. Кросфейд, спалені субтитри, бейджі епох,
   обкладинка 8 кадрів, фінальна картка. Озвучка: studio/public/hroshi/<id>.mp3
   (ElevenLabs, голос Michael Reimer). 16:9, 30 fps, база 1280×720
   (здача --scale=1.5 → 1080p).
   ───────────────────────────────────────────────────────────────────────────── */

const FPS = 30;
const AUDIO_DIR = "hroshi";     // studio/public/hroshi/<id>.mp3
const IMG_DIR = "hroshi/img";   // studio/public/hroshi/img/<shot>.jpg
const FADE = 12;                // кросфейд, кадрів
const TAIL = 120;               // хвіст під фінальну картку

const S = {
  channel: "Ron BaBa TV",
  series: "Цікаві факти",
  cta: ["Підпи", "шись"] as [string, string],
  end: "історії, які вражають",
};
const ORDER = (META as any).voices.map((v: any) => v.id) as string[];

const KEYS: Partial<Record<string, string[]>> = {
  hook: ["вчора", "гроші"],
  s1: ["мінялися", "обмін"],
  s2: ["мушлі", "каурі"],
  s3: ["срібло", "золото"],
  s4: ["Лідія", "монета"],
  s5: ["металеві", "важкі"],
  s5b: ["Китаї", "паперові"],
  s6: ["Європі", "банки"],
  s6b: ["кредит", "працювати"],
  s7: ["обіцянці", "метал"],
  s8: ["картки", "невидимими"],
  s9: ["цифрові", "мережі"],
  s10: ["протокол", "домовленість"],
  s11: ["платимо", "позичаємо"],
  s12: ["обміну", "праця"],
  s13: ["довіру", "ланцюг"],
  cta: ["Збережіть", "підпишіться"],
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

/* ── Шар руху поверх фото, ПЕР-СЦЕНА (line) ── */
const MotionLayer: React.FC<{ line: string; seed: number }> = ({ line }) => {
  switch (line) {
    case "hook":
      return (
        <>
          <Glow x={640} y={440} r={200} color="#FFB43C" speed={1.1} op={0.4} />
          <Sparks x={640} y={470} count={22} color="#FFC94A" speed={1.1} />
          <Motes count={42} color="#FFD98A" dir="up" speed={1} size={4} op={0.55} />
          <Glyphs count={20} color="#FFC878" speed={0.7} op={0.26} />
        </>
      );
    case "s1":
      return (
        <>
          <HeatWaves x={420} y={420} w={280} count={16} color="#FFA93C" />
          <Glow x={420} y={430} r={190} color="#FF9A3C" speed={1.2} op={0.38} />
          <Motes count={44} color="#F2C878" dir="up" speed={0.9} size={4} op={0.5} />
          <InkStroke from={[140, 520]} to={[1160, 300]} lift={-220} color="#8A3A16" width={3} dur={80} />
        </>
      );
    case "s2":
      return (
        <>
          <Motes count={42} color="#FFE7B0" dir="up" speed={0.8} size={4} op={0.5} />
          <Glow x={980} y={220} r={220} color="#FFC24A" speed={0.9} op={0.28} />
          <RuledLines count={6} color="#3A2E20" op={0.14} />
          <InkDrops count={9} color="#1A1410" speed={1.1} op={0.36} />
        </>
      );
    case "s3":
      return (
        <>
          <Glow x={640} y={360} r={230} color="#FFC24A" speed={0.9} op={0.32} />
          <Sparks x={640} y={400} count={20} color="#FFD06A" speed={1.1} />
          <Motes count={42} color="#FFE2A8" dir="up" speed={0.8} size={4} op={0.5} />
          <InkStroke from={[160, 240]} to={[1140, 460]} lift={120} color="#3A2A18" width={3} dur={95} />
        </>
      );
    case "s4":
      return (
        <>
          <WarmLight x={980} y={180} r={330} color="#FFB43C" op={0.3} speed={0.85} />
          <SunDust x={980} count={26} op={0.46} />
          <Motes count={40} color="#FFE2A8" dir="up" speed={0.9} size={4} op={0.5} />
          <Glyphs count={18} color="#E8C87A" speed={0.5} op={0.22} />
        </>
      );
    case "s5":
      return (
        <>
          <SunDust x={980} count={30} op={0.5} />
          <WarmLight x={1040} y={150} r={340} color="#FFB43C" op={0.26} speed={0.8} />
          <Motes count={38} color="#FFE7B0" dir="up" speed={0.7} size={4} op={0.45} />
          <WindLines count={12} color="#FFD98A" speed={0.9} op={0.14} angle={-6} />
        </>
      );
    case "s5b":
      return (
        <>
          <DriftClouds count={6} speed={0.9} op={0.1} />
          <Motes count={34} color="#FFF0C4" dir="up" speed={0.65} size={4} op={0.45} />
          <Glyphs count={22} color="#E8C87A" speed={0.55} op={0.24} />
          <InkStroke from={[180, 460]} to={[1120, 340]} lift={-140} color="#2A2118" width={3} dur={90} />
        </>
      );
    case "s6":
      return (
        <>
          <Glow x={640} y={360} r={240} color="#FFB84A" speed={0.7} op={0.3} />
          <Motes count={46} color="#FFD88A" dir="up" speed={0.55} size={4} op={0.5} />
          <RuledLines count={7} color="#3A2E20" op={0.16} />
        </>
      );
    case "s6b":
      return (
        <>
          <Glyphs count={26} color="#E8C87A" speed={0.6} op={0.26} />
          <Motes count={38} color="#FFE7B0" dir="up" speed={0.7} size={4} op={0.48} />
          <Glow x={980} y={220} r={220} color="#FFC464" speed={0.8} op={0.26} />
          <InkStroke from={[160, 500]} to={[1140, 300]} lift={-170} color="#2A2118" width={3} dur={85} />
        </>
      );
    case "s7":
      return (
        <>
          <WarmLight x={1000} y={200} r={330} color="#FFC866" op={0.28} speed={0.8} />
          <Motes count={40} color="#FFEFC8" dir="up" speed={0.7} size={3} op={0.46} />
          <RuledLines count={7} color="#3A2E20" op={0.14} />
        </>
      );
    case "s8":
      return (
        <>
          <Glow x={640} y={340} r={220} color="#FFC464" speed={0.9} op={0.28} />
          <Motes count={42} color="#FFE7B0" dir="up" speed={0.75} size={4} op={0.5} />
          <WindLines count={14} color="#FFD98A" speed={1} op={0.16} angle={-8} />
          <InkStroke from={[60, 560]} to={[1220, 140]} lift={-260} color={B.red} width={3} dur={95} />
        </>
      );
    case "s9":
      return (
        <>
          <Glyphs count={30} color="#E8C87A" speed={0.7} op={0.26} />
          <Motes count={34} color="#FFEFC8" dir="up" speed={0.6} size={3} op={0.42} />
          <WarmLight x={980} y={200} r={300} color="#FFC466" op={0.24} speed={0.8} />
          <RuledLines count={6} color="#3A2E20" op={0.12} />
        </>
      );
    case "s10":
      return (
        <>
          <Glow x={640} y={320} r={250} color="#FFC24A" speed={0.8} op={0.3} />
          <Glyphs count={30} color="#F2D28A" speed={0.8} op={0.3} />
          <Motes count={44} color="#FFE7B0" dir="up" speed={0.7} size={4} op={0.5} />
        </>
      );
    case "s11":
      return (
        <>
          <WarmLight x={980} y={180} r={320} color="#FFC866" op={0.3} speed={0.9} />
          <SunDust x={980} count={26} op={0.44} />
          <Motes count={38} color="#FFE7B0" dir="up" speed={0.7} size={3} op={0.45} />
        </>
      );
    case "s12":
      return (
        <>
          <Glow x={640} y={330} r={240} color="#FFC24A" speed={0.9} op={0.28} />
          <Motes count={42} color="#FFE7B0" dir="up" speed={0.75} size={4} op={0.5} />
          <WindLines count={14} color="#FFD98A" speed={1} op={0.16} angle={-8} />
          <InkStroke from={[140, 540]} to={[1140, 240]} lift={-180} color="#5A3A18" width={2} dur={90} />
        </>
      );
    case "s13":
      return (
        <>
          <WarmLight x={960} y={200} r={320} color="#FFC866" op={0.28} speed={0.85} />
          <Motes count={40} color="#FFEFC8" dir="up" speed={0.7} size={3} op={0.46} />
          <Glyphs count={22} color="#E8C87A" speed={0.55} op={0.26} />
        </>
      );
    case "cta":
      return (
        <>
          <Glow x={640} y={360} r={220} color="#FFC464" speed={0.8} op={0.28} />
          <Motes count={34} color="#FFE7B0" dir="up" speed={0.6} size={3} op={0.42} />
          <Glyphs count={18} color="#E8C87A" speed={0.5} op={0.22} />
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

/* ── Бейджі епох (at — кадр слова ВІДНОСНО сцени, бо живуть у Sequence лінії) ── */
const OVL: Partial<Record<string, React.ReactNode>> = {
  s1: <Badge at={T.wf("s1", "мінялися")} name="ДО ГРОШЕЙ" note="бартер: товар за товар" y={150} />,
  s2: <Badge at={T.wf("s2", "мушлі")} name="~2000 Р. ДО Н. Е." note="мушлі каурі, сіль, худоба — перші гроші" y={150} />,
  s4: <Badge at={T.wf("s4", "Лідія")} name="~600 Р. ДО Н. Е." note="Лідія: найперша монета зі штемпелем" y={150} />,
  s5b: <Badge at={T.wf("s5b", "Китаї")} name="~1000" note="Китай: перші паперові гроші" y={150} />,
  s6: <Badge at={T.wf("s6", "Європі")} name="~1400" note="Європа: банки й розписки замість золота" y={150} />,
  s8: <Badge at={T.wf("s8", "картки")} name="~1900" note="платіжні картки: гроші стають записами" y={150} />,
  s9: <Badge at={T.wf("s9", "цифрові")} name="~2009" note="цифрові валюти без банку й без центру" y={150} />,
};

/* Обкладинка: фото-фон + 1–2 слова (предмет із назви). */
const COVER_F = 8;
const COVER_SRC = "hook-2.jpg";
const fitCover = (text: string, maxW: number, max: number) =>
  Math.min(
    max,
    Math.floor((0.92 * maxW) / (measureText({ text, fontFamily: FONT.sans, fontWeight: "900", fontSize: 100, letterSpacing: "-0.05em" }).width / 100)),
  );
const HroshiCover: React.FC = () => {
  const { width: W } = useVideoConfig();
  const maxW = W - 120;
  return (
    <AbsoluteFill style={{ background: B.night, overflow: "hidden" }}>
      <Img src={staticFile(`${IMG_DIR}/${COVER_SRC}`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.06)" }} />
      <Glyphs count={20} color="#FFC878" speed={0.6} op={0.24} />
      <InkStroke from={[120, 560]} to={[1160, 200]} lift={-200} color="#FFC878" width={2} dur={70} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.7) 0%, rgba(0,0,0,.28) 46%, rgba(0,0,0,.78) 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, transparent 38%, rgba(0,0,0,.6) 100%)" }} />
      <Tag tone="night" channel={S.channel} series={S.series} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 60px", textAlign: "center" }}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: fitCover("ГРОШІ", maxW, 170), letterSpacing: "-0.01em", lineHeight: 0.95, color: B.white, textShadow: "0 8px 30px rgba(0,0,0,.65)" }}>
          ГРОШІ
        </div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: fitCover("ВІД БАРТЕРУ ДО БІТКОЙНА", maxW, 66), letterSpacing: "-0.005em", lineHeight: 1.05, color: B.red, textShadow: "0 8px 30px rgba(0,0,0,.5)", marginTop: 26 }}>
          ВІД БАРТЕРУ ДО БІТКОЙНА
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

export const HROSHI_F = COVER_F + BODY_F + TAIL;

const HroshiBody: React.FC = () => {
  const f = useCurrentFrame();
  const { height } = useVideoConfig();
  const bgm = (fr: number) =>
    interpolate(fr, [0, 30, HROSHI_F - 60, HROSHI_F - 10], [0, 0.08, 0.08, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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

export const HroshiVideo: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={COVER_F} name="cover">
      <HroshiCover />
    </Sequence>
    <Sequence from={COVER_F} name="body">
      <HroshiBody />
    </Sequence>
  </AbsoluteFill>
);
