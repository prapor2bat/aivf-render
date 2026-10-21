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
  InkStroke,
  Motes,
  RuledLines,
  Sparks,
  SunDust,
  WarmLight,
  WindLines,
} from "./motion";

/* ─────────────────────────────────────────────────────────────────────────────
   Режим «Генерація» (проєкт 025 «Як людство навчилося будувати міста»):
   СТОКОВІ ФОТО (Pixabay/Serper) + ШАР РУХУ В КАДРІ на кожній сцені (MotionLayer):
   теплі пилинки, ореоли світла, спалахи, дим, гліфи. Ken Burns як база.
   Кросфейд, спалені субтитри, бейджі епох міст, обкладинка 8 кадрів, фінальна картка.
   Озвучка: studio/public/mista/<id>.mp3 (ElevenLabs, голос Michael Reimer).
   16:9, 30 fps, база 1280×720 (здача --scale=1.5 → 1080p).
   ───────────────────────────────────────────────────────────────────────────── */

const FPS = 30;
const AUDIO_DIR = "mista";     // studio/public/mista/<id>.mp3
const IMG_DIR = "mista/img";   // studio/public/mista/img/<shot>.jpg
const FADE = 12;              // кросфейд, кадрів
const TAIL = 120;            // хвіст під фінальну картку

const S = {
  channel: "Ron BaBa TV",
  series: "Цікаві факти",
  cta: ["Підпи", "шись"] as [string, string],
  end: "історії, які вражають",
};
const ORDER = (META as any).voices.map((v: any) => v.id) as string[];

