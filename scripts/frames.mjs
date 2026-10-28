/**
 * Capture the built site's drawings and motion as still frames, to look at.
 *
 *   npm run build
 *   npm run frames -- --path /learn/net-worth/ [--path /] [options]
 *
 *   --out DIR          where the PNGs go (default .frames/, which git ignores)
 *   --widths 1280,390  viewport widths
 *   --schemes light,dark
 *   --selector CSS     capture one element rather than the viewport
 *   --full             the whole page, when there's no selector
 *   --frames 0,800,…   motion on, every time-based animation paused at each
 *                      time in milliseconds (a loop's timeline comment in
 *                      `site.css` says which times are worth looking at)
 *   --scroll N         motion on, the --selector element scrolled from just
 *                      below the fold to near the top in N steps, for a
 *                      drawing built by scroll
 *   --report           print each running animation's delay, duration and
 *                      end, and any scroll-built part under way before its
 *                      drawing arrives or unfinished once its bottom edge is
 *                      on screen
 *   --sheet            also tile each path's captures into one contact sheet
 *   --touch            emulate a phone's touch screen as well as its width:
 *                      no hover, so the site's touch rules apply (a card plays
 *                      once its picture is in view, the closing rings turn
 *                      with the scroll), which a narrow desktop window doesn't
 *                      show
 *
 * With neither --frames nor --scroll it captures the finished picture, under
 * `reducedMotion: "reduce"`, which is what a stopped loop and a reader who
 * asked for less motion both see (`web.md` 8.7).
 *
 * A review tool, not a gate: headless timing isn't a fact about the
 * artifact, so nothing in `npm run verify` runs it. It was rewritten from
 * scratch at least five times on one branch before it lived here.
 */
import { createServer } from "node:http";
import { createReadStream, existsSync, mkdirSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const at = args.indexOf(`--${name}`);
  return at === -1 ? fallback : args[at + 1];
};
const all = (name) => args.flatMap((arg, at) => (arg === `--${name}` ? [args[at + 1]] : []));

const paths = all("path");
if (paths.length === 0) throw new Error("name at least one --path, such as --path /");
const outDir = resolve(option("out", ".frames"));
const widths = option("widths", "1280,390").split(",").map(Number);
const schemes = option("schemes", "light,dark").split(",");
const selector = option("selector", null);
const full = args.includes("--full");
const frames = option("frames", null)?.split(",").map(Number);
const scrollSteps = Number(option("scroll", 0));
if (scrollSteps && !selector) throw new Error("--scroll steps a --selector element into view");
const report = args.includes("--report");
const sheet = args.includes("--sheet");
const touch = args.includes("--touch");
mkdirSync(outDir, { recursive: true });

const site = resolve("out");
if (!existsSync(site)) throw new Error("no out/ to serve: run npm run build first");
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".txt": "text/plain",
};
const server = createServer((request, response) => {
  let file = join(site, decodeURIComponent(new URL(request.url, "http://x").pathname));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) {
    response.writeHead(404);
    response.end();
    return;
  }
  response.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
  createReadStream(file).pipe(response);
});
await new Promise((ready) => server.listen(0, ready));
const origin = `http://localhost:${server.address().port}`;

/** Load every lazy image, or a full-page capture shows empty frames below the fold. */
async function settleImages(page) {
  await page.evaluate(async () => {
    const images = [...document.querySelectorAll("img")];
    for (const image of images) image.loading = "eager";
    await Promise.all(
      images.map((image) =>
        image.complete
          ? null
          : new Promise((done) => {
              image.addEventListener("load", done, { once: true });
              image.addEventListener("error", done, { once: true });
              setTimeout(done, 5000);
            }),
      ),
    );
  });
}

