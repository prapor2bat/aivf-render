import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { FONT, B } from "../../brand/tokens";
import { Avatar } from "../../brand/kit";
import { Marker, cross, ring } from "../../brand/marker";
import { Abs, Bands, Body, CarouselDef, Chip, Corner, Count, ease, Fl, Head, Idle, In, INK, NIGHT, PAPER, RED, Seam, Serif, SH, Swipe, SW, X } from "../kit";

/* Демо-карусель «Kling 4.0: 5 змін» (8 слайдів). Факти — офіційний анонс kling.ai, стан на 29.09.2026 (перевіряй актуальність!).
   Стики: логотип Kling навпіл між 1|2, кадр плівки між 3|4, червона нитка через усю панораму. */
const N = 8;
const COLORS = [NIGHT, PAPER, PAPER, NIGHT, PAPER, NIGHT, RED, PAPER];
const dark = (i: number) => COLORS[i] !== PAPER;
const FULL: React.FC<{ i: number }> = ({ i }) => <Abs x={X(i, 70)} y={1210}><In a={20} from="left"><Chip t="повна 4.0 · жовтень" bg={dark(i) ? "rgba(255,255,255,.12)" : "rgba(13,13,13,.07)"} color={dark(i) ? "#fff" : INK} size={40} /></In></Abs>;
const Num: React.FC<{ i: number; k: string }> = ({ i, k }) => <Abs x={X(i, 70)} y={170}><In a={0} from="zoom"><div style={{ width: 96, height: 96, borderRadius: 48, background: RED, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT.sans, fontWeight: 900, fontSize: 56 }}>{k}</div></In></Abs>;

