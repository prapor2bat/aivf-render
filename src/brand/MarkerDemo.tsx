import React from "react";
import { AbsoluteFill } from "remotion";
import { Marker, ring, underline, arrow, check, cross, strike } from "./marker";
import { B, FONT } from "./tokens";
/* Демо маркера від руки (docs/DESIGN-SYSTEM.md §«Маркер»): обвести, підкреслити, стрілка, закреслити, ✗ / ✓.
   Штрихи домальовуються самі й далі стоять. У реальному ролику маркер кладуть ВСЕРЕДИНУ шару скріна/скрінкасту. */
const Row: React.FC<{ y: number; children: React.ReactNode; size?: number }> = ({ y, children, size = 34 }) => (
  <div style={{ position: "absolute", left: 70, top: y, fontFamily: FONT.sans, fontWeight: 800, fontSize: size, color: B.ink }}>{children}</div>
);
export const MarkerDemo: React.FC = () => (
  <AbsoluteFill style={{ background: B.paper }}>
    <Row y={130} size={64}>Шапка профілю</Row>
    <Row y={250}>«Творча людина | Київ»</Row>
    <Row y={320}>«Роблю AI-відео для бізнесу»</Row>
    <div style={{ position: "absolute", left: 760, top: 110, width: 420, height: 500, borderRadius: 28, background: B.night, color: B.white, fontFamily: FONT.sans, padding: 28 }}>
      <div style={{ width: 96, height: 96, borderRadius: 96, background: "#444" }} />
      <div style={{ fontWeight: 900, fontSize: 30, marginTop: 16 }}>my_channel</div>
      <div style={{ fontWeight: 700, fontSize: 20, opacity: 0.7, marginTop: 8 }}>1 240 читачів · 58 тис. переглядів</div>
      <div style={{ marginTop: 26, padding: "14px 18px", borderRadius: 14, background: "#2A2A2E", fontWeight: 800, fontSize: 20 }}>Редагувати профіль</div>
    </div>
    <Marker at={5} strokes={ring(808, 158, 70, 64, 3)} />
    <Marker at={18} strokes={underline(70, 560, 212, 2, true)} color={B.ink} w={7} />
    <Marker at={32} strokes={arrow([560, 560], [770, 455], -0.25)} />
    <Marker at={46} strokes={strike(66, 452, 272, 4)} w={7} />
    <Marker at={56} strokes={cross(505, 272, 30)} w={10} />
    <Marker at={62} strokes={check(612, 342, 38)} color="#1E9E5A" w={10} />
  </AbsoluteFill>
);
