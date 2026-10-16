import React from "react";
import { useCurrentFrame } from "remotion";
import { B } from "./tokens";

/* Маркер «від руки» поверх відео/скріна: обвести, підкреслити, стрілка, галочка, хрестик, закреслити.
   Механіка портована з hand-drawn-canvas-animation (alesha-pro/tools, MIT, core.js brush/wob/doodle):
   • штрих — стрічка змінної ширини: звуження на кінцях (taper) + легкий «натиск» уздовж лінії;
   • тремтіння лінії — детерміноване від довжини дуги й seed: однакове в кожному кадрі, лінія не «пливе»;
   • домальовування зі сталою швидкістю пера (px/с): довгий штрих іде довше; кілька штрихів — по черзі з паузою;
   • boil (перемальовування кожні N кадрів) — ТІЛЬКИ за потреби, за замовчуванням лінія стоїть.
   Координати — у пікселях того шару, куди кладемо (напр. 1920×1080 скрінкасту всередині трансформа камери). */

type P = [number, number];
const TAU = Math.PI * 2;
const rng = (seed: number) => { let a = (seed * 1000003) >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Catmull-Rom через точки, крок ~step px */
const spline = (pts: P[], step = 5, close = false): P[] => {
  if (pts.length < 3) {
    const [a, b] = pts; const n = Math.max(2, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    return Array.from({ length: n + 1 }, (_, i) => [lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)] as P);
  }
  const src = close ? [...pts, pts[0]] : pts, out: P[] = [], g = (i: number) => src[close ? (i + src.length - 1) % (src.length - 1) : Math.max(0, Math.min(src.length - 1, i))];
  for (let i = 0; i < src.length - 1; i++) {
    const p0 = g(i - 1), p1 = src[i], p2 = src[i + 1], p3 = g(i + 2);
    const n = Math.max(2, Math.round(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)) as P);
    }
  }
  out.push(src[src.length - 1]);
  return out;
};
const lengths = (q: P[]) => { const s = [0]; for (let i = 1; i < q.length; i++) s.push(s[i - 1] + Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1])); return s; };

/** Стрічка пензля до частки p (0..1) довжини → SVG path (заливка) */
export const brushPath = (pts: P[], o: { w?: number; p?: number; seed?: number; amp?: number; taper?: number; smooth?: boolean } = {}) => {
  const { w = 8, p = 1, seed = 1, amp = 2, taper = 1, smooth = true } = o;
  if (p <= 0 || pts.length < 2) return "";
  const q = smooth ? spline(pts) : pts, s = lengths(q), L = s[s.length - 1], end = L * Math.min(1, p);
  const r = rng(seed), ph = [r() * TAU, r() * TAU, r() * TAU], f1 = 0.011 + r() * 0.008, f2 = 0.037 + r() * 0.02;
  const tl = Math.max(1, Math.min(L * 0.42, w * 10)) * taper;
  const at = (i: number): P => [q[i][0] + amp * (Math.sin(s[i] * f1 + ph[0]) + 0.5 * Math.sin(s[i] * f2 + ph[1])), q[i][1] + amp * (Math.cos(s[i] * f1 * 1.3 + ph[1]) + 0.5 * Math.sin(s[i] * f2 * 0.8 + ph[2]))];
  const width = (m: number) => { const e = taper ? Math.min(1, m / tl, (L - m) / tl) : 1; return Math.max(0.6, w * (0.3 + 0.7 * Math.sin((Math.max(0, e) * Math.PI) / 2)) * (1 + 0.2 * Math.sin(m * f2 * 1.7 + ph[2]))); };
  const c: P[] = [], ws: number[] = [];
  for (let i = 0; i < q.length && s[i] <= end; i++) { c.push(at(i)); ws.push(width(s[i])); }
  const k = c.length; // кінець рівно на end
  if (k < q.length && k > 0) { const t = (end - s[k - 1]) / (s[k] - s[k - 1] || 1), a = at(k - 1), b = at(k); c.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t)]); ws.push(width(end)); }
  if (c.length < 2) return "";
  const L1: P[] = [], R1: P[] = [];
  for (let i = 0; i < c.length; i++) {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)]; let nx = a[1] - b[1], ny = b[0] - a[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const h = ws[i] / 2; L1.push([c[i][0] + nx * h, c[i][1] + ny * h]); R1.push([c[i][0] - nx * h, c[i][1] - ny * h]);
  }
  const f = (v: number) => v.toFixed(1), cap = (p0: P, p1: P, h: number) => `A${f(h)} ${f(h)} 0 0 1 ${f(p1[0])} ${f(p1[1])}`;
  return `M${f(L1[0][0])} ${f(L1[0][1])}` + L1.slice(1).map((p) => `L${f(p[0])} ${f(p[1])}`).join("") + cap(L1[L1.length - 1], R1[R1.length - 1], ws[ws.length - 1] / 2)
    + R1.reverse().map((p) => `L${f(p[0])} ${f(p[1])}`).join("") + cap(R1[R1.length - 1], L1[0], ws[0] / 2) + "Z";
};

