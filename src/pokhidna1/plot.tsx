import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { B, FONT } from "../brand/tokens";

/* Графічні хелпери для математичних сцен: система координат, крива, дотична, січна. */
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export type Fn = (x: number) => number;
export type Box = { x: number; y: number; w: number; h: number; xmin: number; xmax: number; ymin: number; ymax: number };

export const mapX = (b: Box, X: number) => b.x + ((X - b.xmin) / (b.xmax - b.xmin)) * b.w;
export const mapY = (b: Box, Y: number) => b.y + b.h - ((Y - b.ymin) / (b.ymax - b.ymin)) * b.h;
export const deriv = (f: Fn, x: number, h = 1e-3) => (f(x + h) - f(x - h)) / (2 * h);
export const ez = (f: number, a: number, b: number, o: [number, number]) => interpolate(f, [a, b], o, clamp);

const Layer: React.FC<{ w: number; h: number; children?: React.ReactNode }> = ({ w, h, children }) => (
  <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none" }}>{children}</svg>
);

export const Plot: React.FC<{ b: Box; f: Fn; at?: number; draw?: number; dark?: boolean; color?: string; samples?: number; axes?: boolean; grid?: boolean; dashBack?: boolean }> =
  ({ b, f, at = 0, draw = 22, dark, color, samples = 180, axes = true, grid = true, dashBack }) => {
    const fr = useCurrentFrame();
    const reveal = clamp3(ez(fr, at, at + draw, [0, 1]));
    const n = Math.max(2, Math.round(1 + (samples - 1) * reveal));
    const pts: string[] = [];
    for (let i = 0; i < n; i++) {
      const X = b.xmin + ((b.xmax - b.xmin) * i) / (samples - 1);
      const Y = Math.max(b.ymin, Math.min(b.ymax, f(X)));
      pts.push(`${mapX(b, X).toFixed(1)},${mapY(b, Y).toFixed(1)}`);
    }
    const ax = dark ? "rgba(255,255,255,.55)" : "rgba(13,13,13,.55)";
    const gr = dark ? "rgba(255,255,255,.10)" : "rgba(13,13,13,.09)";
    const y0 = mapY(b, 0), x0 = mapX(b, 0);
    return (
      <Layer w={b.x + b.w} h={b.y + b.h}>
        {grid && [...Array(7)].map((_, i) => { const X = b.xmin + ((b.xmax - b.xmin) * i) / 6; return <line key={"v" + i} x1={mapX(b, X)} y1={b.y} x2={mapX(b, X)} y2={b.y + b.h} stroke={gr} />; })}
        {grid && [...Array(5)].map((_, i) => { const Y = b.ymin + ((b.ymax - b.ymin) * i) / 4; return <line key={"h" + i} x1={b.x} y1={mapY(b, Y)} x2={b.x + b.w} y2={mapY(b, Y)} stroke={gr} />; })}
        <line x1={b.x - 14} y1={y0} x2={b.x + b.w + 14} y2={y0} stroke={ax} strokeWidth={2} />
        <line x1={x0} y1={b.y + b.h + 14} x2={x0} y2={b.y - 14} stroke={ax} strokeWidth={2} />
        {axes && <polygon points={`${b.x + b.w + 14},${y0} ${b.x + b.w + 6},${y0 - 5} ${b.x + b.w + 6},${y0 + 5}`} fill={ax} />}
        <polyline points={pts.join(" ")} fill="none" stroke={color ?? (dark ? "#fff" : B.ink)} strokeWidth={4} strokeLinecap="round" strokeDasharray={dashBack ? "10 9" : undefined} />
      </Layer>
    );
  };
const clamp3 = (v: number) => Math.max(0, Math.min(1, v));

export const Dot: React.FC<{ b: Box; X: number; Y: number; at?: number; color?: string; r?: number; label?: string; dark?: boolean; labelOff?: number }> =
  ({ b, X, Y, at = 0, color = B.red, r = 9, label, dark, labelOff = 0 }) => {
    const fr = useCurrentFrame();
    const p = ez(fr, at, at + 8, [0, 1]);
    return (
      <>
        <div style={{ position: "absolute", left: mapX(b, X) - r, top: mapY(b, Y) - r, width: r * 2, height: r * 2, borderRadius: r * 2, background: color, transform: `scale(${p})`,
          boxShadow: `0 0 0 ${8 * p}px ${hexA(color, 0.18 * p)}` }} />
        {label && <div style={{ position: "absolute", left: mapX(b, X) + 16 + labelOff, top: mapY(b, Y) - 40, fontFamily: FONT.sans, fontWeight: 800, fontSize: 20, color: dark ? "#fff" : B.ink, opacity: p }}>{label}</div>}
      </>
    );
  };

export const Seg: React.FC<{ b: Box; x1: number; y1: number; x2: number; y2: number; color?: string; dash?: string; width?: number; at?: number; grow?: boolean }> =
  ({ b, x1, y1, x2, y2, color = B.red, dash, width = 4, at = 0, grow }) => {
    const fr = useCurrentFrame();
    const p = grow ? ez(fr, at, at + 12, [0, 1]) : 1;
    const X2 = x1 + (x2 - x1) * p, Y2 = y1 + (y2 - y1) * p;
    return <Layer w={b.x + b.w} h={b.y + b.h}><line x1={mapX(b, x1)} y1={mapY(b, y1)} x2={mapX(b, X2)} y2={mapY(b, Y2)} stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" /></Layer>;
  };

/** дотична до f у точці x0, намальована через усю область */
export const Tangent: React.FC<{ b: Box; f: Fn; x0: number; color?: string; at?: number; dash?: string }> = ({ b, f, x0, color = B.red, at = 0, dash }) => {
  const y0 = f(x0), k = deriv(f, x0);
  const g: Fn = (x) => y0 + k * (x - x0);
  const fr = useCurrentFrame();
  const p = ez(fr, at, at + 12, [0, 1]);
  const X2 = x0 + (b.xmax - x0) * p, X1 = x0 - (x0 - b.xmin) * p;
  return <Seg b={b} x1={X1} y1={g(X1)} x2={X2} y2={g(X2)} color={color} dash={dash} width={4} />;
};

export const Slider: React.FC<{ b: Box; f: Fn; at: number; from: number; to: number; dur?: number; color?: string; dark?: boolean; label?: string }> =
  ({ b, f, at, from, to, dur = 90, color = B.red, dark, label }) => {
    const fr = useCurrentFrame();
    const x0 = interpolate(fr, [at, at + dur], [from, to], clamp);
    return (
      <>
        <Dot b={b} X={x0} Y={f(x0)} color={color} r={8} dark={dark} />
        {label && <div style={{ position: "absolute", left: mapX(b, x0) + 14, top: mapY(b, f(x0)) + 12, fontFamily: FONT.sans, fontWeight: 800, fontSize: 18, color: dark ? "#fff" : B.ink }}>{label}</div>}
      </>
    );
  };

export function hexA(hex: string, a: number) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
