import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ez, float } from "./kit";
import { B, FONT, isDark, Tone, useLayout } from "./tokens";

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const useSpring = (at: number, damping = 13, stiffness = 160) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: f - at, fps, config: { damping, stiffness, mass: 0.8 } });
};

/* ── Логотипи моделей ─────────────────────────────────────────────────── */
/* Реєстр логотипів бренду: докачані в styles/logos → public/pack/brand. Нові сервіси ДОДАВАТИ СЮДИ.
   img — кольорова картинка (svg/png/jpg) як є; svg+color — однотонний знак, фарбується маскою. */
export type Logo = { img?: string; svg?: string; color?: string; bg: string; zoom?: number; label?: string; pad?: number };
export const LOGOS: Record<string, Logo> = {
  flow: { svg: "pack/brand/flow_b.png", color: "#1A1A1A", bg: B.white, label: "Flow" },
  nanobanana: { img: "pack/brand/nanobanana-color.svg", bg: "#FFF6D6", pad: 0.2 },
  geminiColor: { img: "pack/brand/gemini-color.svg", bg: B.white, pad: 0.22 },
  qwenColor: { img: "pack/brand/qwen-color.svg", bg: B.white, pad: 0.22 },
  suno: { svg: "pack/brand/suno.svg", color: "#111", bg: B.white, label: "Suno" },
  aistudio: { svg: "pack/brand/aistudio.svg", color: "#1A73E8", bg: B.white, label: "AI Studio" },
  heygen: { img: "pack/brand/heygen_logo.svg", bg: B.white, pad: 0.14 },
  grokMark: { svg: "pack/brand/grok.svg", color: B.white, bg: "#000", label: "" },
  x: { svg: "pack/brand/x.svg", color: B.white, bg: "#000" },
  youtube: { svg: "pack/brand/youtube.svg", color: "#FF0000", bg: B.white, label: "YouTube" },
  capcut: { svg: "pack/brand/capcut.svg", color: "#000", bg: B.white, label: "CapCut" },
  claude3d: { img: "pack/logo/claude-orange-3d-symbol.jpg", bg: B.white, zoom: 1.12 },
  claude: { img: "pack/brand/claude-color.svg", bg: B.white, pad: 0.22 },
  chatgpt: { svg: "pack/brand/openai.svg", color: "#111", bg: B.white, label: "ChatGPT" },
  elevenlabs: { svg: "pack/brand/elevenlabs.svg", color: "#111", bg: B.white, label: "ElevenLabs" },
  remotion: { img: "pack/brand/remotion-logo.svg", bg: "#0B0B0F", pad: 0.2 },
  grok: { img: "pack/logo/grok-black-app-tile.jpg", bg: "#000", zoom: 1.2 },
  kling: { img: "pack/logo/kling-ai-white-on-black.jpg", bg: "#000", zoom: 1.02 },
  wan: { svg: "pack/svg/simple-icons-alibabacloud.svg", color: "#FF6A00", bg: B.white, label: "Wan" },
  gemini: { img: "pack/logo/gemini-white-app-tile.jpg", bg: B.white, zoom: 1.14 },
  seed: { svg: "pack/svg/simple-icons-bytedance.svg", color: "#325AB4", bg: B.white, label: "Seedance" },
  qwen: { svg: "pack/svg/simple-icons-qwen.svg", color: "#615CED", bg: B.white, label: "Qwen" },
  meta: { svg: "pack/svg/simple-icons-meta.svg", color: "#0467DF", bg: B.white, label: "Meta" },
};

export const LogoTile: React.FC<{ id: keyof typeof LOGOS; at: number; x: number; y: number; size?: number; seed?: number; rot?: number }> =
  ({ id, at, x, y, size = 170, seed = 0, rot = 0 }) => {
    const f = useCurrentFrame();
    const p = useSpring(at, 12, 170);
    if (f < at) return null;
    const L = LOGOS[id];
    const r = size * 0.24;
    return (
      <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: r, overflow: "hidden", background: L.bg,
        boxShadow: "0 26px 44px -18px rgba(0,0,0,.45), 0 2px 5px rgba(0,0,0,.12)", transform: `${float(f, seed, 4, false)} scale(${0.4 + 0.6 * p}) rotate(${rot + (1 - p) * -18}deg)`, opacity: Math.min(1, p * 1.5) }}>
        {L.img && <Img src={staticFile(L.img)} style={{ position: "absolute", inset: size * (L.pad ?? 0), width: size * (1 - 2 * (L.pad ?? 0)), height: size * (1 - 2 * (L.pad ?? 0)), objectFit: L.pad ? "contain" : "cover", transform: `scale(${L.zoom ?? 1})` }} />}
        {L.svg && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: size * 0.04 }}>
            <div style={{ width: size * 0.46, height: size * 0.46, background: L.color, WebkitMaskImage: `url(${staticFile(L.svg)})`, WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center" }} />
            {L.label && <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: size * 0.13, letterSpacing: "-0.03em", color: L.bg === "#000" ? B.white : B.ink }}>{L.label}</div>}
          </div>
        )}
      </div>
    );
  };

