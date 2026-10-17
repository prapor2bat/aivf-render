import React from "react";
import { AbsoluteFill, Audio, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

/* Коротка вставка аватара 10–15 с (з фабрики avatar-factory).
   Кадри: public/avatar-insert/frames/f-0001.webp … (WebP з альфа, 25 fps)
   Аудіо: public/avatar-insert/audio.mp3
   Зміни AVATAR_INSERT_F під довжину аудіо (fps=25). */
export const AVATAR_INSERT_F = 300; // 12 с @ 25 fps
const TALK_N = 300;

const TalkAvatar: React.FC<{ h?: number }> = ({ h = 900 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f, fps, config: { damping: 14, stiffness: 120, mass: 0.9 } });
  const w = h * (1122 / 1402);
  const n = Math.min(TALK_N, Math.max(1, Math.floor((f / fps) * 25) + 1));
  const src = `avatar-insert/frames/f-${String(n).padStart(4, "0")}.webp`;
  return (
    <div style={{ position: "absolute", left: 720 / 2 - w / 2, bottom: 40, width: w, height: h }}>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - p) * 80}px)`, opacity: Math.min(1, p * 2), filter: "drop-shadow(0 18px 24px rgba(0,0,0,.18))" }}>
        <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", objectPosition: "bottom" }} />
      </div>
    </div>
  );
};

export const AvatarInsert: React.FC = () => (
  <AbsoluteFill style={{ background: "transparent" }}>
    <TalkAvatar h={900} />
    <Audio src={staticFile("avatar-insert/audio.mp3")} />
  </AbsoluteFill>
);
