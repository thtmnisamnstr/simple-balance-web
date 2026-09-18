/**
 * Capture the screenshots the marketing page uses, from a real running app.
 *
 * The page shows pictures of the product, so the pictures have to be of the
 * product. A mockup drifts from the thing it depicts and nobody notices until
 * a reader does, which on a page whose whole argument is "the figures tie out"
 * is the worst possible place to be caught approximating.
 *
 * WHAT THIS NEEDS, and it is not wired into `npm run verify` for exactly this
 * reason: a checkout of the application, a throwaway PostgreSQL, the API on
 * :3000 and Vite on :5173. `docs/standards/operations.md` 4 has the runbook.
 * Run it when the app's look changes, not on every commit.
 *
 *   node scripts/capture-screenshots.mjs
 *
 * It signs up a fresh account, seeds a ledger that balances, and writes a PNG
 * per page per theme into `public/screenshots/`.
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = process.env.APP_URL ?? "http://localhost:5173";
const OUT = process.env.OUT_DIR ?? "public/screenshots";
/* A fixed identity, because it is visible in the sidebar of every shot. The
   database is recreated for each capture, so uniqueness is the database's job
   rather than a timestamp's. */
const person = {
  name: "Alex Rivera",
  email: "alex@example.com",
  password: "correct-horse-battery-staple-9",
};

/**
 * Dates are relative so a re-capture never shows a stale month, and the bulk
 * of the activity lands in the CURRENT month.
 *
 * That is not cosmetic. Every page defaults to a this-month range, so a
 * ledger seeded evenly across ninety days renders a dashboard reporting
 * almost nothing — which is what the first capture produced. The history
 * still needs earlier months for the reports to have a trend, so both exist:
 * a full current month, and two months behind it.
 */
const today = new Date();
const iso = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return iso(d);
};
/** Day `day` of the month `monthsAgo` months back, clamped to a real date. */
const dayOfMonth = (monthsAgo, day) => {
  const d = new Date(today.getFullYear(), today.getMonth() - monthsAgo, 1);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const capped = Math.min(day, last);
  // Never date anything in the future: money dated ahead has not moved, and
  // the app correctly declines to count it.
  const candidate = new Date(d.getFullYear(), d.getMonth(), capped);
  return iso(candidate > today ? today : candidate);
};

const ACCOUNTS = [
  {
    name: "Everyday Checking",
    type: "checking",
    currency: "USD",
    openingBalance: "3250.00",
    institution: "Pacific Mutual",
  },
  {
    name: "Savings",
    type: "savings",
    currency: "USD",
    openingBalance: "18400.00",
    institution: "Pacific Mutual",
  },
  {
    name: "Travel Card",
    type: "credit_card",
    currency: "USD",
    openingBalance: "-480.25",
    institution: "Northbank",
  },
  {
    name: "Euro Account",
    type: "checking",
    currency: "EUR",
    openingBalance: "2150.00",
    institution: "Banca Sella",
  },
];

const CATEGORIES = [
  { name: "Salary", kind: "income" },
  { name: "Freelance", kind: "income" },
  { name: "Rent", kind: "expense" },
  { name: "Groceries", kind: "expense" },
  { name: "Dining out", kind: "expense" },
  { name: "Transport", kind: "expense" },
  { name: "Utilities", kind: "expense" },
  { name: "Subscriptions", kind: "expense" },
  { name: "Health", kind: "expense" },
];

