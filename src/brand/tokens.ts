import { useVideoConfig } from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/InterTight";
import { loadFont as loadSerif } from "@remotion/google-fonts/PlayfairDisplay";

/* ═══════════════════════════════════════════════════════════════════════
   BRAND — токени фірмового стилю (docs/DESIGN-SYSTEM.md). Кольори міняй тут.
   Будь-який ролик каналу бере кольори/шрифти/розміри ТІЛЬКИ звідси.
   ═══════════════════════════════════════════════════════════════════════ */

loadSans("normal", { weights: ["500", "700", "800", "900"], subsets: ["cyrillic", "latin"] });
loadSerif("italic", { weights: ["500", "700"], subsets: ["cyrillic", "latin"] });

export const W = 720, H = 1280, FPS = 30;

/** Сейф-зона IG/TikTok/Shorts на кадрі 720×1280. Контент тільки всередині. */
export const SAFE = { top: 110, bottom: 270, left: 56, right: 76 };
export const BOX = { x: SAFE.left, y: SAFE.top, w: W - SAFE.left - SAFE.right, h: H - SAFE.top - SAFE.bottom };

/** Горизонтальний YouTube 16:9, кадр 1280×720 (рендер --scale=1.5 → 1920×1080):
    зверху назва/меню плеєра, знизу таймлайн і субтитри YouTube, по боках title-safe. */
export const SAFE_WIDE = { top: 64, bottom: 80, left: 96, right: 96 };
export type Layout = { W: number; H: number; SAFE: typeof SAFE; BOX: typeof BOX; wide: boolean };
/** Розміри кадру й сейф-зона ПОТОЧНОЇ композиції: вертикаль 9:16 або горизонталь 16:9. */
export const useLayout = (): Layout => {
  const { width, height } = useVideoConfig();
  const wide = width > height;
  const S = wide ? SAFE_WIDE : SAFE;
  return { W: width, H: height, SAFE: S, BOX: { x: S.left, y: S.top, w: width - S.left - S.right, h: height - S.top - S.bottom }, wide };
};

export const B = {
  paper: "#F3EEE5",   // кремовий папір — основне світле тло
  paper2: "#E9E1D4",  // тінь паперу, дуга
  ink: "#0D0D0D",     // основний текст
  red: "#E3202B",     // ФІРМОВИЙ червоний: ключове слово, коло, крапка
  blush: "#F7DAD6",   // слід червоного кола — рожеве тло
  gray: "#8C857C",    // службові слова
  night: "#0A0A0A",   // темні сцени
  white: "#FFFFFF",
  grid: "rgba(13,13,13,0.055)",
  gridNight: "rgba(255,255,255,0.045)",
};

export type Tone = "paper" | "night" | "blush" | "red";
export const isDark = (t: Tone) => t === "night" || t === "red";

export const FONT = {
  sans: '"Inter Tight", "Golos Text", system-ui, sans-serif',
  serif: '"Playfair Display", Georgia, serif',
};

/** Типографічна шкала (px на 720-кадрі). */
export const TYPE = {
  base: 74,        // звичайне слово
  key: 1.42,       // множник ключового (червоне, 900)
  small: 0.6,      // службові (сірі, 500)
  serif: 1.02,     // курсив-акцент
  tracking: -0.045, // em
};

/** Моторика. */
export const MOTION = {
  wordIn: 5,        // кадрів на появу слова (розмиття → різкість)
  wordStep: 5,      // крок між словами, якщо немає таймкодів голосу
  push: 0.075,      // наїзд камери за сцену (+7.5%)
  wipe: 8,          // кадрів на червоне коло / iris
};