/* ── Назва моделі ─────────────────────────────────────────────────────── */
export const Name: React.FC<{ text: string; ver: string; at: number; y: number; tone: Tone }> = ({ text, ver, at, y, tone }) => {
    const { W, BOX } = useLayout();
  const f = useCurrentFrame();
  const p = ez(f, at, at + 6, [0, 1]);
  return (
    <div style={{ position: "absolute", left: BOX.x, width: BOX.w, top: y, textAlign: "center", fontFamily: FONT.sans, fontWeight: 800, fontSize: 50, letterSpacing: "-0.04em",
      color: isDark(tone) ? B.white : B.ink, opacity: p, filter: 1 - p > 0.004 ? `blur(${(1 - p) * 10}px)` : undefined, transform: `translateY(${(1 - p) * 12}px)` }}>
      {text} <span style={{ color: B.red }}>{ver}</span>
    </div>
  );
};

/* ── Цінник: накручується від нуля ────────────────────────────────────── */
export const Price: React.FC<{ value: number; at: number; y: number; tone: Tone; approx?: boolean; note: string; digits?: number }> =
  ({ value, at, y, tone, approx, note, digits = 2 }) => {
    const { W, BOX } = useLayout();
    const f = useCurrentFrame();
    const land = useSpring(at + 14, 9, 220);
    if (f < at) return null;
    const t = ez(f, at, at + 16, [0, 1]);
    const v = (value * t).toFixed(digits);
    const dark = isDark(tone);
    return (
      <div style={{ position: "absolute", left: BOX.x, width: BOX.w, top: y, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "baseline", gap: 10, transform: `scale(${0.85 + 0.15 * land})` }}>
          <span style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 118, letterSpacing: "-0.05em", color: B.red, fontVariantNumeric: "tabular-nums",
            textShadow: dark ? "0 0 36px rgba(227,32,43,.45)" : "none" }}>{approx ? "≈" : ""}${v}</span>
          <span style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 500, fontSize: 40, color: dark ? B.white : B.ink }}>/ сек</span>
        </div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 500, fontSize: 22, color: dark ? "rgba(255,255,255,.6)" : B.gray, marginTop: -6, opacity: ez(f, at + 12, at + 20, [0, 1]) }}>{note}</div>
      </div>
    );
  };

/* ── Чип переваги ─────────────────────────────────────────────────────── */
export const Chip: React.FC<{ text: string; icon?: string; at: number; x?: number; y: number; red?: boolean }> = ({ text, icon, at, x: x0, y, red }) => {
  const x = x0 ?? useLayout().W / 2;
  const f = useCurrentFrame();
  const p = useSpring(at, 12, 180);
  if (f < at) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateX(-50%) translateY(${(1 - p) * 30}px) scale(${0.7 + 0.3 * p})`, opacity: Math.min(1, p * 1.4),
      display: "flex", alignItems: "center", gap: 12, padding: "12px 24px 12px 14px", borderRadius: 999, background: red ? B.red : B.white, whiteSpace: "nowrap",
      boxShadow: "0 16px 30px -14px rgba(0,0,0,.4)", fontFamily: FONT.sans, fontWeight: 700, fontSize: 30, letterSpacing: "-0.02em", color: red ? B.white : B.ink }}>
      {icon ? <Img src={staticFile(icon)} style={{ width: 40, height: 40 }} /> : <span style={{ width: 14, height: 14, borderRadius: 14, background: red ? B.white : B.red, marginLeft: 8 }} />}
      {text}
    </div>
  );
};

/* ── Велика цифра-факт ────────────────────────────────────────────────── */
export const BigStat: React.FC<{ n: string; label: string; at: number; x: number; y: number; tone: Tone }> = ({ n, label, at, x, y, tone }) => {
  const f = useCurrentFrame();
  const p = useSpring(at, 10, 200);
  if (f < at) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 280, marginLeft: -140, textAlign: "center", transform: `scale(${1.3 - 0.3 * p})`, opacity: Math.min(1, p * 1.5), filter: 1 - Math.min(1, p) > 0.004 ? `blur(${(1 - Math.min(1, p)) * 10}px)` : undefined }}>
      <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 150, lineHeight: 0.9, letterSpacing: "-0.06em", color: B.red }}>{n}</div>
      <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 500, fontSize: 34, color: isDark(tone) ? B.white : B.ink, marginTop: 6 }}>{label}</div>
    </div>
  );
};

/* ── Картка рейтингу Arena ────────────────────────────────────────────── */
export const RankCard: React.FC<{ at: number; y: number; rows: { r: string; name: string; elo: number; me?: boolean }[]; title: string }> = ({ at, y, rows, title }) => {
    const { W, BOX } = useLayout();
  const f = useCurrentFrame();
  const p = useSpring(at, 15, 150);
  if (f < at) return null;
  return (
    <div style={{ position: "absolute", left: BOX.x + 30, width: BOX.w - 60, top: y, background: B.white, borderRadius: 18, padding: "26px 28px 18px", transform: `translateY(${(1 - p) * 60}px) rotate(${-2 * p}deg)`, opacity: p,
      boxShadow: "0 30px 60px -24px rgba(0,0,0,.35)" }}>
      <div style={{ position: "absolute", top: -12, left: "50%", marginLeft: -13, width: 26, height: 26, borderRadius: 26, background: B.red, boxShadow: "0 6px 10px rgba(0,0,0,.3)" }} />
      <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 20, color: B.gray, marginBottom: 8, letterSpacing: 0.5 }}>{title}</div>
      {rows.map((r, i) => {
        const q = ez(f, at + 8 + i * 6, at + 14 + i * 6, [0, 1]);
        return (
          <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 14, padding: "7px 0", borderTop: i ? "1px solid #eee" : "none", opacity: q, transform: `translateX(${(1 - q) * -20}px)`,
            fontFamily: FONT.sans, fontSize: 30, fontWeight: r.me ? 900 : 600, color: r.me ? B.red : B.ink }}>
            <span style={{ width: 52 }}>{r.r}</span><span style={{ flex: 1, letterSpacing: "-0.02em" }}>{r.name}</span><span style={{ fontVariantNumeric: "tabular-nums", color: r.me ? B.red : B.gray }}>{r.elo}</span>
          </div>
        );
      })}
    </div>
  );
};

/* ── Штамп «СЕКРЕТНО» ─────────────────────────────────────────────────── */
export const Stamp: React.FC<{ text: string; at: number; x: number; y: number }> = ({ text, at, x, y }) => {
  const f = useCurrentFrame();
  const p = useSpring(at, 9, 260);
  if (f < at) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(-9deg) scale(${2.2 - 1.2 * p})`, opacity: Math.min(1, p * 2),
      border: `6px solid ${B.red}`, borderRadius: 14, padding: "6px 22px", fontFamily: FONT.sans, fontWeight: 900, fontSize: 64, letterSpacing: 4, color: B.red }}>{text}</div>
  );
};

