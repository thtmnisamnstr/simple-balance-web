/**
 * Render the social preview image.
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
import { writeFileSync } from "node:fs";

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
