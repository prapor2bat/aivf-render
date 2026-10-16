import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { measureText } from "@remotion/layout-utils";
import { B, FONT, isDark, MOTION, Tone, TYPE, useLayout } from "./tokens";
import { USFX, UsfxKey, hit, tail } from "../components/userSfx";
import { AVATAR_ALPHA_POSES, CHANNEL, CTA_TITLE, SERIES, SOCIALS } from "./config";
import { BRAND } from "./i18n";

/* ═══════════════════════════════════════════════════════════════════════
   BRAND KIT — фірмові деталі. Ролик збирається тільки з них.
   Stage · Words · RedWipe · Iris · Tag · Arc · Cut · Avatar · PinCard · EndCard · Sfx
   ═══════════════════════════════════════════════════════════════════════ */

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const outExpo = Easing.out(Easing.exp);
const inOut = Easing.bezier(0.65, 0, 0.35, 1);
export const ez = (f: number, a: number, b: number, o: [number, number], e = outExpo) => interpolate(f, [a, b], o, { easing: e, ...clamp });
/** «дихання» елемента. rot=false — без повороту: для карток і плашок з текстом (поворот мʼякшить текст і краї) */
export const float = (f: number, seed = 0, amp = 5, rot = true) =>
  `translate(0px, ${Math.round(Math.sin((f + seed * 23) / 38) * amp * 2) / 2}px)` + (rot ? ` translate(${Math.sin((f + seed * 41) / 47) * amp * 0.6}px, 0px) rotate(${Math.sin((f + seed * 17) / 61) * 1.1}deg)` : "");

/* ── Штрихкод (детермінований з тексту) ───────────────────────────────── */
const Barcode: React.FC<{ text: string; h?: number; color: string }> = ({ text, h = 22, color }) => {
  const bars: number[] = [];
  for (const ch of text + text) { const c = ch.charCodeAt(0); bars.push(1 + (c % 3), 1 + ((c >> 2) % 2)); }
  let x = 0;
  const rects = bars.map((w, i) => { const r = i % 2 === 0 ? <rect key={i} x={x} y={0} width={w} height={h} fill={color} /> : null; x += w; return r; });
  return <svg width={x} height={h} style={{ display: "block" }}>{rects}</svg>;
};

/* ── Бирка бренду: штрихкод + назва каналу + рубрика. Типово uk (config.ts/i18n.ts),
   для багатомовних роликів передають channel/series своєю мовою. Вгорі зліва в сейф-зоні ── */
export const Tag: React.FC<{ tone: Tone; channel?: string; series?: string }> = ({ tone, channel = CHANNEL, series = SERIES }) => {
    const { W, H, SAFE, BOX, wide } = useLayout();
  const c = isDark(tone) ? "rgba(255,255,255,0.85)" : B.ink;
  return (
    <div style={{ position: "absolute", left: SAFE.left, top: SAFE.top + 4, display: "flex", alignItems: "center", gap: 10, opacity: 0.9 }}>
      <Barcode text={channel} color={c} />
      <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 13, letterSpacing: 1.6, color: c, lineHeight: 1.15 }}>
        {channel}<br /><span style={{ fontWeight: 500, opacity: 0.7 }}>{series}</span>
      </div>
      <div style={{ width: 9, height: 9, borderRadius: 9, background: B.red, marginLeft: 2 }} />
    </div>
  );
};

/* ── Велика сіра дуга через кадр (декор світлих сцен) ─────────────────── */
export const Arc: React.FC<{ seed?: number; tone: Tone }> = ({ seed = 0, tone }) => {
    const { W, H, SAFE, BOX, wide } = useLayout();
  const f = useCurrentFrame();
  const rot = -18 + seed * 37 + f * 0.08;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <circle cx={W * (seed % 2 ? 0.95 : 0.1)} cy={H * 0.55} r={520} fill="none"
        stroke={isDark(tone) ? "rgba(255,255,255,0.07)" : "rgba(13,13,13,0.09)"} strokeWidth={46}
        strokeDasharray="900 3000" transform={`rotate(${rot} ${W * (seed % 2 ? 0.95 : 0.1)} ${H * 0.55})`} strokeLinecap="round" />
    </svg>
  );
};

