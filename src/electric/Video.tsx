import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { measureText } from "@remotion/layout-utils";
import { B, FONT } from "../brand/tokens";
import { Captions, EndCard, RedWipe, Tag } from "../brand/kit";
import { makeTimeline } from "../brand/timeline";
import { Badge } from "../news/overlays";
import META from "./audio_meta.json";
import PLAN from "./images-plan.json";

/* ─────────────────────────────────────────────────────────────────────────────
   Режим «Генерація» (проєкт 017 «Як людство винайшло електроенергію»):
   слайдшоу AI-ілюстрацій (2752×1536) з повільним zoom/pan (Ken Burns),
   кросфейд між кадрами, спалені субтитри, бейджі років, обкладинка 8 кадрів,
   фінальна картка. Озвучка: mp3-лінії studio/public/electric/<id>.mp3 (Gemini,
   голос Charon), слова — audio_meta.json (whisper-звірка, 0 аномалій).
   16:9, 30 fps, база 1280×720 (здача --scale=1.5 → 1080p).
   в•ђ ──────────────────────────────────────────────────────────────────────── */

const FPS = 30;
const AUDIO_DIR = "electric";   // studio/public/electric/<id>.mp3
const IMG_DIR = "electric/img"; // studio/public/electric/img/<shot>.jpg
const FADE = 12;                // кросфейд, кадрів
const TAIL = 120;               // хвіст під фінальну картку
const CAPS_TOP = 872;           // субтитри у нижній третині (для 9:16)
const capsTopFor = (w: number, h: number) => (w > h ? Math.round(h * 0.74) : CAPS_TOP);

/* Бренд каналу «Ron BaBa TV — Цікаві факти» (окремий канал для пізнавальних
   роликів-історій; новини — «Факти та Новини», див. brand/i18n.ts). */
const S = {
  channel: "Ron BaBa TV",
  series: "Цікаві факти",
  cta: ["Підпи", "шись"] as [string, string],
  end: "історії, які вражають",
};
const ORDER = (META as any).voices.map((v: any) => v.id) as string[];

/* Червоні ключові слова субтитрів. */
const KEYS: Partial<Record<string, string[]>> = {
  hook: ["іскри"],
  s1: ["бурштин"],
  s1b: ["електрика"],
  s2: ["Гільберт"],
  s3: ["блискавка"],
  s3b: ["лейденських"],
  s4: ["Гальвані"],
  s5: ["батарею"],
  s5b: ["батарея"],
  s6: ["генератор"],
  s7: ["податком"],
  s7b: ["турбіни"],
  s8: ["Едісон"],
  s9: ["війна"],
  s10: ["Тесла"],
  s11: ["цивілізації"],
  cta: ["підпишіться"],
};
const T = makeTimeline(META as any, ORDER, { fps: FPS, keys: KEYS });
const LAST = ORDER[ORDER.length - 1];
const END_AT = T.WIN[LAST].e;

/* Ілюстрації за лініями (порядок — як у images-plan.json). */
type PlanShot = { id: string; line: string; prompt: string };
const BY_LINE = new Map<string, string[]>();
for (const sh of (PLAN as any).shots as PlanShot[]) {
  const list = BY_LINE.get(sh.line) ?? [];
  list.push(`${sh.id}.jpg`);
  BY_LINE.set(sh.line, list);
}

type Slide = { src: string; a: number; b: number };
const SLIDES: Slide[] = [];
for (const id of ORDER) {
  const imgs = BY_LINE.get(id) ?? [];
  const w = T.WIN[id];
  const n = Math.max(1, imgs.length);
  for (let i = 0; i < n; i++) {
    SLIDES.push({
      src: imgs[i] ?? (imgs[imgs.length - 1] ?? "hook-1.jpg"),
      a: w.s + Math.round((w.d * i) / n),
      b: w.s + Math.round((w.d * (i + 1)) / n),
    });
  }
}
/* Кросфейд: наступний кадр починається на FADE раніше, ніж завершується попередній. */
for (let i = 1; i < SLIDES.length; i++) {
  SLIDES[i].a = Math.max(SLIDES[i - 1].a + 1, SLIDES[i].a - FADE);
}
const BODY_F = END_AT;
/* останній слайд не має тягнутися під фінальну картку */
if (SLIDES.length) SLIDES[SLIDES.length - 1].b = Math.min(SLIDES[SLIDES.length - 1].b, BODY_F);

/* Ken Burns: чотири чергуються наїзди/повороти; scale≥1.05 тримає краї в кадрі. */
const kb = (i: number, p: number): React.CSSProperties => {
  const dir = i % 4;
  const ease = p * p * (3 - 2 * p); // smoothstep
  if (dir === 0) return { transform: `scale(${1.02 + 0.08 * ease})` };
  if (dir === 1) return { transform: `scale(${1.10 - 0.08 * ease})` };
  if (dir === 2) return { transform: `scale(1.08) translate(${(-2.2 + 4.4 * ease).toFixed(2)}%, ${(-1 + 2 * ease).toFixed(2)}%)` };
  return { transform: `scale(1.08) translate(${(2.2 - 4.4 * ease).toFixed(2)}%, ${(1 - 2 * ease).toFixed(2)}%)` };
};

