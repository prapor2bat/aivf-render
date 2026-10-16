import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { B, FONT } from "../brand/tokens";

/* ═══════════════════════════════════════════════════════════════════════
   ДЕМО-ЗАПИС ЕКРАНА для формату «Скрінкаст»: мок-інтерфейс ШІ-чату.
   Це не справжній запис — синтетичний «екран» 1920×1080, який рендериться
   в mp4 і далі використовується як recording у композиції Screencast.
   Координати збігаються з тим, що знімають шоти-підсвітки у screencast.json.
   ═══════════════════════════════════════════════════════════════════════ */

export const MOCKAI_F = 960; // 32 с @30 — трохи довше за озвучку (29.6 с)

const W = 1920, H = 1080;
const NIGHT = "#0E0E12";
const PANEL = "#16161C";
const PANEL2 = "#1D1D25";
const LINE = "#2A2A34";
const TEXT = "#EDEDF2";
const DIM = "#9A9AA6";
const ACCENT = B.red;

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };
const useIn = (at: number, dur = 14) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: f - at, fps, config: { damping: 20, stiffness: 120 } });
  return { p, o: interpolate(f, [at, at + dur], [0, 1], clamp) };
};

const Dot: React.FC<{ c: string; at: number }> = ({ c, at }) => {
  const { o } = useIn(at, 12);
  return <div style={{ width: 15, height: 15, borderRadius: "50%", background: c, opacity: o }} />;
};

const Row: React.FC<{ label: string; icon: string; at: number; active?: boolean }> = ({ label, icon, at, active }) => {
  const { p, o } = useIn(at, 12);
  return (
    <div style={{ position: "absolute", left: 68, width: 262, height: 52, borderRadius: 12, display: "flex", alignItems: "center", gap: 12,
      paddingLeft: 16, background: active ? "rgba(227,32,43,.16)" : "rgba(255,255,255,.03)", border: `1px solid ${active ? "rgba(227,32,43,.5)" : LINE}`,
      opacity: o, transform: `translateX(${(1 - p) * -16}px)` }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 20, color: active ? TEXT : DIM }}>{label}</span>
    </div>
  );
};

const Chip: React.FC<{ label: string; icon: string; at: number; accent?: boolean }> = ({ label, icon, at, accent }) => {
  const { p, o } = useIn(at, 12);
  return (
    <div style={{ height: 52, borderRadius: 999, display: "flex", alignItems: "center", gap: 10, padding: "0 22px",
      background: accent ? "rgba(227,32,43,.14)" : PANEL2, border: `1px solid ${accent ? "rgba(227,32,43,.45)" : LINE}`,
      opacity: o, transform: `translateY(${(1 - p) * 12}px)` }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
      <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 20, color: accent ? "#FF6B72" : TEXT }}>{label}</span>
    </div>
  );
};

const TypingDots: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const f = useCurrentFrame();
  if (f < from || f > to) return null;
  return (
    <div style={{ display: "flex", gap: 8, padding: "6px 2px" }}>
      {[0, 1, 2].map((i) => {
        const t = ((f - from) / 10 + i * 0.6) % 2;
        const s = 1 + Math.max(0, Math.sin(t * Math.PI)) * 0.5;
        return <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: DIM, transform: `scale(${s})` }} />;
      })}
    </div>
  );
};

const ANSWER = "Це програма, яка вчиться на прикладах. Вона знаходить закономірності й передбачає найімовірніше продовження.";

const AiAnswer: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const words = ANSWER.split(" ");
  const step = 9;
  return (
    <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 30, lineHeight: 1.5, color: TEXT }}>
      {words.map((w, i) => {
        const at = from + i * step;
        const o = interpolate(f, [at, at + 5], [0, 1], clamp);
        return <span key={i} style={{ opacity: o }}>{w}{i < words.length - 1 ? " " : ""}</span>;
      })}
    </div>
  );
};

