/**
 * Render the site's generated images: the social card, and a cover per post.
 *
 * A link to this site pasted into Slack, Bluesky, LinkedIn or a message shows
 * whatever `og:image` points at. With none, it shows a blank card — which for
 * a marketing page is the one place a picture is guaranteed to be seen.
 *
 * Drawn as SVG and rasterised with sharp, at build time, committed as a file.
 * The alternative is Next's `ImageResponse`, which renders per request and so
 * is a server — the thing `output: "export"` exists to avoid. A static card is
 * also the right shape here: it says what the product is, and it does not
 * change per page.
 *
 *   npm run build:images
 *
 * 1200x630 is the size every platform crops from.
 */
import sharp from "sharp";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import matter from "gray-matter";

const W = 1200;
const H = 630;

/**
 * The palette, read out of the contract rather than copied from it.
 *
 * These were six literals under a comment claiming they were "taken from
 * `src/styles/brand.css`" and held to it by a test. The test did not exist,
 * and one of the six — the wash — was never a token at all: `#cfe9d9` is
 * `--ambient`, which the stylesheet writes as `rgb(207 233 217 / 45%)`, so
 * the two could not be compared by eye and nobody had.
 *
 * Reading the file removes the question. A token that changes in `brand.css`
 * changes here on the next build, and a token that is renamed fails loudly
 * below instead of silently painting last year's green.
 */
function palette(block) {
  const read = (token) => {
    const match = block.match(new RegExp(`--${token}:\\s*([^;]+);`));
    if (!match) throw new Error(`brand.css has no --${token} in this block`);
    const value = match[1].trim();
    // `rgb(207 233 217 / 45%)` is a colour with an alpha the SVG sets itself.
    const rgb = value.match(/^rgb\(\s*(\d+)\s+(\d+)\s+(\d+)/);
    return rgb ? `rgb(${rgb[1]}, ${rgb[2]}, ${rgb[3]})` : value;
  };
  return {
    ink: read("ink"),
    ground: read("ground"),
    muted: read("muted"),
    from: read("brand-from"),
    to: read("brand-to"),
    wash: read("ambient"),
    onAccent: read("on-accent"),
    line: read("line"),
  };
}

const brand = readFileSync("src/styles/brand.css", "utf8");
const darkAt = brand.indexOf("@media (prefers-color-scheme: dark)");
if (darkAt < 0) throw new Error("brand.css has no dark block");
const THEMES = {
  light: palette(brand.slice(0, darkAt)),
  dark: palette(brand.slice(darkAt)),
};

// The social card is rendered by platforms that have no theme to respect, so
// it is the light palette and only the light palette.
const {
  ink: INK,
  ground: GROUND,
  muted: MUTED,
  from: FROM,
  to: TO,
  wash: WASH,
  onAccent: ON_ACCENT,
  line: LINE,
} = THEMES.light;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${FROM}"/>
      <stop offset="1" stop-color="${TO}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.18" cy="0" r="0.9">
      <stop offset="0" stop-color="${WASH}" stop-opacity="0.75"/>
      <stop offset="1" stop-color="${GROUND}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${GROUND}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <g transform="translate(84 92)">
    <rect width="72" height="72" rx="22" fill="url(#mark)"/>
    <g transform="translate(16 16) scale(1.667)" fill="none" stroke="${ON_ACCENT}"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
      <path d="M12 18V6"/>
    </g>
    <text x="96" y="50" font-family="Inter, ui-sans-serif, system-ui, sans-serif"
          font-size="38" font-weight="600" fill="${INK}">Simple Balance</text>
  </g>

  <text x="84" y="316" font-family="Inter, ui-sans-serif, system-ui, sans-serif"
        font-size="66" font-weight="600" fill="${INK}" letter-spacing="-1.5">All your accounts,</text>
  <text x="84" y="396" font-family="Inter, ui-sans-serif, system-ui, sans-serif"
        font-size="66" font-weight="600" fill="${INK}" letter-spacing="-1.5">on one page.</text>

  <text x="84" y="472" font-family="Inter, ui-sans-serif, system-ui, sans-serif"
        font-size="30" fill="${MUTED}">We never ask for your bank password</text>

  <rect x="84" y="528" width="1032" height="1" fill="${LINE}"/>
  <text x="84" y="574" font-family="Inter, ui-sans-serif, system-ui, sans-serif"
        font-size="26" fill="${MUTED}">smpl.money</text>
  <text x="1116" y="574" text-anchor="end" font-family="Inter, ui-sans-serif, system-ui, sans-serif"
        font-size="26" fill="${MUTED}">Free, or $20 a year</text>
</svg>`;

/*
 * A palette PNG, not a truecolour one: 126 KB to 57 KB for a card that is
 * flat colour, one gradient wash and text. The wash is the only thing 256
 * colours could band and it does not — it was looked at rather than assumed.
 *
 * It stays a PNG rather than becoming WebP because the only things that fetch
 * it are link-preview scrapers, and their format support is not something
 * this repository can test.
 */
const png = await sharp(Buffer.from(svg))
  .png({ palette: true, quality: 90, compressionLevel: 9, effort: 10 })
  .toBuffer();
writeFileSync("public/og.png", png);
const meta = await sharp(png).metadata();
console.log(
  `wrote public/og.png (${Math.round(png.length / 1024)} KB, ${meta.width}x${meta.height})`,
);

/* ------------------------------------------------------------------ *
 * A cover per post.
 *
 * Generated rather than sourced. The alternative for a technical blog is
 * stock photography of somebody pointing at a laptop, which says nothing,
 * costs a licence and dates. A typographic cover in the product's own palette
 * says what the post is called and gets out of the way.
 * ------------------------------------------------------------------ */

const CW = 1600;
const CH = 800;

/** Break a title into lines that fit, measured roughly by character count. */
function wrap(title, perLine) {
  const lines = [];
  let line = "";
  for (const word of title.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > perLine && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function coverSvg(title, kicker, theme) {
  // A longer title gets smaller type rather than more lines, so a cover
  // never runs past its own edge.
  const lines = wrap(title, title.length > 48 ? 26 : 22);
  const size = lines.length > 3 ? 62 : lines.length > 2 ? 72 : 82;
  const top = CH / 2 - ((lines.length - 1) * (size + 14)) / 2 + 10;
  const body = lines
    .map(
      (line, index) =>
        `<text x="96" y="${top + index * (size + 14)}" font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-size="${size}" font-weight="600" letter-spacing="-1.5" fill="${theme.ink}">${escapeXml(line)}</text>`,
    )
    .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="${CH}" viewBox="0 0 ${CW} ${CH}">
  <defs>
    <linearGradient id="edge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${theme.from}"/><stop offset="1" stop-color="${theme.to}"/>
    </linearGradient>
    <radialGradient id="wash" cx="0.85" cy="0.1" r="0.9">
      <stop offset="0" stop-color="${theme.wash}" stop-opacity="0.8"/>
      <stop offset="1" stop-color="${theme.ground}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${CW}" height="${CH}" fill="${theme.ground}"/>
  <rect width="${CW}" height="${CH}" fill="url(#wash)"/>
  <rect x="0" y="0" width="12" height="${CH}" fill="url(#edge)"/>
  <text x="96" y="124" font-family="Inter, ui-sans-serif, system-ui, sans-serif"
        font-size="25" font-weight="600" letter-spacing="3" fill="${theme.from}">${escapeXml(kicker.toUpperCase())}</text>
  ${body}
  <text x="96" y="${CH - 72}" font-family="Inter, ui-sans-serif, system-ui, sans-serif"
        font-size="25" fill="${theme.muted}">Simple Balance · smpl.money</text>
</svg>`;
}

