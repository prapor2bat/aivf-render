import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { B } from "../brand/tokens";

/* ─────────────────────────────────────────────────────────────────────────────
   Рух у кадрі для 019 «Як людство навчилося писати».
   Кожна сцена отримує власний шар руху ПОВЕРХ ілюстрації: чорнильні штрихи-
   росчерки самі себе малюють, письмена-частинки здіймаються, краплі чорнила
   падають, пил і дим пливуть, ореоли свічки й полумʼя пульсують, друкарські
   іскри скачуть, золоте світло заливає кадр. Усе на коді (без відеогенерації),
   детерміновано від кадру. Шари напівпрозорі — ілюстрація лишається читабельною.
   ───────────────────────────────────────────────────────────────────────────── */

type Rnd = (n: number) => number;
/** Детермінований псевдовипадок [0..1) за індексом. */
const rnd: Rnd = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ── Хмари/дим, що пливуть: 9 м'яких плям, різні швидкості й глибини ── */
export const DriftClouds: React.FC<{ count?: number; speed?: number; op?: number; tint?: string }> = ({
  count = 9,
  speed = 1,
  op = 0.14,
  tint = "#FFF6E2",
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const r1 = rnd(i + 1), r2 = rnd(i + 51), r3 = rnd(i + 101);
        const depth = 0.45 + r2 * 0.9;
        const w = 260 + r1 * 620;
        const h = w * (0.34 + r3 * 0.22);
        const y = -120 + r2 * 1000;
        const span = 2100;
        const x = ((r3 * span + f * speed * depth * 2.1) % span) - 400;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: w,
              height: h,
              borderRadius: "50%",
              background: tint,
              opacity: op * (0.55 + depth * 0.5),
              filter: `blur(${18 + depth * 26}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ── Легкі частинки/пил: підіймаються чи падають, мерехтять ── */
export const Motes: React.FC<{
  count?: number;
  color?: string;
  dir?: "up" | "down";
  speed?: number;
  size?: number;
  op?: number;
}> = ({ count = 46, color = "#FFD98A", dir = "up", speed = 1, size = 4, op = 0.7 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const r1 = rnd(i + 7), r2 = rnd(i + 63), r3 = rnd(i + 129), r4 = rnd(i + 211);
        const x = r1 * 1300;
        const span = 780;
        const p = ((r2 * span + f * speed * (0.5 + r3 * 1.6)) % span) / span;
        const y = dir === "up" ? 760 - p * span : -40 + p * span;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin((f * 0.06 + r4 * 6.28)));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin(f * 0.02 + i) * 22,
              top: y,
              width: size * (0.6 + r3),
              height: size * (0.6 + r3),
              borderRadius: "50%",
              background: color,
              opacity: op * tw,
              boxShadow: `0 0 ${size * 3}px ${color}`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ── Письмена: дрібні гліфи-символи, що повільно здіймаються й розчиняються ── */
export const Glyphs: React.FC<{ count?: number; color?: string; speed?: number; op?: number; size?: number }> = ({
  count = 26,
  color = "#E8C87A",
  speed = 0.6,
  op = 0.3,
  size = 26,
}) => {
  const f = useCurrentFrame();
  const MARKS = ["⁙", "≡", "⊹", "∴", "⋮", "⁘", "⌇", "╱", "⟡", "⊞"];
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const r1 = rnd(i + 17), r2 = rnd(i + 83), r3 = rnd(i + 149);
        const span = 900;
        const p = ((r2 * span + f * speed * (0.4 + r3 * 1.1)) % span) / span;
        const x = r1 * 1280 + Math.sin(f * 0.03 + i) * 26;
        const y = 780 - p * span;
        const a = (f * 0.3 * (0.5 + r1) + r2 * 360) % 360;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              fontSize: size * (0.7 + r3 * 0.7),
              color,
              opacity: op * (1 - p) * (0.5 + r1 * 0.5),
              transform: `rotate(${a.toFixed(0)}deg)`,
              textShadow: `0 0 12px ${color}`,
              fontFamily: "Georgia, serif",
            }}
          >
            {MARKS[Math.floor(r1 * MARKS.length)]}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ── Росчерк пера: штрих, що сам себе малює по вільній кривій ── */
export const InkStroke: React.FC<{
  from?: [number, number];
  to?: [number, number];
  lift?: number;
  color?: string;
  width?: number;
  dur?: number;
  delay?: number;
}> = ({ from = [120, 500], to = [1160, 240], lift = -260, color = "#2A2118", width = 3, dur = 70, delay = 0 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const N = 48;
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const bx = from[0] + (to[0] - from[0]) * t;
    const by = from[1] + (to[1] - from[1]) * t;
    const wave = Math.sin(t * Math.PI * 1.6) * 34;
    pts.push(`${bx.toFixed(1)},${(by + Math.sin(t * Math.PI) * lift + wave).toFixed(1)}`);
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0 }}>
        <polyline
          points={pts.join(" ")}
          fill="none"
          stroke={color}
          strokeWidth={width}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100 - p * 100}
          opacity={0.7}
        />
      </svg>
    </AbsoluteFill>
  );
};

/* ── Чорнильні краплі: падають згори, лишають мʼякий слід ── */
export const InkDrops: React.FC<{ count?: number; color?: string; speed?: number; op?: number }> = ({
  count = 14,
  color = "#1A1410",
  speed = 1,
  op = 0.5,
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const r1 = rnd(i + 29), r2 = rnd(i + 95), r3 = rnd(i + 161);
        const span = 720;
        const p = ((r2 * span + f * speed * (0.6 + r3 * 1.4)) % span) / span;
        const x = r1 * 1300;
        const y = -30 + p * span;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 4 + r3 * 5,
              height: 6 + r3 * 9,
              borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
              background: color,
              opacity: op * (1 - p) * (0.5 + r1 * 0.5),
              filter: "blur(0.4px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ── Пульсуючий ореол (свічка, сонце, піч) ── */
export const Glow: React.FC<{ x: number; y: number; r: number; color?: string; speed?: number; op?: number }> = ({
  x,
  y,
  r,
  color = "#FFC24A",
  speed = 1,
  op = 0.5,
}) => {
  const f = useCurrentFrame();
  const p = 0.75 + 0.25 * Math.sin(f * 0.06 * speed);
  return (
    <div
      style={{
        position: "absolute",
        left: x - r * p,
        top: y - r * p,
        width: r * 2 * p,
        height: r * 2 * p,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, ${color}00 70%)`,
        opacity: op,
        pointerEvents: "none",
      }}
    />
  );
};

