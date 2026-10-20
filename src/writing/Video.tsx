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
   Режим «Генерація» (проєкт 019 «Як людство навчилося писати»):
   AI-ілюстрації + ШАР РУХУ В КАДРІ на кожній сцені (MotionLayer): чорнильні
   росчерки самі себе малюють, письмена-гліфи здіймаються, краплі чорнила
   падають, пил і дим пливуть, ореоли свічки й полумʼя пульсують, друкарські
   іскри скачуть, сонячний пил у промені. Ken Burns лишається під рухом як база.
   Кросфейд, спалені субтитри, бейджі епох, обкладинка 8 кадрів, фінальна картка.
   Озвучка: studio/public/writing/<id>.mp3 (Gemini, Charon).
   16:9, 30 fps, база 1280×720 (здача --scale=1.5 → 1080p).
   ───────────────────────────────────────────────────────────────────────────── */

const FPS = 30;
const AUDIO_DIR = "writing";     // studio/public/writing/<id>.mp3
const IMG_DIR = "writing/img";   // studio/public/writing/img/<shot>.jpg
const FADE = 12;                 // кросфейд, кадрів
const TAIL = 120;                // хвіст під фінальну картку

const S = {
  channel: "Ron BaBa TV",
  series: "Цікаві факти",
  cta: ["Підпи", "шись"] as [string, string],
  end: "історії, які вражають",
};
const ORDER = (META as any).voices.map((v: any) => v.id) as string[];

