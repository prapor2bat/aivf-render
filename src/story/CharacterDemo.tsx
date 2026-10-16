import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { B, FONT } from "../brand/tokens";
import { Tag } from "../brand/kit";
import { Character, CharSpec, Mood, PoseName } from "./Character";
import { Icon } from "./Icon";

/* Демо персонажа-мультика (нове у v3): двоє героїв «розмовляють», змінюють пози й настрої, тримають предмети.
   Без озвучки — рендериться одразу: npx remotion render CharacterDemo out/character-demo.mp4 --scale=1.5 --crf=18
   Скелет: src/story/Character.tsx (пози idle wave point shrug facepalm hold phone thumbs crossed laugh tired work hips;
   настрої neutral smile laugh annoyed tired worried proud surprised sad; зачіски short curly long bun bald cap chef hardhat kerchief ponytail). */
export const CHARACTER_DEMO_F = 300;
const A: CharSpec = { skin: "#EBC19C", hair: "short", hairColor: "#9A958E", outfit: "#6B5B4E", glasses: true, beard: true, mustache: true };
const M: CharSpec = { skin: "#F1C7A3", hair: "cap", hairColor: "#3B2A20", capColor: B.red, outfit: "#2A2A2E", badge: "ВАЙБ" };
const POSES_A: [number, PoseName][] = [[0, "crossed"], [40, "point"], [100, "shrug"], [160, "facepalm"], [220, "thumbs"]];
const MOODS_A: [number, Mood][] = [[0, "neutral"], [40, "annoyed"], [100, "surprised"], [160, "tired"], [220, "smile"]];
const POSES_M: [number, PoseName][] = [[0, "wave"], [70, "work"], [130, "laugh"], [190, "phone"], [250, "thumbs"]];
const MOODS_M: [number, Mood][] = [[0, "smile"], [70, "proud"], [130, "laugh"], [190, "worried"], [250, "laugh"]];
const LINES: [number, number, string, string][] = [[40, 95, "Два тижні на кнопку.", "A"], [100, 155, "Пʼять хвилин!", "M"], [160, 215, "Навіщо кнопці піца?", "A"], [220, 290, "Щоб усім сподобалось!", "M"]];

export const CharacterDemo: React.FC = () => {
  const f = useCurrentFrame();
  const line = LINES.find(([a, b]) => f >= a && f < b);
  return (
    <AbsoluteFill style={{ background: B.paper, backgroundImage: "linear-gradient(rgba(13,13,13,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(13,13,13,.045) 1px, transparent 1px)", backgroundSize: "48px 48px" }}>
      <Character spec={A} poses={POSES_A} moods={MOODS_A} talk={LINES.filter((l) => l[3] === "A").map(([a, b]) => [a, b])} x={200} y={1070} h={610} seed={3} />
      <Character spec={M} poses={POSES_M} moods={MOODS_M} talk={LINES.filter((l) => l[3] === "M").map(([a, b]) => [a, b])} x={530} y={1070} h={610} seed={7} flip hold={f >= 190 && f < 250 ? "device-mobile" : undefined} />
      <div style={{ position: "absolute", left: -20, right: -20, top: 880, height: 420, background: "#B98A5E", borderTop: `6px solid ${B.ink}` }} />
      {line && <div style={{ position: "absolute", left: 40, right: 40, top: 178, height: 100, borderRadius: 22, background: "#fff", border: `4px solid ${B.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.sans, fontWeight: 800, fontSize: 44, color: B.ink }}>
        <span style={{ position: "absolute", left: 18, top: -18, background: line[3] === "A" ? B.ink : B.red, color: "#fff", borderRadius: 999, padding: "4px 14px", fontSize: 20, letterSpacing: "0.06em" }}>{line[3] === "A" ? "СЕНЬЙОР" : "ВАЙБ-КОДЕР"}</span>{line[2]}</div>}
      <div style={{ position: "absolute", left: 600, top: 760 }}><Icon name="plant-2" size={90} color="#1E9E5A" stroke={2.2} p={Math.min(1, f / 30)} /></div>
      <Tag tone="paper" />
    </AbsoluteFill>
  );
};