/* ── Вітрові/світлові лінії: штрихи, що проносяться через кадр ── */
export const WindLines: React.FC<{ count?: number; color?: string; speed?: number; op?: number; angle?: number }> = ({
  count = 16,
  color = "#FFFFFF",
  speed = 1,
  op = 0.22,
  angle = 0,
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none", transform: `rotate(${angle}deg)` }}>
      {Array.from({ length: count }).map((_, i) => {
        const r1 = rnd(i + 31), r2 = rnd(i + 97), r3 = rnd(i + 163);
        const span = 1600;
        const x = ((r1 * span + f * speed * (90 + r2 * 200)) % span) - 300;
        const y = r2 * 820;
        const len = 90 + r3 * 220;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: len,
              height: 2,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${color}00, ${color})`,
              opacity: op * (0.4 + r3 * 0.6),
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ── Друкарські іскри: короткі яскраві спалахи від точки (друкарня, багаття) ── */
export const Sparks: React.FC<{ x: number; y: number; count?: number; color?: string; speed?: number }> = ({
  x,
  y,
  count = 22,
  color = "#FFC94A",
  speed = 1,
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const r1 = rnd(i + 23), r2 = rnd(i + 89), r3 = rnd(i + 151);
        const life = 34;
        const t = ((f * speed * (0.6 + r1) + r2 * life) % life) / life;
        const a = r3 * Math.PI * 2;
        const dist = 20 + t * (70 + r1 * 130);
        const px = Math.cos(a) * dist;
        const py = Math.sin(a) * dist - t * 60;
        const op = (1 - t) * 0.9;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py,
              width: 3 + r2 * 3,
              height: 3 + r2 * 3,
              borderRadius: "50%",
              background: color,
              opacity: op,
              boxShadow: `0 0 8px ${color}`,
            }}
          />
        );
      })}
    </div>
  );
};

/* ── Теплові хвилі над полумʼям/піччю ── */
export const HeatWaves: React.FC<{ x: number; y: number; w?: number; count?: number; color?: string }> = ({
  x,
  y,
  w = 240,
  count = 14,
  color = "#FFB347",
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, height: 320, pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const r1 = rnd(i + 41), r2 = rnd(i + 107);
        const life = 60;
        const t = ((f * (0.7 + r1 * 0.8) + r2 * life) % life) / life;
        const px = r1 * w + Math.sin(f * 0.05 + i) * 16;
        const py = -t * 300;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: px,
              top: py + 300,
              width: 5 + r2 * 7,
              height: 30 + t * 90,
              borderRadius: 20,
              background: `linear-gradient(180deg, ${color}00, ${color})`,
              opacity: (1 - t) * 0.5,
              filter: "blur(2px)",
            }}
          />
        );
      })}
    </div>
  );
};

/* ── Підйом: обʼєкт повзе вгору по кадру і трохи зменшується ── */
export const Rise: React.FC<{ x?: number; y?: number; dx?: number; dy?: number; scaleTo?: number; children: React.ReactNode }> = ({
  x = 0,
  y = 0,
  dx = 0,
  dy = -160,
  scaleTo = 1,
  children,
}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, 150], [0, 1], { extrapolateRight: "clamp" });
  const ease = t * t * (3 - 2 * t);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(${(dx * ease).toFixed(1)}px, ${(dy * ease).toFixed(1)}px) scale(${(1 + (scaleTo - 1) * ease).toFixed(3)})`,
        transformOrigin: "center",
        pointerEvents: "none",
      }}
    >
      {children}
    </div>
  );
};

