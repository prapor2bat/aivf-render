import React from "react";
import { useCurrentFrame } from "remotion";
import { Icon } from "./Icon";

/* Персонаж-мультик для історій (плаский вектор, фірмова палітра бренду).
   Поза (руки), настрій (обличчя), розмова (рот), дихання, моргання — усе від кадру.
   Координати SVG 400×520: голова (200,150), плечі (112,300)/(288,300). */
export type Mood = "neutral" | "smile" | "laugh" | "annoyed" | "tired" | "worried" | "proud" | "surprised" | "sad";
export type PoseName = "idle" | "wave" | "point" | "shrug" | "facepalm" | "hold" | "phone" | "thumbs" | "crossed" | "laugh" | "tired" | "work" | "hips";
export type Hair = "short" | "curly" | "long" | "bun" | "bald" | "cap" | "chef" | "hardhat" | "kerchief" | "ponytail";
export type CharSpec = {
  skin: string; hair: Hair; hairColor: string; outfit: string; sleeves?: "long" | "short";
  apron?: string; coat?: boolean; badge?: string; glasses?: boolean; beard?: boolean; mustache?: boolean; kid?: boolean; capColor?: string; accent?: string; emblem?: string;
};
type Arm = [number, number]; // [кут плеча, кут передпліччя] від вертикалі вниз, «+» — назовні
const POSES: Record<PoseName, { r: Arm; l: Arm }> = {
  idle: { r: [12, 6], l: [12, 6] },
  wave: { r: [150, 170], l: [10, 5] },
  point: { r: [96, 92], l: [12, 6] },
  shrug: { r: [38, 112], l: [38, 112] },
  facepalm: { r: [150, -111], l: [12, 6] },
  hold: { r: [20, -60], l: [20, -60] },
  phone: { r: [160, -150], l: [12, 6] },
  thumbs: { r: [30, 175], l: [12, 6] },
  crossed: { r: [10, -80], l: [10, -80] },
  laugh: { r: [16, -52], l: [16, -52] },
  tired: { r: [4, 2], l: [4, 2] },
  work: { r: [26, -70], l: [26, -70] },
  hips: { r: [40, -40], l: [40, -40] },
};
const R = (s: number) => { const v = Math.sin(s * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const pick = <T,>(tl: [number, T][], f: number) => { let i = 0; while (i + 1 < tl.length && f >= tl[i + 1][0]) i++; return i; };

export const Character: React.FC<{
  spec: CharSpec; poses?: [number, PoseName][]; moods?: [number, Mood][]; talk?: [number, number][]; hold?: string; holdColor?: string;
  x: number; y: number; h?: number; flip?: boolean; seed?: number; enter?: number; dim?: number;
}> = ({ spec, poses = [[0, "idle"]], moods = [[0, "neutral"]], talk = [], hold, holdColor, x, y, h = 520, flip, seed = 1, enter = 0, dim = 1 }) => {
  const f = useCurrentFrame();
  // поза з плавним переходом 8 кадрів
  const pi = pick(poses, f), pa = POSES[poses[Math.max(0, pi - 1)][1]], pb = POSES[poses[pi][1]], pt = pi === 0 ? 1 : ease((f - poses[pi][0]) / 8);
  const arm = (side: "r" | "l"): Arm => [lerp(pa[side][0], pb[side][0], pt), lerp(pa[side][1], pb[side][1], pt)];
  const mood = moods[pick(moods, f)][1];
  const pose = poses[pi][1];
  const talking = talk.some(([a, b]) => f >= a && f < b);
  const breathe = Math.sin((f + seed * 13) / 18) * 2.2;
  const shake = mood === "laugh" ? Math.sin(f * 1.7) * 3.2 : 0;
  const tilt = Math.sin((f + seed * 29) / 41) * 2.4 + (mood === "tired" ? 5 : 0) + (mood === "proud" ? -3 : 0);
  const blinkT = (f + seed * 37) % (78 + (seed % 3) * 17);
  const blink = blinkT < 4 ? 0.12 : 1;
  const wave = pose === "wave" ? Math.sin(f * 0.45) * 22 : 0;
  // вхід: пружинка знизу
  const e = Math.min(1, Math.max(0, (f - enter) / 10)), en = 1 - Math.pow(1 - e, 3);
  if (f < enter) return null;
  const S = spec.kid ? 0.86 : 1;
  const sleeve = spec.coat ? "#FFFFFF" : spec.outfit;
  const fore = spec.sleeves === "short" ? spec.skin : sleeve;
  const armPath = (side: "r" | "l") => {
    const [ua, fa] = arm(side);
    const sgn = side === "r" ? 1 : -1, sx = 200 + sgn * 88 * S, sy = 300;
    const fa2 = side === "r" ? fa + wave : fa;
    const ex = sx + sgn * 95 * S * Math.sin((ua * Math.PI) / 180), ey = sy + 95 * S * Math.cos((ua * Math.PI) / 180);
    const hx = ex + sgn * 85 * S * Math.sin((fa2 * Math.PI) / 180), hy = ey + 85 * S * Math.cos((fa2 * Math.PI) / 180);
    return { sx, sy, ex, ey, hx, hy };
  };
  const A = { r: armPath("r"), l: armPath("l") };
  const eyeY = 150, mouthY = 196;
  const brow = { neutral: [0, 0], smile: [0, -2], laugh: [4, -4], annoyed: [-9, 3], tired: [5, 4], worried: [10, -2], proud: [-2, -4], surprised: [0, -12], sad: [9, 2] }[mood];
  const mouth = () => {
    if (talking && mood !== "laugh") { const o = (Math.floor((f + seed) / 3) % 3) === 0 ? 3 : 9 + R(Math.floor(f / 3) + seed) * 6; return <ellipse cx={200} cy={mouthY + 2} rx={13} ry={o} fill="#5A1414" />; }
    switch (mood) {
      case "laugh": return <path d={`M170,${mouthY - 6} Q200,${mouthY - 8} 230,${mouthY - 6} Q228,${mouthY + 26} 200,${mouthY + 28} Q172,${mouthY + 26} 170,${mouthY - 6}Z`} fill="#5A1414" />;
      case "smile": case "proud": return <path d={`M176,${mouthY} Q200,${mouthY + 18} 224,${mouthY}`} stroke="#3A1010" strokeWidth={5} fill="none" strokeLinecap="round" />;
      case "annoyed": return <path d={`M181,${mouthY + 6} Q200,${mouthY + 1} 219,${mouthY + 7}`} stroke="#3A1010" strokeWidth={5} fill="none" strokeLinecap="round" />;
      case "sad": case "tired": return <path d={`M182,${mouthY + 9} Q200,${mouthY - 1} 218,${mouthY + 9}`} stroke="#3A1010" strokeWidth={5} fill="none" strokeLinecap="round" />;
      case "worried": case "surprised": return <ellipse cx={200} cy={mouthY + 4} rx={mood === "surprised" ? 10 : 7} ry={mood === "surprised" ? 13 : 8} fill="#5A1414" />;
      default: return <path d={`M185,${mouthY + 2} Q200,${mouthY + 8} 215,${mouthY + 2}`} stroke="#3A1010" strokeWidth={5} fill="none" strokeLinecap="round" />;
    }
  };
  const eyes = () => {
    if (mood === "laugh") return <>{[170, 230].map((cx) => <path key={cx} d={`M${cx - 11},${eyeY + 3} Q${cx},${eyeY - 9} ${cx + 11},${eyeY + 3}`} stroke="#141414" strokeWidth={5} fill="none" strokeLinecap="round" />)}</>;
    const ry = (mood === "tired" ? 6 : mood === "surprised" ? 13 : 10.5) * blink;
    return <>{[170, 230].map((cx) => <g key={cx}><ellipse cx={cx} cy={eyeY} rx={8.5} ry={ry} fill="#141414" />{blink > 0.5 && <circle cx={cx + 3} cy={eyeY - 3} r={2.6} fill="#fff" />}
      {mood === "tired" && <path d={`M${cx - 11},${eyeY - 3} L${cx + 11},${eyeY - 3}`} stroke={spec.skin} strokeWidth={6} />}</g>)}</>;
  };
  const hairBack = () => {
    if (spec.hair === "long") return <path d="M112,150 Q108,50 200,46 Q292,50 288,150 L300,320 Q250,300 200,305 Q150,300 100,320 Z" fill={spec.hairColor} />;
    if (spec.hair === "ponytail") return <path d="M270,120 Q330,150 312,250 Q300,290 280,300 Q300,230 262,150Z" fill={spec.hairColor} />;
    if (spec.hair === "bun") return <circle cx={200} cy={58} r={34} fill={spec.hairColor} />;
    return null;
  };
  const hairFront = () => {
    const c = spec.hairColor;
    switch (spec.hair) {
      case "short": return <path d="M121,146 Q116,56 200,54 Q284,56 279,146 Q270,102 236,94 Q204,112 168,96 Q130,104 121,146Z" fill={c} />;
      case "curly": return <g fill={c}>{[[130, 110, 26], [155, 80, 28], [188, 66, 30], [222, 68, 30], [252, 84, 28], [272, 112, 25], [140, 90, 22], [262, 96, 22]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} />)}</g>;
      case "long": case "ponytail": case "bun": return <path d="M118,150 Q114,58 200,54 Q286,58 282,150 Q262,96 200,92 Q150,96 128,128 Q122,138 118,150Z" fill={c} />;
      case "cap": { const cc = spec.capColor ?? spec.outfit; return <g><path d="M118,122 Q120,52 200,50 Q280,52 282,122 Z" fill={cc} /><path d="M112,122 Q200,108 300,122 Q330,128 318,138 Q200,124 108,134 Z" fill={cc} opacity={0.92} /><rect x={188} y={70} width={24} height={16} rx={3} fill="#fff" opacity={0.85} /></g>; }
      case "chef": return <g><path d="M130,112 Q112,70 150,58 Q160,24 200,30 Q240,24 250,58 Q288,70 270,112 Z" fill="#FFFFFF" stroke="#D8D2C6" strokeWidth={3} /><rect x={130} y={104} width={140} height={24} rx={8} fill="#FFFFFF" stroke="#D8D2C6" strokeWidth={3} /></g>;
      case "hardhat": return <g><path d="M116,128 Q118,48 200,46 Q282,48 284,128 Z" fill={spec.capColor ?? "#F2F0EA"} /><rect x={104} y={120} width={192} height={16} rx={8} fill={spec.capColor ?? "#F2F0EA"} stroke="rgba(0,0,0,.12)" strokeWidth={2} /><rect x={194} y={50} width={12} height={72} rx={6} fill="rgba(0,0,0,.08)" /></g>;
      case "kerchief": return <g><path d="M112,160 Q106,52 200,48 Q294,52 288,160 Q270,100 200,96 Q130,100 112,160Z" fill={spec.capColor ?? "#E3202B"} /><circle cx={160} cy={80} r={5} fill="#fff" opacity={0.7} /><circle cx={230} cy={74} r={5} fill="#fff" opacity={0.7} /><circle cx={200} cy={62} r={5} fill="#fff" opacity={0.7} /></g>;
      default: return null;
    }
  };
  const holdAt = (): [number, number, number] | null => {
    if (!hold) return null;
    if (pose === "phone") return [A.r.hx, A.r.hy, 54];
    if (pose === "hold" || pose === "work" || pose === "laugh") return [(A.r.hx + A.l.hx) / 2, (A.r.hy + A.l.hy) / 2 - 18, 96];
    if (pose === "thumbs" || pose === "wave" || pose === "point") return [A.r.hx + 26, A.r.hy - 26, 70];
    return [A.r.hx + 6, A.r.hy - 10, 64];
  };
  const hp = holdAt();
  const sc = (h / 520) * (0.6 + 0.4 * en);
  return (
    <div style={{ position: "absolute", left: x - (400 * h) / 520 / 2, top: y - h, width: (400 * h) / 520, height: h, opacity: en * dim, transform: `translateY(${(1 - en) * 60}px) scaleX(${flip ? -1 : 1})` }}>
      <svg width="100%" height="100%" viewBox="0 0 400 520" style={{ overflow: "visible" }}>
        <g transform={`translate(0 ${breathe * 0.4 + shake})`}>
          {/* тулуб */}
          <g transform={`translate(200 520) scale(${S} ${S * (1 + breathe * 0.004)}) translate(-200 -520)`}>
            <path d="M110,292 Q200,262 290,292 Q334,306 342,362 L354,540 L46,540 L58,362 Q66,306 110,292 Z" fill={spec.coat ? "#FFFFFF" : spec.outfit} stroke={spec.coat ? "#D8D2C6" : "none"} strokeWidth={3} />
            {spec.coat && <><path d="M200,300 L170,360 L200,540 M200,300 L230,360 L200,540" stroke="#D8D2C6" strokeWidth={4} fill="none" /><path d="M150,300 Q200,330 250,300" stroke={spec.outfit} strokeWidth={14} fill="none" /></>}
            {spec.apron && <path d="M138,340 L262,340 L276,540 L124,540 Z" fill={spec.apron} />}
            {spec.apron && <path d="M150,340 Q200,300 250,340" stroke={spec.apron} strokeWidth={8} fill="none" />}
            <path d="M178,284 Q200,312 222,284" stroke="rgba(0,0,0,.18)" strokeWidth={4} fill="none" />
            {spec.emblem && <g transform="translate(128 336) scale(0.13)" fill={spec.emblem}><path d="M130,90 L205,15 Q235,-12 265,15 L340,90 L276,90 L276,187 L194,187 L194,90 Z" /><path d="M130,380 L205,455 Q235,482 265,455 L340,380 L276,380 L276,283 L194,283 L194,380 Z" /><path d="M89,132 L12,208 Q0,220 0,235 Q0,250 12,262 L89,341 Z" /><path d="M381,132 L458,208 Q470,220 470,235 Q470,250 458,262 L381,341 Z" /></g>}
            {spec.badge && <g transform="translate(236 364) rotate(-4)"><rect x={0} y={0} width={70} height={30} rx={6} fill="#FFFFFF" stroke="#0D0D0D" strokeWidth={2} /><text x={35} y={21} textAnchor="middle" fontFamily="Inter Tight, sans-serif" fontWeight={900} fontSize={15} fill="#0D0D0D">{spec.badge}</text></g>}
          </g>
          {/* шия + голова */}
          <g transform={`rotate(${tilt} 200 250) translate(0 ${spec.kid ? 20 : 0})`}>
            <rect x={182} y={222} width={36} height={52} rx={14} fill={spec.skin} />
            {hairBack()}
            <ellipse cx={122} cy={156} rx={14} ry={20} fill={spec.skin} />
            <ellipse cx={278} cy={156} rx={14} ry={20} fill={spec.skin} />
            <ellipse cx={200} cy={150} rx={80} ry={spec.kid ? 84 : 90} fill={spec.skin} />
            {(mood === "smile" || mood === "laugh" || mood === "proud") && <><circle cx={152} cy={182} r={13} fill="#E86A6A" opacity={0.28} /><circle cx={248} cy={182} r={13} fill="#E86A6A" opacity={0.28} /></>}
            {eyes()}
            <g stroke="#1E1612" strokeWidth={6} strokeLinecap="round">
              <line x1={158} y1={126 + brow[1] - brow[0] * 0.5} x2={182} y2={126 + brow[1] + brow[0] * 0.5} />
              <line x1={218} y1={126 + brow[1] + brow[0] * 0.5} x2={242} y2={126 + brow[1] - brow[0] * 0.5} />
            </g>
            <path d="M198,164 Q192,178 202,180" stroke="rgba(0,0,0,.35)" strokeWidth={4} fill="none" strokeLinecap="round" />
            {spec.beard && <path d="M126,170 Q130,250 200,256 Q270,250 274,170 Q262,214 232,218 Q200,210 168,218 Q138,214 126,170Z" fill={spec.hairColor} />}
            {spec.mustache && <path d="M176,186 Q200,176 224,186 Q212,192 200,188 Q188,192 176,186Z" fill={spec.hairColor} />}
            {mouth()}
            {hairFront()}
            {spec.glasses && <g stroke="#141414" strokeWidth={4} fill="rgba(255,255,255,.12)"><circle cx={170} cy={150} r={20} /><circle cx={230} cy={150} r={20} /><line x1={190} y1={150} x2={210} y2={150} /></g>}
            {mood === "tired" && <path d="M268,110 Q276,124 270,134 Q262,126 268,110Z" fill="#8FC7FF" />}
          </g>
          {/* руки */}
          {(["l", "r"] as const).map((s) => { const a = A[s]; return <g key={s} strokeLinecap="round" fill="none">
            <path d={`M${a.sx},${a.sy} L${a.ex},${a.ey}`} stroke={sleeve} strokeWidth={36 * S} />
            <path d={`M${a.ex},${a.ey} L${a.hx},${a.hy}`} stroke={fore} strokeWidth={30 * S} />
            <circle cx={a.hx} cy={a.hy} r={17 * S} fill={spec.skin} stroke="none" />
          </g>; })}
          {pose === "thumbs" && <g transform={`translate(${A.r.hx} ${A.r.hy})`}><rect x={-19} y={-14} width={38} height={32} rx={11} fill={spec.skin} stroke="rgba(0,0,0,.25)" strokeWidth={2} /><ellipse cx={-8} cy={-26} rx={8.5} ry={14} transform="rotate(-18 -8 -26)" fill={spec.skin} stroke="rgba(0,0,0,.25)" strokeWidth={2} /><path d="M-12,0 L14,0 M-12,8 L14,8" stroke="rgba(0,0,0,.18)" strokeWidth={2} /></g>}
          {hp && hold && <g transform={`translate(${hp[0] - hp[2] / 2} ${hp[1] - hp[2] / 2})`}><foreignObject width={hp[2]} height={hp[2]} style={{ overflow: "visible" }}><Icon name={hold} size={hp[2]} color={holdColor ?? "#0D0D0D"} stroke={1.9} /></foreignObject></g>}
        </g>
      </svg>
    </div>
  );
  void sc;
};
