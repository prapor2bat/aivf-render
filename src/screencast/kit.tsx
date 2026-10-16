import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { B, FONT } from "../brand/tokens";
import { ez } from "../brand/kit";
import { Pill } from "../course/kit";

/* ═══════════════════════════════════════════════════════════════════════
   SCREENCAST KIT — переюзовувані деталі для роликів зі записом екрана.
   Запис (1920×1080) кладеться ПІД камеру-риг: наїзди, підсвітка зони,
   пілюля-підпис, розмиття приватного, субтитри на підкладці.

   Координати hl/focus/blur — у пікселях САМОГО запису (baseW×baseH),
   тому збігаються з тим, що видно у кадрі оригіналу 1920×1080.

   Дані: studio/src/screencast/screencast.json (recording, shots, blurs,
   captions, cover…). Див. docs/SCREENCAST.md.
   ═══════════════════════════════════════════════════════════════════════ */

/** Зона у координатах запису: [x, y, w, h]. */
export type Rect = [number, number, number, number];
/** Шот: кадр появи `at` (відносно початку тіла) + наїзд/підсвітка/підпис. */
export type Shot = { at: number; zoom?: number; focus?: Rect; hl?: Rect; label?: string };
/** Вікно розмиття приватного у координатах запису. */
export type BlurWin = { from: number; to: number; r: Rect; px?: number };
/** Слово субтитра: кадр появи `at`, `key` — червоне, `brk` — кінець групи. */
export type Cap = { text: string; at: number; key?: boolean; brk?: boolean };

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const sortShots = (s: Shot[]) => [...s].sort((a, b) => a.at - b.at);

/** Камера: одна спільна для відео, підсвіток і розмиттів (щоб усе їхало разом). */
export const useCam = (shots: Shot[], baseW: number, baseH: number) => {
  const f = useCurrentFrame();
  const { fps, width: CW, height: CH } = useVideoConfig();
  const S0 = CW / baseW; // скільки пікселів композиції в одному пікселі запису
  const list = sortShots(shots.length ? shots : [{ at: 0 }]);
  const i = Math.max(0, list.filter((s) => f >= s.at).length - 1);
  const e = list[i];
  const prev = list[Math.max(0, i - 1)];
  const p = spring({ frame: f - e.at, fps, config: { damping: 18, stiffness: 120 } });
  const calc = (s: Shot) => {
    const z = s.zoom ?? 1;
    const r = s.focus ?? s.hl ?? ([0, 0, baseW, baseH] as Rect);
    const cx = r[0] + r[2] / 2, cy = r[1] + r[3] / 2;
    const k = S0 * z;
    const tx = Math.min(0, Math.max(CW - baseW * k, CW / 2 - cx * k));
    const ty = Math.min(0, Math.max(CH - baseH * k, CH / 2 - cy * k));
    return { k, tx, ty };
  };
  const a = calc(prev), b = calc(e);
  return {
    f,
    k: a.k + (b.k - a.k) * p,
    tx: a.tx + (b.tx - a.tx) * p,
    ty: a.ty + (b.ty - a.ty) * p,
    cur: e,
    fps,
    CW,
    CH,
    baseW,
    baseH,
  };
};

/** Червона рамка навколо зони + затемнення решти кадру. Живе ВСЕРЕДИНІ камери. */
export const HighlightBox: React.FC<{ hl: Rect; at: number; k: number }> = ({ hl, at, k }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hp = spring({ frame: f - at - 4, fps, config: { damping: 12, stiffness: 190 } });
  if (f < at + 1) return null;
  return (
    <div style={{ position: "absolute", left: hl[0] - 6, top: hl[1] - 6, width: hl[2] + 12, height: hl[3] + 12, borderRadius: 14,
      border: `${4 / k}px solid ${B.red}`, boxShadow: `0 0 0 4000px rgba(0,0,0,${0.35 * hp}), 0 0 ${24 / k}px rgba(227,32,43,.7)`,
      opacity: hp, transform: `scale(${1.08 - 0.08 * hp})`, transformOrigin: "center" }} />
  );
};

