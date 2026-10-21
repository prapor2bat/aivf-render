import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { rmSync } from "node:fs";

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), outDir: path.resolve(".rtmp", `bundle-${Date.now()}`) });
try {
  const composition = await selectComposition({ serveUrl, id: "Mista" });
  await renderStill({
    serveUrl,
    composition,
    frame: 5,
    output: path.resolve("out", "mista-cover.png"),
    scale: 1.5,
  });
  console.log("готово: out/mista-cover.png");
} finally { rmSync(serveUrl, { recursive: true, force: true }); }
