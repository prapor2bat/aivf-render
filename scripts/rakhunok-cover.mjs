import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), outDir: path.resolve(".rtmp", `bundle-${Date.now()}`) });
const composition = await selectComposition({ serveUrl, id: "Rakhunok" });
await renderStill({
  serveUrl,
  composition,
  frame: 5,
  output: path.resolve("out", "rakhunok-cover.png"),
  scale: 1.5,
});
console.log("готово: out/rakhunok-cover.png");