/** A plausible month of a real person's spending, repeated over three months. */
function entriesFor(monthsAgo, ids) {
  const d = (day) => dayOfMonth(monthsAgo, day);
  const checking = ids.accounts["Everyday Checking"];
  const savings = ids.accounts["Savings"];
  const card = ids.accounts["Travel Card"];
  const euro = ids.accounts["Euro Account"];
  const c = ids.categories;
  return [
    {
      type: "deposit",
      toAccountId: checking,
      amount: "4200.00",
      date: d(1),
      payee: "Northwind Systems",
      description: "Monthly salary",
      categoryId: c["Salary"],
    },
    {
      type: "withdrawal",
      fromAccountId: checking,
      amount: "1850.00",
      date: d(2),
      payee: "Bayview Properties",
      description: "Rent",
      categoryId: c["Rent"],
    },
    {
      type: "withdrawal",
      fromAccountId: checking,
      amount: "121.60",
      date: d(3),
      payee: "Meridian Power",
      description: "Electricity",
      categoryId: c["Utilities"],
    },
    {
      type: "withdrawal",
      fromAccountId: checking,
      amount: "142.80",
      date: d(4),
      payee: "Greenline Market",
      description: "Weekly shop",
      categoryId: c["Groceries"],
    },
    {
      type: "withdrawal",
      fromAccountId: card,
      amount: "17.99",
      date: d(5),
      payee: "Everstream",
      description: "Subscription",
      categoryId: c["Subscriptions"],
    },
    {
      type: "withdrawal",
      fromAccountId: checking,
      amount: "88.00",
      date: d(6),
      payee: "City Transit",
      description: "Monthly pass",
      categoryId: c["Transport"],
    },
    {
      type: "withdrawal",
      fromAccountId: card,
      amount: "63.40",
      date: d(7),
      payee: "Rosetta Trattoria",
      description: "Dinner",
      categoryId: c["Dining out"],
    },
    {
      type: "withdrawal",
      fromAccountId: checking,
      amount: "156.25",
      date: d(9),
      payee: "Greenline Market",
      description: "Weekly shop",
      categoryId: c["Groceries"],
    },
    {
      type: "withdrawal",
      fromAccountId: euro,
      amount: "64.30",
      date: d(9),
      payee: "Mercato Centrale",
      description: "Groceries",
      categoryId: c["Groceries"],
    },
    {
      type: "withdrawal",
      fromAccountId: checking,
      amount: "72.00",
      date: d(10),
      payee: "Clearview Dental",
      description: "Check-up",
      categoryId: c["Health"],
    },
    {
      type: "deposit",
      toAccountId: checking,
      amount: "750.00",
      date: d(11),
      payee: "Halberd Design",
      description: "Invoice 041",
      categoryId: c["Freelance"],
    },
    {
      type: "withdrawal",
      fromAccountId: euro,
      amount: "112.00",
      date: d(12),
      payee: "Trenitalia",
      description: "Rail fare",
      categoryId: c["Transport"],
    },
    {
      type: "withdrawal",
      fromAccountId: checking,
      amount: "134.15",
      date: d(13),
      payee: "Greenline Market",
      description: "Weekly shop",
      categoryId: c["Groceries"],
    },
    {
      type: "withdrawal",
      fromAccountId: card,
      amount: "48.20",
      date: d(15),
      payee: "Rosetta Trattoria",
      description: "Lunch",
      categoryId: c["Dining out"],
    },
    {
      type: "withdrawal",
      fromAccountId: checking,
      amount: "39.90",
      date: d(16),
      payee: "Alder & Co",
      description: "Household",
      categoryId: c["Groceries"],
    },
    /* A payee is required on every entry, transfers included (`domain.ts:455`),
       so this names the institution the money moves within. */
    {
      type: "transfer",
      fromAccountId: checking,
      toAccountId: savings,
      sourceAmount: "600.00",
      destinationAmount: "600.00",
      date: d(17),
      payee: "Pacific Mutual",
      description: "Monthly saving",
    },
    {
      type: "withdrawal",
      fromAccountId: checking,
      amount: "128.45",
      date: d(20),
      payee: "Greenline Market",
      description: "Weekly shop",
      categoryId: c["Groceries"],
    },
    {
      type: "withdrawal",
      fromAccountId: card,
      amount: "26.00",
      date: d(22),
      payee: "Northside Cinema",
      description: "Tickets",
      categoryId: c["Dining out"],
    },
    {
      type: "withdrawal",
      fromAccountId: checking,
      amount: "145.70",
      date: d(25),
      payee: "Greenline Market",
      description: "Weekly shop",
      categoryId: c["Groceries"],
    },
  ];
}

