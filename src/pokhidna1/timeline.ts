import { makeTimeline } from "../brand/timeline";
import meta from "./audio_meta.json";

/* Епізод 1 серії «Математика простими словами»: Що таке похідна. 16:9, 1280×720 → --scale=1.5. */
export const ORDER = ["hook", "idea", "geometry", "slope", "limit", "mechanics", "notation", "rule", "example", "graph", "meaning", "misconception", "why", "nmt", "history", "cta"] as const;
export type Id = typeof ORDER[number];

export const T = makeTimeline(meta as any, ORDER, {
  extra: { hook: 12, idea: 22, geometry: 16, slope: 18, limit: 34, mechanics: 18, notation: 14, rule: 22, example: 46, graph: 34, meaning: 22, misconception: 18, why: 16, nmt: 16, history: 22, cta: 130 },
  swap: [
    [["ікс", "у", "квадраті"], ["x²"]],
    [["де", "ігрек", "по", "де", "ікс"], ["dy/dx"]],
    [["два", "ікс"], ["2x"]],
    [["еф"], ["f"]],
    [["ікс"], ["x"]],
    [["ігрек"], ["y"]],
  ],
  keys: {
    hook: ["зміни", "штрих"],
    idea: ["миттєве", "питання"],
    geometry: ["нахил", "коефіцієнт"],
    slope: ["дотична"],
    limit: ["нуля", "границя"],
    mechanics: ["швидкість", "прискорення"],
    notation: ["штрих", "точці"],
    rule: ["правила", "формулами"],
    example: ["квадраті"],
    graph: ["додатна"],
    meaning: ["нулю", "максимум", "мінімум"],
    misconception: ["величину"],
    why: ["змінюється"],
    nmt: ["дотичну", "екстремуми"],
    history: ["ньютон", "лейбніц"],
    cta: ["підпишись"],
  },
});

export const { WIN, LEAD_F, wf, af } = T;
export const PK1_VIDEO_F = T.TOTAL_F;
