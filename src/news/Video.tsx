import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { measureText } from "@remotion/layout-utils";
import { B, FONT } from "../brand/tokens";
import { Captions, EndCard, RedWipe, Tag } from "../brand/kit";
import { strings } from "../brand/i18n";
import { makeTimeline } from "../brand/timeline";
import { Broll } from "./Broll";
import { Badge, Chips, Credit, Quote, StatCard } from "./overlays";
import META from "./audio_meta.json";
import BROLL from "./broll_meta.json";

/* ═══════════════════════════════════════════════════════════════════════
   ФОРМАТ «НОВИНИ ТА ФАКТИ» — стокове b-roll під озвучку. 16:9 (NewsWide,
   1280×720) або 9:16 (News, 720×1280). Кожна сцена = лінія озвучки
   (audio_meta.json): за кадром повільний наїзд кліпа, зверху — бренд-
   субтитри, бирка каналу, червоне коло на межах і фінальна картка.
   ─ Проєкт 015 «Слов'янськ, ФАБ-250» — дані у audio_meta.json/broll_meta.json
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
  hook: ["тіла"],
  hook2: ["загиблу"],
  s01: ["багатоповерхівки"],
  s06: ["квартали"],
  s11: ["злочини"],
  s12: ["квартири"],
  s13: ["евакуацію"],
  s15: ["джерелам"],
  s16: ["офіційно"],
  s17: ["зруйновані"],
  s19: ["деблокували"],
  s21: ["звязку"],
  s23: ["зведення"],
  s24: ["загинула"],
  s26: ["підтримка"],
  s27: ["правду"],
  s29: ["підпишіться"],
  s30: ["провадження"],
};
/* Заміна фонетики на справжнє написання (from — нормалізовані токени, точний збіг).
   Пари — ПЕРЕД одинарними, інакше зіб'ється нумерація. */
const SWAP: [string[], string[]][] = [
  [["три", "сорок", "першої"], ["03:40"]],
  [["о", "третій", "сорок", "першій"], ["о", "03:40"]],
  [["фаб", "двісті", "пятдесят"], ["ФАБ-250"]],
  [["каб", "двісті", "пятдесят"], ["КАБ-250"]],
  [["одна", "тисяча", "шістсот", "сімдесят", "сім"], ["1", "677"]],
  [["двох", "тисяч", "восьмого"], ["2008"]],
  [["шістнадцятого", "жовтня"], ["16", "жовтня"]],
  [["сімнадцяте", "жовтня"], ["17", "жовтня"]],
  [["шістнадцять", "людей"], ["16", "людей"]],
  [["сімнадцятирічна"], ["17-річна"]],
  [["десять", "поранених"], ["10", "поранених"]],
  [["шість", "населених"], ["6", "населених"]],
  [["тридцять", "три", "цивільні"], ["33", "цивільні"]],
  [["тринадцять", "житлових"], ["13", "житлових"]],
  [["вісім", "багатоповерхових"], ["8", "багатоповерхових"]],
  [["тридцяти", "девяти"], ["39"]],
  [["вісімдесяти", "одного"], ["81"]],
  [["вісімдесяти", "пяти"], ["85"]],
  [["сорока", "восьми"], ["48"]],
  [["пятьох", "чоловіків"], ["5", "чоловіків"]],
  [["пятьох", "жінок"], ["5", "жінок"]],
  [["пятьох", "мирних"], ["5", "мирних"]],
  [["чотири", "бомби"], ["4", "бомби"]],
  [["чотири", "приватні"], ["4", "приватні"]],
  [["шість", "приватних"], ["6", "приватних"]],
  [["чотириста", "тридцять", "восьма"], ["438"]],
  [["сто", "один"], ["101"]],
  [["сто", "два"], ["102"]],
  [["двох", "людей"], ["2", "людей"]],
  [["дві", "авіабомби"], ["2", "авіабомби"]],
  [["одна", "людина"], ["1", "людина"]],
  [["девяти"], ["9"]],
  [["вісьмох"], ["8"]],
  [["словянська"], ["Слов'янська"]],
  [["словянської"], ["Слов'янської"]],
  [["словянську"], ["Слов'янську"]],
  [["словянськ"], ["Слов'янськ"]],
  [["звязку"], ["зв'язку"]],
];
const T = makeTimeline(META as any, ORDER, { fps: FPS, keys: KEYS, swap: SWAP });
const LAST = ORDER[ORDER.length - 1];
const END_AT = T.WIN[LAST].e;

/* Інфографіка по сценах: `at` — кадр слова в межах сцени (T.wf).
   Для 16:9 субтитри на h*0.74≈533 → панелі тримаємо у y≈150…520 (y перекриваємо для високих). */