/**
 * A budget per category, so the budgets page and the overview card are real.
 *
 * Both currencies get one. A budget is per currency, and the overview renders
 * a block per currency, so seeding only USD left the EUR block reporting "no
 * budget set" next to a populated USD one — which reads as a broken feature
 * rather than an unused one.
 */
const BUDGETS = [
  { category: "Groceries", amount: "250.00", currency: "EUR" },
  { category: "Transport", amount: "150.00", currency: "EUR" },
  { category: "Groceries", amount: "700.00" },
  { category: "Rent", amount: "1850.00" },
  { category: "Dining out", amount: "200.00" },
  { category: "Transport", amount: "120.00" },
  { category: "Utilities", amount: "150.00" },
  { category: "Subscriptions", amount: "40.00" },
  { category: "Health", amount: "100.00" },
];

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: "light",
  });
  const page = await context.newPage();

  // ---- sign up -------------------------------------------------------------
  await page.goto(BASE);
  const toggle = page.getByRole("button", { name: "Create an account" });
  const signUpHeading = page.getByRole("heading", { name: "Create your account" });
  await signUpHeading.or(toggle).waitFor();
  if (await toggle.isVisible()) await toggle.click();
  await signUpHeading.waitFor();
  await page.getByLabel("Your name").fill(person.name);
  await page.getByLabel("Email address").fill(person.email);
  await page.getByLabel(/^Password/).fill(person.password);
  await page.getByLabel(/^Confirm password/).fill(person.password);
  await page.getByRole("button", { name: "Create account" }).click();

  const nav = page.getByRole("navigation", { name: "Main navigation" });
  const taken = page.getByText(/already/i);
  await nav.or(taken).waitFor({ timeout: 30_000 });

  /* The identity is fixed so it looks right in the sidebar, which means a
     re-run against a database that was not dropped meets an account that
     already exists. Signing in is the correct answer rather than an error:
     the seed below is idempotent on its own keys, and a half-finished capture
     should be resumable. */
  let seeded = false;
  if (!(await nav.isVisible())) {
    await page.goto(BASE);
    await page
      .getByRole("button", { name: /Sign in/i })
      .first()
      .waitFor();
    await page.getByLabel("Email address").fill(person.email);
    await page.getByLabel(/^Password/).fill(person.password);
    await page.getByRole("button", { name: /^Sign in$/i }).click();
    await nav.waitFor({ timeout: 30_000 });
    seeded = true;
    console.log("signed in as", person.email, "(account already existed)");
  } else {
    console.log("signed up as", person.email);
  }
  void seeded;

  // ---- seed ----------------------------------------------------------------
  const seed = await page.evaluate(
    async ({ accounts, categories, openingDate }) => {
      const post = async (url, body) => {
        const res = await fetch(url, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`${url} -> ${res.status} ${await res.text()}`);
        return res.json();
      };
      /* Look before creating, so a re-run against a database that already
         holds the fixture reuses it rather than failing on the name
         uniqueness the ledger enforces. This is what makes resuming a
         half-finished capture work. */
      const list = async (url, key) => {
        const res = await fetch(url);
        if (!res.ok) return [];
        const body = await res.json();
        return Array.isArray(body) ? body : (body[key] ?? body.items ?? []);
      };
      const byName = (rows) => new Map(rows.map((r) => [r.name, r.id]));

      const existingAccounts = byName(await list("/api/v1/accounts", "accounts"));
      const existingCategories = byName(await list("/api/v1/categories", "categories"));

      const ids = { accounts: {}, categories: {} };
      for (const a of accounts) {
        ids.accounts[a.name] =
          existingAccounts.get(a.name) ??
          (await post("/api/v1/accounts", { ...a, openingDate })).id;
      }
      for (const c of categories) {
        ids.categories[c.name] =
          existingCategories.get(c.name) ?? (await post("/api/v1/categories", c)).id;
      }
      return ids;
    },
    { accounts: ACCOUNTS, categories: CATEGORIES, openingDate: daysAgo(120) },
  );
  console.log(
    "accounts:",
    Object.keys(seed.accounts).length,
    "categories:",
    Object.keys(seed.categories).length,
  );

  const drafts = [0, 1, 2].flatMap((m) => entriesFor(m, seed));
  const written = await page.evaluate(async (list) => {
    let ok = 0;
    const problems = [];
    for (const [i, draft] of list.entries()) {
      const res = await fetch("/api/v1/transactions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          draft,
          idempotencyKey: `shots-${i}-${draft.date}-${draft.amount ?? draft.sourceAmount}`,
        }),
      });
      if (res.ok) ok += 1;
      else if (problems.length < 3)
        problems.push(`${res.status} ${(await res.text()).slice(0, 200)}`);
    }
    return { ok, problems };
  }, drafts);
  console.log(`transactions written: ${written.ok}/${drafts.length}`);
  if (written.problems.length) console.log("problems:", written.problems);

  const budgets = await page.evaluate(
    async ({ plans, ids, activeFrom }) => {
      let ok = 0;
      const problems = [];
      for (const plan of plans) {
        const res = await fetch("/api/v1/budget-plans", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            categoryId: ids.categories[plan.category],
            currency: plan.currency ?? "USD",
            periodUnit: "month",
            amount: plan.amount,
            activeFrom,
          }),
        });
        if (res.ok) ok += 1;
        else if (problems.length < 2)
          problems.push(`${res.status} ${(await res.text()).slice(0, 220)}`);
      }
      return { ok, problems };
    },
    { plans: BUDGETS, ids: seed, activeFrom: dayOfMonth(3, 1) },
  );
  console.log(`budgets written: ${budgets.ok}/${BUDGETS.length}`);
  if (budgets.problems.length) console.log("budget problems:", budgets.problems);

  // ---- discover the pages --------------------------------------------------
  await page.goto(BASE);
  await nav.waitFor();
  const targets = await nav.locator("a").evaluateAll((links) =>
    links.map((a) => ({
      href: a.getAttribute("href") ?? "",
      label: (a.textContent ?? "").trim(),
    })),
  );
  console.log("nav:", targets.map((t) => t.href).join(" "));

  // ---- capture -------------------------------------------------------------
  //
  // Only the pages the marketing page actually shows. Capturing all thirteen
  // produced eleven megabytes of PNG for five that get used, and an unused
  // screenshot is a file that goes stale without anyone noticing it has.
  const WANTED = ["/", "/transactions", "/budgets", "/reports", "/import"];
  const slug = (href) => (href === "/" ? "dashboard" : href.replace(/^\//, "").replace(/\//g, "-"));
  const chosen = targets.filter((t) => WANTED.includes(t.href));
  if (chosen.length !== WANTED.length) {
    throw new Error(
      `nav is missing one of ${WANTED.join(" ")} — found ${chosen.map((c) => c.href).join(" ")}`,
    );
  }

  const written2 = [];
  for (const theme of ["light", "dark"]) {
    await page.emulateMedia({ colorScheme: theme });
    for (const target of chosen) {
      await page.goto(BASE + target.href);
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.waitForTimeout(900);
      const png = await page.screenshot();
      // WebP at 1600px wide. The shots are taken at 2880 (1440 at 2x) for
      // sharpness and shipped at a width a marketing page can afford: the
      // PNGs are ~420 KB each and these land near 60.
      const file = join(OUT, `${slug(target.href)}-${theme}.webp`);
      const out = await sharp(png).resize({ width: 1600 }).webp({ quality: 82 }).toBuffer();
      writeFileSync(file, out);
      const meta = await sharp(out).metadata();
      written2.push({ file, kb: Math.round(out.length / 1024), w: meta.width, h: meta.height });
      console.log(
        `wrote ${file} (${Math.round(out.length / 1024)} KB, ${meta.width}x${meta.height})`,
      );
    }
  }

  writeFileSync(
    join(OUT, "CAPTURE.json"),
    JSON.stringify(
      { capturedAt: iso(today), viewport: "1440x900@2x", shippedWidth: 1600, images: written2 },
      null,
      2,
    ),
  );
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
