import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { measureText } from "@remotion/layout-utils";
import { B, FONT } from "../brand/tokens";
import { Captions, EndCard, RedWipe, Tag } from "../brand/kit";
import { strings } from "../brand/i18n";
import { makeTimeline } from "../brand/timeline";
import { Broll } from "./Broll";
import { Badge, Chips, Credit, StatCard, StatusRows } from "./overlays";
import META from "./audio_meta.json";
import BROLL from "./broll_meta.json";

/* ═══════════════════════════════════════════════════════════════════════
   ФОРМАТ «НОВИНИ ТА ФАКТИ» · 9:16 — стокове b-roll під озвучку клону.
   Кожна сцена = лінія озвучки (audio_meta.json): за кадром повільний наїзд
   стокового кліпа, зверху — бренд-субтитри, бирка каналу, червоне коло на
   межах і фінальна картка. Кліпи — з Pixabay (див. проектовий broll.json).
   ─ реальні дані: перезапиши audio_meta.json і broll_meta.json + поклади
     mp3 у studio/public/news/<id>.mp3 (staticFile нижче).
   ═══════════════════════════════════════════════════════════════════════ */

const FPS = 30;
const AUDIO_DIR = "news";     // studio/public/news/<id>.mp3
const TAIL = 120;             // хвіст понад останньою лінією (фінальна картка)
const CAPS_TOP = 872;         // субтитри у нижній третині 9:16 (720×1280)
/* 16:9 (1280×720) — субтитри в нижній третині кадру: та сама частка висоти. */
const capsTopFor = (w: number, h: number) => (w > h ? Math.round(h * 0.74) : CAPS_TOP);

type Shot = { id: string; file: string; startFrom?: number };
const SHOT = new Map<string, Shot>((BROLL.shots as Shot[]).map((s) => [s.id, s]));
const CREDITS = new Map<string, string>(((BROLL as any).credits ?? []).map((c: any) => [c.id as string, c.credit as string]));

/* Мова ролика: "language" у broll_meta.json > language_code в audio_meta.json > uk.
   Звідси беруться фірмові написи (рубрика на бирці, CTA фінальної картки). */
const S = strings((BROLL as any).language || (META as any).language_code);

/* Порядок сцен — як у озвучці. Ключові слова сцени (червоні, 900) — за бажанням. */
const ORDER = (META as any).voices.map((v: any) => v.id) as string[];
const KEYS: Partial<Record<string, string[]>> = {
  hook: ["ракети"],
  hook2: ["шість"],
  s01: ["нептун"],
  s07: ["нептун"],
  s09: ["москву"],
  s14: ["ем"],
  s24: ["послаблює"],
  s29: ["ханська"],
  s30: ["пятсот"],
  s34: ["борисоглєбську"],
  s36: ["фламінго"],
  s57: ["нептун"],
  s62: ["нептун"],
};
const T = makeTimeline(META as any, ORDER, { fps: FPS, keys: KEYS });
const LAST = ORDER[ORDER.length - 1];
const END_AT = T.WIN[LAST].e;

