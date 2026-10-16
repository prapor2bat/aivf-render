import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { measureText } from "@remotion/layout-utils";
import { B, FONT } from "../brand/tokens";
import { Captions, EndCard, RedWipe, Tag } from "../brand/kit";
import { strings } from "../brand/i18n";
import { makeTimeline } from "../brand/timeline";
import { Broll } from "./Broll";
import { Badge, Chips, Credit, StatCard } from "./overlays";
import META from "./audio_meta.json";
import BROLL from "./broll_meta.json";

/* ═══════════════════════════════════════════════════════════════════════
   ФОРМАТ «НОВИНИ ТА ФАКТИ» — стокове b-roll під озвучку. 16:9 (NewsWide,
   1280×720) або 9:16 (News, 720×1280). Кожна сцена = лінія озвучки
   (audio_meta.json): за кадром повільний наїзд кліпа, зверху — бренд-
   субтитри, бирка каналу, червоне коло на межах і фінальна картка.
   ─ Проєкт 014 «Рютте лишається» — дані у audio_meta.json/broll_meta.json
     + mp3 у studio/public/news/<id>.mp3 (staticFile нижче).
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
  hook: ["нато"],
  hook2: ["лишається"],
  s01: ["зеленським"],
  s02: ["тридцяти"],
  s03: ["збираюся"],
  s04: ["стармера"],
  s05: ["підтримуйте"],
  s06: ["сімдесят"],
  s07: ["патріот"],
  s08: ["декларація"],
  s09: ["скорочують"],
  s10: ["гринкевич"],
  s11: ["заповнили"],
  s12: ["пятою"],
  s13: ["нестійка"],
  s14: ["пять"],
  s15: ["лейпцигу"],
  s16: ["суверенітет"],
  s17: ["передбачуваність"],
  cta: ["гроші"],
};
/* Заміна фонетики на справжнє написання (from — нормалізовані токени, точний збіг). */
const SWAP: [string[], string[]][] = [
  [["нато"], ["НАТО"]],
  [["пятнадцятого"], ["15"]],
  [["дві", "тисячі", "двадцять", "четвертого"], ["2024"]],
  [["дві", "тисячі", "двадцять", "восьмого"], ["2028"]],
  [["тридцяти", "двох"], ["32"]],
  [["сімдесят", "мільярдів"], ["€70", "млрд"]],
  [["патріот"], ["Patriot"]],
  [["пятою"], ["5-ю"]],
  [["шестисот", "мільйонів"], ["600", "млн"]],
  [["пять", "відсотків"], ["5%"]],
  [["росія"], ["Росія"]],
  [["гринкевич"], ["Ґрінкевич"]],
];
const T = makeTimeline(META as any, ORDER, { fps: FPS, keys: KEYS, swap: SWAP });
const LAST = ORDER[ORDER.length - 1];
const END_AT = T.WIN[LAST].e;

/* Інфографіка по сценах: `at` — кадр слова в межах сцени (T.wf). */
const OVL: Partial<Record<string, React.ReactNode>> = {
  s01: <Badge at={T.wf("s01", "приймав")} name="15 ЖОВТНЯ" note="Брюссель · зустріч із Зеленським" />,
  s02: <StatCard at={T.wf("s02", "чотири")} kicker_="строк генсека" big="4 РОКИ" sub="продовження — за згодою 32 країн" />,
  s03: <Badge at={T.wf("s03", "восьмого")} name="ЖОВТЕНЬ 2028" note="посада стає вільною" />,
  s06: <StatCard at={T.wf("s06", "сімдесят")} kicker_="військова допомога" big="€70 МЛРД" sub="на рік для України" />,
  s07: <Badge at={T.wf("s07", "ліцензію")} name="PATRIOT" note="ліцензія на виробництво в Україні" />,
  s08: <Badge at={T.wf("s08", "декларація")} name="ПАРИЗЬКА ДЕКЛАРАЦІЯ" note="гарантії безпеки після припинення вогню" />,
  s09: <Chips at={T.wf("s09", "скорочують")} y={248} items={["АВІАНОСЕЦЬ", "ПІДВОДНІ ЧОВНИ", "ЛІТАКИ-ЗАПРАВНИКИ"]} />,
  s10: <Badge at={T.wf("s10", "план")} name="ПЛАН Б" note="європейський сценарій без США" />,
  s11: <Badge at={T.wf("s11", "заповнили")} name="ПРОГАЛИНИ ЗАКРИТО" note="Європа і Канада" />,
  s13: <StatCard at={T.wf("s13", "оборону")} kicker_="європейців у НАТО" big="600 МЛН" />,
  s14: <StatCard at={T.wf("s14", "пять")} kicker_="на оборону щороку" big="5% ВВП" />,
  s15: <Chips at={T.wf("s15", "гібридні")} y={248} items={["ПІДПАЛИ", "ПОРУШЕННЯ ПОВІТРЯНОГО ПРОСТОРУ", "АТАКА НА АЕРОПОРТ"]} />,
  s16: <Badge at={T.wf("s16", "армію")} name="ЄДИНА АРМІЯ" note="складно · суверенітет країн" />,
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
