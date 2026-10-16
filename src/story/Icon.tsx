import React from "react";
import ICONS from "./icons.json";

/* Лінійні іконки Tabler (MIT) з icons.json. p — прогрес «самомалювання» лінії 0…1 (як у референсі R4). */
const DICT = ICONS as Record<string, string>;
export const hasIcon = (n: string) => !!DICT[n];
export const Icon: React.FC<{ name: string; size: number; color: string; p?: number; stroke?: number; style?: React.CSSProperties; fill?: string }> = ({ name, size, color, p = 1, stroke = 1.7, style, fill }) => {
  const body = DICT[name] ?? DICT["box"];
  const q = Math.max(0, Math.min(1, p));
  const html = body
    .replace(/stroke-width="[\d.]+"/g, `stroke-width="${stroke}"`)
    .replace(/<(path|circle|line|rect|polyline|polygon|ellipse)\b/g, `<$1 pathLength="1" stroke-dasharray="1 0" stroke-dashoffset="0"`)
    .replace(/stroke-dasharray="1 0" stroke-dashoffset="0"/g, q >= 1 ? `stroke-dasharray="1 0"` : `stroke-dasharray="1 1" stroke-dashoffset="${(1 - q).toFixed(4)}"`);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ color, overflow: "visible", ...style }}>
      {fill && <circle cx={12} cy={12} r={11.5} fill={fill} />}
      <g dangerouslySetInnerHTML={{ __html: html }} />
    </svg>
  );
};
