import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), outDir: path.resolve(".rtmp", `bundle-${Date.now()}`) });
const composition = await selectComposition({ serveUrl, id: "Electric" });
await renderStill({
  serveUrl,
  composition,
  frame: 4,
  output: path.resolve("out", "electric-cover.png"),
  scale: 1.5,
});
console.log("готово: out/electric-cover.png");