const KEYS: Partial<Record<string, string[]>> = {
  hook: ["тримало", "памяти"],
  s1: ["малюнки", "печер"],
  s1b: ["намалювати", "зобразити"],
  s2: ["письмо", "Шумері"],
  s2b: ["Глина", "обпалена"],
  s3: ["Єгипті", "вдавлювання"],
  s3b: ["ієрогліфів", "тисячі"],
  s4: ["переворот", "записувати"],
  s5: ["Абетку", "греки"],
  s5b: ["жрець", "писець"],
  s6: ["розкішшю", "переписували"],
  s7: ["Гутенберг", "металеві"],
  s7b: ["книжок", "більше"],
  s8: ["ланцюг", "ланка"],
  s9: ["пишемо", "коди"],
  s10: ["знання", "передати"],
  s11: ["увагу", "майбутньому"],
  cta: ["Збережіть", "відео"],
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

/* ── Шар руху поверх ілюстрації, ПЕР-СЦЕНА (line) ── */
const MotionLayer: React.FC<{ line: string; seed: number }> = ({ line }) => {
  switch (line) {
    case "hook":
      return (
        <>
          <HeatWaves x={640} y={430} w={300} count={16} color="#FFA93C" />
          <Sparks x={640} y={470} count={22} color="#FFC94A" speed={1.1} />
          <Glow x={640} y={470} r={190} color="#FF9A3C" speed={1.2} op={0.42} />
          <Motes count={40} color="#FFD98A" dir="up" speed={1} size={4} op={0.55} />
          <Glyphs count={22} color="#FFC878" speed={0.7} op={0.28} />
        </>
      );
    case "s1":
      return (
        <>
          <Glow x={300} y={330} r={220} color="#FFA83C" speed={1.1} op={0.4} />
          <Sparks x={300} y={330} count={18} color="#FFB24A" speed={1} />
          <Motes count={44} color="#F2C878" dir="up" speed={0.9} size={4} op={0.5} />
          <InkStroke from={[140, 520]} to={[1160, 300]} lift={-220} color="#8A3A16" width={3} dur={80} />
        </>
      );
    case "s1b":
      return (
        <>
          <Glyphs count={30} color="#E0B15E" speed={0.5} op={0.3} />
          <Motes count={40} color="#FFE0A8" dir="up" speed={0.6} size={4} op={0.42} />
          <DriftClouds count={6} speed={0.8} op={0.1} />
          <Glow x={250} y={560} r={170} color="#FFC86A" speed={0.7} op={0.2} />
        </>
      );
    case "s2":
      return (
        <>
          <InkStroke from={[180, 460]} to={[1120, 340]} lift={-140} color="#2A2118" width={3} dur={90} />
          <RuledLines count={7} color="#3A2E20" op={0.18} />
          <Motes count={40} color="#F2D6A0" dir="up" speed={0.7} size={4} op={0.5} />
          <SunDust x={1000} count={22} op={0.4} />
        </>
      );
    case "s2b":
      return (
        <>
          <Glow x={640} y={330} r={210} color="#FFBE5A" speed={0.8} op={0.26} />
          <Motes count={38} color="#FFE8BC" dir="up" speed={0.6} size={4} op={0.48} />
          <Glyphs count={20} color="#D9A85A" speed={0.5} op={0.24} />
        </>
      );
    case "s3":
      return (
        <>
          <InkStroke from={[160, 240]} to={[1140, 460]} lift={120} color="#3A2A18" width={3} dur={95} />
          <Motes count={42} color="#FFE2A8" dir="up" speed={0.8} size={4} op={0.5} />
          <Glow x={1040} y={180} r={240} color="#FFC24A" speed={0.9} op={0.3} />
          <RuledLines count={6} color="#3A2E20" op={0.14} />
        </>
      );
    case "s3b":
      return (
        <>
          <Glyphs count={34} color="#E6C078" speed={0.45} op={0.3} />
          <Motes count={36} color="#FFE0A8" dir="up" speed={0.55} size={4} op={0.42} />
          <Glow x={330} y={330} r={150} color="#FFC46A" speed={0.55} op={0.24} />
        </>
      );
    case "s4":
      return (
        <>
          <InkStroke from={[140, 540]} to={[1160, 260]} lift={-180} color="#2A2118" width={3} dur={70} />
          <RuledLines count={8} color="#3A2E20" op={0.16} speed={1.2} />
          <Motes count={40} color="#FFE2A8" dir="up" speed={0.9} size={4} op={0.5} />
          <InkDrops count={10} color="#1A1410" speed={1.1} op={0.4} />
        </>
      );
    case "s5":
      return (
        <>
          <SunDust x={980} count={30} op={0.5} />
          <WarmLight x={1040} y={150} r={340} color="#FFB43C" op={0.26} speed={0.8} />
          <Motes count={38} color="#FFE7B0" dir="up" speed={0.7} size={4} op={0.45} />
          <RuledLines count={7} color="#3A2E20" op={0.15} />
        </>
      );
    case "s5b":
      return (
        <>
          <Glyphs count={26} color="#E8C87A" speed={0.55} op={0.26} />
          <Motes count={34} color="#FFF0C4" dir="up" speed={0.65} size={4} op={0.45} />
          <DriftClouds count={6} speed={0.9} op={0.1} />
        </>
      );
    case "s6":
      return (
        <>
          <Glow x={640} y={360} r={240} color="#FFB84A" speed={0.7} op={0.3} />
          <Motes count={46} color="#FFD88A" dir="up" speed={0.55} size={4} op={0.5} />
          <InkStroke from={[200, 520]} to={[1080, 260]} lift={-160} color="#2A2118" width={3} dur={100} />
          <Glyphs count={18} color="#E0B15E" speed={0.4} op={0.22} />
        </>
      );
    case "s7":
      return (
        <>
          <HeatWaves x={520} y={360} w={260} count={16} color="#FF9E3D" />
          <Sparks x={520} y={420} count={26} color="#FFC94A" speed={1.3} />
          <Glow x={520} y={420} r={180} color="#FF9A3C" speed={1.3} op={0.4} />
          <Motes count={40} color="#FFD88A" dir="up" speed={0.8} size={4} op={0.5} />
        </>
      );
    case "s7b":
      return (
        <>
          <InkStroke from={[120, 500]} to={[1180, 220]} lift={-200} color="#2A2118" width={3} dur={80} />
          <Motes count={44} color="#FFE2A8" dir="up" speed={0.7} size={4} op={0.5} />
          <WarmLight x={1040} y={160} r={320} color="#FFB43C" op={0.24} speed={0.75} />
          <Glyphs count={16} color="#E8C87A" speed={0.5} op={0.22} />
        </>
      );
    case "s8":
      return (
        <>
          <InkStroke from={[60, 560]} to={[1220, 140]} lift={-260} color={B.red} width={3} dur={95} />
          <Glow x={640} y={340} r={200} color="#FFC464" speed={0.9} op={0.24} />
          <Motes count={40} color="#FFE2A6" dir="up" speed={0.8} size={4} op={0.5} />
          <Glyphs count={20} color="#E8C87A" speed={0.55} op={0.24} />
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
          <InkStroke from={[140, 540]} to={[1140, 240]} lift={-180} color="#5A3A18" width={2} dur={90} />
        </>
      );
    case "s11":
      return (
        <>
          <WarmLight x={980} y={180} r={320} color="#FFC866" op={0.3} speed={0.9} />
          <SunDust x={980} count={26} op={0.44} />
          <Motes count={38} color="#FFE7B0" dir="up" speed={0.7} size={3} op={0.45} />
          <InkStroke from={[160, 520]} to={[1120, 260]} lift={-170} color="#2A2118" width={3} dur={75} />
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
  s1: <Badge at={T.wf("s1", "малюнки")} name="ДО ПИСЬМА" note="наскельні малюнки: перші знаки" y={150} />,
  s2: <Badge at={T.wf("s2", "Шумері")} name="~3200 Р. ДО Н. Е." note="Шумер: клинопис на глині" y={150} />,
  s3: <Badge at={T.wf("s3", "Єгипті")} name="~3000 Р. ДО Н. Е." note="Єгипет: ієрогліфи й папірус" y={150} />,
  s4: <Badge at={T.wf("s4", "переворот")} name="~1050 Р. ДО Н. Е." note="фінікійська абетка: звук замість слова" y={150} />,
  s5: <Badge at={T.wf("s5", "греки")} name="~800 Р. ДО Н. Е." note="греки додали голосні" y={150} />,
  s7: <Badge at={T.wf("s7", "Гутенберг")} name="~1450" note="Гутенберг: рухливий метал і друк" y={150} />,
  s9: <Badge at={T.wf("s9", "пишемо")} name="СЬОГОДНІ" note="пишемо більше, ніж будь коли" y={150} />,
};

/* Обкладинка: ілюстрація-фон + 1–2 слова (предмет із назви). */
const COVER_F = 8;
const COVER_SRC = "hook-2.jpg";
const fitCover = (text: string, maxW: number, max: number) =>
  Math.min(
    max,
    Math.floor((0.92 * maxW) / (measureText({ text, fontFamily: FONT.sans, fontWeight: "900", fontSize: 100, letterSpacing: "-0.05em" }).width / 100)),
  );
const WritingCover: React.FC = () => {
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
        <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: fitCover("ПИСЬМО", maxW, 150), letterSpacing: "-0.01em", lineHeight: 0.95, color: B.white, textShadow: "0 8px 30px rgba(0,0,0,.65)" }}>
          ПИСЬМО
        </div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: fitCover("ВІД ПЕЧЕРИ ДО ДРУКАРНІ", maxW, 72), letterSpacing: "-0.005em", lineHeight: 1.05, color: B.red, textShadow: "0 8px 30px rgba(0,0,0,.5)", marginTop: 26 }}>
          ВІД ПЕЧЕРИ ДО ДРУКАРНІ
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

export const WRITING_F = COVER_F + BODY_F + TAIL;

const WritingBody: React.FC = () => {
  const f = useCurrentFrame();
  const { height } = useVideoConfig();
  const bgm = (fr: number) =>
    interpolate(fr, [0, 30, WRITING_F - 60, WRITING_F - 10], [0, 0.08, 0.08, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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

export const WritingVideo: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={COVER_F} name="cover">
      <WritingCover />
    </Sequence>
    <Sequence from={COVER_F} name="body">
      <WritingBody />
    </Sequence>
  </AbsoluteFill>
);
