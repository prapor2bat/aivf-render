// Рендер анімованої каруселі Instagram: node scripts/carousel.mjs <id> [--check] [--static]
//   --check  : лише панорама-перевірка (out/carousel/<id>/pano.jpg + pano-start.jpg) — стики, текст, ритм кольорів
//   --static : лише PNG-слайди (без відео)
// Результат: out/carousel/<id>/slide-01.mp4 … (1080×1350, 6 с, H.264, без звуку) + slide-01.png … + pano.jpg + cover-grid.jpg (кроп 3:4 для сітки профілю)
// Один бандл на все; тимчасові файли — у studio/.rtmp (не забивати системний диск).
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync, rmSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const [, , id, ...flags] = process.argv;
if (!id) { console.error("usage: node scripts/carousel.mjs <id> [--check] [--static]"); process.exit(1); }
const check = flags.includes("--check"), stat = flags.includes("--static");
const STILL = 165;
const out = path.resolve("out/carousel", id); mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), outDir: path.resolve(".rtmp", `bundle-car-${Date.now()}`) });
try {
  // 1) панорама: кадр «усе увійшло» + кадр 0 (що видно в момент свайпу — стики мають збігатися)
  const pano = await selectComposition({ serveUrl, id: `CarPano-${id}` });
  await renderStill({ serveUrl, composition: pano, frame: STILL, output: path.join(out, "pano.png"), scale: 0.4 });
  await renderStill({ serveUrl, composition: pano, frame: 0, output: path.join(out, "pano-start.png"), scale: 0.4 });
  for (const f of ["pano", "pano-start"]) execFileSync("ffmpeg", ["-v", "error", "-y", "-i", path.join(out, f + ".png"), "-q:v", "3", path.join(out, f + ".jpg")]);
  rmSync(path.join(out, "pano.png")); rmSync(path.join(out, "pano-start.png"));
  console.log("✓ панорама:", path.join(out, "pano.jpg"));
  if (check) process.exit(0);
  // 2) слайди
  const n = pano.width / 1080;
  for (let i = 1; i <= n; i++) {
    const nn = String(i).padStart(2, "0");
    const comp = await selectComposition({ serveUrl, id: `Car-${id}-${nn}` });
    await renderStill({ serveUrl, composition: comp, frame: STILL, output: path.join(out, `slide-${nn}.png`) });
    if (!stat) await renderMedia({ serveUrl, composition: comp, codec: "h264", crf: 17, muted: true, jpegQuality: 95, outputLocation: path.join(out, `slide-${nn}.mp4`), concurrency: 6 });
    console.log(`✓ слайд ${nn}/${n}`);
  }
  // 3) обкладинка в сітці профілю (3:4 з центру 4:5) — чи не ріже заголовок
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", path.join(out, "slide-01.png"), "-vf", "crop=1012:1350:34:0,scale=506:-1", path.join(out, "cover-grid.jpg")]);
  console.log("✓ готово:", out, readdirSync(out).length, "файлів");
} finally { rmSync(serveUrl, { recursive: true, force: true }); }