const SlideImg: React.FC<{ src: string; dur: number; idx: number }> = ({ src, dur, idx }) => {
  const f = useCurrentFrame();
  const p = dur <= 1 ? 1 : f / (dur - 1);
  const op = idx === 0 ? 1 : interpolate(f, [0, FADE], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: B.night, overflow: "hidden" }}>
      <Img
        src={staticFile(`${IMG_DIR}/${src}`)}
        style={{ width: "100%", height: "100%", objectFit: "cover", ...kb(idx, p), opacity: op }}
      />
    </AbsoluteFill>
  );
};

/* ── Бейджі років/подій (at — кадр слова, T.af) ── */
const OVL: Partial<Record<string, React.ReactNode>> = {
  s1: <Badge at={T.af("s1", "Фалес")} name="600 ДО Н.Е." note="Фалес натер бурштин шерстю" y={150} />,
  s2: <Badge at={T.af("s2", "Гільберт")} name="XVII СТОЛІТТЯ" note="Гільберт: електрика — сила природи" y={150} />,
  s3: <Badge at={T.af("s3", "Франклін")} name="1752" note="змійка з ключем: блискавка — це електрика" y={150} />,
  s5: <Badge at={T.af("s5", "батарею")} name="1800" note="Вольт: перша батарея світу" y={150} />,
  s6: <Badge at={T.af("s6", "Фарадей")} name="1831" note="магніт у котушці — і з'явився струм" y={150} />,
  s8: <Badge at={T.af("s8", "Едісон")} name="1879" note="лампа розжарювання світиться досі" y={150} />,
  s9: <Badge at={T.af("s9", "війна")} name="ВІЙНА СТРУМІВ" note="Едісон проти Тесли: постійний проти змінного" y={150} />,
  s10: <Badge at={T.af("s10", "Чикаго")} name="1893–1896" note="Чикаго, Ніагара, Баффало — перемога змінного" y={150} />,
};

/* Обкладинка: ілюстрація-фон + 1–2 слова (предмет із назви — електроенергія). */
const COVER_F = 8;
const COVER_SRC = "hook-2.jpg";
const fitCover = (text: string, maxW: number, max: number) =>
  Math.min(
    max,
    Math.floor((0.92 * maxW) / (measureText({ text, fontFamily: FONT.sans, fontWeight: "900", fontSize: 100, letterSpacing: "-0.05em" }).width / 100)),
  );
const ElectricCover: React.FC = () => {
  const { width: W } = useVideoConfig();
  const maxW = W - 120;
  return (
    <AbsoluteFill style={{ background: B.night, overflow: "hidden" }}>
      <Img src={staticFile(`${IMG_DIR}/${COVER_SRC}`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.06)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.7) 0%, rgba(0,0,0,.28) 46%, rgba(0,0,0,.78) 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, transparent 38%, rgba(0,0,0,.6) 100%)" }} />
      <Tag tone="night" channel={S.channel} series={S.series} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 60px", textAlign: "center" }}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: fitCover("ЕЛЕКТРОЕНЕРГІЯ", maxW, 138), letterSpacing: "-0.01em", lineHeight: 0.95, color: B.white, textShadow: "0 8px 30px rgba(0,0,0,.65)" }}>
          ЕЛЕКТРОЕНЕРГІЯ
        </div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: fitCover("ВІД ІСКРИ ДО МЕРЕЖІ", maxW, 86), letterSpacing: "-0.005em", lineHeight: 1.05, color: B.red, textShadow: "0 8px 30px rgba(0,0,0,.5)", marginTop: 26 }}>
          ВІД ІСКРИ ДО МЕРЕЖІ
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* Смуга прогресу (лише 16:9). */
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

export const ELECTRIC_F = COVER_F + BODY_F + TAIL;

const ElectricBody: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const bgm = (fr: number) =>
    interpolate(fr, [0, 30, ELECTRIC_F - 60, ELECTRIC_F - 10], [0, 0.08, 0.08, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: B.night }}>
      <Audio src={staticFile(`${AUDIO_DIR}/bgm.mp3`)} loop volume={bgm} />

      {SLIDES.map((s, i) => (
        <Sequence key={`img-${i}`} from={s.a} durationInFrames={s.b - s.a} name={`img-${i}`}>
          <SlideImg src={s.src} dur={s.b - s.a} idx={i} />
        </Sequence>
      ))}

      {ORDER.map((id) => (
        <Sequence key={`c-${id}`} from={T.WIN[id].s} durationInFrames={T.WIN[id].d} name={`cap-${id}`}>
          <Captions items={T.captions(id)} tone="night" top={capsTopFor(width, height)} size={58} />
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

export const ElectricVideo: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={COVER_F} name="cover">
      <ElectricCover />
    </Sequence>
    <Sequence from={COVER_F} name="body">
      <ElectricBody />
    </Sequence>
  </AbsoluteFill>
);
