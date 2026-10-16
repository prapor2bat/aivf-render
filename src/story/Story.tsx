import React from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { B, FONT, isDark, Tone } from "../brand/tokens";
import { EndCard, Iris, RedWipe, Sfx, Stage, Words } from "../brand/kit";
import { Marker, check as mCheck, cross as mCross } from "../brand/marker";
import { UsfxKey } from "../components/userSfx";
import { Icon } from "./Icon";
import { Character, CharSpec, Mood, PoseName } from "./Character";

/* ═══ ДВИГУН ІСТОРІЙ «як працює бізнес» (052, 29.09.2026) ═══
   Формат: мультик-моушн з персонажем + лінійні схеми, що малюються (референс R4), морф-телефон (R1),
   предмет-герой, що мандрує ланцюгом (R3). Бренд: папір/ніч/рожеве, червоний — лише акцент.
   Реліз = масив ударів (Beat): текст оповіді зверху (розмітка Words: *ключове*, _курсив_, ~службове~) + сцена в полі 450…1010. */
export type Scene =
  | { k: "char"; who: string; pose?: PoseName | [number, PoseName][]; mood?: Mood | [number, Mood][]; hold?: string; holdColor?: string; bubble?: string; bubbleAt?: number; set?: SetName; talk?: boolean }
  | { k: "dialog"; a: string; b: string; set?: SetName; lines: { who: "a" | "b"; text: string; mood?: Mood; pose?: PoseName; other?: Mood }[] }
  | { k: "chain"; nodes: { icon: string; label: string }[]; hit?: number; mover?: string; stuck?: boolean }
  | { k: "stat"; value: number; prefix?: string; suffix?: string; label: string; icon?: string; dec?: number; from?: number }
  | { k: "phone"; title: string; icon?: string; steps: { text: string; bad?: boolean; ok?: boolean }[] }
  | { k: "grid"; items: { icon: string; label: string; bad?: boolean }[] }
  | { k: "blackout"; items?: { icon: string; label: string }[] }
  | { k: "doc"; title: string; rows: { text: string; mark?: "ok" | "no" }[]; stamp?: string }
  | { k: "strike"; target: string; label?: string; night?: boolean }
  | { k: "compare"; left: { icon: string; label: string; value: string }; right: { icon: string; label: string; value: string } }
  | { k: "end"; line?: string };
export type SetName = "counter" | "shelves" | "pharmacy" | "cafe" | "bakery" | "field" | "shop" | "tower" | "print" | "factory" | "street" | "home" | "none";
export type Beat = { text: string[]; tone: Tone; scene: Scene; dur?: number; tr?: "cut" | "red" | "iris"; sfx?: [UsfxKey, number, number?][] };
export type Reel = { id: string; series: string; cast: Record<string, CharSpec>; beats: Beat[]; music: string; musicVol?: number };

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const ease = (x: number) => { const t = Math.min(1, Math.max(0, x)); return 1 - Math.pow(1 - t, 3); };
const io = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const words = (b: Beat) => b.text.join(" ").replace(/[*_~]/g, "").split(/\s+/).filter(Boolean).length;
/** тривалість удару: читання ≈ 0.3 с/слово + 1.4 с на осмислення + запас під анімацію сцени */
export const beatDur = (b: Beat) => b.dur ?? Math.round(Math.min(260, Math.max(96, words(b) * 9 + 44 + (b.scene.k === "dialog" ? b.scene.lines.length * 34 : b.scene.k === "chain" || b.scene.k === "doc" ? 40 : b.scene.k === "end" ? 60 : 0))));
export const reelLen = (r: Reel) => r.beats.reduce((a, b) => a + beatDur(b), 0);
const ink = (t: Tone) => (isDark(t) ? B.white : B.ink);
const TEXT_TOP = 168, FIELD_TOP = 470, FIELD_BOT = 1006, CX = 360;