/* ── фігури: кожна повертає список штрихів (порядок = порядок малювання) ── */
/** обведення від руки: ~1.12 оберта, старт зліва-зверху, кінець заходить за початок (як маркером) */
export const ring = (cx: number, cy: number, rx: number, ry: number, seed = 1): P[][] => {
  const r = rng(seed), a0 = -2.4 + (r() - 0.5) * 0.4, turns = 1.1 + r() * 0.06, n = 64, tilt = (r() - 0.5) * 0.12;
  return [Array.from({ length: n + 1 }, (_, i) => { const t = i / n, a = a0 + t * TAU * turns, grow = 1 + (t - 0.5) * 0.08 + (r() - 0.5) * 0.015;
    const x = Math.cos(a) * rx * grow, y = Math.sin(a) * ry * grow; return [cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt)] as P; })];
};
/** підкреслення: трохи дугою, з легким підйомом наприкінці; double — другий штрих коротший */
export const underline = (x1: number, x2: number, y: number, seed = 1, double = false): P[][] => {
  const r = rng(seed), sag = 4 + r() * 4, out: P[][] = [[[x1, y + r() * 3], [lerp(x1, x2, 0.5), y + sag], [x2, y - 3 - r() * 4]]];
  if (double) out.push([[lerp(x1, x2, 0.08), y + 14], [lerp(x1, x2, 0.55), y + 14 + sag * 0.6], [lerp(x1, x2, 0.9), y + 10]]);
  return out;
};
/** стрілка з a в b з вигином bend (частка довжини, + вліво); вістря — два окремі штрихи */
export const arrow = (a: P, b: P, bend = 0.18, head = 30): P[][] => {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), mid: P = [lerp(a[0], b[0], 0.5) - (dy / L) * L * bend, lerp(a[1], b[1], 0.5) + (dx / L) * L * bend];
  const q = spline([a, mid, b]), t = q[q.length - 1], u = q[Math.max(0, q.length - 6)], ang = Math.atan2(t[1] - u[1], t[0] - u[0]);
  const h = (s: number): P[] => [[t[0] - Math.cos(ang + s * 0.5) * head, t[1] - Math.sin(ang + s * 0.5) * head], t];
  return [[a, mid, b], h(1), h(-1)];
};
export const check = (x: number, y: number, s: number): P[][] => [[[x - s * 0.5, y], [x - s * 0.15, y + s * 0.38], [x + s * 0.6, y - s * 0.55]]];
export const cross = (x: number, y: number, s: number): P[][] => [[[x - s / 2, y - s / 2], [x + s / 2, y + s / 2]], [[x + s / 2, y - s / 2], [x - s / 2, y + s / 2]]];
/** закреслити рядок */
export const strike = (x1: number, x2: number, y: number, seed = 1): P[][] => { const r = rng(seed); return [[[x1 - 6, y + 4 + r() * 3], [x2 + 6, y - 5 - r() * 3]]]; };

/** Малює штрихи по черзі з кадру `at`: швидкість пера speed px/с, пауза gap с між штрихами.
 *  boil=N — перемальовувати лінію кожні N кадрів (живий «кипучий» контур), за замовчуванням вимкнено. */
export const Marker: React.FC<{ at: number; strokes: P[][]; color?: string; w?: number; speed?: number; gap?: number; seed?: number; amp?: number; fps?: number; boil?: number; out?: number; opacity?: number; shadow?: boolean }> = ({
  at, strokes, color = B.red, w = 9, speed = 1400, gap = 0.06, seed = 1, amp = 2, fps = 30, boil = 0, out, opacity = 1, shadow = true,
}) => {
  const f = useCurrentFrame();
  if (f < at || (out !== undefined && f >= out)) return null;
  const tau = (f - at) / fps, bs = boil ? Math.floor(f / boil) * 17 : 0;
  const fade = out !== undefined ? Math.min(1, (out - f) / 6) : 1;
  let t0 = 0;
  const paths = strokes.map((pts, i) => {
    const ls = lengths(spline(pts)), L = ls[ls.length - 1] || 1, dur = Math.max(0.07, L / speed), p = (tau - t0) / dur;
    t0 += dur + gap;
    return brushPath(pts, { w, p, seed: seed + i * 31 + bs, amp });
  });
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", pointerEvents: "none", opacity: opacity * fade }} width={1} height={1}>
      {shadow && <g transform="translate(2 3)" opacity={0.22}>{paths.map((d, i) => d && <path key={i} d={d} fill="#000" />)}</g>}
      {paths.map((d, i) => d && <path key={i} d={d} fill={color} />)}
    </svg>
  );
};
