/**
 * Every internal link in the built site resolves to something that exists.
 *
 * Run against `out/`, not against the source, because the question is whether
 * a reader clicking a link gets a page — and the mapping from a route to a
 * file is the export's business, not the source's.
 *
 * **Internal only.** An external link checker fails when somebody else's site
 * is down, which trains people to ignore a red build. External rot is real and
 * is a periodic job, not a merge gate.
 */
import { readFileSync } from "node:fs";
import { globSync } from "node:fs";

const files = new Set();
const pages = new Set(["/"]);

for (const file of globSync("out/**/*", { withFileTypes: true })) {
  if (!file.isFile()) continue;
  const rel = "/" + [file.parentPath ?? file.path, file.name].join("/").replace(/^out\/?/, "");
  files.add(rel.replace(/\/{2,}/g, "/"));
}
for (const path of files) {
  if (path.endsWith("/index.html")) pages.add(path.slice(0, -"index.html".length));
}

const broken = [];
for (const path of files) {
  if (!path.endsWith(".html")) continue;
  const source = path.replace(/index\.html$/, "");
  const html = readFileSync("out" + path, "utf8");
  for (const [, href] of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    if (href.startsWith("/_next")) continue;
    if (pages.has(href) || files.has(href)) continue;
    broken.push(`${source} -> ${href}`);
  }
}

if (broken.length > 0) {
  console.error("Broken internal links:");
  for (const line of [...new Set(broken)].sort()) console.error("  " + line);
  process.exit(1);
}
console.log(`Checked ${pages.size} pages. No broken internal links.`);