/* ── Рядки-лінійки: горизонтальні «рядки письма», що повільно проступають ── */
export const RuledLines: React.FC<{ count?: number; color?: string; op?: number; speed?: number }> = ({
  count = 9,
  color = "#3A2E20",
  op = 0.16,
  speed = 1,
}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const y = 90 + i * 62;
        const w = 40 + rnd(i + 5) * 40;
        const p = interpolate(f, [0, 90], [0, 1], { extrapolateRight: "clamp" });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 160,
              right: 160,
              top: y,
              height: 2,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${color}00, ${color}, ${color}00)`,
              opacity: op * p * (0.5 + (w / 80)),
              filter: "blur(0.3px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/* ── Пил у промені: сонячний пил у похилому світлі ── */
export const SunDust: React.FC<{ x: number; w?: number; color?: string; count?: number; op?: number }> = ({
  x = 900,
  w = 520,
  color = "#FFE7B0",
  count = 30,
  op = 0.5,
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: 0, width: w, height: 720, pointerEvents: "none", transform: "rotate(18deg)" }}>
      {Array.from({ length: count }).map((_, i) => {
        const r1 = rnd(i + 61), r2 = rnd(i + 127), r3 = rnd(i + 193);
        const span = 720;
        const p = ((r2 * span + f * 0.5 * (0.4 + r3)) % span) / span;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: r1 * w,
              top: p * 720,
              width: 2 + r3 * 3,
              height: 2 + r3 * 3,
              borderRadius: "50%",
              background: color,
              opacity: op * (1 - p) * (0.4 + r1 * 0.6),
              boxShadow: `0 0 6px ${color}`,
            }}
          />
        );
      })}
    </div>
  );
};

/* ── Золоте світло: тепле сяйво, що заливає кадр і пульсує ── */
export const WarmLight: React.FC<{ x?: number; y?: number; r?: number; color?: string; op?: number; speed?: number }> = ({
  x = 1040,
  y = 140,
  r = 360,
  color = "#FFB43C",
  op = 0.28,
  speed = 0.8,
}) => {
  const f = useCurrentFrame();
  const p = 0.85 + 0.15 * Math.sin(f * 0.05 * speed);
  return (
    <div
      style={{
        position: "absolute",
        left: x - r * p,
        top: y - r * p,
        width: r * 2 * p,
        height: r * 2 * p,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, ${color}00 72%)`,
        opacity: op,
        pointerEvents: "none",
      }}
    />
  );
};

