import React from "react";
import { AbsoluteFill, Audio, Img, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { RedWipe, Sfx, Stage, Words } from "../brand/kit";
import { B, H, useLayout } from "../brand/tokens";

/* Демо-ролик 10 с: живий аватар (lip-sync) + реальна озвучка. Кадр 720×1280, 30 fps.
   Озвучка: public/audio/avatar10.mp3 (10.66 с).
   Живий аватар: public/avatar/frames/f-0001..0266.webp (WebP alpha, 25 fps, 10.64 с) —
   прозора покадрова послідовність (lip-sync MoDA). Той самий голос озвучки → синхронно. */
export const AVATAR10_F = 320; // 10.67 с
const S1 = 210; // межа сцен ≈7 с — рівно на слові «Хук»
const TALK_N = 266; // кадрів у послідовності (25 fps × 10.64 с)

/* ── Живий аватар: прозоре відео у тому ж місці/розмірі, що й статичний PNG ── */
const TalkAvatar: React.FC<{ h?: number; disk?: boolean; at?: number }> = ({ h = 580, disk = true, at = 0 }) => {
  const { W, SAFE } = useLayout();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 120, mass: 0.9 } });
  const d = spring({ frame: f - at + 3, fps, config: { damping: 18, stiffness: 140 } });
  const w = h * (1122 / 1402);
  const n = Math.min(TALK_N, Math.max(1, Math.floor((f / fps) * 25) + 1)); // кадр lip-sync під поточний час
  const src = `avatar/frames/f-${String(n).padStart(4, "0")}.webp`;
  return (
    <div style={{ position: "absolute", left: W / 2 - w / 2, bottom: SAFE.bottom - 6, width: w, height: h }}>
      {disk && <div style={{ position: "absolute", left: w / 2 - h * 0.34, top: h * 0.04, width: h * 0.68, height: h * 0.68, borderRadius: "50%", background: B.red, transform: `scale(${d})` }} />}
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - p) * 160}px)`, opacity: Math.min(1, p * 2), filter: "drop-shadow(0 18px 24px rgba(0,0,0,.18))" }}>
        <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", objectPosition: "bottom" }} />
      </div>
    </div>
  );
};

export const Avatar10: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {/* 1. ЗНАЙОМСТВО — світла сцена */}
    <Sequence from={0} durationInFrames={S1}>
      <Stage tone="paper" dur={S1} arc={0}>
        <Sequence from={0} durationInFrames={95} layout="none">
          <Words tone="paper" top={200} at={[4, 10, 16, 26, 34]} lines={["Привіт, я твій", "*новий* ведучий"]} />
        </Sequence>
        <Sequence from={95} durationInFrames={S1 - 95} layout="none">
          <Words tone="paper" top={200} at={[6, 10, 14, 24, 30]} lines={["За десять секунд", "покажу *головне*"]} />
        </Sequence>
      </Stage>
    </Sequence>

    {/* 2. СУТЬ — темна сцена */}
    <Sequence from={S1} durationInFrames={AVATAR10_F - S1}>
      <Stage tone="night" dur={AVATAR10_F - S1} arc={1}>
        <Words tone="night" top={240} at={[9, 35, 66, 72]} lines={["Хук, утримання", "і *заклик*"]} />
      </Stage>
    </Sequence>

    {/* живий аватар — наскрізний шар поверх обох сцен */}
    <TalkAvatar h={580} />

    {/* переходи: червоне коло на старті та на зміні сцени */}
    <RedWipe at={0} />
    <RedWipe at={S1} y={H * 0.5} />

    {/* озвучка + тихий фон */}
    <Audio src={staticFile("audio/avatar10.mp3")} />
    <Audio src={staticFile("audio06/bgm.mp3")} volume={0.1} />

    {/* звук: пік кожного семплу — рівно на подію */}
    <Sfx k="i17" at={4} vol={0.22} />
    <Sfx k="p27" at={12} vol={0.2} />
    <Sfx k="w08" at={16} vol={0.14} />
    <Sfx k="p28" at={30} vol={0.25} />
    <Sfx k="w04" at={95} vol={0.25} />
    <Sfx k="i18" at={115} vol={0.5} />
    <Sfx k="w05" at={S1} vol={0.3} />
    <Sfx k="p27" at={S1 + 4} vol={0.2} />
    <Sfx k="p28" at={S1 + 9} vol={0.28} />
    <Sfx k="i18" at={S1 + 66} vol={0.55} />
    <Sfx k="d40" at={S1 + 90} vol={0.3} />
  </AbsoluteFill>
);
