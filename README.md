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

New images work as they are: put the file in `src/images/` and use it. For faster loading, add WebP versions (480px and 960px wide, plus the original width) next to the original as `name-480w.webp`, and so on, and list the image in `src/_data/images.json`. Images listed there get width/height and responsive sizes automatically.

## Blog posts

Each post in `src/blog/` has front matter with `title`, `date`, `image`, `imageAlt` (a short Hebrew description of the image for screen readers) and `description`.
