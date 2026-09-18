/**
 * Static export, deliberately.
 *
 * `output: "export"` emits plain HTML, CSS and JS into `out/` with no server
 * and no platform adapter. That is what keeps this repository portable: the
 * same build artefact is what Netlify publishes today and what an S3 bucket or
 * a Vercel project would publish instead, so choosing a host again later costs
 * a `netlify.toml` rather than a rewrite.
 *
 * The cost is that every server-only Next.js feature is unavailable — route
 * handlers, middleware, ISR, and the built-in image optimiser. A marketing
 * page needs none of them, and `docs/standards/code/index.md` records what to
 * do on the day one is actually wanted.
 *
 * `trailingSlash: true` makes every route a directory with its own
 * `index.html`. Any static host serves that shape without rewrite rules, which
 * matters more than it looks: a rewrite rule broad enough to serve
 * `/about` is usually broad enough to swallow `/ads.txt`, and that file is
 * what authorises the app's advertising inventory. See
 * `docs/standards/operations.md`.
 */
const nextConfig = {
  // Pinned so Turbopack does not walk up looking for a workspace root and pick
  // an unrelated directory above this one.
  turbopack: { root: import.meta.dirname },
  output: "export",
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    // The optimiser is a server. Without this, `next build` fails the moment
    // anything renders `next/image`.
    unoptimized: true,
  },
};

export default nextConfig;