/* ------------------------------------------------------------------
 * A narrow copy of every screenshot.
 *
 * The application publishes them at 1600px and that is the right size for
 * the widest place they render: a problem shot is 1024 CSS pixels on a
 * 1280px screen, which wants 2048 at 2x, so 1600 is already a compromise
 * *downwards* on a desktop.
 *
 * A phone is the opposite. The same picture renders at about 356 CSS pixels
 * there, and a 3x screen would be handed 1600px for a thumbnail — roughly
 * four and a half times what it can show, on the connection least able to
 * afford it. 1200 gives a phone about the same generosity a desktop already
 * gets, and `src/components/shot.tsx` lets the browser choose between them.
 *
 * The originals are never touched: these are written beside them, and
 * `sync-from-app` §4 regenerates them after a pull.
 * ------------------------------------------------------------------ */
const NARROW = 1200;
mkdirSync(`public/screenshots/${NARROW}`, { recursive: true });
let narrowed = 0;
let narrowBytes = 0;
for (const file of readdirSync("public/screenshots")) {
  if (!file.endsWith(".webp")) continue;
  const derived = await sharp(`public/screenshots/${file}`)
    .resize(NARROW)
    .webp({ quality: 82, effort: 6 })
    .toBuffer();
  writeFileSync(`public/screenshots/${NARROW}/${file}`, derived);
  narrowed += 1;
  narrowBytes += derived.length;
}
console.log(
  `wrote ${narrowed} screenshots at ${NARROW}px (${Math.round(narrowBytes / 1024)} KB total).`,
);

mkdirSync("public/covers", { recursive: true });
let covers = 0;
for (const file of readdirSync("content/blog")) {
  if (!/\.mdx?$/.test(file)) continue;
  const { data } = matter(readFileSync(`content/blog/${file}`, "utf8"));
  const slug = String(data.slug ?? file.replace(/\.mdx?$/, ""));
  const kicker = data.series ? String(data.series) : String(data.tags?.[0] ?? "Notes");
  /*
   * One cover per theme, like every screenshot on the site.
   *
   * There was one, in the light palette, and a post read in dark mode opened
   * with a bright white card across the top of a dark page — the exact defect
   * `web.md` 5.2 describes for screenshots, on the one image the site draws
   * itself. `src/components/cover.tsx` picks between them with the same
   * `prefers-color-scheme` source the screenshots use, so a reader in dark
   * mode never downloads the light file.
   */
  for (const [name, theme] of Object.entries(THEMES)) {
    const file = `public/covers/${slug}${name === "dark" ? "-dark" : ""}.webp`;
    const image = await sharp(Buffer.from(coverSvg(String(data.title), kicker, theme)))
      .webp({ quality: 88 })
      .toBuffer();
    writeFileSync(file, image);
    console.log(`wrote ${file} (${Math.round(image.length / 1024)} KB)`);
  }
  covers += 1;
}
console.log(`${covers} cover${covers === 1 ? "" : "s"}.`);
