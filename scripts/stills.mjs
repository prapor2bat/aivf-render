// Швидкі контрольні кадри: node scripts/stills.mjs <CompId> <outDir> <кадр...>   (один бандл на всі кадри, scale 0.5)
// Тимчасовий бандл — у studio/.rtmp (НЕ в системному TEMP: кожен бандл копіює весь public/ і забиває диск C:), видаляється після рендеру.
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync, rmSync } from "node:fs";
import path from "node:path";
const [, , comp, outDir, ...frames] = process.argv;
if (!comp || !outDir || !frames.length) { console.error("node scripts/stills.mjs <CompId> <outDir> <кадр...>"); process.exit(1); }
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), outDir: path.resolve(".rtmp", `bundle-${Date.now()}`) });
try {
  const composition = await selectComposition({ serveUrl, id: comp });
  mkdirSync(outDir, { recursive: true });
  for (const fr of frames) await renderStill({ serveUrl, composition, frame: +fr, output: path.join(outDir, `f${String(fr).padStart(6, "0")}.png`), scale: 0.5 });
  console.log("готово:", frames.length, "кадрів →", outDir);
} finally { rmSync(serveUrl, { recursive: true, force: true }); }
