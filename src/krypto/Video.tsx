import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Captions, Cut, EndCard, Iris, RedWipe, Sfx, Stage, ez } from "../brand/kit";
import { BigStat, Chip, Stamp } from "../brand/parts";
import { B, BOX, FONT, H, isDark, Tone, W } from "../brand/tokens";
import { COVER_F, withCover } from "../brand/cover";
import { af, captions, LEAD_F, ORDER, SceneId, TOTAL_F, WIN, wf } from "./timeline";

export const KRYPTO_F = TOTAL_F;
export const KRYPTO_TOTAL_F = TOTAL_F + COVER_F;

const TONE: Record<SceneId, Tone> = { hook: "paper", m1: "night", m2: "paper", m3: "blush", m4: "night", m5: "paper", cta: "paper" };
const sceneAt = (f: number): SceneId => { let c: SceneId = "hook"; for (const id of ORDER) if (f >= WIN[id].s) c = id; return c; };

const Beat: React.FC<{ from: number; to?: number; children: React.ReactNode }> = ({ from, to = 99999, children }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  const o = interpolate(f, [to - 6, to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o, filter: 1 - o > 0.004 ? `blur(${(1 - o) * 8}px)` : undefined }}>{children}</AbsoluteFill>;
};

const Scene: React.FC<{ id: SceneId; children?: React.ReactNode; push?: number; arc?: number | false; caps?: boolean }> = ({ id, children, push, arc = false, caps = true }) => (
  <Sequence from={WIN[id].s} durationInFrames={WIN[id].d}>
    <Stage tone={TONE[id]} dur={WIN[id].d} push={push} arc={arc}>{children}</Stage>
    {caps && <Captions items={captions(id)} tone={TONE[id]} />}
  </Sequence>
);

const Note: React.FC<{ text: string; at: number; y: number; tone: Tone }> = ({ text, at, y, tone }) => {
  const f = useCurrentFrame();
  return <div style={{ position: "absolute", left: BOX.x, width: BOX.w, top: y, textAlign: "center", fontFamily: FONT.serif, fontStyle: "italic", fontSize: 30,
    color: isDark(tone) ? "rgba(255,255,255,.72)" : B.gray, opacity: ez(f, at, at + 8, [0, 1]) }}>{text}</div>;
};

/* ── Міф: штамп, стікери-ілюстрація і рядок правди ─────────────────── */
type Sticker = { src: string; word: string; x: number; y: number; w: number; seed?: number; rot?: number };
const Myth: React.FC<{ id: SceneId; n: string; note: string; noteWord: string; stickers: Sticker[]; arc?: number | false }> =
  ({ id, n, note, noteWord, stickers, arc = false }) => (
    <Scene id={id} arc={arc}>
      {stickers.map((s, i) => <Cut key={i} src={s.src} at={wf(id, s.word)} x={s.x} y={s.y} w={s.w} seed={s.seed ?? i} rot={s.rot ?? (i % 2 ? 6 : -6)} />)}
      <Stamp text={`МІФ ${n}`} at={wf(id, "Міф")} x={W / 2} y={610} />
      <Note text={note} at={wf(id, noteWord)} y={820} tone={TONE[id]} />
    </Scene>
  );