/** Each time-based animation's schedule, and how long the longest play-once takes. */
async function printReport(page, label) {
  const rows = await page.evaluate(() =>
    document.getAnimations().map((animation) => {
      const timing = animation.effect.getComputedTiming();
      const target = animation.effect.target;
      return {
        name: animation.animationName ?? "",
        on: target ? `${target.tagName.toLowerCase()}.${[...target.classList].join(".")}` : "",
        scroll: animation.timeline !== document.timeline,
        // A scroll-driven animation's timing is a range of the scroll, not
        // milliseconds, so it has no delay or end worth printing.
        delay: Math.round(Number(timing.delay)),
        duration: Math.round(Number(timing.duration)),
        iterations: timing.iterations,
        end: timing.iterations === Infinity ? Infinity : Math.round(Number(timing.endTime)),
      };
    }),
  );
  const once = rows.filter((row) => !row.scroll && row.iterations !== Infinity);
  const longest = Math.max(0, ...once.map((row) => row.end));
  console.log(`\n${label}: ${rows.length} animations, the longest play-once ends at ${longest}ms`);
  for (const row of rows) {
    const clock = row.scroll ? "scroll" : row.iterations === Infinity ? "loop" : "once";
    const when = row.scroll
      ? "paced by scroll"
      : `delay ${row.delay}ms, ${row.duration}ms a play, ends ${row.end === Infinity ? "never" : `${row.end}ms`}`;
    console.log(`  ${clock.padEnd(6)} ${row.name.padEnd(16)} ${when}  ${row.on}`);
  }
}

/**
 * Every box that names a view timeline, found by its computed style rather
 * than a list, so a timeline only a touch screen names counts too, and the
 * scroll-built parts under each that are wrong at either end: under way
 * before its top edge arrives, which is a timeline the page's scroll isn't
 * moving, or unfinished once its bottom edge is on screen. The first is how
 * the closing picture sat finished on every screen: it was named inside a
 * panel that hid its overflow, which makes a scroller, and the second line
 * passed it, because a timeline that never moves is never late. Only a part
 * whose range ends in `entry` owes the second; the closing rings turn across
 * `cover`, the whole passage, and are meant to be part-way there.
 */
async function scrollBuiltAtEntry(page) {
  return page.evaluate(async () => {
    const early = [];
    const late = [];
    const settle = () =>
      new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
    const scrolled = (box) =>
      box
        .getAnimations({ subtree: true })
        .filter((animation) => animation.timeline !== document.timeline)
        .map((animation) => ({
          progress: animation.effect.getComputedTiming().progress ?? 0,
          byEntry: animation.rangeEnd?.rangeName === "entry",
        }));
    // How far a transform has carried the box from its layout box, which is
    // what a view timeline measures. A learn card's picture rides the card's
    // rise, up to 32px below where its timeline puts it, and placed by where
    // it showed, its timeline, which the scroll does move, read as frozen.
    const carried = (box) => {
      let y = 0;
      for (let at = box; at; at = at.parentElement) {
        const { transform } = getComputedStyle(at);
        if (transform !== "none") y += new DOMMatrixReadOnly(transform).m42;
      }
      return y;
    };
    const owners = [...document.querySelectorAll("*")].filter(
      (box) => getComputedStyle(box).viewTimelineName !== "none",
    );
    for (const box of owners) {
      const name =
        (box.className.baseVal ?? box.className) ||
        `${box.parentElement.className} > ${box.tagName.toLowerCase()}`;
      const top = () => box.getBoundingClientRect().top - carried(box);
      window.scrollTo(0, window.scrollY + top() - window.innerHeight - 2);
      await settle();
      // A box near the top of the page can't be scrolled below the fold.
      const below = top() >= window.innerHeight;
      if (below && scrolled(box).some((part) => part.progress > 0.001)) early.push(name);
      window.scrollTo(
        0,
        window.scrollY + box.getBoundingClientRect().bottom - window.innerHeight + 2,
      );
      await settle();
      if (scrolled(box).some((part) => part.byEntry && part.progress < 0.999)) late.push(name);
    }
    return { early: [...new Set(early)], late: [...new Set(late)] };
  });
}

