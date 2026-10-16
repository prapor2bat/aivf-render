import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { measureText } from "@remotion/layout-utils";
import { B, FONT } from "../brand/tokens";
import { CHANNEL } from "../brand/config";

/* ═══ АНІМОВАНІ КАРУСЕЛІ Instagram (з 29.09.2026) — рушій ═══
   Карусель = ОДНА панорама шириною N×1080 (кожен слайд 1080×1350, 4:5). Слайд i рендерить вікно панорами [i·1080, (i+1)·1080].
   Тому все, що перетинає стик між слайдами, при гортанні продовжується без шва.
   ЗАКОНИ:
   1. Кожен слайд — окреме відео (DUR кадрів, ≥ 3 с — мінімум Instagram), починається з 0 у момент показу.
   2. Те, що ПЕРЕТИНАЄ стик (лінія, стрічка, обʼєкт навпіл) — СТАТИЧНЕ (<Seam>), бо сусідні слайди стартують у різний час.
   3. Вхід елементів — перші ~1.5 с (<In>), далі — «живе» тихе дихання (<Idle>), щоб відео не виглядало фото.
   4. PNG-версія слайда = кадр STILL (усе вже увійшло) — для статичного варіанту й обкладинки.
   6. ОБКЛАДИНКА (слайд 1) ВИДНА З КАДРУ 0: Instagram бере перший кадр відео як прев'ю в стрічці й у сітці — заголовок
      обкладинки без входу (a={-1} = статично), рух лише на другорядному (підказка «гортай», акцент).
   5. Обкладинка (слайд 1): важливе в центрі 1012 px (сітка профілю ріже 4:5 до 3:4). Текст ≥ 38 px, заголовки 96–150 px. */
export const SW = 1080, SH = 1350, FPS = 30, DUR = 180, STILL = 165;
export const INK = B.ink, RED = B.red, PAPER = B.paper, NIGHT = "#0B0B0D", GREEN = "#1E9E5A";
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
export const ease = (x: number) => { const t = Math.min(1, Math.max(0, x)); return 1 - Math.pow(1 - t, 3); };
/** X(слайд, x) — глобальна координата панорами */
export const X = (i: number, x: number) => i * SW + x;

export type CarouselDef = { id: string; title: string; n: number; Pano: React.FC; bg?: (i: number) => string };

/** слайд = вікно панорами */
export const Slide: React.FC<{ car: CarouselDef; i: number }> = ({ car, i }) => (
  <AbsoluteFill style={{ background: car.bg ? car.bg(i) : PAPER, overflow: "hidden" }}>
    <div style={{ position: "absolute", left: -i * SW, top: 0, width: car.n * SW, height: SH }}><car.Pano /></div>
  </AbsoluteFill>
);

/** фон-смуги панорами: колір на кожен слайд + сітка (сітка безшовна) */
export const Bands: React.FC<{ colors: string[]; grid?: boolean }> = ({ colors, grid = true }) => <>
  {colors.map((c, i) => <div key={i} style={{ position: "absolute", left: i * SW, top: 0, width: SW, height: SH, background: c }} />)}
  {grid && colors.map((c, i) => { const l = c === PAPER || c === "#FFFFFF" ? "rgba(13,13,13,.05)" : "rgba(255,255,255,.05)"; return <div key={"g" + i} style={{ position: "absolute", left: i * SW, top: 0, width: SW, height: SH, backgroundImage: `linear-gradient(${l} 1px, transparent 1px), linear-gradient(90deg, ${l} 1px, transparent 1px)`, backgroundSize: "54px 54px" }} />; })}
</>;

/** вхід: з розмиття, знизу/збоку, пружина; a — кадр старту */
export const In: React.FC<{ a?: number; from?: "up" | "down" | "left" | "right" | "zoom" | "blur"; dist?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ a = 0, from = "up", dist = 60, children, style }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  if (a < 0) return <div style={style}>{children}</div>; // статично з кадру 0 (обкладинка)
  const p = f < a ? 0 : spring({ frame: f - a, fps, config: { damping: 14, stiffness: 150, mass: 0.8 } });
  const d = (1 - p) * dist;
  const tr = from === "up" ? `translateY(${d}px)` : from === "down" ? `translateY(${-d}px)` : from === "left" ? `translateX(${-d}px)` : from === "right" ? `translateX(${d}px)` : from === "zoom" ? `scale(${0.6 + 0.4 * p})` : "";
  return <div style={{ ...style, transform: `${style?.transform ?? ""} ${tr}`, opacity: Math.min(1, p * 1.6), filter: p < 0.985 ? `blur(${(1 - p) * 12}px)` : undefined }}>{children}</div>;
};
/** тихе «дихання» після входу — відео живе, але не смикається */
export const Idle: React.FC<{ amp?: number; speed?: number; seed?: number; rot?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ amp = 6, speed = 1, seed = 0, rot = 0, children, style }) => {
  const f = useCurrentFrame(); const t = (f + seed * 23) / 30 * speed;
  return <div style={{ ...style, transform: `${style?.transform ?? ""} translateY(${Math.sin(t * 1.6) * amp}px) rotate(${Math.sin(t * 1.1) * rot}deg)` }}>{children}</div>;
};
/** статичний шар, що перетинає стики — без анімації (закон 2) */
export const Seam: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

