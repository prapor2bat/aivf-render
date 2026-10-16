import React from "react";
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";
import { ez } from "../brand/kit";
import { LogoTile } from "../brand/parts";
import { B, FONT } from "../brand/tokens";

/* Спільні деталі міні-курсу «Нейронки з нуля» (16:9, 1280×720). Контент — з y ≥ 120 (бирка зліва вгорі). */
export const COURSE = { name: "Нейронки з нуля", total: 7 };
export const RED = "#FF3B45";
export type WF = (kw: string, n?: number, off?: number) => number;

export const useSp = (at: number, damping = 13, stiffness = 180) => { const f = useCurrentFrame(); return f < at ? 0 : spring({ frame: f - at, fps: 30, config: { damping, stiffness } }); };
export const Ico: React.FC<{ src: string; size?: number; style?: React.CSSProperties }> = ({ src, size = 90, style }) => <Img src={staticFile(src)} style={{ width: size, height: size, objectFit: "contain", flex: "none", ...style }} />;
export const Logo: React.FC<{ id: string; at: number; size?: number }> = ({ id, at, size = 90 }) => <div style={{ position: "relative", width: size, height: size, flex: "none" }}><LogoTile id={id as any} at={at} x={size / 2} y={size / 2} size={size} /></div>;
export const Pill: React.FC<{ children: React.ReactNode; red?: boolean; ink?: boolean; ghost?: boolean; size?: number }> = ({ children, red, ink, ghost, size = 22 }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, background: red ? B.red : ink ? B.ink : ghost ? "rgba(255,255,255,.08)" : B.white, color: red || ink || ghost ? B.white : B.ink,
    border: ghost ? "1px solid rgba(255,255,255,.18)" : undefined, fontFamily: FONT.sans, fontWeight: 900, fontSize: size, letterSpacing: "-0.02em", whiteSpace: "nowrap", boxShadow: ghost ? undefined : "0 12px 24px -12px rgba(0,0,0,.45)" }}>{children}</span>
);
export const In: React.FC<{ at: number; children: React.ReactNode; y?: number; x?: number; to?: number; style?: React.CSSProperties }> = ({ at, children, y = 26, x = 0, to, style }) => {
  const f = useCurrentFrame(); const p = useSp(at, 13, 180);
  // до появи — невидимий, але займає своє місце (інакше сусіди в flex-ряду «стрибають»)
  if (f < at) return <div style={{ ...style, opacity: 0 }}>{children}</div>;
  if (to !== undefined && f >= to) return null;
  const o = to !== undefined ? interpolate(f, [to - 5, to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return <div style={{ opacity: Math.min(o, p * 1.4), transform: `translate(${(1 - p) * x}px, ${(1 - p) * y}px) scale(${0.88 + 0.12 * p})`, ...style }}>{children}</div>;
};
export const Abs: React.FC<{ x: number; y: number; w?: number; children: React.ReactNode; center?: boolean }> = ({ x, y, w, children, center }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, transform: center ? "translate(-50%, -50%)" : undefined }}>{children}</div>
);
export const Big: React.FC<{ at: number; children: React.ReactNode; size?: number; dark?: boolean; center?: boolean }> = ({ at, children, size = 56, dark, center }) => {
  const f = useCurrentFrame(); const p = ez(f, at, at + 9, [0, 1]);
  return <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: size, lineHeight: 0.98, letterSpacing: "-0.05em", color: dark ? B.white : B.ink, textAlign: center ? "center" : "left",
    opacity: p, transform: `translateY(${(1 - p) * 20}px)`, filter: 1 - p > 0.004 ? `blur(${(1 - p) * 10}px)` : undefined }}>{children}</div>;
};
export const Card: React.FC<{ children: React.ReactNode; w?: number | string; h?: number; dark?: boolean; pad?: number; red?: boolean; style?: React.CSSProperties }> = ({ children, w, h, dark, pad = 20, red, style }) => (
  <div style={{ width: w, height: h, padding: pad, boxSizing: "border-box", borderRadius: 20, background: dark ? "#141418" : B.white, border: red ? `3px solid ${B.red}` : dark ? "1px solid rgba(255,255,255,.09)" : "none",
    boxShadow: "0 26px 50px -26px rgba(0,0,0,.5)", fontFamily: FONT.sans, color: dark ? B.white : B.ink, ...style }}>{children}</div>
);
export const Typed: React.FC<{ at: number; text: string; cps?: number; caret?: boolean }> = ({ at, text, cps = 1.8, caret = true }) => {
  const f = useCurrentFrame(); const n = Math.max(0, Math.min(text.length, Math.floor((f - at) * cps)));
  return <>{text.slice(0, n)}{caret && n < text.length && <span style={{ color: B.red, opacity: Math.floor(f / 8) % 2 }}>|</span>}</>;
};
export const Stamp: React.FC<{ at: number; children: React.ReactNode; rot?: number; size?: number }> = ({ at, children, rot = -10, size = 46 }) => {
  const f = useCurrentFrame();
  const st = spring({ frame: f - at, fps: 30, config: { damping: 10, stiffness: 190 } });
  if (f < at) return null;
  return <div style={{ display: "inline-block", transform: `rotate(${rot}deg) scale(${2 - st})`, opacity: Math.min(1, st * 1.5), padding: "6px 20px", border: `6px solid ${B.red}`, borderRadius: 12,
    color: B.red, fontFamily: FONT.sans, fontWeight: 900, fontSize: size, letterSpacing: "0.03em", background: "rgba(255,255,255,.9)", whiteSpace: "nowrap" }}>{children}</div>;
};
export const Src: React.FC<{ at: number; children: React.ReactNode; dark?: boolean }> = ({ at, children, dark }) => {
  const f = useCurrentFrame();
  return <div style={{ position: "absolute", left: 96, right: 96, top: 655, textAlign: "center", fontFamily: FONT.sans, fontWeight: 600, fontSize: 15, color: dark ? "rgba(255,255,255,.5)" : "rgba(0,0,0,.45)", opacity: ez(f, at, at + 10, [0, 1]) }}>джерело: {children}</div>;
};
/** плашка уроку праворуч угорі: «УРОК 1/7 · Нейронки з нуля» */
export const LessonBadge: React.FC<{ n: number; dark?: boolean }> = ({ n, dark }) => (
  <div style={{ position: "absolute", right: 96, top: 66, display: "flex", alignItems: "center", gap: 10, fontFamily: FONT.sans, fontWeight: 800, fontSize: 17, color: dark ? "rgba(255,255,255,.75)" : "rgba(0,0,0,.6)" }}>
    <span style={{ padding: "4px 10px", borderRadius: 999, background: B.red, color: B.white, fontWeight: 900 }}>УРОК {n}/{COURSE.total}</span>{COURSE.name}
  </div>
);
/** мокап чату: повідомлення з'являються за кадрами */
export type ChatMsg = { at: number; me?: boolean; text: string; typed?: boolean };
export const ChatBox: React.FC<{ msgs: ChatMsg[]; w: number; h?: number; title?: string; logo?: string; dark?: boolean }> = ({ msgs, w, h = 380, title = "Чат з нейронкою", logo, dark }) => {
  const f = useCurrentFrame();
  return (
    <Card w={w} h={h} pad={0} dark={dark} style={{ overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: `1px solid ${dark ? "rgba(255,255,255,.08)" : "#EEE"}` }}>
        {logo ? <Logo id={logo} at={0} size={28} /> : <Ico src="assets/fl-robot.png" size={26} />}<div style={{ fontWeight: 800, fontSize: 18, color: dark ? "rgba(255,255,255,.7)" : "#555" }}>{title}</div>
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.filter((m) => f >= m.at).map((m) => {
          const p = ez(f, m.at, m.at + 8, [0, 1]);
          return <div key={m.at + m.text} style={{ alignSelf: m.me ? "flex-end" : "flex-start", maxWidth: "86%", padding: "10px 14px", borderRadius: 14, fontSize: 20, fontWeight: m.me ? 700 : 600, lineHeight: 1.3,
            background: m.me ? B.ink : dark ? "#23232A" : "#F3F1EC", color: m.me ? B.white : dark ? B.white : B.ink, opacity: p, transform: `translateY(${(1 - p) * 10}px)` }}>{m.typed ? <Typed at={m.at} text={m.text} cps={2.2} /> : m.text}</div>;
        })}
      </div>
    </Card>
  );
};
export const Num: React.FC<{ n: number; red?: boolean }> = ({ n, red = true }) => (
  <span style={{ width: 44, height: 44, borderRadius: 44, flex: "none", background: red ? B.red : B.ink, color: B.white, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.sans, fontWeight: 900, fontSize: 24 }}>{n}</span>
);
export const Bar: React.FC<{ at: number; label: string; v: number; hot?: boolean; dark?: boolean }> = ({ at, label, v, hot, dark }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [at, at + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: FONT.sans, opacity: f < at ? 0.2 : 1 }}>
    <div style={{ width: 170, fontWeight: 900, fontSize: 24, color: hot ? RED : dark ? B.white : B.ink }}>{label}</div>
    <div style={{ flex: 1, height: 20, borderRadius: 20, background: dark ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.08)" }}><div style={{ width: `${v * p}%`, height: "100%", borderRadius: 20, background: hot ? RED : dark ? "rgba(255,255,255,.7)" : B.ink }} /></div>
    <div style={{ width: 60, textAlign: "right", fontWeight: 900, fontSize: 22, color: hot ? RED : dark ? B.white : B.ink }}>{Math.round(v * p)}%</div>
  </div>;
};
