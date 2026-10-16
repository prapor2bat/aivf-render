/* ═══════════════════════════════════════════════════════════════════════
   НАЛАШТУВАННЯ ТВОГО БРЕНДУ — почни звідси.
   Змінюй тут назву каналу, серію, соцмережі. Кольори — у tokens.ts (обʼєкт B).
   Мовні варіанти назви рубрики й CTA — у brand/i18n.ts (uk/ru/de/en/es/fr).
   ═══════════════════════════════════════════════════════════════════════ */
import { BRAND } from "./i18n";

/** Назва каналу на бирці вгорі зліва кожного ролика (типово uk, як BRAND.uk). */
export const CHANNEL = BRAND.uk.channel;

/** Назва рубрики/серії під назвою каналу (типово — українською, як BRAND.uk). */
export const SERIES = BRAND.uk.series;

/** Плитки соцмереж у фінальній картці (файли з public/pack/logo або public/pack/brand). */
export const SOCIALS = [
  "pack/logo/instagram-colorful-3d-tile.jpg",
  "pack/logo/tiktok-3d-black-tile.jpg",
  "pack/brand/logos-youtube-icon.svg",
];

/** Заголовок фінальної картки: [чорна частина, червона частина] (типово uk). */
export const CTA_TITLE: [string, string] = BRAND.uk.cta;

/** Пози аватара з ПРОЗОРИМ фоном (PNG з альфою). Решта поз вважаються з білим фоном
    і на світлих сценах змішуються через multiply. Див. docs/AVATAR.md. */
export const AVATAR_ALPHA_POSES = ["welcome", "shock", "idea", "point-right", "point-left", "thumbs", "stop", "think", "skeptical", "neutral"];