/* Інфографіка по сценах: `at` — кадр слова в межах сцени (T.wf). */
const OVL: Partial<Record<string, React.ReactNode>> = {
  s01: <Badge at={T.wf("s01", "нептун")} name="НЕПТУН" note="українська крилата ракета" />,
  s02: <Badge at={T.wf("s02", "борисоглєбськ")} name="БОРИСОГЛЄБСЬК" note="аеродром · Воронежка область" />,
  s07: <Badge at={T.wf("s07", "комплекс")} name="ЗАХИСТ УЗБЕРЕЖЖЯ" note="початкове призначення комплексу" />,
  s08: <Badge at={T.wf("s08", "луч")} name="КБ «ЛУЧ»" note="розробник ракети" />,
  s09: <Badge at={T.wf("s09", "москву")} name="КРЕЙСЕР «МОСКВА»" note="флагман Чорноморського флоту" />,
  s10: <StatCard at={T.wf("s10", "трьохсот")} kicker_="дальність ураження" big="300 КМ" sub="дозвукова ракета" />,
  s12: <Badge at={T.wf("s12", "наземних")} name="НАЗЕМНІ ЦІЛІ" note="нова можливість модернізації" />,
  s14: <Badge at={T.wf("s14", "ем")} name="СУ-34М" note="винищувач-бомбардувальник" />,
  s25: <StatusRows at={T.wf("s25", "менше")} rows={[{ text: "менше вильотів щодня", ok: true }, { text: "менше ударів керованими бомбами", ok: true }]} />,
  s26: <StatCard at={T.wf("s26", "пятдесяти")} kicker_="експортна вартість борту" big="50 МЛН $" sub="за оцінками ЗМІ" />,
  s29: <Badge at={T.wf("s29", "ханська")} name="ХАНСЬКА" note="Адигея · початок жовтня" />,
  s30: <StatCard at={T.wf("s30", "пятсот")} kicker_="відстань до цілі" big="500 КМ" sub="від українського кордону" />,
  s32: <Badge at={T.wf("s32", "майкоп")} name="МАЙКОП" note="аеродром · Адигея" />,
  s36: <Badge at={T.wf("s36", "фламінго")} name="ФЛАМІНГО" note="удар по Роскосмосу" />,
  s37: <Badge at={T.wf("s37", "сбербанку")} name="СБЕРБАНК" note="атака на датацентр" />,
  s38: <Badge at={T.wf("s38", "яндекса")} name="ЯНДЕКС" note="атака на датацентр" />,
  s39: <Badge at={T.wf("s39", "рязанському")} name="РЯЗАНСЬКИЙ НПЗ" note="атака дронів" />,
  s43: <Chips at={T.wf("s43", "далекобійні")} items={["РАКЕТИ НЕПТУН", "УДАРНІ БЕЗПІЛОТНИКИ", "НОВІ КРИЛАТІ РАКЕТИ"]} />,
  s49: <StatusRows at={T.wf("s49", "підтверджують")} rows={[{ text: "російські джерела не підтверджують втрати", ok: false }]} />,
  s50: <StatusRows at={T.wf("s50", "українські")} rows={[{ text: "офіційно повідомляють українські військові", ok: true }]} />,
  s52: <StatusRows at={T.wf("s52", "незалежного")} rows={[{ text: "незалежного підтвердження кількості літаків немає", ok: false }]} />,
  s57: <StatCard at={T.wf("s57", "шістьох")} kicker_="результат удару" big="6 ЛІТАКІВ" sub="Су-34М на аеродромі" />,
  s62: <StatusRows at={T.wf("s62", "полювання")} rows={[{ text: "обіцяють продовжувати роботу", ok: true }]} />,
};

/* Обкладинка (якщо у broll_meta.json є "cover") — 8 кадрів перед роликом. */
const NEWS_COVER_F = 8;
const COVER = (BROLL as any).cover as { top?: string; bottom?: string; banner?: string; style?: string; source?: string } | undefined;
export const NEWS_F = (COVER ? NEWS_COVER_F : 0) + END_AT + TAIL;

const Scene: React.FC<{ id: string; dur: number; seed: number }> = ({ id, dur, seed }) => {
  const shot = SHOT.get(id);
  const { width, height } = useVideoConfig();
  return (
    <>
      <Broll src={shot?.file} dur={dur} seed={seed} trimBefore={Math.round((shot?.startFrom ?? 0) * FPS)} />
      <Captions items={T.captions(id)} tone="night" top={capsTopFor(width, height)} size={58} />
      {OVL[id]}
      {CREDITS.has(id) && <Credit text={CREDITS.get(id)!} />}
    </>
  );
};

/* Смуга прогресу — лише 16:9: показує, скільки лишилось (для довгого 8–10 хв). */
const WideProgress: React.FC<{ total: number }> = ({ total }) => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  if (width <= height) return null;
  const p = Math.max(0, Math.min(1, f / Math.max(1, total)));
  return (
    <div style={{ position: "absolute", left: 96, right: 96, bottom: 34, height: 5, background: "rgba(255,255,255,.18)", borderRadius: 5, overflow: "hidden" }}>
      <div style={{ width: `${p * 100}%`, height: "100%", background: B.red }} />
    </div>
  );
};

/* Підгонка кегля під ширину: 1–2 слова на всю обкладинку. */
const fitCover = (text: string, maxW: number, max: number) =>
  Math.min(
    max,
    Math.floor((0.92 * maxW) / (measureText({ text, fontFamily: FONT.sans, fontWeight: "900", fontSize: 100, letterSpacing: "-0.05em" }).width / 100)),
  );

