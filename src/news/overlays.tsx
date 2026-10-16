import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { B, FONT } from "../brand/tokens";
import { ez } from "../brand/kit";
import { Marker, underline, arrow } from "../brand/marker";

/* ═══════════════════════════════════════════════════════════════════════
   Інфографіка для формату «Новини та факти» (9:16). Шар оверлеїв поверх
   стокового b-roll, у зоні над субтитрами (y ≈ 250…840). Кольори/шрифт —
   з brand/tokens. Час `at` — кадр у межах сцени (рахується з T.wf за словом).
   ═══════════════════════════════════════════════════════════════════════ */

const useSpringAt = (at: number, d = 14, s = 170) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - at, fps, config: { damping: d, stiffness: s, mass: 0.8 } });
};

const panel: React.CSSProperties = {
  position: "absolute", background: "rgba(10,10,10,.66)", backdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,.08)", borderRadius: 22, boxShadow: "0 30px 60px -30px rgba(0,0,0,.9)",
};
const kicker = (c: string): React.CSSProperties => ({ fontFamily: FONT.sans, fontWeight: 700, fontSize: 22, letterSpacing: ".12em", textTransform: "uppercase", color: c });

/* ── 1. Чипи: хто на звʼязку (Білий дім / ЦРУ / Пентагон) ─────────────────── */
const Pill: React.FC<{ at: number; text: string }> = ({ at, text }) => {
  const f = useCurrentFrame();
  const p = useSpringAt(at, 13, 180);
  if (f < at) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 26px 14px 20px", borderRadius: 999, background: B.white, color: B.ink,
      fontFamily: FONT.sans, fontWeight: 800, fontSize: 32, letterSpacing: "-.02em", whiteSpace: "nowrap",
      transform: `translateY(${(1 - p) * 26}px) scale(${0.8 + 0.2 * p})`, opacity: Math.min(1, p * 1.4), boxShadow: "0 16px 30px -16px rgba(0,0,0,.6)" }}>
      <span style={{ width: 16, height: 16, borderRadius: 16, background: B.red }} />{text}
    </div>
  );
};
export const Chips: React.FC<{ at: number; items: string[]; y?: number }> = ({ at, items, y = 300 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
    {items.map((t, i) => <Pill key={t} at={at + i * 9} text={t} />)}
  </div>
);

/* ── 2. Велика цифра-швидкість + підкреслення маркером ───────────────────── */
export const SpeedStat: React.FC<{ at: number; y?: number }> = ({ at, y = 300 }) => {
  const f = useCurrentFrame();
  const p = useSpringAt(at, 10, 200);
  if (f < at) return null;
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center" }}>
        <div style={{ ...kicker(B.red), marginBottom: 10, opacity: ez(f, at, at + 6, [0, 1]) }}>лимит в движении</div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 196, lineHeight: 0.86, letterSpacing: "-.06em", color: B.white,
          transform: `scale(${1.16 - 0.16 * p})`, textShadow: "0 10px 46px rgba(0,0,0,.75)" }}>160</div>
        <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontSize: 46, color: B.white, opacity: ez(f, at + 5, at + 14, [0, 1]) }}>км/ч</div>
      </div>
      <Marker at={at + 10} strokes={underline(196, 524, y + 236, 7)} color={B.red} w={11} />
    </div>
  );
};

/* ── 3. Бейдж версії (STARSHIELD) ────────────────────────────────────────── */
export const Badge: React.FC<{ at: number; name: string; note: string; y?: number }> = ({ at, name, note, y = 350 }) => {
  const f = useCurrentFrame();
  const p = useSpringAt(at, 12, 180);
  if (f < at) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", flexDirection: "column", alignItems: "center", gap: 18,
      transform: `scale(${0.82 + 0.18 * p})`, opacity: Math.min(1, p * 1.4) }}>
      <div style={{ padding: "16px 36px", borderRadius: 16, background: B.red, color: B.white, fontFamily: FONT.sans, fontWeight: 900, fontSize: 48,
        letterSpacing: ".16em", boxShadow: "0 26px 54px -20px rgba(227,32,43,.85)" }}>{name}</div>
      <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 28, color: B.white, opacity: ez(f, at + 8, at + 18, [0, 1]), textShadow: "0 4px 20px rgba(0,0,0,.7)" }}>{note}</div>
    </div>
  );
};

