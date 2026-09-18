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
 *   node scripts/build-og-image.mjs
 *
 * 1200x630 is the size every platform crops from.
 */
import sharp from "sharp";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import matter from "gray-matter";

const W = 1200;
const H = 630;

// Taken from src/styles/brand.css. `tests/og-image.test.ts` holds them to it.
const INK = "#17231d";
const GROUND = "#f5f7f3";
const MUTED = "#636f68";
const FROM = "#257a59";
const TO = "#0d4b34";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${FROM}"/>
      <stop offset="1" stop-color="${TO}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.18" cy="0" r="0.9">
      <stop offset="0" stop-color="#cfe9d9" stop-opacity="0.75"/>
      <stop offset="1" stop-color="${GROUND}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${GROUND}"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <g transform="translate(84 92)">
    <rect width="72" height="72" rx="22" fill="url(#mark)"/>
    <g transform="translate(16 16) scale(1.667)" fill="none" stroke="#ffffff"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
      <path d="M12 18V6"/>
    </g>
    <text x="96" y="50" font-family="Inter, ui-sans-serif, system-ui, sans-serif"
          font-size="38" font-weight="600" fill="${INK}">Simple Balance</text>
  </g>

  <text x="84" y="316" font-family="Inter, ui-sans-serif, system-ui, sans-serif"
        font-size="66" font-weight="600" fill="${INK}" letter-spacing="-1.5">Know where your money is,</text>
  <text x="84" y="396" font-family="Inter, ui-sans-serif, system-ui, sans-serif"
        font-size="66" font-weight="600" fill="${INK}" letter-spacing="-1.5">and where it went.</text>

  <text x="84" y="472" font-family="Inter, ui-sans-serif, system-ui, sans-serif"
        font-size="30" fill="${MUTED}">Self-hosted double-entry bookkeeping</text>

  <rect x="84" y="528" width="1032" height="1" fill="#dde4df"/>
  <text x="84" y="574" font-family="Inter, ui-sans-serif, system-ui, sans-serif"
        font-size="26" fill="${MUTED}">smpl.money</text>
  <text x="1116" y="574" text-anchor="end" font-family="Inter, ui-sans-serif, system-ui, sans-serif"
        font-size="26" fill="${MUTED}">AGPL-3.0</text>
</svg>`;

const png = await sharp(Buffer.from(svg)).png().toBuffer();
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

function coverSvg(title, kicker) {
  // A longer title gets smaller type rather than more lines, so a cover
  // never runs past its own edge.
  const lines = wrap(title, title.length > 48 ? 26 : 22);
  const size = lines.length > 3 ? 62 : lines.length > 2 ? 72 : 82;
  const top = CH / 2 - ((lines.length - 1) * (size + 14)) / 2 + 10;
  const body = lines
    .map(
      (line, index) =>
        `<text x="96" y="${top + index * (size + 14)}" font-family="Inter, ui-sans-serif, system-ui, sans-serif" font-size="${size}" font-weight="600" letter-spacing="-1.5" fill="${INK}">${escapeXml(line)}</text>`,
    )
    .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="${CH}" viewBox="0 0 ${CW} ${CH}">
  <defs>
    <linearGradient id="edge" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${FROM}"/><stop offset="1" stop-color="${TO}"/>
    </linearGradient>
    <radialGradient id="wash" cx="0.85" cy="0.1" r="0.9">
      <stop offset="0" stop-color="#cfe9d9" stop-opacity="0.8"/>
      <stop offset="1" stop-color="${GROUND}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${CW}" height="${CH}" fill="${GROUND}"/>
  <rect width="${CW}" height="${CH}" fill="url(#wash)"/>
  <rect x="0" y="0" width="12" height="${CH}" fill="url(#edge)"/>
  <text x="96" y="124" font-family="Inter, ui-sans-serif, system-ui, sans-serif"
        font-size="25" font-weight="600" letter-spacing="3" fill="${FROM}">${escapeXml(kicker.toUpperCase())}</text>
  ${body}
  <text x="96" y="${CH - 72}" font-family="Inter, ui-sans-serif, system-ui, sans-serif"
        font-size="25" fill="${MUTED}">Simple Balance · smpl.money</text>
</svg>`;
}

mkdirSync("public/covers", { recursive: true });
let covers = 0;
for (const file of readdirSync("content/blog")) {
  if (!/\.mdx?$/.test(file)) continue;
  const { data } = matter(readFileSync(`content/blog/${file}`, "utf8"));
  const slug = String(data.slug ?? file.replace(/\.mdx?$/, ""));
  const kicker = data.series ? String(data.series) : String(data.tags?.[0] ?? "Notes");
  const image = await sharp(Buffer.from(coverSvg(String(data.title), kicker)))
    .webp({ quality: 88 })
    .toBuffer();
  writeFileSync(`public/covers/${slug}.webp`, image);
  covers += 1;
  console.log(`wrote public/covers/${slug}.webp (${Math.round(image.length / 1024)} KB)`);
}
console.log(`${covers} cover${covers === 1 ? "" : "s"}.`);
