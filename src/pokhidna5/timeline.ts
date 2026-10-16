/* Епізод 5 серії «Математика простими словами»: Похідна складеної функції. 16:9, 1280×720.
   Версія БЕЗ озвучки: тривалості сцен задані вручну (текст на екрані замість дикторських субтитрів). */
export const ORDER = ["hook", "idea", "notation", "rule", "steps", "intuition", "example", "trig", "trig2", "why", "mistake", "check", "recap", "cta"] as const;
export type Id = typeof ORDER[number];

export const FPS = 30;

const DUR: Record<Id, number> = {
  hook: 180, idea: 240, notation: 330, rule: 300, steps: 300, intuition: 240,
  example: 480, trig: 330, trig2: 330, why: 270, mistake: 240, check: 210, recap: 270, cta: 180,
};

export type Win = { s: number; e: number; d: number };
export const WIN = {} as Record<Id, Win>;
let acc = 0;
for (const id of ORDER) {
  const d = DUR[id];
  WIN[id] = { s: acc, e: acc + d, d };
  acc += d;
}
export const TOTAL_F = acc;

/** кадр усередині сцени за часткою її тривалості (локальний, від початку сцени) */
export const P = (id: Id, frac: number) => Math.round(WIN[id].d * frac);
/** абсолютний кадр від початку ролика */
export const A = (id: Id, frac = 0) => WIN[id].s + Math.round(WIN[id].d * frac);
