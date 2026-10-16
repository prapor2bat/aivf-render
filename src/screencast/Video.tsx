import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { B } from "../brand/tokens";
import { EndCard, RedWipe, Sfx, Tag } from "../brand/kit";
import { strings } from "../brand/i18n";
import { COVER_F, Cover, CoverSpec } from "../brand/cover";
import { CamRig, ScreenCaptions, RecCredit, type BlurWin, type Cap, type Shot } from "./kit";
import SC from "./screencast.json";

/* ═══════════════════════════════════════════════════════════════════════
   ФОРМАТ «СКРІНКАСТ» · 16:9 — запис екрана під озвучку (клон або живий голос).
   Запис 1920×1080 → композиція 1280×720 (рендер --scale=1.5 → 1920×1080).
   Усе керується studio/src/screencast/screencast.json:
     recording  — { file, width, height, duration, startFrom, credit }
     language   — мова фірмових написів (brand/i18n)
     voiceover  — файл озвучки у studio/public (необов'язково)
     cover      — CoverSpec (8 кадрів на початку) + окремо PNG
     shots      — наїзди/підсвітки/підписи: { at, zoom, focus, hl, label }
     blurs      — розмиття приватного: { from, to, r, px }
     captions   — слова з кадрами: { text, at, key, brk }
     end        — фінальна картка (типово true), endLine — свій підпис
   ═══════════════════════════════════════════════════════════════════════ */

const FPS = 30;
const TAIL = 120;
const S = strings((SC as any).language || "uk");

type Recording = { file: string; width: number; height: number; duration?: number; startFrom?: number; credit?: string };
const REC = (SC as any).recording as Recording;
const COVER = (SC as any).cover as CoverSpec | undefined;
const VOICE = (SC as any).voiceover as string | undefined;
const SHOTS = ((SC as any).shots ?? [{ at: 0 }]) as Shot[];
const BLURS = ((SC as any).blurs ?? []) as BlurWin[];
const CAPS = ((SC as any).captions ?? []) as Cap[];
const END = (SC as any).end !== false;
const END_LINE = ((SC as any).endLine as string) ?? S.end;

const lastCap = CAPS.length ? Math.max(...CAPS.map((c) => c.at)) : 0;
const END_AT = ((SC as any).endAt as number) ?? lastCap + 40;
const REC_F = Math.round((REC.duration ?? lastCap / FPS) * FPS);
const BODY = Math.max(END_AT + (END ? TAIL : 0), REC_F);

export const SCREENCAST_F = (COVER ? COVER_F : 0) + BODY;

const Body: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <CamRig shots={SHOTS} baseW={REC.width} baseH={REC.height} blurs={BLURS}>
        <OffthreadVideo src={staticFile(REC.file)} muted startFrom={Math.round((REC.startFrom ?? 0) * FPS)}
          style={{ width: REC.width, height: REC.height }} />
      </CamRig>

      <ScreenCaptions items={CAPS} />
      {REC.credit && <RecCredit text={REC.credit} />}
      {f < END_AT - 4 && <Tag tone="night" channel={S.channel} series={S.series} />}

      {END && (
        <Sequence from={END_AT} durationInFrames={TAIL} name="end">
          <AbsoluteFill style={{ background: B.paper }} />
          <EndCard at={0} line={END_LINE} cta={S.cta} />
        </Sequence>
      )}

      <RedWipe at={END_AT} />
      {VOICE && <Audio src={staticFile(VOICE)} />}
      {SHOTS.filter((s) => s.hl).map((s, i) => <Sfx key={i} k="p30" at={s.at + 4} vol={0.06} />)}
    </AbsoluteFill>
  );
};

/* Ролик = обкладинка (8 кадрів) + тіло. Без "cover" — лише тіло. */
export const ScreencastVideo: React.FC = () => {
  if (!COVER) return <Body />;
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={COVER_F} name="cover">
        <Cover spec={COVER} />
      </Sequence>
      <Sequence from={COVER_F} name="body">
        <Body />
      </Sequence>
    </AbsoluteFill>
  );
};