const KEYS: Partial<Record<string, string[]>> = {
  hook: ["селища", "міст"],
  s1: ["пшеницю", "осіле"],
  s2: ["міста", "перші"],
  s3: ["вода", "революцією"],
  s4: ["вузьких", "пожежі"],
  s5: ["закони", "ради"],
  s5b: ["торгівля", "красою"],
  s6: ["тісним", "вгору"],
  s6b: ["винаходи", "хаосу"],
  s7: ["антисанітарія", "хвороби"],
  s8: ["планувати", "майбутнє"],
  s9: ["генерує", "порядок"],
  s10: ["найбільших", "турботи"],
  s11: ["тягли", "плечем"],
  s12: ["спільного", "один"],
  s13: ["створюємо", "майбутнє"],
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

/* ── Шар руху поверх фото, ПЕР-СЦЕНА (line) — тепла камʼяно-теракотова палітра ── */
const MotionLayer: React.FC<{ line: string; seed: number }> = ({ line }) => {
  switch (line) {
    case "hook":
      return (
        <>
          <Glow x={900} y={220} r={260} color="#F0B07A" speed={0.9} op={0.3} />
          <Motes count={46} color="#F6DCC0" dir="up" speed={0.8} size={4} op={0.55} />
          <Sparks x={640} y={240} count={20} color="#FFFFFF" speed={0.9} />
          <Glyphs count={18} color="#F6DCC0" speed={0.6} op={0.24} />
        </>
      );
    case "s1":
      return (
        <>
          <SunDust x={900} count={28} op={0.44} />
          <WarmLight x={980} y={200} r={320} color="#E8C070" op={0.28} speed={0.85} />
          <Motes count={46} color="#F2E0B8" dir="up" speed={0.7} size={3} op={0.52} />
          <Glyphs count={18} color="#D8B060" speed={0.5} op={0.22} />
        </>
      );
    case "s2":
      return (
        <>
          <WarmLight x={640} y={240} r={300} color="#E09050" op={0.28} speed={0.85} />
          <Motes count={44} color="#F2D6B0" dir="up" speed={0.65} size={4} op={0.5} />
          <Sparks x={760} y={220} count={16} color="#FFFFFF" speed={0.85} />
          <RuledLines count={7} color="#B07848" op={0.14} />
        </>
      );
    case "s3":
      return (
        <>
          <Glow x={640} y={300} r={240} color="#6FC8C0" speed={0.85} op={0.3} />
          <Motes count={44} color="#C4ECE8" dir="up" speed={0.65} size={4} op={0.5} />
          <Sparks x={680} y={260} count={18} color="#FFFFFF" speed={0.9} />
          <InkStroke from={[120, 200]} to={[1160, 420]} lift={180} color="#2E8A86" width={2} dur={80} />
        </>
      );
    case "s4":
      return (
        <>
          <Glow x={620} y={280} r={250} color="#E06038" speed={0.9} op={0.32} />
          <Motes count={44} color="#F4C088" dir="up" speed={0.7} size={4} op={0.5} />
          <Sparks x={700} y={300} count={22} color="#FFE0A0" speed={0.95} />
          <HeatWaves x={640} y={320} w={420} count={7} color="#F0A060" />
        </>
      );
    case "s5":
      return (
        <>
          <Glow x={640} y={240} r={240} color="#E8B060" speed={0.85} op={0.3} />
          <Motes count={44} color="#F4DCC0" dir="up" speed={0.7} size={4} op={0.5} />
          <Sparks x={640} y={220} count={18} color="#FFFFFF" speed={0.9} />
          <RuledLines count={6} color="#A07040" op={0.12} />
        </>
      );
    case "s5b":
      return (
        <>
          <Glow x={640} y={260} r={260} color="#E0A050" speed={0.9} op={0.3} />
          <Motes count={42} color="#F6DCA8" dir="up" speed={0.65} size={4} op={0.5} />
          <WindLines count={12} color="#E8C080" speed={0.9} op={0.12} angle={-6} />
          <Sparks x={640} y={240} count={20} color="#FFFFFF" speed={0.95} />
        </>
      );
    case "s6":
      return (
        <>
          <Glow x={640} y={300} r={250} color="#C89060" speed={0.85} op={0.28} />
          <Motes count={44} color="#EAD0B0" dir="up" speed={0.6} size={4} op={0.46} />
          <RuledLines count={7} color="#98724C" op={0.14} />
          <Sparks x={700} y={240} count={16} color="#FFFFFF" speed={0.9} />
        </>
      );
    case "s6b":
      return (
        <>
          <Glow x={640} y={320} r={260} color="#5FC0C8" speed={0.85} op={0.32} />
          <Motes count={44} color="#C8ECF0" dir="up" speed={0.6} size={4} op={0.5} />
          <WindLines count={12} color="#8CD4DC" speed={0.9} op={0.12} angle={-6} />
          <Sparks x={760} y={260} count={18} color="#FFFFFF" speed={0.85} />
        </>
      );
    case "s7":
      return (
        <>
          <Glow x={640} y={300} r={240} color="#4FB8B0" speed={0.9} op={0.3} />
          <Motes count={42} color="#C4EAE6" dir="up" speed={0.7} size={4} op={0.5} />
          <Sparks x={640} y={260} count={20} color="#FFFFFF" speed={0.95} />
          <Glyphs count={18} color="#8CD8D0" speed={0.55} op={0.22} />
        </>
      );
    case "s8":
      return (
        <>
          <Glow x={640} y={300} r={240} color="#E0A858" speed={0.85} op={0.3} />
          <Motes count={44} color="#F2D8A8" dir="up" speed={0.65} size={4} op={0.5} />
          <InkStroke from={[60, 520]} to={[1220, 160]} lift={-240} color="#2E8A86" width={3} dur={95} />
        </>
      );
    case "s9":
      return (
        <>
          <Glow x={640} y={320} r={250} color="#56C0C0" speed={0.9} op={0.34} />
          <Motes count={42} color="#C8EEEC" dir="up" speed={0.6} size={4} op={0.5} />
          <Sparks x={640} y={320} count={22} color="#FFFFFF" speed={1} />
          <Glyphs count={24} color="#9CDCD8" speed={0.6} op={0.24} />
        </>
      );
    case "s10":
      return (
        <>
          <Glow x={640} y={300} r={240} color="#E8B060" speed={0.85} op={0.3} />
          <Motes count={44} color="#F4DCB0" dir="up" speed={0.65} size={4} op={0.5} />
          <Sparks x={640} y={240} count={16} color="#FFFFFF" speed={0.9} />
          <DriftClouds count={5} speed={0.8} op={0.08} tint="#E0B080" />
        </>
      );
    case "s11":
      return (
        <>
          <SunDust x={980} count={26} op={0.44} />
          <WarmLight x={980} y={180} r={320} color="#E8B860" op={0.28} speed={0.9} />
          <Motes count={38} color="#F4DCB0" dir="up" speed={0.7} size={3} op={0.45} />
          <Sparks x={900} y={200} count={16} color="#FFFFFF" speed={0.85} />
        </>
      );
    case "s12":
      return (
        <>
          <SunDust x={860} count={24} op={0.4} />
          <WarmLight x={920} y={200} r={320} color="#E8C078" op={0.26} speed={0.85} />
          <Motes count={40} color="#F6E0C0" dir="up" speed={0.7} size={4} op={0.5} />
          <Sparks x={640} y={220} count={16} color="#FFFFFF" speed={0.85} />
        </>
      );
    case "s13":
      return (
        <>
          <WarmLight x={960} y={200} r={320} color="#F0C880" op={0.28} speed={0.85} />
          <Motes count={40} color="#F8ECD0" dir="up" speed={0.65} size={3} op={0.48} />
          <Sparks x={640} y={200} count={16} color="#FFFFFF" speed={0.85} />
        </>
      );
    case "cta":
      return (
        <>
          <Glow x={640} y={360} r={220} color="#E8B060" speed={0.8} op={0.26} />
          <Motes count={34} color="#F4DCC0" dir="up" speed={0.6} size={3} op={0.44} />
          <Glyphs count={16} color="#F4DCC0" speed={0.5} op={0.2} />
        </>
      );
    default:
      return <Motes count={30} color="#F4DCC0" dir="up" speed={0.7} size={3} op={0.4} />;
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
  s1: <Badge at={T.wf("s1", "пшеницю")} name="~10000 Р. ДО Н. Е." note="перші селища землеробів" y={150} />,
  s2: <Badge at={T.wf("s2", "перші")} name="~3500 Р. ДО Н. Е." note="перші справжні міста" y={150} />,
  s3: <Badge at={T.wf("s3", "вода")} name="АНТИЧНІСТЬ" note="акведуки й чиста вода" y={150} />,
  s5: <Badge at={T.wf("s5", "закони")} name="ПРАВО" note="закони, податки, міські ради" y={150} />,
  s5b: <Badge at={T.wf("s5b", "торгівля")} name="ТОРГІВЛЯ" note="шляхи, пристані, базари" y={150} />,
  s7: <Badge at={T.wf("s7", "антисанітарія")} name="XIX СТ." note="каналізація врятувала міста" y={150} />,
  s9: <Badge at={T.wf("s9", "генерує")} name="СЬОГОДНІ" note="міста — двигуни цивілізації" y={150} />,
};

/* Обкладинка: фото-фон + 1–2 слова (предмет із назви). */
const COVER_F = 8;
const COVER_SRC = "hook-2.jpg";
const fitCover = (text: string, maxW: number, max: number) =>
  Math.min(
    max,
    Math.floor((0.92 * maxW) / (measureText({ text, fontFamily: FONT.sans, fontWeight: "900", fontSize: 100, letterSpacing: "-0.05em" }).width / 100)),
  );
const MistaCover: React.FC = () => {
  const { width: W } = useVideoConfig();
  const maxW = W - 120;
  return (
    <AbsoluteFill style={{ background: B.night, overflow: "hidden" }}>
      <Img src={staticFile(`${IMG_DIR}/${COVER_SRC}`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.06)" }} />
      <Motes count={44} color="#F6DCC0" dir="up" speed={0.7} size={4} op={0.5} />
      <Sparks x={760} y={220} count={20} color="#FFFFFF" speed={0.9} />
      <InkStroke from={[120, 560]} to={[1160, 200]} lift={-200} color="#E8B060" width={2} dur={70} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.7) 0%, rgba(0,0,0,.28) 46%, rgba(0,0,0,.78) 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, transparent 38%, rgba(0,0,0,.6) 100%)" }} />
      <Tag tone="night" channel={S.channel} series={S.series} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 60px", textAlign: "center" }}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: fitCover("МІСТА", maxW, 170), letterSpacing: "-0.01em", lineHeight: 0.95, color: B.white, textShadow: "0 8px 30px rgba(0,0,0,.65)" }}>
          МІСТА
        </div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: fitCover("ПЕРШІ МІСТА ЛЮДСТВА", maxW, 66), letterSpacing: "-0.005em", lineHeight: 1.05, color: B.red, textShadow: "0 8px 30px rgba(0,0,0,.5)", marginTop: 26 }}>
          ПЕРШІ МІСТА ЛЮДСТВА
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

export const MISTA_F = COVER_F + BODY_F + TAIL;

const MistaBody: React.FC = () => {
  const f = useCurrentFrame();
  const { height } = useVideoConfig();
  const bgm = (fr: number) =>
    interpolate(fr, [0, 30, MISTA_F - 60, MISTA_F - 10], [0, 0.08, 0.08, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
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

export const MistaVideo: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={COVER_F} name="cover">
      <MistaCover />
    </Sequence>
    <Sequence from={COVER_F} name="body">
      <MistaBody />
    </Sequence>
  </AbsoluteFill>
);
