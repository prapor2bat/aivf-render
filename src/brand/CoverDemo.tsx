import React from "react";
import { AbsoluteFill } from "remotion";
import { Cover, CoverGuide, CoverSpec } from "./cover";

/* Приклади обкладинок (перевірка стилю). Аватар — твої пози public/assets/av-<поза>.png (docs/AVATAR.md): вертикаль з рамками 4:5 / 3:4 і горизонталь. */
export const SPEC_SCAMS: CoverSpec = { top: "ХАЛЯВА", bottom: "КРАДЕ", pose: "shock", obj: "assets/fl-fishing_pole.png", badge: "ChatGPT · Claude", tone: "night" };
export const SPEC_CCODE: CoverSpec = { top: "НЕ БІЙСЯ", bottom: "CLAUDE CODE", pose: "point-left", obj: "pack/brand/claude-color.svg", objBg: "#FFFFFF", badge: "ПРОСТИМИ СЛОВАМИ", tone: "paper" };
export const CoverDemoV: React.FC<{ guide?: boolean }> = ({ guide }) => <AbsoluteFill><Cover spec={SPEC_SCAMS} />{guide && <CoverGuide />}</AbsoluteFill>;
export const CoverDemoW: React.FC = () => <Cover spec={SPEC_CCODE} />;