/** Розмиття приватного (чужі імена, листи, пошта). Живе ВСЕРЕДИНІ камери. */
export const Blur: React.FC<BlurWin> = ({ from, to, r, px = 16 }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  return (
    <div style={{ position: "absolute", left: r[0], top: r[1], width: r[2], height: r[3], borderRadius: 12,
      backdropFilter: `blur(${px}px)`, WebkitBackdropFilter: `blur(${px}px)`, background: "rgba(255,255,255,.2)" }} />
  );
};

/** Камера-риг: наїзд/панорама за шотами, підсвітка, розмиття, пілюля-підпис.
 *  children — запис розміром baseW×baseH (OffthreadVideo). */
export const CamRig: React.FC<{ shots: Shot[]; baseW: number; baseH: number; blurs?: BlurWin[]; children: React.ReactNode }> =
  ({ shots, baseW, baseH, blurs = [], children }) => {
    const { f, k, tx, ty, cur, fps, CW, CH } = useCam(shots, baseW, baseH);
    const hl = cur.hl;
    const hp = spring({ frame: f - cur.at - 4, fps, config: { damping: 12, stiffness: 190 } });
    let label: React.ReactNode = null;
    if (hl && cur.label) {
      const rx = hl[0] * k + tx, ry = hl[1] * k + ty, rw = hl[2] * k, rh = hl[3] * k;
      const below = ry + rh + 60 < CH;
      const lx = Math.max(24, Math.min(CW - 480, rx));
      const ly = below ? ry + rh + 12 : Math.max(64, ry - 56);
      label = (
        <div style={{ position: "absolute", left: lx, top: ly, opacity: hp, transform: `translateY(${(1 - hp) * 12}px)` }}>
          <Pill red size={22}>{cur.label}</Pill>
        </div>
      );
    }
    return (
      <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: baseW, height: baseH, transformOrigin: "0 0",
          transform: `translate(${tx}px, ${ty}px) scale(${k})` }}>
          {children}
          {blurs.map((b, j) => <Blur key={j} {...b} />)}
          {hl && <HighlightBox hl={hl} at={cur.at} k={k} />}
        </div>
        {label}
      </AbsoluteFill>
    );
  };

/** Субтитри на темній підкладці (для кадрів зі світлим інтерфейсом). Групи ≤ 4 слова. */
export const ScreenCaptions: React.FC<{ items: Cap[]; top?: number; size?: number }> = ({ items, top, size = 34 }) => {
  const f = useCurrentFrame();
  const { height } = useVideoConfig();
  const groups: Cap[][] = [];
  let cur: Cap[] = [];
  for (const w of items) { if (!w.text) continue; cur.push(w); if (w.brk || cur.length >= 4) { groups.push(cur); cur = []; } }
  if (cur.length) groups.push(cur);
  const gi = groups.findIndex((g, i) => f >= g[0].at - 1 && (i === groups.length - 1 || f < groups[i + 1][0].at - 1));
  if (gi < 0) return null;
  const g = groups[gi];
  if (f > g[g.length - 1].at + 30) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: top ?? height - 150, display: "flex", justifyContent: "center" }}>
      <div style={{ display: "flex", gap: "0 12px", padding: "6px 18px", borderRadius: 14, background: "rgba(10,10,12,.82)",
        opacity: ez(f, g[0].at - 1, g[0].at + 4, [0, 1]) }}>
        {g.map((w, j) => {
          if (f < w.at - 1) return null;
          const p = ez(f, w.at, w.at + 5, [0, 1]);
          const on = f >= w.at && f < w.at + 10;
          return (
            <span key={j} style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: size, letterSpacing: "-0.03em", whiteSpace: "nowrap",
              color: w.key ? "#FF3B45" : B.white, opacity: p, transform: `translateY(${(1 - p) * 10}px) scale(${on ? 1.06 : 1})` }}>{w.text}</span>
          );
        })}
      </div>
    </div>
  );
};

/** Кредит авторства запису (CC BY) — дрібним під биркою каналу. */
export const RecCredit: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", left: 24, right: 24, top: 78, textAlign: "center", fontFamily: FONT.sans, fontWeight: 500,
    fontSize: 15, color: "rgba(255,255,255,.5)" }}>{text}</div>
);

export const _clamp = clamp;