/* ── Наскрізна шкала цін (0–25¢), точки додаються сцена за сценою ─────── */
export type Mark = { id: string; label: string; price: number; at: number; lvl: number; side?: "l" | "r" };
export const Ruler: React.FC<{ marks: Mark[]; active: string | null; tone: Tone; show: number; hide: number }> = ({ marks, active, tone, show, hide }) => {
    const { W, BOX } = useLayout();
  const f = useCurrentFrame();
  const o = Math.min(ez(f, show, show + 10, [0, 1]), interpolate(f, [hide - 8, hide], [1, 0], clamp));
  if (o <= 0) return null;
  const dark = isDark(tone);
  const ink = dark ? "rgba(255,255,255,.85)" : B.ink, dim = dark ? "rgba(255,255,255,.45)" : B.gray;
  const x0 = BOX.x + 24, x1 = BOX.x + BOX.w - 24, Y = 948;
  const X = (p: number) => x0 + (p / 0.25) * (x1 - x0);
  const draw = ez(f, show, show + 18, [0, 1]);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <div style={{ position: "absolute", left: x0, top: 846, fontFamily: FONT.sans, fontWeight: 700, fontSize: 18, letterSpacing: 1.5, color: dim }}>ЦІНА ЗА 1 СЕК · 720p</div>
      <div style={{ position: "absolute", left: x0, top: Y, width: (x1 - x0) * draw, height: 3, background: ink, borderRadius: 3 }} />
      {[0, 0.05, 0.1, 0.15, 0.2, 0.25].map((t) => (
        <React.Fragment key={t}>
          <div style={{ position: "absolute", left: X(t) - 1, top: Y - 6, width: 2, height: 15, background: ink, opacity: draw }} />
          <div style={{ position: "absolute", left: X(t) - 30, width: 60, top: Y + 14, textAlign: "center", fontFamily: FONT.sans, fontWeight: 600, fontSize: 18, color: dim, opacity: draw }}>{Math.round(t * 100)}¢</div>
        </React.Fragment>
      ))}
      {marks.filter((m) => f >= m.at).map((m) => {
        const p = spring({ frame: f - m.at, fps: 30, config: { damping: 10, stiffness: 200 } });
        const on = m.id === active;
        const ly = Y - 34 - m.lvl * 30;
        return (
          <React.Fragment key={m.id}>
            <div style={{ position: "absolute", left: X(m.price) - 1, top: ly + 22, width: 2, height: Y - ly - 22, background: on ? B.red : dim, opacity: p }} />
            <div style={{ position: "absolute", left: X(m.price) - 11, top: Y - 11 - (1 - p) * 40, width: 22, height: 22, borderRadius: 22, background: on ? B.red : ink, border: `3px solid ${dark ? B.night : B.paper}`, opacity: Math.min(1, p * 2) }} />
            <div style={{ position: "absolute", left: X(m.price) + (m.side === "r" ? -4 : m.side === "l" ? 4 : 0), top: ly, transform: m.side === "r" ? "translateX(-100%)" : m.side === "l" ? "none" : "translateX(-50%)", whiteSpace: "nowrap", fontFamily: FONT.sans, fontWeight: on ? 900 : 600, fontSize: on ? 22 : 18, color: on ? B.red : dim, opacity: p }}>{m.label}</div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