/* ── Сцена: тло тону + сітка/віньєтка + наїзд камери + бирка ─────────── */
export const Stage: React.FC<{ tone: Tone; dur: number; push?: number; arc?: number | false; tag?: boolean; children?: React.ReactNode }> =
  ({ tone, dur, push = MOTION.push, arc = false, tag = true, children }) => {
    const f = useCurrentFrame();
    const s = 1 + push * interpolate(f, [0, dur], [0, 1], clamp);
    const bg = { paper: B.paper, night: B.night, blush: B.blush, red: B.red }[tone];
    const grid = isDark(tone) ? B.gridNight : B.grid;
    // тло лежить у ТОМУ Ж шарі, що й контент: інакше mix-blend (multiply/screen) не бачить його під transform
    return (
      <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
        <AbsoluteFill style={{ transform: `scale(${s})`, background: bg }}>
          <AbsoluteFill style={{ backgroundImage: `linear-gradient(${grid} 1px, transparent 1px), linear-gradient(90deg, ${grid} 1px, transparent 1px)`, backgroundSize: "48px 48px", backgroundPosition: "center" }} />
          {tone === "night" && <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 45% at 50% 45%, rgba(255,255,255,0.10), transparent 70%)" }} />}
          <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, transparent 45%, ${tone === "night" ? "#000" : tone === "red" ? "#B3141D" : B.paper2} 100%)`, opacity: tone === "blush" ? 0.35 : 0.8 }} />
          {arc !== false && <Arc seed={arc} tone={tone} />}
          {children}
        </AbsoluteFill>
        {tag && <Tag tone={tone} />}
      </AbsoluteFill>
    );
  };

/* ── СЛОВА: головний механізм бренду ──────────────────────────────────
   Розмітка рядка:  *слово* = КЛЮЧОВЕ (червоне, 900, ×1.42)
                    _слово_ = курсив-серіф (акцент-поворот: «але», «насправді»)
                    ~слово~ = службове (сіре, дрібне)
   at: кадр появи кожного слова (з таймкодів голосу) або auto з кроком wordStep.
   Кожен рядок сам зменшується, щоб влізти в сейф-зону. */
type Tok = { t: string; kind: "base" | "key" | "serif" | "small" };
const MARK: Record<string, Tok["kind"]> = { "*": "key", "_": "serif", "~": "small" };
/** Розмітка може охоплювати кілька слів: «~не нагороджує~». */
const parse = (line: string): Tok[] => {
  let mode: Tok["kind"] = "base";
  return line.split(/\s+/).filter(Boolean).map((w) => {
    const open = MARK[w[0]];
    if (mode === "base" && open) mode = open;
    const kind = mode;
    const t = w.replace(/[*_~]/g, "");
    if (/[*_~][.,!?:;…»")]*$/.test(w) && (w.length > 1 || !open)) mode = "base";
    return { t, kind };
  });
};
const tokStyle = (k: Tok["kind"], size: number, dark: boolean): React.CSSProperties => {
  const fg = dark ? B.white : B.ink;
  if (k === "key") return { fontFamily: FONT.sans, fontWeight: 900, fontSize: size * TYPE.key, color: B.red, letterSpacing: `${TYPE.tracking}em` };
  if (k === "serif") return { fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 500, fontSize: size * TYPE.serif, color: fg, letterSpacing: "-0.01em" };
  if (k === "small") return { fontFamily: FONT.sans, fontWeight: 500, fontSize: size * TYPE.small, color: dark ? "rgba(255,255,255,0.6)" : B.gray, letterSpacing: "-0.02em" };
  return { fontFamily: FONT.sans, fontWeight: 700, fontSize: size, color: fg, letterSpacing: `${TYPE.tracking}em` };
};
const lineWidth = (toks: Tok[], size: number) => {
  const gap = size * 0.24;
  return toks.reduce((a, tk) => {
    const st = tokStyle(tk.kind, size, false);
    const w = measureText({ text: tk.t, fontFamily: st.fontFamily as string, fontSize: st.fontSize as number, fontWeight: String(st.fontWeight), letterSpacing: typeof st.letterSpacing === "string" ? `${parseFloat(st.letterSpacing) * (st.fontSize as number)}px` : undefined }).width;
    return a + w * (tk.kind === "serif" ? 1.04 : 1);
  }, 0) + gap * (toks.length - 1);
};

export const Words: React.FC<{ lines: string[]; at?: number[]; start?: number; step?: number; tone: Tone; size?: number; top?: number; align?: "center" | "left"; maxW?: number }> =
  ({ lines, at, start = 0, step = MOTION.wordStep, tone, size = TYPE.base, top = 420, align = "center", maxW: maxW0 }) => {
    const { W, H, SAFE, BOX, wide } = useLayout();
    const maxW = maxW0 ?? useLayout().BOX.w;
    const f = useCurrentFrame(); const { fps } = useVideoConfig();
    const dark = isDark(tone);
    let idx = 0;
    return (
      <div style={{ position: "absolute", left: BOX.x, width: BOX.w, top, display: "flex", flexDirection: "column", alignItems: align === "center" ? "center" : "flex-start", gap: size * 0.02 }}>
        {lines.map((ln, li) => {
          const toks = parse(ln);
          const k = Math.min(1, (maxW * 0.97) / lineWidth(toks, size));
          const sz = size * k;
          return (
            <div key={li} style={{ display: "flex", alignItems: "baseline", justifyContent: align === "center" ? "center" : "flex-start", gap: sz * 0.24, whiteSpace: "nowrap", lineHeight: 1.0 }}>
              {toks.map((tk, ti) => {
                const t0 = at?.[idx] ?? start + idx * step; idx++;
                const p = ez(f, t0, t0 + MOTION.wordIn, [0, 1]);
                const pop = tk.kind === "key" ? spring({ frame: f - t0, fps, config: { damping: 11, stiffness: 180, mass: 0.7 } }) : p;
                const sc = tk.kind === "key" ? 1.28 - 0.28 * pop : 0.9 + 0.1 * p;
                const glow = tk.kind === "key" && dark ? `0 0 28px rgba(227,32,43,${0.55 * p})` : "none";
                return (
                  <span key={ti} style={{ ...tokStyle(tk.kind, sz, dark), display: "inline-block", opacity: p, filter: 1 - p > 0.004 ? `blur(${(1 - p) * 14}px)` : undefined,
                    transform: `translateY(${(1 - p) * 12}px) scale(${sc})`, transformOrigin: "50% 70%", textShadow: glow }}>{tk.t}</span>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

/* ── СУБТИТРИ: кожне слово озвучки з'являється в момент, коли його чути ──
   items — слова сцени з кадром появи (відносно сцени); key → червоне 900;
   brk → після слова група закінчується. Група ≤ 3 слова, один рядок, сам стискається. */
export type CapWord = { text: string; f: number; key?: boolean; brk?: boolean };
export const Captions: React.FC<{ items: CapWord[]; tone: Tone; top?: number; size?: number; until?: number }> =
  ({ items, tone, top = 172, size = 68, until = 99999 }) => {
    const { W, H, SAFE, BOX, wide } = useLayout();
    const f = useCurrentFrame(); const { fps } = useVideoConfig();
    const groups: CapWord[][] = [];
    let cur: CapWord[] = [];
    for (const w of items) { if (!w.text) continue; cur.push(w); if (w.brk || cur.length >= 3) { groups.push(cur); cur = []; } }
    if (cur.length) groups.push(cur);
    const gi = groups.findIndex((g, i) => f >= g[0].f - 1 && (i === groups.length - 1 || f < groups[i + 1][0].f - 1));
    if (gi < 0 || f > until) return null;
    const g = groups[gi];
    const dark = isDark(tone);
    const toks: Tok[] = g.map((w) => ({ t: w.text, kind: w.key ? "key" : "base" }));
    const k = Math.min(1, (BOX.w * 0.97) / lineWidth(toks, size));
    const sz = size * k;
    return (
      <div style={{ position: "absolute", left: BOX.x, width: BOX.w, top, display: "flex", justifyContent: "center", alignItems: "baseline", gap: sz * 0.24, whiteSpace: "nowrap", lineHeight: 1.05 }}>
        {g.map((w, i) => {
          const p = ez(f, w.f, w.f + MOTION.wordIn, [0, 1]);
          const pop = w.key ? spring({ frame: f - w.f, fps, config: { damping: 11, stiffness: 180, mass: 0.7 } }) : p;
          const st = tokStyle(w.key ? "key" : "base", sz, dark);
          return (
            <span key={i} style={{ ...st, fontSize: (st.fontSize as number) * (w.key ? 0.82 : 1), display: "inline-block", opacity: p, filter: 1 - p > 0.004 ? `blur(${(1 - p) * 12}px)` : undefined,
              transform: `translateY(${(1 - p) * 10}px) scale(${w.key ? 1.25 - 0.25 * pop : 0.92 + 0.08 * p})`, transformOrigin: "50% 70%",
              textShadow: w.key && dark ? `0 0 24px rgba(227,32,43,${0.5 * p})` : "none" }}>{w.text}</span>
          );
        })}
      </div>
    );
  };

/* ── ПЕРЕХОДИ (кладуться поверх сцен на межі `at`) ───────────────────── */
/** Фірмовий: червоне коло з точки розростається на весь кадр і тане, відкриваючи нову сцену. */
export const RedWipe: React.FC<{ at: number; x?: number; y?: number; color?: string }> = ({ at, x: x0, y: y0, color = B.red }) => {
  const { W, H } = useLayout(); const x = x0 ?? W / 2, y = y0 ?? H * 0.45;
  const f = useCurrentFrame();
  const R = Math.hypot(Math.max(x, W - x), Math.max(y, H - y));
  const r = interpolate(f, [at - MOTION.wipe, at], [0, R], { easing: inOut, ...clamp });
  const o = interpolate(f, [at, at + 7], [1, 0], clamp);
  if (f < at - MOTION.wipe || f > at + 8) return null;
  return <AbsoluteFill style={{ pointerEvents: "none" }}><div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: color, opacity: o }} /></AbsoluteFill>;
};
/** Iris: чорна точка з'їдає кадр → темна сцена. */
export const Iris: React.FC<{ at: number; x?: number; y?: number }> = (p) => <RedWipe {...p} color={B.night} />;

/* ── Картинка з паку з правильним змішуванням фону ────────────────────── */
export const Cut: React.FC<{ src: string; at: number; x: number; y: number; w: number; blend?: "multiply" | "screen" | "normal"; rot?: number; seed?: number; shadow?: boolean; radius?: number }> =
  ({ src, at, x, y, w, blend = "normal", rot = 0, seed = 0, shadow = false, radius = 0 }) => {
    const f = useCurrentFrame(); const { fps } = useVideoConfig();
    const p = spring({ frame: f - at, fps, config: { damping: 13, stiffness: 160, mass: 0.8 } });
    if (f < at) return null;
    return (
      <div style={{ position: "absolute", left: x - w / 2, top: y - w / 2, width: w, transform: `${float(f, seed, 4)} scale(${0.6 + 0.4 * p}) rotate(${rot * p}deg)`, opacity: Math.min(1, p * 1.4), mixBlendMode: blend }}>
        <Img src={staticFile(src)} style={{ width: "100%", display: "block", borderRadius: radius, filter: shadow ? "drop-shadow(0 24px 30px rgba(0,0,0,.22))" : undefined }} />
      </div>
    );
  };

/* ── Аватар (твій персонаж з public/assets/av-<поза>.png) + червоний диск за спиною ── */
export type Pose = "welcome" | "shock" | "idea" | "point-right" | "point-left" | "thumbs" | "stop" | "think" | "skeptical" | "neutral" | "laptop" | "camera" | "facepalm";
const ALPHA = AVATAR_ALPHA_POSES as Pose[];
export const Avatar: React.FC<{ pose: Pose; at: number; x?: number; bottom?: number; h?: number; disk?: boolean; tone: Tone }> =
  ({ pose, at, x: x0, bottom: b0, h = 560, disk = true, tone }) => {
    const { W, SAFE } = useLayout(); const x = x0 ?? W / 2, bottom = b0 ?? SAFE.bottom;
    const f = useCurrentFrame(); const { fps } = useVideoConfig();
    const p = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 120, mass: 0.9 } });
    const d = spring({ frame: f - at + 3, fps, config: { damping: 18, stiffness: 140 } });
    if (f < at - 3) return null;
    const w = h * (1122 / 1402);
    const blend = ALPHA.includes(pose) ? "normal" : tone === "paper" || tone === "blush" ? "multiply" : "normal";
    return (
      <div style={{ position: "absolute", left: x - w / 2, bottom: bottom - 6, width: w, height: h }}>
        {disk && <div style={{ position: "absolute", left: w / 2 - h * 0.34, top: h * 0.04, width: h * 0.68, height: h * 0.68, borderRadius: "50%", background: B.red, transform: `scale(${d})` }} />}
        <Img src={staticFile(`assets/av-${pose}.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", objectPosition: "bottom",
          transform: `translateY(${(1 - p) * 160}px)`, opacity: Math.min(1, p * 2), mixBlendMode: blend,
          // тінь (filter) на елементі вимикає mix-blend у рендері → для поз з білим фоном без тіні
          filter: blend === "normal" ? "drop-shadow(0 18px 24px rgba(0,0,0,.18))" : undefined }} />
      </div>
    );
  };

