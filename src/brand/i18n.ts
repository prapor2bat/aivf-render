/* ═══════════════════════════════════════════════════════════════════════
   МОВНІ ЗАГОТОВКИ БРЕНДУ каналу «Факти та Новини» (uk · ru · de · en · es · fr).
   Тут — фірмові написи, які залежать від мови ролика:
   назва каналу, рубрика на бирці, заголовок фінальної картки (CTA) і підпис.
   Мова ролика береться з audio_meta.json ("language_code"), напр. "ru".
   Невідома/порожня мова → uk (типово). Додати мову: ключ у LANGUAGES озвучки
   (_template/scripts/voices-go.mjs) + рядок у BRAND нижче.
   ═══════════════════════════════════════════════════════════════════════ */

export type Lang = "uk" | "ru" | "de" | "en" | "es" | "fr";

/** Мови, для яких уже є заготовки (порядок = як у каталозі озвучки). */
export const LANGS: Lang[] = ["uk", "ru", "de", "en", "es", "fr"];

/** Локалізовані фірмові написи.
    channel — назва каналу на бирці.
    series  — рубрика на бирці (другий рядок).
    cta     — заголовок фінальної картки, дві частини: [чорна, червона].
    end     — підпис фінальної картки за замовчуванням (усі ролики).
    newsEnd — підпис фінальної картки у формату «Новини та факти». */
export type Strings = {
  channel: string;
  series: string;
  cta: [string, string];
  end: string;
  newsEnd: string;
};

export const BRAND: Record<Lang, Strings> = {
  uk: { channel: "Факти та Новини", series: "ФАКТИ ТА НОВИНИ",
        cta: ["Підпи", "шись"], end: "щоб не пропустити наступну новину", newsEnd: "більше новин кожного дня" },
  ru: { channel: "Факты и Новости", series: "ФАКТЫ И НОВОСТИ",
        cta: ["Подпи", "шись"], end: "чтобы не пропустить следующую новость", newsEnd: "больше новостей каждый день" },
  de: { channel: "Fakten und Nachrichten", series: "FAKTEN UND NACHRICHTEN",
        cta: ["Abon", "nieren"], end: "um die nächste Nachricht nicht zu verpassen", newsEnd: "mehr Nachrichten jeden Tag" },
  en: { channel: "Facts and News", series: "FACTS AND NEWS",
        cta: ["Sub", "scribe"], end: "so you don't miss the next news", newsEnd: "more news every day" },
  es: { channel: "Datos y Noticias", series: "DATOS Y NOTICIAS",
        cta: ["Sus", "críbete"], end: "para no perderte la próxima noticia", newsEnd: "más noticias cada día" },
  fr: { channel: "Faits et Actualités", series: "FAITS ET ACTUALITÉS",
        cta: ["S'abon", "ner"], end: "pour ne pas rater la prochaine actualité", newsEnd: "plus d'actualités chaque jour" },
};

/* Підписи/коди мов, які теж приймаємо (людські назви — з каталогу озвучки). */
const ALIASES: Record<string, Lang> = {
  ua: "uk", ukrainian: "uk", українська: "uk",
  russian: "ru", російська: "ru",
  german: "de", німецька: "de",
  english: "en", англійська: "en",
  spanish: "es", іспанська: "es",
  french: "fr", французька: "fr",
};

/** Нормалізує код/підпис мови до ключа. Невідоме → "uk". */
export function toLang(x?: string | null): Lang {
  const s = String(x ?? "").trim().toLowerCase();
  if ((LANGS as string[]).includes(s)) return s as Lang;
  return ALIASES[s] ?? "uk";
}

/** Фірмові написи для мови (з запасним uk). */
export function strings(lang?: string | null): Strings {
  return BRAND[toLang(lang)] ?? BRAND.uk;
}
