// Runs before every build (npm "prebuild"). For each photo in src/images that
// doesn't have WebP versions yet, creates name-480w.webp, name-960w.webp and a
// full-size WebP next to the original, and records its size in
// src/_data/images.json. Originals are never modified.
// If anything goes wrong it only warns: the site still builds, and images
// without WebP versions are served as their original files.
import { readdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const IMAGES = path.join(ROOT, "src/images");
const MANIFEST = path.join(ROOT, "src/_data/images.json");
const WIDTHS = [480, 960];
const SPECIAL = { "/images/logo.png": [184, 276] }; // logo is shown at 92px / 70px

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(jpe?g|png)$/i.test(e.name)) out.push(p);
  }
  return out;
}
const exists = (p) => access(p).then(() => true, () => false);

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.warn("[images] sharp not available; skipping WebP generation");
    return;
  }
  const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
  let added = 0;
  for (const file of await walk(IMAGES)) {
    const url = "/" + path.relative(path.join(ROOT, "src"), file).split(path.sep).join("/");
    const base = file.replace(/\.(jpe?g|png)$/i, "");
    const known = manifest[url];
    if (known && (await Promise.all(known.webp.map((w) => exists(`${base}-${w}w.webp`)))).every(Boolean)) continue;
    try {
      const img = sharp(file).rotate();
      const { width, height, hasAlpha } = await img.metadata().then(async (m) => {
        const o = m.orientation >= 5; // EXIF rotation swaps width/height
        return { width: o ? m.height : m.width, height: o ? m.width : m.height, hasAlpha: m.hasAlpha };
      });
      const targets = SPECIAL[url] || [...WIDTHS.filter((w) => w < width), width];
      for (const w of targets) {
        const opts = hasAlpha ? { lossless: true } : { quality: 88 };
        await sharp(file).rotate().resize({ width: w }).webp(opts).toFile(`${base}-${w}w.webp`);
      }
      manifest[url] = { width, height, webp: targets };
      added++;
      console.log(`[images] ${url}: ${targets.join(", ")}w`);
    } catch (err) {
      console.warn(`[images] skipped ${url}: ${err.message}`);
    }
  }
  if (added) {
    const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
    await writeFile(MANIFEST, JSON.stringify(sorted, null, 1));
  }
  console.log(`[images] ${added ? `${added} new image(s) prepared` : "all images already have WebP versions"}`);
}

main().catch((err) => console.warn("[images] failed, continuing build:", err.message));