/* ── Картка з червоною шпилькою + список (пункти з'являються по черзі) ── */
export const PinCard: React.FC<{ title: string; items: string[]; at: number; step?: number; top?: number; tilt?: number }> =
  ({ title, items, at, step = 9, top = 470, tilt = -3 }) => {
    const { W, H, SAFE, BOX, wide } = useLayout();
    const f = useCurrentFrame(); const { fps } = useVideoConfig();
    const p = spring({ frame: f - at, fps, config: { damping: 15, stiffness: 150 } });
    if (f < at) return null;
    return (
      <div style={{ position: "absolute", left: BOX.x + 24, width: BOX.w - 48, top, background: B.white, borderRadius: 18, padding: "34px 34px 28px",
        boxShadow: "0 30px 60px -24px rgba(0,0,0,.35), 0 2px 6px rgba(0,0,0,.06)", transform: `translateY(${(1 - p) * 80}px) rotate(${tilt * p}deg) ${float(f, 3, 3, false)}`, opacity: p }}>
        <div style={{ position: "absolute", top: -12, left: "50%", marginLeft: -13, width: 26, height: 26, borderRadius: 26, background: B.red, boxShadow: "0 6px 10px rgba(0,0,0,.3), inset -4px -4px 0 rgba(0,0,0,.18)" }} />
        <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 46, letterSpacing: "-0.04em", color: B.ink, borderBottom: `3px solid ${B.ink}`, paddingBottom: 12, marginBottom: 14 }}>{title}</div>
        {items.map((it, i) => {
          const q = ez(f, at + 10 + i * step, at + 16 + i * step, [0, 1]);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: FONT.sans, fontWeight: 600, fontSize: 28, color: B.ink, padding: "8px 0", opacity: q, transform: `translateX(${(1 - q) * -24}px)`, filter: 1 - q > 0.004 ? `blur(${(1 - q) * 8}px)` : undefined }}>
              <span style={{ width: 12, height: 12, borderRadius: 12, background: B.red, flex: "none" }} />{it}
            </div>
          );
        })}
      </div>
    );
  };