const THREAD = `M-20 1120 C 300 1060, 700 1180, ${SW} 1110 S ${SW * 2 - 200} 1170, ${SW * 2} 1120 S ${SW * 3 - 300} 1060, ${SW * 3} 1130 S ${SW * 4 - 200} 1180, ${SW * 4} 1110 S ${SW * 5 - 300} 1060, ${SW * 5} 1120 S ${SW * 6 - 200} 1180, ${SW * 6} 1110 S ${SW * 7 - 300} 1060, ${SW * 7} 1120 S ${SW * 8 - 200} 1150, ${SW * 8 + 20} 1120`;
const Pano: React.FC = () => {
  const f = useCurrentFrame();
  const cyc = f < 50 ? 0 : Math.floor((f - 50) / 30) % 4; // слайд 5: цикл фон→стиль→міміка→камера
  return <>
    <Bands colors={COLORS} />
    {/* ── НИТКА через усю панораму (статична, закон 2) ── */}
    <Seam><svg style={{ position: "absolute", left: 0, top: 0 }} width={N * SW} height={SH}>
      <path d={THREAD}
        fill="none" stroke={RED} strokeWidth={10} strokeLinecap="round" opacity={0.9} /></svg>
      <div style={{ position: "absolute", left: SW * 6, top: 0, width: SW, height: SH, overflow: "hidden" }}><svg style={{ position: "absolute", left: -SW * 6, top: 0 }} width={N * SW} height={SH}><path d={THREAD} fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" /></svg></div></Seam>
    {/* ── СТИК 1|2: логотип Kling навпіл ── */}
    <Seam><div style={{ position: "absolute", left: SW - 150, top: 870, width: 300, height: 300, borderRadius: 80, background: "#fff", border: `8px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `12px 12px 0 ${RED}` }}>
      <Img src={staticFile("kling/kling-color.svg")} style={{ width: 190 }} /></div></Seam>
    {/* ── СТИК 3|4: кадр плівки ── */}
    <Seam><div style={{ position: "absolute", left: SW * 3 - 190, top: 930, width: 380, height: 150, background: "#1C1C22", border: `6px solid ${INK}`, borderRadius: 14, display: "flex", gap: 10, padding: 14, boxSizing: "border-box" }}>
      {[0, 1, 2, 3].map((k) => <div key={k} style={{ flex: 1, borderRadius: 8, background: ["#3A3F58", RED, "#3A3F58", "#F4F1E6"][k] }} />)}</div></Seam>

    {/* ═ 1. ОБКЛАДИНКА ═ */}
    <Corner i={0} n={N} dark />
    <Head x={X(0, 70)} y={250} lines={["KLING 4.0:", "*5 змін*,", "які варто знати"]} size={150} color="#fff" w={940} a={-1} />
    <Serif x={X(0, 70)} y={740} t="і одна пастка з ціною" size={60} color="rgba(255,255,255,.8)" a={-1} />
    <Swipe i={0} dark />

    {/* ═ 2. 30 секунд ═ */}
    <Corner i={1} n={N} /><Num i={1} k="1" />
    <Head x={X(1, 70)} y={300} lines={["До *30 секунд*", "за одну генерацію"]} size={112} />
    <Abs x={X(1, 70)} y={560}><In a={10}>
      <div style={{ width: 940 }}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 40, color: B.gray, marginBottom: 10 }}>Kling 3.0</div>
        <div style={{ height: 58, width: "50%", borderRadius: 16, background: "#C9C1B5", display: "flex", alignItems: "center", paddingLeft: 20, boxSizing: "border-box", fontFamily: FONT.sans, fontWeight: 900, fontSize: 40, color: INK }}>15 с</div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 40, color: INK, margin: "28px 0 10px" }}>Kling 4.0</div>
        <div style={{ height: 58, width: `${50 + 50 * ease((f - 24) / 26)}%`, borderRadius: 16, background: RED, display: "flex", alignItems: "center", paddingLeft: 20, boxSizing: "border-box" }}><span style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 40, color: "#fff", opacity: ease((f - 40) / 10) }}>30 с</span></div>
      </div></In></Abs>
    <Abs x={X(1, 380)} y={800}><In a={24} from="zoom"><div style={{ width: 640, textAlign: "right" }}><Count from={15} to={30} a={24} dur={26} size={300} color={RED} /><span style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 110, color: INK }}> с</span></div></In></Abs>
    <FULL i={1} />

    {/* ═ 3. 10 ключових кадрів ═ */}
    <Corner i={2} n={N} /><Num i={2} k="2" />
    <Head x={X(2, 70)} y={300} lines={["*До 10* ключових", "кадрів"]} size={120} />
    {(["door", "key", "wrapped_gift", "heart_hands", "exploding_head"] as const).map((s, k) => <Abs key={s} x={X(2, 70 + k * 190)} y={600}><In a={8 + k * 5} from="zoom">
      <Idle amp={5} seed={k}><div style={{ width: 160, height: 160, borderRadius: 24, background: "#fff", border: `6px solid ${INK}`, boxShadow: `6px 6px 0 ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <Fl n={s} s={110} /><div style={{ position: "absolute", left: -14, top: -14, width: 42, height: 42, borderRadius: 21, background: INK, color: "#fff", fontFamily: FONT.sans, fontWeight: 900, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>{k === 4 ? 10 : k + 1}</div></div></Idle></In></Abs>)}
    <Body x={X(2, 70)} y={820} t="Задаєте стани сцени: двері, предмет, реакція. Вони можуть іти *одним планом*." w={800} a={30} />
    <FULL i={2} />

    {/* ═ 4. 15 референсів ═ */}
    <Corner i={3} n={N} dark /><Num i={3} k="3" />
    <Head x={X(3, 70)} y={300} lines={["До *15 референсів*", "одночасно"]} size={112} color="#fff" />
    <Abs x={X(3, 70)} y={540}><div style={{ display: "flex", flexWrap: "wrap", gap: 12, width: 940 }}>
      {Array.from({ length: 15 }, (_, k) => <div key={k} style={{ width: 50, height: 50, borderRadius: 12, background: f >= 10 + k * 2 ? RED : "rgba(255,255,255,.1)" }} />)}</div></Abs>
    {([["framed_picture", "фото"], ["film_frames", "відео"], ["microphone", "голос"], ["puzzle_piece", "елементи"]] as const).map(([s, t], k) => <Abs key={s} x={X(3, 70 + k * 235)} y={660}><In a={30 + k * 5} from="up">
      <div style={{ width: 215, height: 215, borderRadius: 28, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}><Fl n={s} s={110} /><span style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 40, color: INK }}>{t}</span></div></In></Abs>)}
    <FULL i={3} />

    {/* ═ 5. Редагування ═ */}
    <Corner i={4} n={N} /><Num i={4} k="4" />
    <Head x={X(4, 70)} y={300} lines={["Правки в *готовому*", "відео"]} size={110} />
    <Abs x={X(4, 70)} y={540}><In a={8} from="up">
      <div style={{ width: 600, height: 420, borderRadius: 30, overflow: "hidden", border: `7px solid ${INK}`, boxShadow: `10px 10px 0 ${INK}`, position: "relative", background: f < 50 ? "linear-gradient(180deg,#9FD3FF,#E8F4FF)" : "linear-gradient(180deg,#1B1F4A,#4B2C6B)" }}>
        {cyc >= 1 && <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(0,0,0,.4) 2px, transparent 2.4px)", backgroundSize: "13px 13px", mixBlendMode: "multiply" }} />}
        <div style={{ position: "absolute", left: 200, top: 110, transform: `scale(${cyc === 3 ? 1.35 : 1})`, transition: "none" }}><Idle amp={8}><Fl n={cyc >= 2 ? "face_screaming_in_fear" : "smiling_face_with_sunglasses"} s={200} /></Idle></div>
      </div></In></Abs>
    <Abs x={X(4, 710)} y={560}><div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {["фон", "стиль", "міміка", "камера"].map((t, k) => <In key={t} a={14 + k * 4} from="right"><Chip t={t} bg={k === cyc && f >= 50 ? RED : "rgba(13,13,13,.08)"} color={k === cyc && f >= 50 ? "#fff" : INK} size={40} /></In>)}</div></Abs>
    <FULL i={4} />

    {/* ═ 6. Звук і мови ═ */}
    <Corner i={5} n={N} dark /><Num i={5} k="5" />
    <Head x={X(5, 70)} y={300} lines={["Стерео і губи", "*в синхрон*"]} size={116} color="#fff" />
    <Abs x={X(5, 70)} y={560}><div style={{ display: "flex", flexWrap: "wrap", gap: 14, width: 940 }}>
      {["китайська", "англійська", "японська", "корейська", "іспанська", "португальська", "німецька", "французька"].map((l, k) => <In key={l} a={8 + k * 3} from="zoom"><Chip t={l} bg="rgba(255,255,255,.12)" size={38} /></In>)}</div></Abs>
    <Abs x={X(5, 70)} y={860}><In a={24} from="zoom"><div style={{ position: "relative", display: "inline-block" }}><Chip t="українська" bg="transparent" size={52} /><div style={{ position: "absolute", inset: -6, borderRadius: 999, border: "5px dashed rgba(255,255,255,.55)" }} /></div></In></Abs>
    {f >= 30 && <Marker at={30} strokes={cross(X(5, 70 + 170), 906, 150)} w={14} speed={2600} />}
    <Body x={X(5, 470)} y={860} t="Українську озвучку поки робимо *окремо*." w={540} color="#fff" a={36} />
    <FULL i={5} />

    {/* ═ 7. Головне: Flash ═ */}
    <Corner i={6} n={N} dark />
    <Head x={X(6, 70)} y={170} lines={["ГОЛОВНЕ:", "зараз лише Flash"]} size={120} color="#fff" accent={INK} />
    <Abs x={X(6, 70)} y={470}><In a={10} from="up">
      <div style={{ width: 940, borderRadius: 32, background: "#fff", border: `7px solid ${INK}`, boxShadow: `10px 10px 0 ${INK}`, padding: "30px 36px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}><Img src={staticFile("kling/kling-color.svg")} style={{ width: 64 }} /><span style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 52, color: INK }}>Kling 4.0 Flash</span></div>
        {[["доступ", "з 28 вересня, ранній"], ["якість", "720p"], ["довжина", "до 20 с"], ["тариф", "лише Ultra на рік"]].map(([k, v], j) => <In key={k} a={22 + j * 5} from="left"><div style={{ display: "flex", justifyContent: "space-between", borderTop: "3px solid rgba(13,13,13,.08)", marginTop: 16, paddingTop: 14, fontFamily: FONT.sans }}>
          <span style={{ fontWeight: 700, fontSize: 38, color: B.gray }}>{k}</span><span style={{ fontWeight: 900, fontSize: 42, color: INK }}>{v}</span></div></In>)}
      </div></In></Abs>
    <Abs x={X(6, 540)} y={1075} center><In a={36} from="down"><Idle amp={4} rot={2}><div style={{ background: INK, color: "#fff", borderRadius: 24, padding: "18px 40px", fontFamily: FONT.sans, fontWeight: 900, fontSize: 90, letterSpacing: "-0.04em", whiteSpace: "nowrap" }}>$1 429,99<span style={{ fontSize: 40, opacity: 0.7 }}> /рік</span></div></Idle></In></Abs>

    {/* ═ 8. CTA ═ */}
    <Corner i={7} n={N} />
    <Head x={X(7, 70)} y={200} lines={["Не купуйте", "річну *за анонсом*"]} size={120} />
    <Serif x={X(7, 70)} y={460} t="Повна версія — у жовтні." size={62} a={12} w={940} />
    <Serif x={X(7, 70)} y={540} t="Покажу тести першим." size={62} a={16} w={940} />
    <Abs x={X(7, 70)} y={700}><div style={{ display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-start" }}>
      <In a={24} from="left"><Chip t="🔖 Збережіть" bg={RED} size={52} /></In>
      <In a={30} from="left"><Chip t="🔔 Підпишіться" bg={INK} size={52} /></In></div></Abs>
    {f >= 44 && <Marker at={44} strokes={ring(X(7, 270), 750, 215, 70, 3)} w={9} speed={2200} />}
    <Avatar pose="point-left" at={10} x={X(7, 830)} h={640} tone="paper" bottom={0} />
  </>;
};

export const KLING4_CAR: CarouselDef = { id: "kling4", title: "Kling 4.0 — 5 змін", n: N, Pano, bg: (i) => COLORS[i] };