/* Обкладинка: темний кадр b-roll + великий заголовок (1–2 слова) + бирка бренду. */
const NewsCover: React.FC = () => {
  const { width: W, height: Hh } = useVideoConfig();
  const wide = W > Hh;
  const shot = SHOT.get(COVER?.source || ORDER[0]);
  const maxW = W - 120;
  const s1 = fitCover(COVER?.top || "", maxW, 150);
  const s2 = COVER?.bottom ? fitCover(COVER.bottom, maxW, 150) : 0;
  return (
    <AbsoluteFill style={{ background: B.night, overflow: "hidden" }}>
      {shot?.file && (
        <AbsoluteFill>
          <OffthreadVideo
            src={staticFile(shot.file)}
            muted
            startFrom={Math.round((shot.startFrom ?? 0) * FPS)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.74) 0%, rgba(0,0,0,.34) 46%, rgba(0,0,0,.8) 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, transparent 38%, rgba(0,0,0,.62) 100%)" }} />
      <Tag tone="night" channel={S.channel} series={S.series} />
      {COVER?.banner && (
        <div style={{ position: "absolute", top: wide ? 92 : 200, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ background: B.red, color: B.white, fontFamily: FONT.sans, fontWeight: 900, fontSize: 44, letterSpacing: ".22em", padding: "14px 46px",
            textTransform: "uppercase", boxShadow: "0 22px 54px -20px rgba(227,32,43,.9)" }}>{COVER.banner}</div>
        </div>
      )}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 60px", paddingTop: COVER?.banner ? 130 : 0, textAlign: "center" }}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: s1, letterSpacing: "-0.05em", lineHeight: 0.92, color: B.white, textShadow: "0 8px 30px rgba(0,0,0,.65)" }}>
          {COVER?.top}
        </div>
        {COVER?.bottom && (
          <div style={{ fontFamily: FONT.sans, fontWeight: 900, fontSize: s2, letterSpacing: "-0.05em", lineHeight: 0.92, color: B.red, textShadow: "0 8px 30px rgba(0,0,0,.5)" }}>
            {COVER.bottom}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const NewsBody: React.FC = () => {
  const f = useCurrentFrame();
  const bgm = (fr: number) =>
    interpolate(fr, [0, 30, NEWS_F - 60, NEWS_F - 10], [0, 0.08, 0.08, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: B.night }}>
      <Audio src={staticFile("news/bgm.mp3")} loop volume={bgm} />
      {ORDER.map((id, i) => (
        <Sequence key={id} from={T.WIN[id].s} durationInFrames={T.WIN[id].d} name={id}>
          <Scene id={id} dur={T.WIN[id].d} seed={i} />
        </Sequence>
      ))}

      {/* фірмове червоне коло на кожній межі сцен + вхід у фінальну картку */}
      {ORDER.slice(1).map((id) => (
        <RedWipe key={id} at={T.WIN[id].s} />
      ))}
      <RedWipe at={END_AT} />

      {/* фінальна картка на папері */}
      <Sequence from={END_AT} durationInFrames={TAIL} name="end">
        <AbsoluteFill style={{ background: B.paper }} />
        <EndCard at={0} line={S.newsEnd} cta={S.cta} />
      </Sequence>

      {/* бирка бренду — поверх усього, крім фінальної картки (на папері темна невидима) */}
      {f < END_AT - 4 && <Tag tone="night" channel={S.channel} series={S.series} />}

      {/* смуга прогресу (лише 16:9) */}
      {f < END_AT - 4 && <WideProgress total={END_AT} />}

      {/* озвучка клону */}
      {ORDER.map((id) => (
        <Sequence key={`a-${id}`} from={T.WIN[id].s} layout="none">
          <Audio src={staticFile(`${AUDIO_DIR}/${id}.mp3`)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

/* Ролик = обкладинка (8 кадрів) + тіло. Без "cover" у broll_meta.json — лише тіло. */
export const NewsVideo: React.FC = () => {
  if (!COVER) return <NewsBody />;
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={NEWS_COVER_F} name="cover">
        <NewsCover />
      </Sequence>
      <Sequence from={NEWS_COVER_F} name="body">
        <NewsBody />
      </Sequence>
    </AbsoluteFill>
  );
};
