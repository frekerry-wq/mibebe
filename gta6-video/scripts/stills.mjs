// Renderiza fotogramas sueltos para revisión: node scripts/stills.mjs <outdir> <frame,frame,...> [scale]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [outDir, framesArg, scaleArg] = process.argv.slice(2);
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const comp = await selectComposition({ serveUrl, id: "GTA6", inputProps: { captions: true, audio: false }, browserExecutable });
for (const f of framesArg.split(",").map(Number)) {
  await renderStill({ composition: comp, serveUrl, frame: f, output: path.join(outDir, `f${String(f).padStart(5, "0")}.jpg`), imageFormat: "jpeg", jpegQuality: 80, scale: Number(scaleArg ?? 0.5), inputProps: { captions: true, audio: false }, browserExecutable });
  process.stdout.write(`${f} `);
}
console.log("done");