/* ── бульбашка репліки ── */
export const Bubble: React.FC<{ text: string; x: number; y: number; at: number; tail?: "left" | "right" | "down"; w?: number; tone: Tone }> = ({ text, x, y, at, tail = "down", w = 380, tone }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  if (f < at) return null;
  const p = spring({ frame: f - at, fps, config: { damping: 12, stiffness: 190, mass: 0.7 } });
  const ws = text.split(" "); const n = Math.min(ws.length, Math.floor((f - at) / 3) + 1);
  const size = text.length > 44 ? 32 : text.length > 26 ? 36 : 42;
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: y, width: w, transform: `scale(${0.5 + 0.5 * p})`, transformOrigin: tail === "left" ? "0% 100%" : tail === "right" ? "100% 100%" : "50% 100%", opacity: Math.min(1, p * 1.6) }}>
      <div style={{ position: "relative", background: B.white, border: `4px solid ${B.ink}`, borderRadius: 30, padding: "18px 24px", fontFamily: FONT.sans, fontWeight: 800, fontSize: size, lineHeight: 1.08, letterSpacing: "-0.03em", color: B.ink, boxShadow: isDark(tone) ? "0 20px 40px -10px rgba(0,0,0,.6)" : `8px 8px 0 ${B.ink}` }}>
        {ws.map((wd, i) => <span key={i} style={{ opacity: i < n ? 1 : 0 }}>{wd} </span>)}
        <svg width={40} height={30} style={{ position: "absolute", bottom: -27, left: tail === "left" ? 34 : tail === "right" ? w - 80 : w / 2 - 20 }}>
          <path d={tail === "right" ? "M4,0 L36,0 L34,28 Z" : tail === "left" ? "M4,0 L36,0 L6,28 Z" : "M4,0 L36,0 L20,28 Z"} fill={B.white} stroke={B.ink} strokeWidth={4} strokeLinejoin="round" />
          <rect x={6} y={-4} width={28} height={8} fill={B.white} />
        </svg>
      </div>
    </div>
  );
};

/* ── декорації: прилавок + лінійні предмети позаду ── */
const SETS: Record<SetName, { back: string[]; counter?: boolean; floor?: boolean }> = {
  counter: { back: ["package", "packages", "box", "package", "truck-delivery"], counter: true },
  shelves: { back: ["shopping-cart", "basket", "milk", "bottle", "bread"], counter: true },
  pharmacy: { back: ["pill", "pills", "vaccine-bottle", "flask", "heart"], counter: true },
  cafe: { back: ["coffee", "cup", "cookie", "cake", "glass"], counter: true },
  bakery: { back: ["bread", "baguette", "flame", "cookie", "chef-hat"], counter: true },
  field: { back: ["wheat", "tractor", "sun", "plant-2", "wheat"], floor: true },
  shop: { back: ["shopping-bag", "tag", "discount", "hanger", "shirt"], counter: true },
  tower: { back: ["antenna", "building-broadcast-tower", "wifi", "signal-4g", "battery-charging"], floor: true },
  print: { back: ["printer", "books", "book", "file-text", "book-2"], counter: true },
  factory: { back: ["building-factory-2", "ice-cream", "snowflake", "truck", "ice-cream-2"], counter: true },
  street: { back: ["building", "building-store", "car", "building-skyscraper", "road"], floor: true },
  home: { back: ["sofa", "window", "armchair", "bulb", "door"], floor: true },
  none: { back: [] },
};
const SetBack: React.FC<{ set: SetName; tone: Tone }> = ({ set, tone }) => {
  const f = useCurrentFrame();
  const s = SETS[set];
  const c = isDark(tone) ? "rgba(255,255,255,.16)" : "rgba(13,13,13,.14)";
  const pos = [[110, 560, 96], [610, 540, 110], [150, 760, 80], [590, 760, 90], [360, 500, 70]];
  return <>{s.back.map((ic, i) => <div key={i} style={{ position: "absolute", left: pos[i][0] - pos[i][2] / 2, top: pos[i][1] - pos[i][2] / 2 + Math.sin((f + i * 30) / 40) * 4 }}><Icon name={ic} size={pos[i][2]} color={c} p={ease((f - i * 4) / 20)} stroke={1.4} /></div>)}
    {s.floor && <div style={{ position: "absolute", left: 40, right: 40, top: 960, height: 3, background: isDark(tone) ? "rgba(255,255,255,.25)" : "rgba(13,13,13,.3)", transform: `scaleX(${ease(f / 16)})` }} />}</>;
};
const Counter: React.FC<{ tone: Tone; set: SetName }> = ({ tone, set }) => {
  const f = useCurrentFrame();
  if (!SETS[set].counter) return null;
  const top = 900, dark = isDark(tone);
  const item = { counter: "package", shelves: "basket", pharmacy: "pill", cafe: "coffee", bakery: "bread", shop: "shopping-bag", print: "book", factory: "ice-cream", field: "", tower: "", street: "", home: "", none: "" }[set];
  return <>
    <div style={{ position: "absolute", left: 30, right: 30, top, height: 140, background: dark ? "#1A1A1C" : B.white, border: `4px solid ${dark ? "rgba(255,255,255,.3)" : B.ink}`, borderRadius: 18, boxShadow: dark ? "none" : `0 -2px 0 ${B.ink}` }} />
    <div style={{ position: "absolute", left: 30, right: 30, top: top + 30, height: 6, background: B.red }} />
    {item && <div style={{ position: "absolute", left: 520, top: top - 86 + Math.sin(f / 30) * 2 }}><Icon name={item} size={96} color={dark ? B.white : B.ink} p={ease(f / 18)} stroke={1.8} /></div>}
  </>;
};

