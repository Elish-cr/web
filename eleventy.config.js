import { readFileSync } from "node:fs";

// Responsive WebP variants live next to each original (e.g. cover-480w.webp).
// Originals stay untouched at full resolution as the <img> fallback.
const imageManifest = JSON.parse(readFileSync(new URL("./src/_data/images.json", import.meta.url)));
const escAttr = (s = "") => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

export default function (eleventyConfig) {
  // {% picture "/images/x.jpg", "alt text", "(max-width: 760px) 100vw, 480px", 'class="c" loading="lazy"' %}
  eleventyConfig.addShortcode("picture", (src, alt = "", sizes = "100vw", attrs = "") => {
    const meta = imageManifest[src];
    const hasDims = /\bwidth=/.test(attrs);
    const dims = meta && !hasDims ? ` width="${meta.width}" height="${meta.height}"` : "";
    const img = `<img decoding="async"${dims} src="${src}" alt="${escAttr(alt)}"${attrs ? " " + attrs : ""}>`;
    if (!meta) return img;
    const base = src.replace(/\.(jpe?g|png)$/i, "");
    const srcset = meta.webp.map((w) => `${base}-${w}w.webp ${w}w`).join(", ");
    return `<picture><source type="image/webp" srcset="${srcset}" sizes="${sizes}">${img}</picture>`;
  });

  eleventyConfig.addPassthroughCopy({
    "src/images": "images",
    "src/css": "css",
    "src/favicon.png": "favicon.png",
    "src/_redirects": "_redirects",
    "src/robots.txt": "robots.txt",
  });

  eleventyConfig.addCollection("posts", (api) =>
    api.getFilteredByGlob("src/blog/*.md").sort((a, b) => b.date - a.date)
  );
  eleventyConfig.addCollection("treatments", (api) =>
    api.getFilteredByGlob("src/treatments/*.md").sort((a, b) => a.data.order - b.data.order)
  );

  eleventyConfig.addFilter("heDate", (d) =>
    new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric" }).format(d)
  );
  eleventyConfig.addFilter("head", (arr, n) => arr.slice(0, n));
  eleventyConfig.addFilter("isoDate", (d) => d.toISOString().slice(0, 10));
  eleventyConfig.addFilter("excerpt", (s = "", n = 140) => {
    const t = s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return t.length > n ? t.slice(0, n).replace(/\s\S*$/, "") + "…" : t;
  });

  return {
    dir: { input: "src", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
