# Trail of Silk - ד״ר אלי שזיפי

The trailofsilk.net website, rebuilt from the Wix version as a static site with [Eleventy](https://www.11ty.dev/) and hosted on Render as a Static Site.

## Run locally

```bash
npm install
npm start
```

Then open http://localhost:8080.

## Where things are

- `src/_data/site.json`: phone, address, booking links, social links
- `src/_data/testimonials.json`: patient reviews
- `src/blog/`: blog posts, one Markdown file each
- `src/treatments/`: treatment pages; photos are in `src/images/<treatment>/`
- `src/css/style.css`: all styling
- `src/_data/legacyRedirects.json` + `src/legacy-redirects.njk`: forwarding pages for the old Hebrew Wix addresses (Render's redirect rules can't match Hebrew paths)
- `src/_redirects`: the full list of old Wix addresses (kept for reference; Render doesn't read this file)
- `src/_data/images.json`: sizes of each image and its WebP versions, used by the `{% picture %}` shortcode

## Deploy

Render (Static Site `trailofsilk-static`) rebuilds automatically on every push to `main`: build command `npm ci && npm run build`, publish directory `_site`. The live site updates 1–2 minutes after a push.

Settings that live in the Render dashboard, not in this repo:

- Custom domains: `trailofsilk.net` (primary) and `www.trailofsilk.net` (redirects to it)
- Redirects/Rewrites: 301 rules for the old English Wix addresses (`/home`, `/portfolio`, `/portfolio-collections/my-portfolio`, `/portfolio-collections/my-portfolio/lips`, `/blog-feed.xml`)
- Headers: `Cache-Control: public, max-age=2592000` on `/images/*`

`netlify.toml` is left over from an earlier Netlify setup and is not used by Render.

## Adding images

Put the photo in `src/images/` and use it. Every build (`npm run build`, including Render's) first runs `scripts/images.mjs`, which creates WebP versions (480px, 960px and full width) next to any new photo and records its size in `src/_data/images.json`. Images used through the `{% picture %}` shortcode then get width/height and responsive sizes automatically. To prepare them locally without building, run `npm run images`. Originals are never changed.

## Blog posts

Each post in `src/blog/` has front matter with `title`, `date`, `image`, `imageAlt` (a short Hebrew description of the image for screen readers) and `description`.
