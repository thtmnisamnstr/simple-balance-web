/**
 * Which comparison pages are due to be checked again.
 *
 * Run weekly by `.github/workflows/compare-check.yml`, never by `verify`: a
 * build that fails because a calendar moved fails every unrelated change that
 * day, and the work it asks for is reading somebody else's pricing page, which
 * a test can't do. So it reports, and the workflow keeps one issue open while
 * anything is due.
 *
 * Exit codes follow `check-app-sync.mjs`: 0 nothing due, 1 something due.
 */
import { RECHECK_DAYS, dueForCheck, rivals } from "../src/content/compare.ts";

const today = new Date().toISOString().slice(0, 10);
const due = dueForCheck(rivals, today);

if (due.length === 0) {
  console.log(`Every comparison was checked within ${RECHECK_DAYS} days of ${today}.`);
  process.exit(0);
}

console.log(`Checked more than ${RECHECK_DAYS} days before ${today}:\n`);
for (const rival of due) {
  console.log(
    `- ${rival.name}, checked ${rival.checked}: https://smpl.money/compare/${rival.slug}/`,
  );
}
console.log(
  "\nRead every source on each page again, correct what moved in `src/content/compare.ts`, " +
    "and set `checked` to the day you did. `docs/standards/content.md` 5.19 has the rules.",
);
process.exit(1);
