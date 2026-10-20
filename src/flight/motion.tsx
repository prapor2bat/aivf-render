import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { B } from "../brand/tokens";

/* ─────────────────────────────────────────────────────────────────────────────
   Рух у кадрі для 018 «Як людство навчилося літати».
   Кожна сцена отримує власний шар руху ПОВЕРХ ілюстрації: хмари пливуть,
   частинки летять, траєкторії тягнуться, пропелер крутиться, куля підіймається,
   крила махають, іскри скачуть. Усе на коді (без відеогенерації), детерміновано
   від кадру. Шари напівпрозорі, тож картинка лишається читабельною.
   ───────────────────────────────────────────────────────────────────────────── */

type Rnd = (n: number) => number;
/** Детермінований псевдовипадок [0..1) за індексом. */
const rnd: Rnd = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ── Хмари, що пливуть: 9 м'яких плям, різні швидкості й глибини ── */
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

/* ── Дугові траєкторії польоту: пунктир, що сам себе малює по дузі ── */
export const ArcTrail: React.FC<{
  cx?: number;
  cy?: number;
  from?: [number, number];
  to?: [number, number];
  lift?: number;
  color?: string;
  width?: number;
  dur?: number;
  delay?: number;
}> = ({ cx = 640, cy = 720, from = [-80, 300], to = [1400, 60], lift = -420, color = B.red, width = 3, dur = 46, delay = 0 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [delay, delay + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const N = 40;
  const pts: string[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const bx = from[0] + (to[0] - from[0]) * t;
    const by = from[1] + (to[1] - from[1]) * t;
    const byy = by + Math.sin(t * Math.PI) * lift;
    pts.push(`${bx + cx * 0},${byy + cy * 0}`);
  }
  // зсув у центр кадру
  const offX = cx - 640, offY = cy - 360;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" viewBox="0 0 1280 720" style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${offX} ${offY})`}>
          <polyline
            points={pts.join(" ")}
            fill="none"
            stroke={color}
            strokeWidth={width}
            strokeDasharray="10 12"
            strokeLinecap="round"
            pathLength={100}
            strokeDashoffset={100 - p * 100}
            opacity={0.85}
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ── Пропелер, що крутиться: пелюстки + розмитий диск на швидкості ── */
export const Propeller: React.FC<{ x: number; y: number; r?: number; spin?: number; color?: string; blur?: boolean }> = ({
  x,
  y,
  r = 74,
  spin = 1,
  color = "#1B2A2F",
  blur = true,
}) => {
  const f = useCurrentFrame();
  const ang = f * 26 * spin;
  const diskOp = interpolate(spin, [0, 1.4], [0, 0.42], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, pointerEvents: "none" }}>
      {blur && (
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle, ${color}00 30%, ${color} 78%)`, opacity: diskOp, filter: "blur(3px)" }} />
      )}
      <div style={{ position: "absolute", inset: 0, transform: `rotate(${ang}deg)` }}>
        {[0, 60, 120].map((a, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: r - 5,
              top: 6,
              width: 10,
              height: r * 1.7,
              marginTop: -r * 0.85,
              borderRadius: 6,
              background: color,
              transformOrigin: "5px 50%",
              transform: `rotate(${a}deg)`,
              opacity: 0.65,
            }}
          />
        ))}
        <div style={{ position: "absolute", left: r - 9, top: r - 9, width: 18, height: 18, borderRadius: "50%", background: color }} />
      </div>
    </div>
  );
};

/* ── Політ обʼєкта по кривій (куля/літак/пташка): мʼякий синусоїдний дрейф ── */
export const Floating: React.FC<{ x: number; y: number; amp?: number; speed?: number; rot?: number; children: React.ReactNode }> = ({
  x,
  y,
  amp = 16,
  speed = 1,
  rot = 0,
  children,
}) => {
  const f = useCurrentFrame();
  const dx = Math.sin(f * 0.03 * speed) * amp;
  const dy = Math.cos(f * 0.045 * speed) * amp * 0.6;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, pointerEvents: "none" }}>
      {children}
    </div>
  );
};

/* ── Крила, що махають (білі силуети птахів) ── */
export const FlyingBirds: React.FC<{ count?: number; color?: string; speed?: number; op?: number; scale?: number }> = ({
  count = 5,
  color = "#132126",
  speed = 1,
  op = 0.6,
  scale = 1,
}) => {
  const f = useCurrentFrame();
  const BIRD = 30 * scale;
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const r1 = rnd(i + 13), r2 = rnd(i + 71), r3 = rnd(i + 137);
        const span = 1500;
        const x = ((r1 * span + f * speed * (50 + r2 * 70)) % span) - 120;
        const y = 90 + r2 * 380 + Math.sin(f * 0.05 + i * 2) * 24;
        const flap = Math.sin(f * (0.28 + r3 * 0.2) + i * 1.7);
        const wing = 0.35 + 0.65 * Math.abs(flap);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: BIRD, height: BIRD, opacity: op }}>
            <svg viewBox="0 0 40 40" width={BIRD} height={BIRD}>
              <path
                d={`M2 ${22 - wing * 10} Q 20 ${28 + wing * 4} 38 ${22 - wing * 10}`}
                fill="none"
                stroke={color}
                strokeWidth={3.4}
                strokeLinecap="round"
              />
            </svg>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ── Іскри: короткі яскраві спалахи, що злітають від точки ── */
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

/* ── Пульсуючий ореол (сонце, двигун, полумʼя) ── */
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

/* ── Вітрові лінії: штрихи, що проносяться через кадр ── */
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

/* ── Теплові хвилі над полумʼям: пласкі «язики», що здіймаються ── */
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

/* ── Стрічка-шлейф за літаком: тане з часом ── */
export const Contrail: React.FC<{ x: number; y: number; len?: number; angle?: number; color?: string }> = ({
  x,
  y,
  len = 520,
  angle = 12,
  color = "#FFFFFF",
}) => {
  const f = useCurrentFrame();
  const grow = interpolate(f, [0, 40], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: x, top: y, pointerEvents: "none", transform: `rotate(${angle}deg)`, transformOrigin: "0 50%" }}>
      <div
        style={{
          width: len * grow,
          height: 12,
          borderRadius: 12,
          background: `linear-gradient(90deg, ${color}00, ${color}, ${color}00)`,
          opacity: 0.5,
          filter: "blur(4px)",
        }}
      />
      <div
        style={{
          width: len * grow,
          height: 5,
          marginTop: -9,
          borderRadius: 6,
          background: `linear-gradient(90deg, ${color}00, ${color}cc, ${color}00)`,
          opacity: 0.35,
          filter: "blur(1.5px)",
        }}
      />
    </div>
  );
};

/* ── Підйом: обʼєкт повзе вгору по кадру і трохи зменшується (куля, планер) ── */
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