/* ── 4. Стовпчикова діаграма (160 проти 290 км/ч) ────────────────────────── */
export const Bars: React.FC<{ at: number; title: string; rows: { label: string; value: number; max: number; accent?: boolean }[]; y?: number }> =
  ({ at, title, rows, y = 280 }) => {
    const f = useCurrentFrame();
    if (f < at) return null;
    const grow = ez(f, at + 6, at + 30, [0, 1]);
    const H = 210;
    return (
      <div style={{ ...panel, left: 96, right: 96, top: y, padding: "28px 26px 24px" }}>
        <div style={{ ...kicker(B.red), fontSize: 21, marginBottom: 22, textAlign: "center" }}>{title}</div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 56, height: H + 74 }}>
          {rows.map((r) => {
            const h = (r.value / r.max) * H * grow;
            return (
              <div key={r.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: 150 }}>
                <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 40, color: r.accent ? B.red : B.white, fontVariantNumeric: "tabular-nums" }}>{r.value}</div>
                <div style={{ width: 100, height: h, background: r.accent ? B.red : "rgba(255,255,255,.88)", borderRadius: "10px 10px 4px 4px", boxShadow: "0 12px 26px -12px rgba(0,0,0,.75)" }} />
                <div style={{ ...kicker(B.gray), fontSize: 18, letterSpacing: ".06em" }}>{r.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

/* ── 5. Картка-стата (контракт до квітня 2027) ───────────────────────────── */
export const StatCard: React.FC<{ at: number; kicker_: string; big: string; sub?: string; y?: number }> = ({ at, kicker_, big, sub, y = 300 }) => {
  const f = useCurrentFrame();
  const p = useSpringAt(at, 10, 200);
  if (f < at) return null;
  return (
    <div style={{ position: "absolute", left: 96, right: 96, top: y, textAlign: "center", transform: `translateY(${(1 - p) * 22}px)`, opacity: Math.min(1, p * 1.5) }}>
      <div style={{ ...kicker(B.white), marginBottom: 10 }}>{kicker_}</div>
      <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 78, letterSpacing: "-.045em", color: B.red, lineHeight: 1, textShadow: "0 8px 36px rgba(0,0,0,.7)" }}>{big}</div>
      {sub && <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontSize: 40, color: B.white, marginTop: 10 }}>{sub}</div>}
    </div>
  );
};

/* ── 6. Цитата (Зеленський) ──────────────────────────────────────────────── */
export const Quote: React.FC<{ at: number; text: string; who: string; y?: number }> = ({ at, text, who, y = 320 }) => {
  const f = useCurrentFrame();
  const p = useSpringAt(at, 13, 170);
  if (f < at) return null;
  return (
    <div style={{ ...panel, left: 96, right: 96, top: y, padding: "34px 30px 26px", transform: `translateY(${(1 - p) * 24}px)`, opacity: Math.min(1, p * 1.4) }}>
      <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 700, fontSize: 62, lineHeight: 1.08, color: B.white, textAlign: "center" }}>«{text}»</div>
      <div style={{ ...kicker(B.gray), fontSize: 22, textAlign: "right", marginTop: 16, textTransform: "none", letterSpacing: ".02em" }}>— {who}</div>
    </div>
  );
};

/* ── 7. Рядки-статуси (що відновлено / без відповіді) ────────────────────── */
const StatusRow: React.FC<{ at: number; text: string; ok: boolean }> = ({ at, text, ok }) => {
  const f = useCurrentFrame();
  const p = useSpringAt(at, 13, 180);
  if (f < at) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(10,10,10,.7)", borderRadius: 16, padding: "18px 24px",
      border: "1px solid rgba(255,255,255,.08)", transform: `translateX(${(1 - p) * 30}px)`, opacity: Math.min(1, p * 1.4) }}>
      <div style={{ width: 42, height: 42, borderRadius: 42, flex: "0 0 auto", background: ok ? B.red : "rgba(255,255,255,.16)", color: B.white,
        display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 26 }}>{ok ? "✓" : "—"}</div>
      <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 32, color: B.white, letterSpacing: "-.01em" }}>{text}</div>
    </div>
  );
};
export const StatusRows: React.FC<{ at: number; rows: { text: string; ok: boolean }[]; y?: number }> = ({ at, rows, y = 320 }) => (
  <div style={{ position: "absolute", left: 96, right: 96, top: y, display: "flex", flexDirection: "column", gap: 16 }}>
    {rows.map((r, i) => <StatusRow key={r.text} at={at + i * 11} text={r.text} ok={r.ok} />)}
  </div>
);

/* ── 8. Стрілка-вказівник (маркер від руки) ──────────────────────────────── */
export const ArrowCallout: React.FC<{ at: number; from: [number, number]; to: [number, number]; label: string; labelY?: number; bend?: number }> =
  ({ at, from, to, label, labelY, bend = 0.16 }) => (
    <div style={{ position: "absolute", inset: 0 }}>
      <Marker at={at} strokes={arrow(from, to, bend)} color={B.red} w={10} />
      {label && (
        <div style={{ position: "absolute", left: to[0], top: labelY ?? to[1] - 54, transform: "translateX(-50%)", whiteSpace: "nowrap",
          ...kicker(B.red), fontSize: 24 }}>{label}</div>
      )}
    </div>
  );

/* ── 9. Кредит авторства (CC BY) — дрібним під низом ─────────────────────── */
export const Credit: React.FC<{ text: string }> = ({ text }) => (
  <div style={{ position: "absolute", left: 24, right: 24, top: 70, textAlign: "center", fontFamily: FONT.sans, fontWeight: 500, fontSize: 15,
    color: "rgba(255,255,255,.5)", letterSpacing: ".01em" }}>{text}</div>
);