export const MockAI: React.FC = () => {
  const f = useCurrentFrame();
  const win = spring({ frame: f - 0, fps: 30, config: { damping: 22, stiffness: 90 } });
  const chipAt = 130;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 0%, #14141A, #070709 70%)" }}>
      {/* вікно застосунку */}
      <div style={{ position: "absolute", left: 48, top: 40, width: 1824, height: 1000, borderRadius: 20, background: PANEL,
        border: `1px solid ${LINE}`, boxShadow: "0 40px 120px rgba(0,0,0,.6)", overflow: "hidden",
        opacity: interpolate(win, [0, 1], [0, 1]), transform: `translateY(${(1 - win) * 26}px)` }}>
        {/* заголовок вікна */}
        <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 56, borderBottom: `1px solid ${LINE}`, display: "flex", alignItems: "center", gap: 10, paddingLeft: 22, background: "#101016" }}>
          <Dot c="#FF5F57" at={6} /><Dot c="#FEBC2E" at={9} /><Dot c="#28C840" at={12} />
          <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", padding: "6px 40px", borderRadius: 999, background: "rgba(255,255,255,.05)", border: `1px solid ${LINE}`, fontFamily: FONT.sans, fontWeight: 600, fontSize: 17, color: DIM }}>ai-studio.app / chat</div>
        </div>

        {/* бокова панель */}
        <div style={{ position: "absolute", left: 0, top: 56, bottom: 0, width: 300, borderRight: `1px solid ${LINE}`, background: "#111117" }}>
          <div style={{ position: "absolute", left: 68, top: 30, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: ACCENT }} />
            <span style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: 22, color: TEXT, letterSpacing: "-0.03em" }}>AI Studio</span>
          </div>
          <div style={{ position: "absolute", left: 0, top: 92 }}><Row label="Новий чат" icon="✳" at={18} active /></div>
          <div style={{ position: "absolute", left: 0, top: 154 }}><Row label="Історія" icon="🕘" at={22} /></div>
          <div style={{ position: "absolute", left: 0, top: 216 }}><Row label="Налаштування" icon="⚙" at={26} /></div>
          {/* профіль (розмиємо вікном у screencast.json) */}
          <div style={{ position: "absolute", left: 68, bottom: 26, width: 262, height: 66, borderRadius: 12, background: PANEL2, border: `1px solid ${LINE}`, display: "flex", alignItems: "center", gap: 12, paddingLeft: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#3A3A46" }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 17, color: TEXT }}>Олена К.</span>
              <span style={{ fontFamily: FONT.sans, fontWeight: 500, fontSize: 15, color: DIM }}>olena.p@example.com</span>
            </div>
          </div>
        </div>

        {/* чат */}
        <div style={{ position: "absolute", left: 300, top: 56, right: 0, bottom: 0 }}>
          <div style={{ position: "absolute", left: 32, top: 28, fontFamily: FONT.sans, fontWeight: 800, fontSize: 26, color: TEXT, letterSpacing: "-0.02em" }}>Новий чат</div>
          {/* чипи можливостей */}
          <div style={{ position: "absolute", left: 32, top: 78, display: "flex", gap: 14 }}>
            <Chip label="Мова" icon="💬" at={chipAt} accent />
            <Chip label="Картинки" icon="🖼" at={chipAt + 4} />
            <Chip label="Тексти" icon="✍" at={chipAt + 8} />
          </div>

          {/* запит користувача */}
          <div style={{ position: "absolute", right: 32, top: 200, width: 640, borderRadius: 18, background: ACCENT, padding: "18px 24px",
            opacity: interpolate(f, [40, 54], [0, 1], clamp), transform: `translateY(${(1 - interpolate(f, [40, 54], [0, 1], clamp)) * 14}px)` }}>
            <span style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 27, color: "#fff" }}>Що таке штучний інтелект?</span>
          </div>

          {/* відповідь ШІ */}
          <div style={{ position: "absolute", left: 32, top: 300, width: 1180, borderRadius: 18, background: PANEL2, border: `1px solid ${LINE}`, padding: "22px 26px",
            opacity: interpolate(f, [200, 216], [0, 1], clamp) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 26, height: 26, borderRadius: 8, background: ACCENT }} />
              <span style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 18, color: TEXT }}>AI Studio</span>
              <div style={{ marginLeft: "auto" }}><TypingDots from={110} to={220} /></div>
            </div>
            {f >= 216 ? <AiAnswer from={228} /> : <span style={{ fontFamily: FONT.sans, fontSize: 30, color: DIM }}>…</span>}
          </div>

          {/* поле вводу + кнопка надсилання */}
          <div style={{ position: "absolute", left: 32, right: 32, top: 800, height: 78, borderRadius: 18, background: "#101016", border: `1px solid ${LINE}`, display: "flex", alignItems: "center" }}>
            <span style={{ marginLeft: 26, fontFamily: FONT.sans, fontWeight: 500, fontSize: 25, color: DIM }}>Напиши повідомлення…</span>
            <div style={{ position: "absolute", right: 10, width: 58, height: 58, borderRadius: 14, background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 26, color: "#fff" }}>➤</span>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
