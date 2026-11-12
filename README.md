# Trail of Silk - ד״ר אלי שזיפי

The trailofsilk.net website, rebuilt from the Wix version as a static site with [Eleventy](https://www.11ty.dev/) and hosted on Netlify.

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
- `src/_redirects`: sends the old Wix addresses to the new ones

## Deploy

Netlify builds with `npm run build` and publishes `_site` (set in `netlify.toml`).
