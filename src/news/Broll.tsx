import React from "react";
import { AbsoluteFill, interpolate, staticFile, useCurrentFrame, OffthreadVideo } from "remotion";
import { B } from "../brand/tokens";

/* ═══════════════════════════════════════════════════════════════════════
   BROLL — стокове відео як тло сцени (формат «Новини та факти»).
   Кліпи (локальна база або Pixabay) кладемо в studio/public/broll/<проєкт>/
   (скрипт projects/_template/scripts/broll.mjs). Шар лежить ПІД бренд-
   оверлеєм: сверху йдуть Captions, Tag, RedWipe, EndCard.
   ─ файл відсутній (напр. не всі сцени знайшли кліп) → темний градієнт.
   ═══════════════════════════════════════════════════════════════════════ */

const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

export const Broll: React.FC<{ src?: string; dur: number; seed?: number; trimBefore?: number }> = ({ src, dur, seed = 0, trimBefore = 0 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, dur], [0, 1], clamp);
  const zoom = 1.06 + 0.1 * p;                              // повільний наїзд (Ken Burns)
  const dir = seed % 2 ? 1 : -1;
  const panX = dir * (16 * p - 8);
  const panY = (seed % 3 === 0 ? 1 : -1) * (12 * p - 6);
  return (
    <AbsoluteFill style={{ background: B.night, overflow: "hidden" }}>
      {src ? (
        <AbsoluteFill style={{ transform: `scale(${zoom}) translate(${panX}px, ${panY}px)` }}>
          <OffthreadVideo src={staticFile(src)} muted startFrom={trimBefore} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ background: "linear-gradient(160deg, #23262F 0%, #0A0A0A 72%)" }} />
      )}
      {/* затемнення під текст: верх і низ темніші, центр лишається читабельним */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.14) 26%, rgba(0,0,0,.05) 50%, rgba(0,0,0,.62) 100%)" }} />
      {/* фірмова вінєтка + ледь помітна сітка */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, transparent 42%, rgba(0,0,0,.55) 100%)" }} />
      <AbsoluteFill style={{ opacity: 0.5, backgroundImage: `linear-gradient(${B.gridNight} 1px, transparent 1px), linear-gradient(90deg, ${B.gridNight} 1px, transparent 1px)`, backgroundSize: "48px 48px" }} />
    </AbsoluteFill>
  );
};