/* ── сцени ── */
const asTl = <T,>(v: T | [number, T][] | undefined, d: T): [number, T][] => (Array.isArray(v) ? (v as [number, T][]) : [[0, (v ?? d) as T]]);
const CharScene: React.FC<{ s: Extract<Scene, { k: "char" }>; cast: Reel["cast"]; tone: Tone; dur: number }> = ({ s, cast, tone, dur }) => {
  const set = s.set ?? "none", bub = !!s.bubble, bAt = s.bubbleAt ?? 14;
  const talk: [number, number][] = s.talk === false || !bub ? [] : [[bAt, bAt + Math.min(dur - bAt, 12 + s.bubble!.split(" ").length * 6)]];
  return <>
    <SetBack set={set} tone={tone} />
    <Character spec={cast[s.who]} poses={asTl(s.pose, "idle" as PoseName)} moods={asTl(s.mood, "neutral" as Mood)} talk={talk} hold={s.hold} holdColor={s.holdColor} x={bub ? 250 : CX} y={SETS[set].counter ? 1010 : 985} h={560} seed={s.who.length} />
    <Counter tone={tone} set={set} />
    {bub && <Bubble text={s.bubble!} x={480} y={500} at={bAt} tail="left" w={360} tone={tone} />}
  </>;
};
const DialogScene: React.FC<{ s: Extract<Scene, { k: "dialog" }>; cast: Reel["cast"]; tone: Tone; dur: number }> = ({ s, cast, tone, dur }) => {
  const f = useCurrentFrame();
  const n = s.lines.length, slot = (dur - 20) / n;
  const cur = Math.min(n - 1, Math.floor(Math.max(0, f - 10) / slot));
  const set = s.set ?? "none";
  const moodOf = (who: "a" | "b"): Mood => { const l = s.lines[cur]; return l.who === who ? l.mood ?? "neutral" : l.other ?? "neutral"; };
  const poseOf = (who: "a" | "b"): PoseName => { for (let i = cur; i >= 0; i--) if (s.lines[i].who === who && s.lines[i].pose) return s.lines[i].pose!; return "idle"; };
  const talkA: [number, number][] = [], talkB: [number, number][] = [];
  s.lines.forEach((l, i) => { const a = 10 + i * slot; (l.who === "a" ? talkA : talkB).push([a + 4, a + 4 + Math.min(slot - 8, l.text.split(" ").length * 6 + 8)]); });
  return <>
    <SetBack set={set} tone={tone} />
    <Character spec={cast[s.a]} poses={[[0, poseOf("a")]]} moods={[[0, moodOf("a")]]} talk={talkA} x={200} y={1010} h={470} seed={3} />
    <Character spec={cast[s.b]} poses={[[0, poseOf("b")]]} moods={[[0, moodOf("b")]]} talk={talkB} x={530} y={1010} h={450} seed={7} flip />
    <Counter tone={tone} set={set} />
    {s.lines.map((l, i) => { const a = 10 + i * slot; if (f < a || i < cur) return null; return <Bubble key={i} text={l.text} x={l.who === "a" ? 280 : 440} y={470} at={a} tail={l.who === "a" ? "left" : "right"} w={400} tone={tone} />; })}
  </>;
};
/* ланцюг: вузли зигзагом, лінія малюється, предмет-герой їде, удар по вузлу */
export const Drone: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 100 100"><path d="M50,8 L92,70 L58,62 L50,92 L42,62 L8,70 Z" fill={color} /><path d="M50,8 L50,92" stroke="rgba(255,255,255,.35)" strokeWidth={3} /></svg>
);
const ChainScene: React.FC<{ s: Extract<Scene, { k: "chain" }>; tone: Tone; dur: number }> = ({ s, tone, dur }) => {
  const f = useCurrentFrame();
  const n = s.nodes.length, c = ink(tone), dark = isDark(tone);
  const pts = s.nodes.map((_, i) => [i % 2 ? 540 : 180, FIELD_TOP + 50 + (i * (FIELD_BOT - FIELD_TOP - 150)) / Math.max(1, n - 1)] as [number, number]);
  const step = Math.min(22, (dur * 0.5) / n);
  const hitAt = s.hit !== undefined ? Math.round(step * n + 16) : 9999;
  const moveEnd = s.hit !== undefined ? hitAt + 4 : dur - 10;
  // шлях
  let d = `M${pts[0][0]},${pts[0][1]}`; for (let i = 1; i < n; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; d += ` C${x0},${(y0 + y1) / 2} ${x1},${(y0 + y1) / 2} ${x1},${y1}`; }
  const drawP = ease(f / (step * n));
  // рух предмета: по відрізках, зупиняється перед ураженим вузлом
  const segs = s.hit !== undefined ? Math.max(0.6, s.hit - 0.35) : n - 1;
  const mv = interpolate(f, [step * 2, moveEnd], [0, segs], clamp);
  const si = Math.min(n - 2, Math.floor(mv)), st = mv - si;
  const bez = (i: number, t: number) => { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], my = (y0 + y1) / 2, u = 1 - t; return [u * u * u * x0 + 3 * u * u * t * x0 + 3 * u * t * t * x1 + t * t * t * x1, u * u * u * y0 + 3 * u * u * t * my + 3 * u * t * t * my + t * t * t * y1]; };
  const [mx, my] = n > 1 ? bez(si, st) : pts[0];
  const hit = s.hit, hf = f - hitAt;
  const shake = hit !== undefined && hf >= 0 && hf < 12 ? Math.sin(hf * 3) * (12 - hf) : 0;
  return <div style={{ position: "absolute", inset: 0, transform: `translate(${shake}px, ${shake * 0.4}px)` }}>
    <svg width={720} height={1280} style={{ position: "absolute", inset: 0 }}>
      <path d={d} fill="none" stroke={dark ? "rgba(255,255,255,.35)" : "rgba(13,13,13,.3)"} strokeWidth={5} strokeDasharray="14 12" pathLength={1000} strokeDashoffset={0} style={{ clipPath: `inset(0 0 ${(1 - drawP) * 100}% 0)` }} />
    </svg>
    {s.nodes.map((nd, i) => {
      const a = i * step, p = ease((f - a) / 12); if (f < a) return null;
      const isHit = hit === i && hf >= 0;
      return <div key={i} style={{ position: "absolute", left: pts[i][0] - 70, top: pts[i][1] - 70, width: 140, transform: `scale(${0.6 + 0.4 * p})`, opacity: p }}>
        <div style={{ width: 140, height: 140, borderRadius: 140, background: isHit ? B.red : dark ? "#161618" : B.white, border: `5px solid ${isHit ? B.red : c}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: dark ? "none" : `6px 6px 0 ${B.ink}` }}>
          <Icon name={nd.icon} size={78} color={isHit ? B.white : c} p={ease((f - a) / 18)} stroke={1.7} />
        </div>
        <div style={{ position: "absolute", top: 150, left: -60, right: -60, textAlign: "center", fontFamily: FONT.sans, fontWeight: 800, fontSize: 30, letterSpacing: "-0.03em", color: isHit ? B.red : c, whiteSpace: "nowrap" }}>{nd.label}</div>
        {isHit && <svg width={140} height={140} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => { const an = (k / 8) * Math.PI * 2, r0 = 80 + ease(hf / 10) * 20, r1 = r0 + 30 * (1 - ease(hf / 14)); return <line key={k} x1={70 + Math.cos(an) * r0} y1={70 + Math.sin(an) * r0} x2={70 + Math.cos(an) * r1} y2={70 + Math.sin(an) * r1} stroke={B.red} strokeWidth={6} strokeLinecap="round" opacity={1 - ease(hf / 16)} />; })}
          <path d="M40,30 L62,62 L50,74 L80,110" stroke={B.white} strokeWidth={5} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ease(hf / 8)} />
        </svg>}
      </div>;
    })}
    {/* предмет-герой */}
    {s.mover && f >= step * 2 && <div style={{ position: "absolute", left: mx - 38, top: my - 38, width: 76, height: 76, borderRadius: 18, background: B.red, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 20px -6px rgba(0,0,0,.4)" }}>
      <Icon name={s.mover} size={50} color={B.white} stroke={2} /></div>}
    {s.stuck && hf > 10 && <div style={{ position: "absolute", left: mx + 30, top: my - 76, opacity: ease((hf - 10) / 8) }}><div style={{ display: "flex", alignItems: "center", gap: 8, background: B.ink, color: B.white, borderRadius: 999, padding: "8px 16px", fontFamily: FONT.sans, fontWeight: 800, fontSize: 26 }}><Icon name="clock-pause" size={30} color={B.white} stroke={2} />чекає</div></div>}
    {/* дрон */}
    {hit !== undefined && f >= hitAt - 18 && f < hitAt + 2 && (() => { const t = (f - (hitAt - 18)) / 18, tx = pts[hit][0], ty = pts[hit][1]; const x = 760 + (tx - 760) * t, y = FIELD_TOP - 60 + (ty - FIELD_TOP + 60) * t * t; const ang = Math.atan2(ty - (FIELD_TOP - 60), tx - 760) * 180 / Math.PI + 90; return <div style={{ position: "absolute", left: x - 34, top: y - 34, transform: `rotate(${ang}deg)` }}><Drone size={68} color={dark ? B.white : B.ink} /></div>; })()}
    {hit !== undefined && hf >= 0 && hf < 8 && <AbsoluteFill style={{ background: B.white, opacity: 0.7 * (1 - hf / 8) }} />}
  </div>;
};
const fmt = (v: number, dec = 0) => v.toFixed(dec).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const StatScene: React.FC<{ s: Extract<Scene, { k: "stat" }>; tone: Tone }> = ({ s, tone }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const v = interpolate(f, [6, 40], [s.from ?? 0, s.value], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 4) });
  const pop = spring({ frame: f - 40, fps, config: { damping: 10, stiffness: 220 } });
  const txt = `${s.prefix ?? ""}${fmt(v, s.dec)}${s.suffix ?? ""}`;
  const size = Math.min(230, Math.floor(600 / Math.max(3, txt.length * 0.58)));
  return <>
    {s.icon && <div style={{ position: "absolute", left: CX - 60, top: 500 }}><Icon name={s.icon} size={120} color={ink(tone)} p={ease(f / 20)} stroke={1.5} /></div>}
    <div style={{ position: "absolute", left: 40, right: 40, top: 640, textAlign: "center", fontFamily: FONT.sans, fontWeight: 900, fontSize: size, letterSpacing: "-0.06em", color: B.red, lineHeight: 1, transform: `scale(${f >= 40 ? 1 + 0.06 * (1 - pop) : 1})` }}>{txt}</div>
    <div style={{ position: "absolute", left: 60, right: 60, top: 660 + size, textAlign: "center", fontFamily: FONT.sans, fontWeight: 700, fontSize: 40, letterSpacing: "-0.03em", color: ink(tone), opacity: ease((f - 30) / 10), lineHeight: 1.1 }}>{s.label}</div>
  </>;
};
const PhoneScene: React.FC<{ s: Extract<Scene, { k: "phone" }>; tone: Tone; dur: number }> = ({ s, dur }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame: f, fps, config: { damping: 15, stiffness: 140 } });
  const step = Math.min(26, (dur - 30) / s.steps.length);
  return <div style={{ position: "absolute", left: CX - 190, top: 480, width: 380, height: 520, transform: `translateY(${(1 - p) * 120}px)`, opacity: p }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: 54, background: "#111", padding: 14, boxShadow: "0 40px 70px -30px rgba(0,0,0,.6)" }}>
      <div style={{ position: "absolute", inset: 14, borderRadius: 42, background: "#F7F5F0", overflow: "hidden", padding: "46px 26px 20px" }}>
        <div style={{ position: "absolute", top: 12, left: "50%", marginLeft: -50, width: 100, height: 26, borderRadius: 20, background: "#111" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: B.red, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={s.icon ?? "package"} size={34} color={B.white} stroke={2} /></div>
          <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 30, letterSpacing: "-0.03em", color: B.ink, lineHeight: 1 }}>{s.title}</div>
        </div>
        {s.steps.map((st, i) => {
          const a = 14 + i * step; if (f < a) return null;
          const q = ease((f - a) / 8);
          const col = st.bad ? B.red : st.ok ? "#1E9E5A" : B.ink;
          return <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "10px 0", opacity: q, transform: `translateX(${(1 - q) * 30}px)` }}>
            <div style={{ width: 22, height: 22, marginTop: 5, borderRadius: 22, background: col, flex: "none", boxShadow: st.bad ? `0 0 0 ${6 + Math.sin(f / 4) * 3}px rgba(227,32,43,.2)` : "none" }} />
            <div style={{ fontFamily: FONT.sans, fontWeight: st.bad ? 900 : 700, fontSize: 28, lineHeight: 1.12, letterSpacing: "-0.02em", color: col }}>{st.text}</div>
          </div>;
        })}
      </div>
    </div>
  </div>;
};
const GridScene: React.FC<{ s: Extract<Scene, { k: "grid" }>; tone: Tone }> = ({ s, tone }) => {
  const f = useCurrentFrame();
  const n = s.items.length, cols = n <= 4 ? 2 : 3, rows = Math.ceil(n / cols), cw = 600 / cols, ch = Math.min(250, 520 / rows);
  return <>{s.items.map((it, i) => {
    const a = 6 + i * 7, q = ease((f - a) / 10); if (f < a) return null;
    const x = 60 + (i % cols) * cw + cw / 2, y = FIELD_TOP + 10 + Math.floor(i / cols) * ch + ch / 2 - 20;
    return <div key={i} style={{ position: "absolute", left: x - cw / 2 + 10, top: y - ch / 2 + 10, width: cw - 20, height: ch - 20, borderRadius: 26, background: isDark(tone) ? "#161618" : B.white, border: `4px solid ${it.bad ? B.red : ink(tone)}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, transform: `scale(${0.7 + 0.3 * q})`, opacity: q, boxShadow: isDark(tone) ? "none" : `6px 6px 0 ${B.ink}` }}>
      <Icon name={it.icon} size={Math.min(96, ch * 0.42)} color={it.bad ? B.red : ink(tone)} p={ease((f - a) / 16)} stroke={1.7} />
      <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: cols === 3 ? 25 : 30, letterSpacing: "-0.03em", color: it.bad ? B.red : ink(tone), textAlign: "center", lineHeight: 1.05, padding: "0 8px" }}>{it.label}</div>
      {it.bad && f > a + 14 && <svg width={cw - 20} height={ch - 20} style={{ position: "absolute", inset: 0 }}><line x1={cw / 2 - 70} y1={18} x2={cw / 2 + 50} y2={Math.min(ch * 0.55, 150)} stroke={B.red} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ease((f - a - 14) / 6)} /></svg>}
    </div>;
  })}</>;
};
const BlackoutScene: React.FC<{ s: Extract<Scene, { k: "blackout" }>; tone: Tone }> = ({ s }) => {
  const f = useCurrentFrame();
  const off = f > 18 || (f > 10 && f % 4 < 2);
  const items = s.items ?? [];
  return <>
    <AbsoluteFill style={{ background: "#000", opacity: off ? 0.55 : 0 }} />
    <div style={{ position: "absolute", left: CX - 110, top: 480, filter: off ? "none" : "drop-shadow(0 0 40px rgba(255,220,120,.7))" }}><Icon name={off ? "bulb-off" : "bulb"} size={220} color={off ? "rgba(255,255,255,.55)" : "#FFD66B"} stroke={1.3} /></div>
    {items.map((it, i) => { const a = 30 + i * 12, q = ease((f - a) / 10); if (f < a) return null; const x = items.length === 1 ? CX : 150 + (i * 420) / Math.max(1, items.length - 1); const vib = it.icon === "engine" ? Math.sin(f * 2.3) * 2.5 : 0;
      return <div key={i} style={{ position: "absolute", left: x - 90, top: 760 + vib, width: 180, textAlign: "center", opacity: q, transform: `translateY(${(1 - q) * 30}px)` }}>
        <div style={{ width: 120, height: 120, margin: "0 auto", borderRadius: 30, background: "#1B1B1E", border: "3px solid rgba(255,255,255,.35)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={it.icon} size={76} color={B.white} p={ease((f - a) / 14)} stroke={1.7} /></div>
        <div style={{ marginTop: 10, fontFamily: FONT.sans, fontWeight: 800, fontSize: 28, color: B.white, letterSpacing: "-0.02em", lineHeight: 1.05 }}>{it.label}</div></div>; })}
  </>;
};
const DocScene: React.FC<{ s: Extract<Scene, { k: "doc" }>; tone: Tone; dur: number }> = ({ s, dur }) => {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  const p = spring({ frame: f, fps, config: { damping: 15, stiffness: 130 } });
  const step = Math.min(20, (dur - 50) / Math.max(1, s.rows.length));
  const stampAt = 14 + s.rows.length * step + 10;
  const sp = spring({ frame: f - stampAt, fps, config: { damping: 9, stiffness: 260 } });
  const L = 110, T = 490, Wd = 500;
  return <>
    <div style={{ position: "absolute", left: L, top: T, width: Wd, minHeight: 470, background: B.white, borderRadius: 8, padding: "34px 36px", transform: `translateY(${(1 - p) * 100}px) rotate(${-2 * p}deg)`, opacity: p, boxShadow: "0 30px 60px -24px rgba(0,0,0,.4)" }}>
      <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 38, letterSpacing: "-0.03em", color: B.ink, borderBottom: `4px solid ${B.ink}`, paddingBottom: 12, marginBottom: 12 }}>{s.title}</div>
      {s.rows.map((r, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 0", borderBottom: "2px dashed rgba(13,13,13,.18)", opacity: f >= 10 + i * step ? 1 : 0.25 }}>
        <div style={{ width: 38, height: 38, border: `3px solid ${B.ink}`, borderRadius: 6, flex: "none" }} />
        <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 29, color: B.ink, lineHeight: 1.1, letterSpacing: "-0.02em" }}>{r.text}</div>
      </div>)}
    </div>
    {s.rows.map((r, i) => r.mark && <Marker key={i} at={14 + i * step} strokes={r.mark === "ok" ? mCheck(L + 55, T + 142 + i * 64, 34) : mCross(L + 55, T + 140 + i * 64, 30)} color={r.mark === "ok" ? "#1E9E5A" : B.red} w={8} />)}
    {s.stamp && f >= stampAt && <div style={{ position: "absolute", left: 250, top: 820, transform: `rotate(-12deg) scale(${1.8 - 0.8 * sp})`, opacity: Math.min(1, sp * 2), border: `6px solid ${B.red}`, borderRadius: 14, padding: "8px 22px", fontFamily: FONT.sans, fontWeight: 900, fontSize: 52, letterSpacing: "0.02em", color: B.red, background: "rgba(255,255,255,.4)" }}>{s.stamp}</div>}
  </>;
};
const StrikeScene: React.FC<{ s: Extract<Scene, { k: "strike" }>; tone: Tone; dur: number }> = ({ s, tone }) => {
  const f = useCurrentFrame();
  const hitAt = 30, hf = f - hitAt, c = ink(tone);
  const t = Math.min(1, f / hitAt), dx = 700 - 660 * t, dy = 480 + 230 * t * t;
  const shake = hf >= 0 && hf < 14 ? Math.sin(hf * 3) * (14 - hf) * 0.9 : 0;
  return <div style={{ position: "absolute", inset: 0, transform: `translate(${shake}px, ${shake * 0.5}px)` }}>
    <div style={{ position: "absolute", left: CX - 170, top: 560 }}><Icon name={s.target} size={340} color={hf >= 0 ? B.red : c} p={ease(f / 20)} stroke={1.2} /></div>
    {hf >= 0 && <svg width={720} height={1280} style={{ position: "absolute", inset: 0 }}>
      <path d={`M300,640 L340,700 L320,740 L372,810 M420,650 L400,720 L440,760`} stroke={isDark(tone) ? B.white : B.ink} strokeWidth={6} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ease(hf / 8)} />
      {[0, 1, 2, 3, 4].map((k) => { const q = Math.max(0, (hf - k * 5) / 40); if (q <= 0 || q > 1) return null; return <circle key={k} cx={330 + k * 20 + Math.sin(q * 6 + k) * 20} cy={620 - q * 180} r={30 + q * 40} fill={isDark(tone) ? "rgba(255,255,255,.18)" : "rgba(13,13,13,.14)"} opacity={1 - q} />; })}
    </svg>}
    {f < hitAt && <div style={{ position: "absolute", left: dx - 40, top: dy - 40, transform: `rotate(${-110 + t * 20}deg)` }}><Drone size={80} color={c} /></div>}
    {hf >= 0 && hf < 10 && <AbsoluteFill style={{ background: hf < 3 ? B.white : B.red, opacity: (1 - hf / 10) * 0.8 }} />}
    {s.label && hf > 8 && <div style={{ position: "absolute", left: 60, right: 60, top: 930, textAlign: "center", fontFamily: FONT.sans, fontWeight: 900, fontSize: 40, color: B.red, letterSpacing: "-0.03em", opacity: ease((hf - 8) / 8) }}>{s.label}</div>}
  </div>;
};
const CompareScene: React.FC<{ s: Extract<Scene, { k: "compare" }>; tone: Tone }> = ({ s, tone }) => {
  const f = useCurrentFrame();
  const col = (side: "left" | "right", i: number) => { const it = s[side], a = 6 + i * 16, q = ease((f - a) / 12); const x = side === "left" ? 70 : 380;
    return <div key={side} style={{ position: "absolute", left: x, top: 500, width: 270, textAlign: "center", opacity: q, transform: `translateY(${(1 - q) * 40}px)` }}>
      <div style={{ width: 150, height: 150, margin: "0 auto", borderRadius: 34, background: i ? B.red : isDark(tone) ? "#1B1B1E" : B.white, border: `4px solid ${i ? B.red : ink(tone)}`, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name={it.icon} size={90} color={i ? B.white : ink(tone)} p={ease((f - a) / 16)} stroke={1.7} /></div>
      <div style={{ marginTop: 18, fontFamily: FONT.sans, fontWeight: 700, fontSize: 30, color: ink(tone), lineHeight: 1.1 }}>{it.label}</div>
      <div style={{ marginTop: 10, fontFamily: FONT.sans, fontWeight: 900, fontSize: Math.min(70, Math.floor(262 / (it.value.length * 0.6))), letterSpacing: "-0.05em", color: i ? B.red : ink(tone), lineHeight: 1, whiteSpace: "nowrap" }}>{it.value}</div>
    </div>; };
  return <>{col("left", 0)}{col("right", 1)}<div style={{ position: "absolute", left: CX - 3, top: 520, width: 6, height: 380, background: isDark(tone) ? "rgba(255,255,255,.25)" : "rgba(13,13,13,.2)", transform: `scaleY(${ease(f / 14)})` }} /></>;
};

const SceneView: React.FC<{ b: Beat; cast: Reel["cast"]; dur: number; last: boolean }> = ({ b, cast, dur }) => {
  const s = b.scene, t = b.tone;
  switch (s.k) {
    case "char": return <CharScene s={s} cast={cast} tone={t} dur={dur} />;
    case "dialog": return <DialogScene s={s} cast={cast} tone={t} dur={dur} />;
    case "chain": return <ChainScene s={s} tone={t} dur={dur} />;
    case "stat": return <StatScene s={s} tone={t} />;
    case "phone": return <PhoneScene s={s} tone={t} dur={dur} />;
    case "grid": return <GridScene s={s} tone={t} />;
    case "blackout": return <BlackoutScene s={s} tone={t} />;
    case "doc": return <DocScene s={s} tone={t} dur={dur} />;
    case "strike": return <StrikeScene s={s} tone={t} dur={dur} />;
    case "compare": return <CompareScene s={s} tone={t} />;
    case "end": return <EndCard at={4} line={s.line ?? "щоб бачити, як працює Україна"} pose="point-left" />;
  }
};
/** звук сцени за типом */
const sceneSfx = (b: Beat, dur: number): [UsfxKey, number, number][] => {
  const s = b.scene;
  switch (s.k) {
    case "chain": { const out: [UsfxKey, number, number][] = [["w07", 2, 0.22]]; if (s.hit !== undefined) { const st = Math.min(22, (dur * 0.5) / s.nodes.length); const h = Math.round(st * s.nodes.length + 16); out.push(["w09", h - 16, 0.22], ["i18", h, 0.32]); } return out; }
    case "strike": return [["w09", 12, 0.22], ["i18", 30, 0.34], ["g38", 32, 0.14]];
    case "stat": return [["d44", 40, 0.22]];
    case "phone": return s.steps.map((st, i) => [st.bad ? "d43" : "p29", 14 + i * Math.min(26, (dur - 30) / s.steps.length), st.bad ? 0.2 : 0.16] as [UsfxKey, number, number]);
    case "doc": return [...s.rows.map((_, i) => ["c24", 14 + i * Math.min(20, (dur - 50) / s.rows.length), 0.18] as [UsfxKey, number, number]), ...(s.stamp ? [["c26", 14 + s.rows.length * Math.min(20, (dur - 50) / s.rows.length) + 10, 0.3] as [UsfxKey, number, number]] : [])];
    case "blackout": return [["g34", 12, 0.18], ["p28", 30, 0.2]];
    case "grid": return s.items.map((_, i) => ["p30", 6 + i * 7, 0.12] as [UsfxKey, number, number]);
    case "char": return s.bubble ? [["p27", s.bubbleAt ?? 14, 0.16]] : [];
    case "dialog": return s.lines.map((_, i) => ["p27", 10 + (i * (dur - 20)) / s.lines.length, 0.14] as [UsfxKey, number, number]);
    case "end": return [["d40", 6, 0.25]];
    default: return [];
  }
};

export const StoryReel: React.FC<{ reel: Reel }> = ({ reel }) => {
  let t = 0;
  const L = reelLen(reel);
  const seq = reel.beats.map((b, i) => { const d = beatDur(b), at = t; t += d; return { b, d, at, i }; });
  return (
    <AbsoluteFill style={{ background: B.paper }}>
      {seq.map(({ b, d, at, i }) => (
        <Sequence key={i} from={at} durationInFrames={d} layout="none">
          <Stage tone={b.tone} dur={d} push={0.035} arc={b.scene.k === "char" || b.scene.k === "dialog" ? false : i % 3}>
            <SceneView b={b} cast={reel.cast} dur={d} last={i === seq.length - 1} />
            {b.scene.k !== "end" && <Words lines={b.text} tone={b.tone} top={TEXT_TOP} size={b.text.length > 2 ? 54 : 60} start={6} step={4} />}
          </Stage>
          {sceneSfx(b, d).map(([k, a, v], j) => <Sfx key={j} k={k} at={Math.round(a)} vol={v} />)}
          {(b.sfx ?? []).map(([k, a, v], j) => <Sfx key={"x" + j} k={k} at={a} vol={v ?? 0.25} />)}
        </Sequence>
      ))}
      {seq.slice(1).map(({ b, at, i }) => b.tr === "red" ? <React.Fragment key={"t" + i}><RedWipe at={at} /><Sfx k="w03" at={at} vol={0.2} /></React.Fragment> : b.tr === "iris" ? <React.Fragment key={"t" + i}><Iris at={at} /><Sfx k="k48" at={at} vol={0.2} /></React.Fragment> : null)}
      <Audio src={staticFile(reel.music)} loop volume={(fr) => interpolate(fr, [0, 20, L - 40, L], [0, reel.musicVol ?? 0.3, reel.musicVol ?? 0.3, 0], clamp)} />
    </AbsoluteFill>
  );
};
