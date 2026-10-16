import meta from "./audio_meta.json";
import type { CapWord } from "../brand/kit";

/* «3 кошики, які лишають тобі гроші» — Ron TV. 30 fps, вертикаль 720×1280. */
export const FPS = 30;
const LEAD = 0.14, GAP = 0.16;
const EXTRA: Record<string, number> = { hook: 6, m1: 6, m2: 6, m3: 6, m4: 6, m5: 6, cta: 60 };

export const ORDER = ["hook", "m1", "m2", "m3", "m4", "m5", "cta"] as const;
export type SceneId = typeof ORDER[number];
type Word = { text: string; start: number; end: number };

export const WIN = {} as Record<SceneId, { s: number; e: number; d: number; words: Word[] }>;
let acc = 0;
for (const id of ORDER) {
  const v = (meta.voices as any[]).find((x) => x.id === id);
  const d = Math.ceil((LEAD + v.duration_s + GAP) * FPS) + (EXTRA[id] ?? 0);
  WIN[id] = { s: acc, e: acc + d, d, words: v.words };
  acc += d;
}
export const TOTAL_F = acc;
export const LEAD_F = Math.round(LEAD * FPS);

export const norm = (s: string) => s.toLowerCase().replace(/[ʼ‘’'´]/g, "").replace(/[^\p{L}\d]/gu, "");
export const wf = (id: SceneId, kw: string, n = 0, off = 0) => {
  const k = norm(kw);
  const hits = WIN[id].words.filter((w) => norm(w.text).startsWith(k));
  const w = hits[Math.min(n, hits.length - 1)] ?? WIN[id].words[0];
  return LEAD_F + Math.round(w.start * FPS) + off;
};
export const af = (id: SceneId, kw: string, n = 0, off = 0) => WIN[id].s + wf(id, kw, n, off);

const SWAP: [string[], string[]][] = [];

const KEYS: Record<SceneId, string[]> = {
  hook: ["зарплата", "зникає", "пять"],
  m1: ["плати", "десяту", "залишку"],
  m2: ["кошиків", "потреби", "бажання"],
  m3: ["подушка", "три", "спокій"],
  m4: ["відсоток", "нараховується", "раніше"],
  m5: ["борги", "відсотковий", "вклад"],
  cta: ["звичок", "застосуй", "зарплати"],
};

export const captions = (id: SceneId): CapWord[] => {
  const ws = WIN[id].words;
  const out: CapWord[] = ws.map((w) => ({
    text: w.text.replace(/\.\.\.$/, "").replace(/[.,:;…!]+$/g, ""),
    f: LEAD_F + Math.round(w.start * FPS),
    key: KEYS[id].some((k) => norm(w.text).startsWith(k)),
    brk: /[.,?!:…]$/.test(w.text),
  }));
  for (let i = 0; i < ws.length; i++) {
    const rule = SWAP.find(([from]) => from.every((fw, j) => ws[i + j] && norm(ws[i + j].text) === fw));
    if (!rule) continue;
    const [from, to] = rule;
    const last = ws[i + from.length - 1].text;
    from.forEach((_, j) => { out[i + j].text = to[j] ?? ""; });
    out[i + to.length - 1].brk = out[i + to.length - 1].brk || /[.,?!:…]$/.test(last);
    i += from.length - 1;
  }
  return out;
};