const browser = await chromium.launch();
const written = new Map();
for (const path of paths) {
  const slug = path.replace(/^\/|\/$/g, "").replaceAll("/", "_") || "home";
  written.set(slug, []);
  for (const width of widths) {
    for (const scheme of schemes) {
      const moving = Boolean(frames || scrollSteps || report);
      const context = await browser.newContext({
        viewport: { width, height: width > 600 ? 900 : 844 },
        deviceScaleFactor: 1,
        colorScheme: scheme,
        reducedMotion: moving ? "no-preference" : "reduce",
        // `(hover: none)` follows touch emulation, not the width.
        ...(touch ? { isMobile: true, hasTouch: true } : {}),
      });
      const page = await context.newPage();
      // The site loads nothing from anywhere else; a request out is a fault
      // to see in the picture rather than a page that waits on the network.
      await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort());
      await page.goto(`${origin}${path}`, { waitUntil: "load" });
      await settleImages(page);
      const name = `${slug}-${width}-${scheme}${touch ? "-touch" : ""}`;
      const target = selector ? page.locator(selector).first() : page;
      const shot = async (suffix) => {
        const file = join(outDir, `${name}${suffix}.png`);
        await target.screenshot({ path: file, ...(selector ? {} : { fullPage: full }) });
        written.get(slug).push(file);
      };

      if (report) {
        await printReport(page, name);
        const { early, late } = await scrollBuiltAtEntry(page);
        if (early.length) console.log(`  under way before it arrives: ${early.join(", ")}`);
        console.log(
          late.length
            ? `  unfinished at entry: ${late.join(", ")}`
            : "  every scroll-built drawing finishes at entry",
        );
      }
      if (scrollSteps && selector) {
        const box = await page.evaluate((css) => {
          const rect = document.querySelector(css).getBoundingClientRect();
          return { top: rect.top + window.scrollY, viewport: window.innerHeight };
        }, selector);
        const start = box.top - box.viewport + 40;
        const end = box.top - 80;
        for (let step = 0; step <= scrollSteps; step += 1) {
          const y = start + ((end - start) * step) / scrollSteps;
          // Gradually, as a reader scrolls, so a scroll timeline passes
          // through every position rather than jumping to the last.
          await page.evaluate(async (to) => {
            const from = window.scrollY;
            for (let tick = 1; tick <= 6; tick += 1) {
              window.scrollTo(0, from + ((to - from) * tick) / 6);
              await new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
            }
          }, y);
          const file = join(outDir, `${name}-s${String(step).padStart(2, "0")}.png`);
          await page.screenshot({ path: file });
          written.get(slug).push(file);
        }
      } else if (frames) {
        for (const time of frames) {
          await page.evaluate((ms) => {
            for (const animation of document.getAnimations()) {
              // A scroll-driven animation's clock is a position, not a time.
              if (animation.timeline !== document.timeline) continue;
              animation.pause();
              animation.currentTime = ms;
            }
          }, time);
          await shot(`-t${time}`);
        }
      } else if (!report) {
        await shot("");
      }
      await context.close();
    }
  }
}
await browser.close();
server.close();

if (sheet) {
  for (const [slug, files] of written) {
    if (files.length === 0) continue;
    const images = await Promise.all(files.map((file) => sharp(file).metadata()));
    const columns = Math.min(4, files.length);
    const cell = {
      width: Math.max(...images.map((image) => image.width)),
      height: Math.max(...images.map((image) => image.height)),
    };
    const rows = Math.ceil(files.length / columns);
    const file = join(outDir, `${slug}-sheet.png`);
    await sharp({
      create: {
        width: cell.width * columns,
        height: cell.height * rows,
        channels: 3,
        background: "#ffffff",
      },
    })
      .composite(
        files.map((input, at) => ({
          input,
          left: (at % columns) * cell.width,
          top: Math.floor(at / columns) * cell.height,
        })),
      )
      .png()
      .toFile(file);
    console.log(`sheet: ${file}`);
  }
}
for (const files of written.values()) for (const file of files) console.log(file);
