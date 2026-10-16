import type { CapWord } from "./kit";

/* Спільний таймлайн бренд-роликів: сцени = лінії озвучки (audio_meta.json з tts-el.mjs),
   кадр кожного слова, субтитри з заміною фонетики на справжні назви/цифри.
   Використання: const T = makeTimeline(meta, ORDER, { extra, swap, keys }); */
export type Word = { text: string; start: number; end: number };
export type Win = { s: number; e: number; d: number; words: Word[] };

export const norm = (s: string) => s.toLowerCase().replace(/[ʼ‘’'´]/g, "").replace(/[^\p{L}\d]/gu, "");

export function makeTimeline<Id extends string>(
  meta: { voices: { id: string; duration_s: number; words: Word[] }[] },
  order: readonly Id[],
  opt: { fps?: number; lead?: number; gap?: number; extra?: Partial<Record<Id, number>>; swap?: [string[], string[]][]; keys?: Partial<Record<Id, string[]>> } = {},
) {
  const FPS = opt.fps ?? 30, LEAD = opt.lead ?? 0.14, GAP = opt.gap ?? 0.16;
  const WIN = {} as Record<Id, Win>;
  let acc = 0;
  for (const id of order) {
    const v = meta.voices.find((x) => x.id === id);
    if (!v) throw new Error(`audio_meta: немає лінії ${id}`);
    const d = Math.ceil((LEAD + v.duration_s + GAP) * FPS) + (opt.extra?.[id] ?? 0);
    WIN[id] = { s: acc, e: acc + d, d, words: v.words };
    acc += d;
  }
  const LEAD_F = Math.round(LEAD * FPS);
  /** кадр слова відносно сцени (n — яке за рахунком входження) */
  const wf = (id: Id, kw: string, n = 0, off = 0) => {
    const k = norm(kw);
    const hits = WIN[id].words.filter((w) => norm(w.text).startsWith(k));
    const w = hits[Math.min(n, hits.length - 1)] ?? WIN[id].words[0];
    return LEAD_F + Math.round(w.start * FPS) + off;
  };
  const af = (id: Id, kw: string, n = 0, off = 0) => WIN[id].s + wf(id, kw, n, off);
  const sceneAt = (f: number): Id => { let c = order[0]; for (const id of order) if (f >= WIN[id].s) c = id; return c; };

  const captions = (id: Id): CapWord[] => {
    const ws = WIN[id].words;
    const keys = opt.keys?.[id] ?? [];
    const out: CapWord[] = ws.map((w) => ({
      text: w.text.replace(/\.\.\.$/, "").replace(/[.,:;…!]+$/g, ""),
      f: LEAD_F + Math.round(w.start * FPS),
      key: keys.some((k) => norm(w.text).startsWith(k)),
      brk: /[.,?!:…]$/.test(w.text),
    }));
    for (let i = 0; i < ws.length; i++) {
      const rule = (opt.swap ?? []).find(([from]) => from.every((fw, j) => ws[i + j] && norm(ws[i + j].text) === fw));
      if (!rule) continue;
      const [from, to] = rule;
      const last = ws[i + from.length - 1].text;
      from.forEach((_, j) => { out[i + j].text = to[j] ?? ""; });
      out[i + to.length - 1].brk = out[i + to.length - 1].brk || /[.,?!:…]$/.test(last);
      i += from.length - 1;
    }
    return out;
  };
  return { FPS, WIN, TOTAL_F: acc, LEAD_F, wf, af, sceneAt, captions };
}
