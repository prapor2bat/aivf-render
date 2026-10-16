import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, useVideoConfig } from "remotion";
import { measureText } from "@remotion/layout-utils";
import { B, FONT } from "./tokens";

/* ═══ ОБКЛАДИНКА (з 25.09.2026, правило користувача) ═══
   Кожен ролик починається з клікбейтної обкладинки на COVER_F кадрів (~0.27 с): при заливці в соцмережі
   цей кадр обирають як обкладинку. Статичний кадр (без анімації) — будь-який з 8 кадрів однаковий.
   9:16: УСЕ важливе — в центральній зоні 4:5 (Instagram-сітка ріже 9:16 до 4:5 / 3:4) → y 190…1090 з 1280.
   Текст: 1–2 слова, величезні; + аватар з емоцією (public/assets/av-*.png) + предмет теми (лого/стікер). */
export const COVER_F = 8;
export type CoverPose = "shock" | "head-shock" | "point-right" | "point-left" | "thumbs" | "idea" | "head-idea" | "skeptical" | "think" | "stop" | "facepalm" | "welcome";
export type CoverSpec = {
  top: string;             // 1-й рядок (біле/чорне)
  bottom?: string;         // 2-й рядок (червоне)
  pose?: CoverPose;        // поза аватара: public/assets/av-<поза>.png (head-* — лише якщо є такі файли)
  obj?: string;            // шлях до картинки предмета (staticFile), напр. "assets/fl-fire.png" або логотип
  objBg?: string;          // якщо лого — плитка під ним
  badge?: string;          // маленька плашка: «0 ₴», «НОВЕ», «#23»
  tone?: "night" | "paper" | "red";
};
const fit = (t: string, maxW: number, max: number) => Math.min(max, Math.floor(0.86 * maxW / (measureText({ text: t, fontFamily: FONT.sans, fontWeight: "900", fontSize: 100, letterSpacing: "-0.05em" }).width / 100)));

export const Cover: React.FC<{ spec: CoverSpec }> = ({ spec }) => {
  const { width: W, height: H } = useVideoConfig();
  const wide = W > H;
  const tone = spec.tone ?? "night";
  const bg = tone === "paper" ? B.paper : tone === "red" ? B.red : "#0B0B0D";
  const ink = tone === "paper" ? B.ink : B.white;
  const accent = tone === "red" ? B.ink : "#FF2D3A";
  const pose = spec.pose ?? "shock";
  // зона безпеки: 16:9 — BOX, 9:16 — центральна 4:5
  const Z = wide ? { x: 64, y: 40, w: W - 128, h: H - 80 } : { x: 0, y: Math.round((H - W * 5 / 4) / 2), w: W, h: Math.round(W * 5 / 4) };
  const textW = wide ? Z.w * 0.5 : Z.w - 70;
  const s1 = fit(spec.top, textW, wide ? 150 : 150), s2 = spec.bottom ? fit(spec.bottom, textW, wide ? 150 : 150) : 0;
  const headOnly = pose.startsWith("head-");
  const avH = wide ? H * (headOnly ? 0.78 : 1.02) : Z.h * (headOnly ? 0.5 : 0.66);
  const avW = avH * (headOnly ? 1 : 1122 / 1402);
  return (
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      {/* світло + фірмове червоне коло за аватаром */}
      <AbsoluteFill style={{ background: tone === "paper" ? "radial-gradient(ellipse at 70% 60%, rgba(227,32,43,.14), transparent 60%)" : "radial-gradient(ellipse at 70% 62%, rgba(227,32,43,.45), transparent 58%)" }} />
      <div style={{ position: "absolute", width: avH * 0.95, height: avH * 0.95, borderRadius: "50%", background: tone === "red" ? "rgba(0,0,0,.18)" : B.red,
        left: wide ? W - avH * 0.95 - 40 : Z.x + Z.w - avH * 0.86, top: wide ? H - avH * 0.9 : Z.y + Z.h - avH * 0.92, opacity: tone === "red" ? 1 : 0.95 }} />
      {/* аватар */}
      <Img src={staticFile(`assets/av-${pose}.png`)} style={{ position: "absolute", height: avH, width: avW, objectFit: "contain",
        left: wide ? W - avW - 20 : Z.x + Z.w - avW + (headOnly ? 30 : 60), top: wide ? H - avH + (headOnly ? 0 : H * 0.06) : Z.y + Z.h - avH + (headOnly ? 10 : 30),
        filter: "drop-shadow(0 20px 40px rgba(0,0,0,.45))" }} />
      {/* предмет теми */}
      {spec.obj && <div style={{ position: "absolute", left: wide ? W * 0.42 : Z.x + 40, top: wide ? H * 0.5 : Z.y + Z.h * 0.52, width: wide ? 230 : 250, height: wide ? 230 : 250,
        transform: "rotate(-8deg)", borderRadius: spec.objBg ? 48 : 0, background: spec.objBg, display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: spec.objBg ? "0 30px 60px -20px rgba(0,0,0,.6)" : undefined, filter: spec.objBg ? undefined : "drop-shadow(0 24px 40px rgba(0,0,0,.5))" }}>
        <Img src={staticFile(spec.obj)} style={{ width: spec.objBg ? "70%" : "100%", height: spec.objBg ? "70%" : "100%", objectFit: "contain" }} /></div>}
      {/* 1–2 слова */}
      <div style={{ position: "absolute", left: wide ? Z.x + 16 : Z.x + 36, top: wide ? Z.y + 30 : Z.y + 34, width: textW, fontFamily: FONT.sans, fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.9 }}>
        {spec.badge && <div style={{ display: "inline-block", marginBottom: 14, padding: "8px 18px", borderRadius: 999, background: tone === "red" ? B.ink : B.red, color: B.white, fontSize: wide ? 30 : 34, letterSpacing: "0.01em" }}>{spec.badge}</div>}
        <div style={{ fontSize: s1, color: ink, textShadow: tone === "paper" ? "none" : "0 8px 30px rgba(0,0,0,.5)", whiteSpace: "nowrap" }}>{spec.top}</div>
        {spec.bottom && <div style={{ fontSize: s2, color: accent, whiteSpace: "nowrap", textShadow: tone === "paper" ? "none" : "0 8px 30px rgba(0,0,0,.4)" }}>{spec.bottom}</div>}
      </div>
    </AbsoluteFill>
  );
};

/** Обкладинка на початку + ролик після неї. Тривалість композиції = COVER_F + тривалість ролика. */
export const withCover = (Comp: React.FC, spec: CoverSpec): React.FC => () => (
  <AbsoluteFill>
    <Sequence durationInFrames={COVER_F} layout="none"><Cover spec={spec} /></Sequence>
    <Sequence from={COVER_F} layout="none"><Comp /></Sequence>
  </AbsoluteFill>
);

/** Перевірка: рамка 4:5 і 3:4 поверх вертикального кадру (лише для чорнових стилів). */
export const CoverGuide: React.FC = () => {
  const { width: W, height: H } = useVideoConfig();
  if (W > H) return null;
  const h45 = W * 5 / 4, h34 = W * 4 / 3;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: (H - h34) / 2, height: h34, border: "3px dashed #00E0FF" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: (H - h45) / 2, height: h45, border: "3px dashed #FFE600" }} />
    </AbsoluteFill>
  );
};
