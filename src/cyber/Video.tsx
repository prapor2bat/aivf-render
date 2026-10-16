import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Avatar, Captions, Cut, EndCard, Iris, RedWipe, Sfx, Stage, ez } from "../brand/kit";
import { BigStat, Chip, Stamp } from "../brand/parts";
import { B, BOX, FONT, H, isDark, Tone, W } from "../brand/tokens";
import { COVER_F, withCover } from "../brand/cover";
import { af, captions, LEAD_F, ORDER, SceneId, TOTAL_F, WIN, wf } from "./timeline";

/* Демо-ролик ніші «Кібербезпека й приватність». Вертикаль 9:16, 30 fps. */
export const CYBER_F = TOTAL_F + COVER_F;

const TONE: Record<SceneId, Tone> = { hook: "paper", m1: "night", m2: "paper", m3: "blush", m4: "night", m5: "paper", cta: "paper" };
const sceneAt = (f: number): SceneId => { let c: SceneId = "hook"; for (const id of ORDER) if (f >= WIN[id].s) c = id; return c; };

const Beat: React.FC<{ from: number; to?: number; children: React.ReactNode }> = ({ from, to = 99999, children }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  const o = interpolate(f, [to - 6, to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={o < 1 ? { opacity: o, filter: 1 - o > 0.004 ? `blur(${(1 - o) * 8}px)` : undefined } : undefined}>{children}</AbsoluteFill>;
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

type Stk = { src: string; word: string; x: number; y: number; w: number; seed?: number; rot?: number };
const Habit: React.FC<{ id: SceneId; ord: string; n: string; note: string; noteWord: string; fix: string; fixWord: string; fixIcon: string; stickers: Stk[]; arc?: number | false }> =
  ({ id, ord, n, note, noteWord, fix, fixWord, fixIcon, stickers, arc = false }) => (
    <Scene id={id} arc={arc}>
      {stickers.map((s, i) => <Cut key={i} src={s.src} at={wf(id, s.word)} x={s.x} y={s.y} w={s.w} seed={s.seed ?? i} rot={s.rot ?? (i % 2 ? 6 : -6)} />)}
      <Stamp text={`ПОМИЛКА ${n}`} at={wf(id, ord)} x={W / 2} y={600} />
      <Chip text={fix} icon={fixIcon} at={wf(id, fixWord)} y={706} red />
      <Note text={note} at={wf(id, noteWord)} y={858} tone={TONE[id]} />
    </Scene>
  );

export const CyberVideo: React.FC = () => {
  const f = useCurrentFrame();
  const hookB = wf("hook", "пять");

  return (
    <AbsoluteFill style={{ background: B.paper }}>
      {/* ── ХУК ── */}
      <Scene id="hook" arc={0}>
        <Beat from={0} to={hookB}>
          <Avatar pose="skeptical" at={3} tone="paper" h={540} x={W / 2 + 40} disk />
          <Cut src="assets/fl-warning.png" at={wf("hook", "зламати")} x={170} y={470} w={170} rot={-8} />
          <Chip text="а ти впевнений?" at={wf("hook", "тебе")} y={700} />
        </Beat>
        <Beat from={hookB}>
          <BigStat n="5" label="звичок безпеки" at={hookB} x={W / 2} y={410} tone="paper" />
          <Cut src="assets/fl-shield.png" at={wf("hook", "пять", 0, 10)} x={W / 2} y={780} w={150} seed={2} />
        </Beat>
      </Scene>

      <Habit id="m1" ord="перше" n="1" note="одна база — і всі акаунти відкриті" noteWord="базу"
        fix="свій пароль на кожен сайт" fixWord="пароль" fixIcon="assets/fl-locked_with_key.png"
        stickers={[{ src: "assets/fl-key.png", word: "пароль", x: 300, y: 400, w: 150 }, { src: "assets/fl-globe_with_meridians.png", word: "сайти", x: 520, y: 450, w: 130, seed: 2 }]} />

      <Habit id="m2" ord="друге" n="2" note="справжня підтримка код не питає" noteWord="дзвінка"
        fix="код не диктуй нікому" fixWord="код" fixIcon="assets/fl-locked.png"
        stickers={[{ src: "assets/fl-mobile_phone.png", word: "код", x: 300, y: 400, w: 150 }, { src: "assets/fl-loudspeaker.png", word: "дзвінка", x: 520, y: 450, w: 130, seed: 2 }]} />

      <Habit id="m3" ord="третє" n="3" note="у відкритій мережі видно все" noteWord="мережі" arc={0}
        fix="увімкни захисний тунель" fixWord="тунель" fixIcon="assets/fl-shield.png"
        stickers={[{ src: "assets/fl-antenna_bars.png", word: "вайфай", x: 300, y: 400, w: 150 }, { src: "assets/fl-eyes.png", word: "мережі", x: 520, y: 450, w: 130, seed: 2 }]} />

      <Habit id="m4" ord="четверте" n="4" note="фішинг копіює сайт до літери" noteWord="фішинг"
        fix="перевір адресу посилання" fixWord="адресу" fixIcon="assets/fl-magnifying_glass_tilted_left.png"
        stickers={[{ src: "assets/fl-envelope_with_arrow.png", word: "посиланням", x: 300, y: 400, w: 150 }, { src: "assets/fl-magnifying_glass_tilted_left.png", word: "адресу", x: 520, y: 450, w: 130, seed: 2 }]} />

      <Habit id="m5" ord="пяте" n="5" note="оновлення закриває дірки" noteWord="дірки" arc={0}
        fix="увімкни автооновлення" fixWord="автоматичні" fixIcon="assets/fl-counterclockwise_arrows_button.png"
        stickers={[{ src: "assets/fl-counterclockwise_arrows_button.png", word: "оновлення", x: 300, y: 400, w: 150 }, { src: "assets/fl-warning.png", word: "дірки", x: 520, y: 450, w: 130, seed: 2 }]} />

      {/* ── CTA ── */}
      <Scene id="cta" caps={false} push={0.03} arc={0}>
        <EndCard at={LEAD_F} code="ЗАХИСТ" line="який захист уже стоїть у тебе?" />
      </Scene>

      {/* переходи */}
      <RedWipe at={WIN.m1.s} />
      <Iris at={WIN.m2.s} x={W / 2} y={H * 0.3} />
      <RedWipe at={WIN.m3.s} />
      <Iris at={WIN.m4.s} />
      <RedWipe at={WIN.m5.s} />
      <Iris at={WIN.cta.s} />

      {ORDER.map((id) => <Sequence key={id} from={WIN[id].s + LEAD_F} layout="none"><Audio src={staticFile(`audio05/${id}.mp3`)} /></Sequence>)}
      <Audio src={staticFile("audio05/bgm.mp3")} volume={(fr) => interpolate(fr, [0, 20, CYBER_F - 50, CYBER_F - 10], [0, 0.08, 0.08, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <Sounds />
    </AbsoluteFill>
  );
};

const Sounds: React.FC = () => {
  const myth: { id: SceneId; n: string; fix: string }[] = [
    { id: "m1", n: "перше", fix: "пароль" }, { id: "m2", n: "друге", fix: "код" }, { id: "m3", n: "третє", fix: "тунель" },
    { id: "m4", n: "четверте", fix: "адресу" }, { id: "m5", n: "пяте", fix: "автоматичні" },
  ];
  return (
    <>
      <Sfx k="p27" at={af("hook", "дані")} vol={0.2} />
      <Sfx k="p28" at={af("hook", "зламати")} vol={0.18} />
      <Sfx k="i18" at={af("hook", "пять")} vol={0.45} />
      {myth.map(({ id, n, fix }) => (
        <React.Fragment key={id}>
          <Sfx k="k48" at={WIN[id].s} vol={0.28} />
          <Sfx k="g38" at={af(id, n)} vol={0.26} />
          <Sfx k="p28" at={af(id, fix)} vol={0.26} />
        </React.Fragment>
      ))}
      <Sfx k="k48" at={WIN.cta.s} vol={0.32} />
      <Sfx k="d40" at={af("cta", "підпишись")} vol={0.3} />
    </>
  );
};

export const CyberComposition = withCover(CyberVideo, {
  top: "5 ЗВИЧОК", bottom: "БЕЗПЕКИ", tone: "night", pose: "shock", obj: "assets/fl-shield.png", badge: "КІБЕРБЕЗПЕКА",
});