const OVL: Partial<Record<string, React.ReactNode>> = {
  hook: <Badge at={T.wf("hook", "тіла")} name="03:40" note="ніч · спальний мікрорайон Слов'янська" />,
  hook2: <StatCard at={T.wf("hook2", "загиблу")} kicker_="попередні дані" big="1 ЗАГИБЛА" sub="10 поранених · ФАБ-250 з УМПК" />,
  s01: <Quote at={T.wf("s01", "багатоповерхівки")} text="Під завалами можуть бути тіла людей — влучання у дві багатоповерхівки." who="Вадим Лях · Слов'янська МВА" y={170} />,
  s02: <Badge at={T.wf("s02", "працюють")} name="ПОШУКОВО-РЯТУВАЛЬНІ РОБОТИ" note="дві локації · завали розбирають бригади" />,
  s03: <StatCard at={T.wf("s03", "госпіталізовані")} kicker_="станом на зараз" big="1 ЗАГИНУЛА" sub="10 поранених · 4 госпіталізовані" />,
  s04: <StatCard at={T.wf("s04", "шістнадцять")} kicker_="постраждали за добу" big="16 ПОРАНЕНИХ" sub="серед них 17-річна дівчина" />,
  s05: <StatCard at={T.wf("s05", "вісім")} kicker_="пошкоджено" big="8 БУДИНКІВ" sub="з них 2 частково зруйновані" />,
  s06: <Chips at={T.wf("s06", "квартали")} y={170} items={["ФАБ-250", "УМПК", "ЖИТЛОВІ КВАРТАЛИ"]} />,
  s07: <StatCard at={T.wf("s07", "тисяча")} kicker_="атаки за добу по області" big="1 677 АТАК" sub="6 населених пунктів · 13 житлових будинків" />,
  s08: <StatCard at={T.wf("s08", "двох")} kicker_="Краматорськ" big="2 ЗАГИБЛІ · 8 ПОРАНЕНИХ" sub="удари «Торнадо-С» і «Смерч»" />,
  s09: <StatCard at={T.wf("s09", "пятьох")} kicker_="дрони ФПВ · Слов'янськ" big="5 ПОРАНЕНИХ" sub="серед них дівчина 2008 року народження" />,
  s10: <Chips at={T.wf("s10", "приватні")} y={170} items={["ЯСНОГІРКА · 4 БУДИНКИ", "СТАРОВАРВАРІВКА · 6", "КРИНИЦІ · 1"]} />,
  s11: <Badge at={T.wf("s11", "злочини")} name="СТ. 438 КК УКРАЇНИ" note="воєнні злочини · розслідування триває" />,
  s12: <Badge at={T.wf("s12", "квартири")} name="РОДИЧІ БІЛЯ ЗАВАЛІВ" note="квартири, де люди встигли вийти — і де ні" />,
  s13: <Badge at={T.wf("s13", "евакуацію")} name="ЕВАКУАЦІЯ" note="комендантська година · лише перевірені маршрути" />,
  s14: <StatCard at={T.wf("s14", "номерами")} kicker_="ДСНС · поліція" big="101 · 102" sub="не чіпайте нерозірвані снаряди" />,
  s15: <Badge at={T.wf("s15", "джерелам")} name="ОФІЦІЙНІ ДЖЕРЕЛА" note="без сенсацій і телеграм-каналів" />,
  s16: <Badge at={T.wf("s16", "офіційно")} name="ДАНІ УТОЧНЮЮТЬСЯ" note="оновинмо, коли з'являться нові дані" />,
  s17: <StatCard at={T.wf("s17", "зруйновані")} kicker_="пошкоджено" big="2 ЧАСТКОВО" sub="частково зруйновані — люди без даху" />,
  s18: <Badge at={T.wf("s18", "локаціях")} name="ПОШУК НА ОБОХ ЛОКАЦІЯХ" note="кожна хвилина на вагу золота" />,
  s19: <StatCard at={T.wf("s19", "деблокували")} kicker_="прокуратура Донецької області" big="5 ЧОЛОВІКІВ · 5 ЖІНОК" sub="вік 39–85 · тіла деблоковано" />,
  s20: <Badge at={T.wf("s20", "поліція")} name="РОЗСЛІДУВАННЯ ТРИВАЄ" note="поліція задокументує кожен факт" />,
  s21: <Badge at={T.wf("s21", "звязку")} name="ЗВ'ЯЗОК З РОДИЧАМИ" note="довіряйте лише офіційним джерелам" />,
  s22: <Chips at={T.wf("s22", "донецька")} y={200} items={["ДОНЕЦЬКА ОБЛАСТЬ", "СЛОВ'ЯНСЬК", "КРАМАТОРСЬК"]} />,
  s23: <Badge at={T.wf("s23", "зведення")} name="ОФІЦІЙНІ ЗВЕДЕННЯ" note="поліція області — щодня" />,
  s24: <StatCard at={T.wf("s24", "загинула")} kicker_="коротко · ніч на 17 жовтня" big="1 ЗАГИНУЛА" sub="10 поранених · під завалами шукають людей" />,
  s25: <Chips at={T.wf("s25", "краматорськ")} y={200} items={["КРАМАТОРСЬК", "СЛОВ'ЯНСЬК"]} />,
  s26: <Badge at={T.wf("s26", "підтримка")} name="ПІДТРИМКА" note="люди, що лишились, живуть під ударами" />,
  s27: <Badge at={T.wf("s27", "правду")} name="ЛИШЕ ПРАВДА" note="працюємо тільки з офіційними джерелами" />,
  s28: <StatCard at={T.wf("s28", "снаряд")} kicker_="небезпека" big="101 · 102" sub="не чіпайте нерозірваний снаряд" />,
  s29: <Badge at={T.wf("s29", "підпишіться")} name="ПІДПИШІТЬСЯ" note="більше перевірених фактів — на каналі" />,
  s30: <Badge at={T.wf("s30", "провадження")} name="КРИМІНАЛЬНЕ ПРОВАДЖЕННЯ" note="за кожен удар по області" />,
  s31: <StatCard at={T.wf("s31", "номери")} kicker_="перевірте рідних" big="101 · 102" sub="зателефонуйте — чи вони в безпеці" />,
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