export const KryptoVideo: React.FC = () => {
  const f = useCurrentFrame();
  const cur = sceneAt(f);
  const hookB = wf("hook", "пять");

  return (
    <AbsoluteFill style={{ background: B.paper }}>
      {/* ── ХУК ── */}
      <Scene id="hook" arc={0}>
        <Beat from={0} to={hookB}>
          <Cut src="assets/fl-coin.png" at={wf("hook", "криптовалюта")} x={W / 2} y={480} w={190} />
          <Chip text="складно й небезпечно?" at={wf("hook", "небезпечною")} y={702} />
        </Beat>
        <Beat from={hookB}>
          <BigStat n="5" label="міфів про крипту" at={hookB} x={W / 2} y={420} tone="paper" />
          <Cut src="assets/fl-money_with_wings.png" at={wf("hook", "забути")} x={W / 2} y={770} w={150} seed={2} />
        </Beat>
      </Scene>

      <Myth id="m1" n="1" note="обманюють люди, а не код" noteWord="технологія"
        stickers={[{ src: "assets/fl-warning.png", word: "шахрайство", x: 360, y: 430, w: 150 }]} />

      <Myth id="m2" n="2" note="блокчейн публічний — видно все" noteWord="блокчейн"
        stickers={[{ src: "assets/fl-magnifying_glass_tilted_left.png", word: "анонімно", x: 300, y: 420, w: 150 }, { src: "assets/fl-globe_with_meridians.png", word: "назавжди", x: 520, y: 470, w: 130, seed: 2 }]} />

      <Myth id="m3" n="3" note="гроші теж не привʼязані до золота" noteWord="золота" arc={0}
        stickers={[{ src: "assets/fl-gem_stone.png", word: "підкріплена", x: 300, y: 430, w: 150 }, { src: "assets/fl-heavy_dollar_sign.png", word: "гроші", x: 520, y: 470, w: 140, seed: 2 }]} />

      <Myth id="m4" n="4" note="ринок хитає — багато хто втрачає" noteWord="ринок"
        stickers={[{ src: "assets/fl-chart_increasing.png", word: "розбагатіти", x: 300, y: 420, w: 150 }, { src: "assets/fl-slot_machine.png", word: "день", x: 520, y: 470, w: 130, seed: 2 }]} />

      <Myth id="m5" n="5" note="працює понад 15 років" noteWord="працює" arc={0}
        stickers={[{ src: "assets/fl-prohibited.png", word: "заборонять", x: 300, y: 420, w: 150 }, { src: "assets/fl-rocket.png", word: "пятнадцять", x: 520, y: 470, w: 130, seed: 2 }]} />

      {/* ── CTA ── */}
      <Scene id="cta" caps={false} push={0.03} arc={0}>
        <EndCard at={LEAD_F} line="який міф здивував найбільше?" />
      </Scene>

      {/* переходи */}
      <RedWipe at={WIN.m1.s} />
      <Iris at={WIN.m2.s} x={W / 2} y={H * 0.3} />
      <RedWipe at={WIN.m3.s} />
      <Iris at={WIN.m4.s} />
      <RedWipe at={WIN.m5.s} />
      <Iris at={WIN.cta.s} />

      {ORDER.map((id) => <Sequence key={id} from={WIN[id].s + LEAD_F} layout="none"><Audio src={staticFile(`audio01/${id}.mp3`)} /></Sequence>)}
      <Sounds />
    </AbsoluteFill>
  );
};

const Sounds: React.FC = () => {
  const myth: SceneId[] = ["m1", "m2", "m3", "m4", "m5"];
  return (
    <>
      <Sfx k="i18" at={af("hook", "пять")} vol={0.5} />
      <Sfx k="p27" at={af("hook", "забути")} vol={0.22} />
      {myth.map((id) => (
        <React.Fragment key={id}>
          <Sfx k="k48" at={WIN[id].s} vol={0.3} />
          <Sfx k="g38" at={af(id, "Міф")} vol={0.3} />
          <Sfx k="p28" at={af(id, "Насправді")} vol={0.26} />
        </React.Fragment>
      ))}
      <Sfx k="k48" at={WIN.cta.s} vol={0.32} />
      <Sfx k="d40" at={af("cta", "збережи")} vol={0.3} />
    </>
  );
};

/* Обкладинка на початку (COVER_F кадрів) + ролик. */
export const KryptoComposition = withCover(KryptoVideo, {
  top: "5 МІФІВ", bottom: "ПРО КРИПТУ", tone: "night", pose: "shock", obj: "assets/fl-coin.png", badge: "КРИПТА",
});