/* ── ФІНАЛЬНА КАРТКА (однакова в кожному ролику) ─────────────────────── */
export const EndCard: React.FC<{ at: number; code?: string; line?: string; pose?: Pose; cta?: [string, string] }> =
  ({ at, code, line = BRAND.uk.end, pose = "point-left", cta = CTA_TITLE }) => {
    const { W, H, SAFE, BOX, wide } = useLayout();
    const f = useCurrentFrame(); const { fps } = useVideoConfig();
    const s = (d: number) => spring({ frame: f - at - d, fps, config: { damping: 13, stiffness: 150 } });
    const socials = SOCIALS;
    return (
      <>
        <Avatar pose={pose} at={at + 4} x={wide ? W - SAFE.right - 190 : W - SAFE.right - 150} h={wide ? 500 : 470} tone="paper" bottom={wide ? 0 : undefined} />
        <div style={{ position: "absolute", left: BOX.x, top: wide ? 150 : 250, width: wide ? 640 : 420 }}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: wide ? 120 : 84, letterSpacing: "-0.05em", color: B.ink, lineHeight: 0.95, transform: `translateY(${(1 - s(0)) * 30}px)`, opacity: s(0), filter: 1 - s(0) > 0.004 ? `blur(${(1 - s(0)) * 10}px)` : undefined }}>
            {cta[0]}<span style={{ color: B.red }}>{cta[1]}</span>
          </div>
          <div style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 500, fontSize: wide ? 40 : 32, color: B.ink, marginTop: 10, opacity: s(6) }}>{line}</div>
          {code && (
            <div style={{ marginTop: 34, display: "inline-flex", flexDirection: "column", background: B.red, color: B.white, borderRadius: 16, padding: "14px 22px", transform: `scale(${s(14)}) rotate(-2deg)`, transformOrigin: "left center" }}>
              <span style={{ fontFamily: FONT.sans, fontWeight: 500, fontSize: 20, opacity: 0.85 }}>напиши в коментарях</span>
              <span style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 48, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>«{code}»</span>
            </div>
          )}
        </div>
        <div style={{ position: "absolute", left: BOX.x, bottom: SAFE.bottom + 20, display: "flex", gap: 14 }}>
          {socials.map((src, i) => (
            <div key={src} style={{ width: 74, height: 74, transform: `scale(${s(20 + i * 4)})`, mixBlendMode: "multiply" }}>
              <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </>
    );
  };

/* ── Звук з паку: пік рівно на кадрі події ───────────────────────────── */
export const Sfx: React.FC<{ k: UsfxKey; at: number; vol?: number; max?: number }> = ({ k, at, vol = 0.25, max }) => (
  <Sequence from={hit(k, at)} durationInFrames={Math.min(max ?? 9999, tail(k))} layout="none">
    <Audio src={staticFile(USFX[k].src)} volume={vol} />
  </Sequence>
);

/* ── Налагодження: показати сейф-зону ────────────────────────────────── */
export const SafeGuide: React.FC = () => { const { SAFE, BOX } = useLayout(); return (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: SAFE.left, top: SAFE.top, width: BOX.w, height: BOX.h, outline: "2px dashed rgba(0,160,255,.8)" }} />
  </AbsoluteFill>
); };

