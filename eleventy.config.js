export default function (eleventyConfig) {
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