/** текст: автопідгін під ширину, акцент {червоним} через *…* */
export const fit = (t: string, maxW: number, max: number, weight = "900", serif = false) => Math.min(max, Math.floor(maxW / (measureText({ text: t, fontFamily: serif ? FONT.serif : FONT.sans, fontWeight: weight, fontSize: 100, letterSpacing: serif ? "0" : "-0.045em" }).width / 100)));
const rich = (t: string, accent: string) => t.split(/(\*[^*]+\*)/g).map((p, k) => p.startsWith("*") ? <span key={k} style={{ color: accent }}>{p.slice(1, -1)}</span> : <React.Fragment key={k}>{p}</React.Fragment>);
export const Head: React.FC<{ x: number; y: number; lines: string[]; size?: number; w?: number; color?: string; accent?: string; a?: number; step?: number; align?: "left" | "center" }> = ({ x, y, lines, size = 120, w = 920, color = INK, accent = RED, a = 0, step = 5, align = "left" }) => {
  const sz = Math.min(...lines.map((l) => fit(l.replace(/\*/g, ""), w, size)));
  return <div style={{ position: "absolute", left: x, top: y, width: w, textAlign: align }}>
    {lines.map((l, k) => <In key={k} a={a < 0 ? -1 : a + k * step} from="up" dist={50}><div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: sz, lineHeight: 0.98, letterSpacing: "-0.045em", wordSpacing: "0.12em", color, whiteSpace: "nowrap" }}>{rich(l, accent)}</div></In>)}
  </div>;
};
export const Serif: React.FC<{ x: number; y: number; t: string; size?: number; w?: number; color?: string; a?: number; align?: "left" | "center" }> = ({ x, y, t, size = 54, w = 920, color = INK, a = 0, align = "left" }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, textAlign: align }}><In a={a} from="up" dist={30}><div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 600, fontSize: Math.min(size, fit(t, w, size, "600", true)), color, lineHeight: 1.1 }}>{t}</div></In></div>
);
export const Body: React.FC<{ x: number; y: number; t: string; size?: number; w?: number; color?: string; a?: number; accent?: string }> = ({ x, y, t, size = 44, w = 900, color = INK, a = 0, accent = RED }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w }}><In a={a} from="up" dist={24}><div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: size, lineHeight: 1.28, color, letterSpacing: "-0.01em" }}>{rich(t, accent)}</div></In></div>
);
export const Chip: React.FC<{ t: string; bg?: string; color?: string; size?: number; icon?: React.ReactNode }> = ({ t, bg = INK, color = "#fff", size = 40, icon }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: bg, color, borderRadius: 999, padding: `${size * 0.3}px ${size * 0.62}px`, fontFamily: FONT.sans, fontWeight: 900, fontSize: size, letterSpacing: "-0.03em", whiteSpace: "nowrap", boxShadow: "0 16px 30px -16px rgba(0,0,0,.5)" }}>{icon}{t}</div>
);
/** номер слайда «2/8» + бирка бренду */
export const Corner: React.FC<{ i: number; n: number; dark?: boolean }> = ({ i, n, dark }) => {
  const c = dark ? "rgba(255,255,255,.85)" : INK;
  return <>
    <div style={{ position: "absolute", left: X(i, 70), top: 64, display: "flex", alignItems: "center", gap: 12, fontFamily: FONT.sans, fontWeight: 800, fontSize: 22, letterSpacing: 2, color: c }}>
      <div style={{ width: 14, height: 14, borderRadius: 7, background: RED }} />{CHANNEL}</div>
    <div style={{ position: "absolute", left: X(i, 1080 - 70 - 120), width: 120, top: 58, textAlign: "right", fontFamily: FONT.sans, fontWeight: 900, fontSize: 30, color: c, fontVariantNumeric: "tabular-nums" }}>{i + 1}<span style={{ opacity: 0.45 }}>/{n}</span></div>
  </>;
};
/** підказка «гортай →», що пульсує */
export const Swipe: React.FC<{ i: number; dark?: boolean; t?: string }> = ({ i, dark, t = "гортай" }) => {
  const f = useCurrentFrame(); const k = Math.sin(f / 7) * 10;
  return <div style={{ position: "absolute", left: X(i, 1080 - 70 - 260), width: 260, top: 1350 - 120, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 14, fontFamily: FONT.sans, fontWeight: 900, fontSize: 34, color: dark ? "#fff" : INK, opacity: ease((f - 30) / 12) }}>
    {t}<svg width={70} height={34} style={{ transform: `translateX(${k}px)` }}><path d="M2 17 H62 M46 3 L64 17 L46 31" stroke={RED} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></div>;
};
/** лічильник */
export const Count: React.FC<{ from: number; to: number; a?: number; dur?: number; size: number; color?: string; suffix?: string; prefix?: string }> = ({ from, to, a = 0, dur = 24, size, color = INK, suffix = "", prefix = "" }) => {
  const f = useCurrentFrame();
  const v = Math.round(interpolate(f, [a, a + dur], [from, to], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) }));
  return <span style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: size, letterSpacing: "-0.06em", color, lineHeight: 0.9, fontVariantNumeric: "tabular-nums" }}>{prefix}{v}{suffix}</span>;
};
/** Fluent 3D-стікер */
export const Fl: React.FC<{ n: string; s: number }> = ({ n, s }) => <Img src={staticFile(`assets/fl-${n}.png`)} style={{ width: s, height: s, objectFit: "contain", display: "block", filter: "drop-shadow(0 18px 24px rgba(0,0,0,.25))" }} />;
export const Abs: React.FC<{ x: number; y: number; children: React.ReactNode; center?: boolean; style?: React.CSSProperties }> = ({ x, y, children, center, style }) => <div style={{ position: "absolute", left: x, top: y, transform: center ? "translate(-50%,-50%)" : undefined, ...style }}>{children}</div>;
