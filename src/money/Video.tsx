import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Avatar, Captions, Cut, EndCard, Iris, RedWipe, Sfx, Stage, ez } from "../brand/kit";
import { BigStat, Chip, Stamp } from "../brand/parts";
import { B, BOX, FONT, H, isDark, Tone, W } from "../brand/tokens";
import { COVER_F, withCover } from "../brand/cover";
import { af, captions, LEAD_F, ORDER, SceneId, TOTAL_F, WIN, wf } from "./timeline";

/* Демо-ролик ніші «Особисті фінанси для молоді». Вертикаль 9:16, 30 fps. */
export const MONEY_F = TOTAL_F + COVER_F;

const TONE: Record<SceneId, Tone> = { hook: "paper", m1: "night", m2: "paper", m3: "blush", m4: "night", m5: "paper", cta: "paper" };

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
const Rule: React.FC<{ id: SceneId; ord: string; n: string; note: string; noteWord: string; fix: string; fixWord: string; fixIcon: string; stickers: Stk[]; arc?: number | false }> =
  ({ id, ord, n, note, noteWord, fix, fixWord, fixIcon, stickers, arc = false }) => (
    <Scene id={id} arc={arc}>
      {stickers.map((s, i) => <Cut key={i} src={s.src} at={wf(id, s.word)} x={s.x} y={s.y} w={s.w} seed={s.seed ?? i} rot={s.rot ?? (i % 2 ? 6 : -6)} />)}
      <Stamp text={`ПРАВИЛО ${n}`} at={wf(id, ord)} x={W / 2} y={600} />
      <Chip text={fix} icon={fixIcon} at={wf(id, fixWord)} y={706} red />
      <Note text={note} at={wf(id, noteWord)} y={858} tone={TONE[id]} />
    </Scene>
  );

export const MoneyVideo: React.FC = () => {
  const hookB = wf("hook", "пять");

  return (
    <AbsoluteFill style={{ background: B.paper }}>
      {/* ── ХУК ── */}
      <Scene id="hook" arc={1}>
        <Beat from={0} to={hookB}>
          <Avatar pose="think" at={3} tone="paper" h={540} x={W / 2 + 40} disk />
          <Cut src="assets/fl-money_with_wings.png" at={wf("hook", "зникає")} x={170} y={470} w={170} rot={-8} />
          <Chip text="а гроші все одно йдуть" at={wf("hook", "тиждень")} y={700} />
        </Beat>
        <Beat from={hookB}>
          <BigStat n="5" label="звичок про гроші" at={hookB} x={W / 2} y={410} tone="paper" />
          <Cut src="assets/fl-money_bag.png" at={wf("hook", "пять", 0, 10)} x={W / 2} y={780} w={150} seed={2} />
        </Beat>
      </Scene>

      <Rule id="m1" ord="перше" n="1" note="а не з залишку — з доходу" noteWord="залишку"
        fix="відкладай десяту частину" fixWord="десяту" fixIcon="assets/fl-seedling.png"
        stickers={[{ src: "assets/fl-seedling.png", word: "плати", x: 300, y: 400, w: 150 }, { src: "assets/fl-calendar.png", word: "доходу", x: 520, y: 450, w: 130, seed: 2 }]} />

      <Rule id="m2" ord="друге" n="2" note="потреби, бажання і запас" noteWord="потреби"
        fix="половина, тридцять, двадцять" fixWord="кошиків" fixIcon="assets/fl-bank.png"
        stickers={[{ src: "assets/fl-shopping_cart.png", word: "потреби", x: 230, y: 400, w: 130 }, { src: "assets/fl-shopping_bags.png", word: "бажання", x: 360, y: 460, w: 130, seed: 1 }, { src: "assets/fl-bank.png", word: "відкладай", x: 490, y: 400, w: 130, seed: 2 }]} />

      <Rule id="m3" ord="третє" n="3" note="не про прибуток — про спокій" noteWord="спокій" arc={0}
        fix="запас на три місяці життя" fixWord="три" fixIcon="assets/fl-shield.png"
        stickers={[{ src: "assets/fl-shield.png", word: "подушка", x: 300, y: 420, w: 160 }, { src: "assets/fl-calendar.png", word: "місяці", x: 520, y: 450, w: 130, seed: 2 }]} />

      <Rule id="m4" ord="четверте" n="4" note="головне — почати раніше" noteWord="раніше"
        fix="відсоток на відсоток" fixWord="відсоток" fixIcon="assets/fl-chart_increasing.png"
        stickers={[{ src: "assets/fl-chart_increasing.png", word: "відсоток", x: 230, y: 460, w: 130 }, { src: "assets/fl-repeat_button.png", word: "нараховується", x: 360, y: 400, w: 130, seed: 1 }, { src: "assets/fl-seedling.png", word: "ростуть", x: 490, y: 460, w: 130, seed: 2 }]} />

      <Rule id="m5" ord="пяте" n="5" note="а вже потім інвестуй" noteWord="інвестуй" arc={0}
        fix="спершу закрий відсотковий борг" fixWord="відсотковий" fixIcon="assets/fl-credit_card.png"
        stickers={[{ src: "assets/fl-credit_card.png", word: "борги", x: 300, y: 420, w: 150 }, { src: "assets/fl-chart_decreasing.png", word: "зїдає", x: 520, y: 450, w: 130, seed: 2 }]} />

      {/* ── CTA ── */}
      <Scene id="cta" caps={false} push={0.03} arc={0}>
        <EndCard at={LEAD_F} code="БЮДЖЕТ" line="яку звичку почнеш першою?" />
      </Scene>

      {/* переходи */}
      <RedWipe at={WIN.m1.s} />
      <Iris at={WIN.m2.s} x={W / 2} y={H * 0.3} />
      <RedWipe at={WIN.m3.s} />
      <Iris at={WIN.m4.s} />
      <RedWipe at={WIN.m5.s} />
      <Iris at={WIN.cta.s} />

      {ORDER.map((id) => <Sequence key={id} from={WIN[id].s + LEAD_F} layout="none"><Audio src={staticFile(`audio06/${id}.mp3`)} /></Sequence>)}
      <Audio src={staticFile("audio06/bgm.mp3")} volume={(fr) => interpolate(fr, [0, 20, MONEY_F - 50, MONEY_F - 10], [0, 0.08, 0.08, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <Sounds />
    </AbsoluteFill>
  );
};

const Sounds: React.FC = () => {
  const rules: { id: SceneId; n: string; fix: string }[] = [
    { id: "m1", n: "перше", fix: "десяту" }, { id: "m2", n: "друге", fix: "кошиків" }, { id: "m3", n: "третє", fix: "три" },
    { id: "m4", n: "четверте", fix: "відсоток" }, { id: "m5", n: "пяте", fix: "відсотковий" },
  ];
  return (
    <>
      <Sfx k="p27" at={af("hook", "зарплата")} vol={0.2} />
      <Sfx k="p28" at={af("hook", "зникає")} vol={0.18} />
      <Sfx k="i18" at={af("hook", "пять")} vol={0.45} />
      {rules.map(({ id, n, fix }) => (
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

export const MoneyComposition = withCover(MoneyVideo, {
  top: "3 КОШИКИ", bottom: "ГРОШЕЙ", tone: "night", pose: "thumbs", obj: "assets/fl-money_bag.png", badge: "ФІНАНСИ ДЛЯ МОЛОДІ",
});
