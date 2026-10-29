---
name: aeo-review
description: Check what an answer engine or an AI assistant finds when somebody asks it about Simple Balance. Covers the prompts people ask and the sentence each engine would quote, whether those sentences are true, current, self-contained and no stronger than the privacy policy, one story about the product across the homepage, pricing, /llms.txt, the structured data and the docs, and nothing shutting AI crawlers out. Run by merge-prep after seo-review; run it on its own before a launch, or when asked how the product shows up in ChatGPT, Claude, Perplexity, Gemini, Copilot or Google's AI answers.
---

# Be the answer an assistant gives

ChatGPT, Claude, Perplexity, Gemini, Copilot and Google's AI Overviews and AI
Mode answer a question the same way: they search an index they already have
and quote a sentence or two from the pages it returns. Google's AI features
answer from Google's index, Copilot and much of ChatGPT's search from Bing's,
Claude from Brave's and its own crawler's, Perplexity from PerplexityBot's.
Google says its AI features need no special file and no special markup, only
a page that's indexed and allowed a snippet.

So this runs after `seo-review`. A page that isn't indexed has nothing here
to improve. Once it is indexed, what an engine takes from it is plain
sentences, and the work here is making sure the sentence it would lift for
each question somebody asks is on the page, is true, and makes sense on its
own.

The other reader is an agent: a coding tool or an assistant told to read the
docs and then set up the MCP connection, import a file or install a copy. It
reads `/llms.txt` and the Markdown copy beside each docs page and guide
(`content.md` 5.15), so those get read here the way the agent gets them.

**Run by `merge-prep` §9**, between `seo-review` and `optimize`, it reads
what the branch changed (§1). **Run on its own**, before a launch or when
somebody asks how the product shows up in AI answers, it reads the whole
site and every prompt in §3, and §9 reports the owner's half in full.

**The machinery is already tested** (§2), so this spends its time on what no
test can decide: whether a sentence answers the question, and whether it's
true.

## 1. Scope

Run the scope block in `merge-prep` §1 again rather than reusing the list it
wrote. `seo-review` runs just before this and may have retitled a page or
rewritten a description, and `legal-review` may have rewritten the policy
that §3 holds every privacy answer to.

Then decide what to read from that list:

- **A docs page or a learn guide**, changed or new: its opening (§5), its
  Markdown copy (§7), and any prompt in §3 it answers.
- **The words every surface of the product's description draws on**:
  `src/content/home.ts`, `src/content/pricing.ts`, `src/content/llms.ts`,
  `src/content/legal.ts` or `src/content/app-facts.json`. Read every surface
  in §4, because each holds a piece of one story, and every prompt in §3
  that the homepage, the pricing page or the privacy policy answers.
- **Anything every page shares**, which widens this to the whole site:
  `src/app/layout.tsx`, `src/app/open-graph.ts`, `src/lib/indexing.ts`,
  `src/lib/feed.ts`, `src/lib/markdown.ts`,
  `src/components/structured-data.tsx`, `src/content/sections.ts`,
  `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/llms.txt/route.ts`,
  the two copy routes, `src/app/docs/[slug]/index.md/route.ts` and
  `src/app/learn/[slug]/index.md/route.ts`, the two page templates,
  `src/app/docs/[slug]/page.tsx` and `src/app/learn/[slug]/page.tsx`, which
  emit each docs page's and guide's alternate link and article graph, the
  headers in `netlify.toml`, and either `_sections.json`, which orders
  `/llms.txt`. So does an upgrade `update-dependencies` made to Next or the
  Markdown pipeline, since it changes what every page and copy emits.
- **After a sync**, the product moved by definition, so §3, §4 and §7 run
  whole. `sync-from-app` ends by running `merge-prep`, which runs this.
- **Nothing a reader or a crawler reads**, such as guides, skills, tests or
  workflows alone: say so in the report and hand back.

Everything below reads the built site:

```sh
npm run build
```

Under `merge-prep`, the build the review before this one made is current
unless something has changed since.

## 2. What the tests already hold

Each of these runs on every `npm run verify`. Don't check them again by
hand; read the list so you know where the gate stops.

- **`tests/markdown.test.ts`**, "the Markdown copies": a copy for every docs
  page and learn guide, opening on the page's title, description and
  address; no component left as a tag; the made-up-money line under every
  picture; linked from its page as an alternate; only absolute links back
  into the site, refusing a root-relative link and a fragment-only one,
  which inside a text file leads nowhere. And "/llms.txt": the format's
  shape, links only to files the build wrote, every docs page and guide
  listed and nothing from an unannounced section, and the application's own
  prices.
- **`tests/export-shape.test.ts`**, "serves the Markdown copies and llms.txt
  as text, and keeps them out of the index": their content types, and
  `noindex` on exactly those two paths and nothing else.
- **`tests/structured-data.test.ts`**: every page's JSON-LD parses and
  claims no rating or review; the homepage's graph is there once, with its
  ids, its `alternateName` and offers equal to the contract; every guide and
  docs page has its article, its card and its breadcrumbs; and each docs
  page's `about` points at the application.
- **`tests/pricing.test.tsx`**, "publishes structured data whose answers are
  visible on the page".
- **`tests/sections.test.tsx`**, "is still allowed to be crawled either way,
  so the noindex can be read": one `User-agent: *` group, `Allow: /`, no
  `Disallow`, and the sitemap line. The rest of that file holds the
  announced flag in both directions, and `tests/feeds.test.ts` holds the
  feeds to it.
- **`tests/compare.test.ts`**: a source for every fact about another app,
  every source cited, a checked date that isn't in the future, Simple
  Balance's column and every answer read from the contract, each claim and
  source on the built page and in its Markdown copy, the copies in
  `/llms.txt`, and each page's article dated by its check. Its last block
  holds the docs' questions page: its `FAQPage` marks up exactly the
  questions and answers on the page, and none the pricing page already does.
- **`tests/copy.test.ts`**, "never implies the product logs in to a bank",
  over the homepage's and the pricing page's modules and
  `src/content/llms.ts`;
  **`tests/app-facts.test.ts`** for every price and limit on those pages;
  and **`tests/legal.test.tsx`**, "the marketing pages, against the policy".

**None of them reads the words as answers.** The summary and notes in
`/llms.txt` are written by hand in `src/content/llms.ts`, and only their
prices and the bank word list are checked. That list reads the homepage, the
pricing page and `/llms.txt`, and not a docs page, where "doesn't connect to
your bank" is the denial and its first pattern would refuse it. Nothing
reads whether a sentence answers a question, or whether two surfaces
describe the product the same way. That's the rest of this skill.

## 3. The prompts the site must answer

These are the questions people put to an assistant about a product like this
one, from the October 2026 search and prompt research that `content.md` 5.14
and 5.16 draw on.
Each has one page an engine should land on, the words to look for there, and
what a true answer has to carry.

| Prompt                                                | Page                                          | Look for                                          | A true answer carries                                                                                                                              |
| ----------------------------------------------------- | --------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| What is Simple Balance?                               | `/`                                           | Simple Balance is, budget app, spending tracker   | What it is, in the homepage's category words, and the two ways to use it: in a browser at app.smpl.money, or as your own copy                      |
| Is Simple Balance free? What does Premium cost?       | `/pricing/`                                   | free, Premium, a month, a year                    | Every feature on every plan; free for three accounts in use at once, with ads; Premium's two prices, from the contract                             |
| Does Simple Balance connect to my bank?               | `/pricing/`                                   | bank                                              | No automatic connection today: you download a file from your bank and bring it in. Present tense, and no promise about tomorrow (`content.md` 1.4) |
| Can I self-host Simple Balance? Is it open source?    | `/docs/self-hosting/`                         | open source, source code, license, AGPL, yourself | Yes to both: free to run yourself, with no plan, no limit and no ads, from public source code under its license                                    |
| Does Simple Balance sell my data?                     | `/privacy/`                                   | sell, rent                                        | What the policy says, and no more (below)                                                                                                          |
| How do I import a CSV into Simple Balance?            | `/docs/importing-a-statement/`                | CSV                                               | Download the statement as a CSV, choose it on Import CSV, and check the rows on Staged before any of them count                                    |
| How do I connect Simple Balance to Claude or ChatGPT? | `/docs/agents-and-mcp/`                       | MCP, assistant, Claude, ChatGPT                   | The address, the OAuth sign-in, and what an assistant can and can't do                                                                             |
| How do I move from the cloud app to my own copy?      | `/docs/moving-between-cloud-and-self-hosted/` | export, move                                      | Either direction, one account at a time as spreadsheets, and what doesn't travel                                                                   |
| A free budget app                                     | `/`                                           | free, budget app                                  | The category and "free" together, with the free plan's limit close by                                                                              |
| A budget app without linking my bank                  | `/pricing/`                                   | bank, file                                        | The same mechanism as the bank question, said as what you do                                                                                       |
| A budget app that works with ChatGPT or Claude        | `/`                                           | assistant                                         | That an assistant can connect, and what it can do once it has                                                                                      |
| A self-hosted or open source budget app               | `/docs/self-hosting/`                         | open source, self-host, yourself                  | The self-hosting answer, said as the category                                                                                                      |
| An expense tracker, or a spending tracker             | `/learn/track-your-spending/`                 | tracker                                           | The guide's product section saying Simple Balance is one (`content.md` 5.16)                                                                       |
| A zero-based budgeting app                            | `/learn/zero-based-budgeting/`                | budgeting app                                     | The same, for zero-based budgeting                                                                                                                 |
| An envelope budgeting app                             | `/learn/envelope-budgeting/`                  | budgeting app                                     | The same, for envelopes                                                                                                                            |
| A net worth tracker                                   | `/learn/net-worth/`                           | tracker                                           | The same, and what it won't do: look up what investments, a home or a car are worth                                                                |
| A subscription tracker                                | `/learn/find-your-subscriptions/`             | tracker                                           | What it isn't: a tracker that finds them for you                                                                                                   |
| An alternative to YNAB                                | `/compare/ynab/`                              | YNAB, bank, free, Simple Balance                  | Both apps' prices with their subjects, the bank difference said as what you do, and a source for every fact about YNAB                             |
| An alternative to Monarch                             | `/compare/monarch/`                           | Monarch, bank, free, MCP                          | The same, and that both connect to an assistant through MCP, which Monarch's own page says                                                         |
| An alternative to Quicken Simplifi                    | `/compare/quicken-simplifi/`                  | Simplifi, bank, free, trial                       | The same, and that Simplifi has neither a free plan nor a trial                                                                                    |
| An open source alternative to Actual Budget           | `/compare/actual-budget/`                     | Actual Budget, open source, server, bank          | That both are free to run yourself, that only Simple Balance is also hosted with a free plan, and the bank sync and envelopes Actual offers        |
| Simple Balance vs YNAB, Monarch or Simplifi           | `/compare/`                                   | YNAB, Monarch, Simplifi, free plan                | The bank difference first, then the free plan none of the three has                                                                                |
| Is there a Simple Balance phone app?                  | `/docs/frequently-asked-questions/`           | phone, app store, browser                         | No app-store app, and that it runs in a phone's web browser                                                                                        |

**Two kinds of prompt have no row, on purpose.** "How do I make a budget"
and the other jobs are each a learn guide's own title, and §5 reads whether
its opening answers it. "The best budget app" is answered from other
people's lists, so that work is the listings in §9. "An alternative to
YNAB" has rows now, because the comparison pages exist (`content.md` 5.19),
and other people's lists still carry most of its answers.

**A prompt is added as a row.** The command reads the table above, so the
list lives in one place. For each row it prints the page's description and
first paragraph, from the Markdown copy where there is one, and then the
sentences on the page that name what the prompt asks about, best first: the
most of the row's words, then whole sentences ahead of fragments. It shows
four and counts the rest as "+N more", so a long page still says how much
it held. A look-word that's a name, such as Claude or AGPL, gets a line of
its own when nothing on the page says it, because an absent name is easy to
miss in a list of the words that are there.

The HTML is read the way a crawler's text extraction reads it. A line ends
at each block, and at each link, button or label that's followed by another
element rather than by the rest of a sentence, so a row of buttons doesn't
run into the paragraph after it. Anything marked `aria-hidden`, and the
"Stop the animation" checkbox under each loop, is left out. What still
prints as a fragment, such as a button's label or the words inside a
drawing, is page chrome and not an answer.

````sh
node -e '
const fs = require("node:fs");
const rows = fs.readFileSync(".claude/skills/aeo-review/SKILL.md", "utf8").split("\n")
  .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
  .filter((cells) => /^`\/[^`]*`$/.test(cells[1] ?? ""));
const EMPTY = /^(area|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/i;
const BLOCK = /^(p|li|h[1-6]|summary|td|th|tr|caption|dt|dd|figcaption|blockquote|div|section|ul|ol)$/i;
const plain = (html) => {
  const source = html.replace(/<(script|style|svg|template)\b[\s\S]*?<\/\1>|<!--[\s\S]*?-->/g, " ");
  let text = "", depth = 0, hidden = 0, from = 0;
  for (const tag of source.matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g)) {
    if (!hidden) text += source.slice(from, tag.index);
    from = tag.index + tag[0].length;
    const [, close, name, attributes, empty] = tag;
    if (empty || EMPTY.test(name)) continue;
    if (!close) {
      depth += 1;
      if (!hidden && /aria-hidden="true"|class="mo-stop"/.test(attributes)) hidden = depth;
      text += " ";
      continue;
    }
    if (hidden === depth) hidden = 0;
    depth -= 1;
    const control = /^(a|button|label)$/i.test(name) && /^\s*</.test(source.slice(from, from + 80));
    text += BLOCK.test(name) || control ? "\n" : " ";
  }
  return (text + (hidden ? "" : source.slice(from)))
    .replace(/&amp;/g, "&").replace(/&#x27;|&#39;|’/g, "\x27").replace(/&quot;/g, "\"");
};
const flat = (text) => text.replace(/\s+/g, " ").trim();
const escape = (word) => word.replace(/[.*+?^()|[\]\\]/g, "\\$&");
for (const [prompt, cell, look] of rows) {
  const route = cell.slice(1, -1);
  const words = look.split(/,\s*/).map((word) => [word, new RegExp("\\b" + escape(word), "i")]);
  const copy = `out${route}index.md`;
  let lead, blocks;
  if (fs.existsSync(copy)) {
    const text = fs.readFileSync(copy, "utf8");
    const body = (text.split(/\nFrom Simple Balance: [^\n]*\n/)[1] ?? "")
      .replace(/```[\s\S]*?```/g, "").replace(/^(\||#+ |!\[).*$/gm, "")
      .replace(/^>\s?/gm, "").replace(/\n\s*(?:[-*]|\d+\.)\s+/g, "\n\n");
    blocks = body.split(/\n\s*\n/);
    lead = [text.split("\n")[2].slice(2), blocks.find((block) => block.trim())];
  } else {
    const html = fs.readFileSync(`out${route}index.html`, "utf8");
    const main = /<main[\s\S]*<\/main>/.exec(html)?.[0] ?? "";
    blocks = plain(main).split("\n");
    lead = [
      plain(/<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? ""),
      plain(/<\/h1>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/.exec(main)?.[1] ?? ""),
    ];
  }
  const sentences = blocks.flatMap((block) => flat(block).split(/(?<=[.?!])\s+(?=[A-Z*"])/));
  const score = (sentence) => 2 * words.filter(([, re]) => re.test(sentence)).length +
    (/[.?!]["”)]?$/.test(sentence) ? 1 : 0);
  const hits = sentences.filter((sentence) => score(sentence) >= 2).sort((a, b) => score(b) - score(a));
  console.log(`\n# ${prompt}   ${fs.existsSync(copy) ? copy : route}`);
  for (const line of lead) console.log(`  > ${flat(line ?? "")}`);
  for (const sentence of hits.slice(0, 4)) console.log(`  - ${sentence}`);
  if (hits.length > 4) console.log(`    (+${hits.length - 4} more)`);
  if (hits.length === 0) console.log("  - nothing on this page names it");
  for (const [word, re] of words) {
    if (/^[A-Z]/.test(word) && !sentences.some((sentence) => re.test(sentence))) {
      console.log(`  ! nothing on this page says ${word}`);
    }
  }
}'
````

Read each prompt's lines as the engine would, one or two sentences lifted
out of the page, and ask five things of the one that answers.

1. **Is there one?** "Nothing on this page names it", or matches that
   mention the words without answering, is the finding. So is a "nothing on
   this page says" line for a name the answer needs, such as the license on
   the self-hosting page. On a docs page or a guide, the fix is a sentence
   in the opening or in the section the prompt belongs to. On the homepage
   or the pricing page it's a proposal (§10).
2. **Does it stand alone?** "It never adds anything on its own" answers
   nothing once it's lifted away from the sentence before it. "Simple
   Balance doesn't connect to your bank" answers a question by itself. The
   opening sentence and the answering sentence name their subject. The rest
   of the page doesn't need to repeat the product's name, and reads worse
   when it does.
3. **Is it true of the shipped application**, at the release the snapshot
   records (`content.md` 2.1 and 2.7)? A price or a limit is the contract's,
   and the bank mechanism is said in the present tense with no promise
   about tomorrow (`content.md` 1.4). An assistant is named only once
   somebody has connected it to that release, because naming one tells the
   next reader it works. So on the MCP row, "nothing on this page says
   Claude" and the same for ChatGPT are correct until the owner's item in §9
   is done, and they're how the report knows that item is still open. Once
   it's done, the same lines are a finding: the page names each client that
   was connected, with its own steps.
4. **Is it current?** A date, a version number, "new", "soon" or "coming"
   is true on the day it's written. A sentence naming a release names the
   snapshot's (`content.md` 2.6).
5. **Is it no stronger than the privacy policy** (`content.md` 2.4)? The
   data question is where this bites. The policy says "We don't sell your
   data or rent it", and under Your rights it says that Google's advertising
   cookies personalizing ads in the application "can count as selling or
   sharing personal information" under California's law and laws like it.
   "Simple Balance never sells or shares anything about you", on any page an
   engine might quote, promises more than the policy does.
   `tests/legal.test.tsx` holds the homepage and the pricing page to the
   policy, and nothing holds a docs page or `/llms.txt` to it. Nothing holds
   the policy to itself, either. The data row's answer is the policy's own
   sentence, and lifted alone, "We don't sell your data or rent it" names
   no subject and says more than the policy does once Your rights qualifies
   it. A policy sentence that fails check 2 or this one goes where §10 says.

## 4. One story about the product

An engine assembles its answer from several pages, and where they disagree
it picks one or blends them. The name also sits close to two others: Simple,
an online bank that closed in 2021 and still has years of reviews, and an
unrelated iOS checkbook app called Simple Balance. The name, one description
and the domain, said together the same way everywhere, are what tell this
product apart from both.

This prints the name, the description, the prices, the free limit and the
plan names as each surface states them, under the contract they come from.
Then, as `bank:` and `ways:`, it prints each surface's sentences about how
data gets in and about the two ways to use it. It reads the HTML with §3's
helper, so a run of link labels such as "See how to run it yourself" is
chrome there too:

````sh
node -e '
const fs = require("node:fs");
const read = (path) => fs.readFileSync(path, "utf8");
const EMPTY = /^(area|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/i;
const BLOCK = /^(p|li|h[1-6]|summary|td|th|tr|caption|dt|dd|figcaption|blockquote|div|section|ul|ol)$/i;
const plain = (html) => {
  const source = html.replace(/<(script|style|svg|template)\b[\s\S]*?<\/\1>|<!--[\s\S]*?-->/g, " ");
  let text = "", depth = 0, hidden = 0, from = 0;
  for (const tag of source.matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g)) {
    if (!hidden) text += source.slice(from, tag.index);
    from = tag.index + tag[0].length;
    const [, close, name, attributes, empty] = tag;
    if (empty || EMPTY.test(name)) continue;
    if (!close) {
      depth += 1;
      if (!hidden && /aria-hidden="true"|class="mo-stop"/.test(attributes)) hidden = depth;
      text += " ";
      continue;
    }
    if (hidden === depth) hidden = 0;
    depth -= 1;
    const control = /^(a|button|label)$/i.test(name) && /^\s*</.test(source.slice(from, from + 80));
    text += BLOCK.test(name) || control ? "\n" : " ";
  }
  return (text + (hidden ? "" : source.slice(from)))
    .replace(/&amp;/g, "&").replace(/&#x27;|&#39;|’/g, "\x27").replace(/&quot;/g, "\"");
};
const head = (html) => [/<title>([^<]*)/, /<meta name="description" content="([^"]*)"/]
  .map((re) => plain(re.exec(html)?.[1] ?? "")).join("\n");
const main = (html) => plain(/<main[\s\S]*<\/main>/.exec(html)?.[0] ?? "");
const prose = (md) => md.replace(/```[\s\S]*?```/g, "").replace(/^(\||From Simple Balance: ).*$/gm, "")
  .replace(/^>\s?/gm, "").replace(/(?<=\S)\n(?=(?![-*+]\s|#|\||\d+\.\s)\S)/g, " ");
const { derived, declared } = require("./src/content/app-facts.json").facts;
const plans = Object.values(derived.plans)
  .map((p) => `${p.label}: ${p.accountLimit ?? "unlimited"} accounts, ${p.advertising ? "ads" : "no ads"}`);
console.log(`the contract, at ${derived.appVersion}\n  ${derived.appName} | ${plans.join(" | ")} | ` +
  `${declared.prices.currency} ${declared.prices.monthly} a month, ${declared.prices.yearly} a year`);
const home = read("out/index.html");
const graph = JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(home)[1])["@graph"] ?? [];
for (const node of graph) {
  const offers = (node.offers ?? []).map((o) => `${o.name} ${o.price} ${o.priceCurrency}`).join(", ");
  console.log(`JSON-LD ${node["@type"]}\n  ${[node.name, node.alternateName, node.description, offers].filter(Boolean).join(" | ")}`);
}
const surfaces = [
  ["homepage title and description", head(home)],
  ["homepage", main(home)],
  ["pricing title and description", head(read("out/pricing/index.html"))],
  ["pricing", main(read("out/pricing/index.html"))],
  ["/llms.txt", read("out/llms.txt").split("\n## ")[0]],
  ...["getting-started", "limits", "your-account-and-plan", "self-hosting"]
    .map((slug) => [`/docs/${slug}/`, prose(read(`out/docs/${slug}/index.md`))]),
];
const unique = (text, re) => [...new Set([...text.matchAll(re)]
  .map((m) => m[0].replace(/\s+/g, " ").trim()))].join(" · ") || "(none)";
const show = (list) => list.length === 0 ? "(none)" : list.slice(0, 3).join("\n          ") +
  (list.length > 3 ? `\n          (+${list.length - 3} more)` : "");
for (const [name, text] of surfaces) {
  const sentences = text.split(/\n+|(?<=[.?!])\s+(?=[A-Z])/).map((s) => s.replace(/\s+/g, " ").trim());
  const said = (re) => sentences.filter((s) => re.test(s));
  console.log(`${name}\n  is:     ${show(said(/Simple Balance (is|works as)|budget(ing)? app|spending tracker|expense tracker|accounting software/i))}`);
  console.log(`  price:  ${unique(text, /\$[0-9][0-9.]*\s*(a|per|\/)\s*(month|year|mo|yr)\b/gi)}`);
  console.log(`  limit:  ${unique(text, /\b(up to )?(three|3) accounts( (in use|you can use)( at once)?)?/gi)}`);
  console.log(`  plans:  ${unique(text, /\b(Premium|Plus|Pro)\b/g)}`);
  console.log(`  bank:   ${show(said(/\bbank\b/i))}`);
  console.log(`  ways:   ${show(said(/app\.smpl\.money|cloud app|your own copy|run it yourself|self-host/i))}`);
}'
````

What has to agree:

- **The name.** Simple Balance, with smpl.money as the domain, which the
  graph carries as `alternateName`.
- **What it is.** The homepage's category words, a budget app and spending
  tracker, in the title, in the description (which is also the graph's), in
  the label above the hero and in the first line of `/llms.txt`. A surface
  that says less is fine. One that calls it something else, "personal
  accounting software" or "a ledger", describes a second product to an
  engine.
- **The plans.** Free and Premium, and never the wire's `plus`
  (`content.md` 6.3); Premium's two prices, and the free plan's three
  accounts in use at once, with ads, each equal to the contract line at the
  top.
- **How data gets in, and the two ways to use it**: a file you bring in, and
  either the cloud app at app.smpl.money or your own copy, in the words
  `content.md` 1.6 gives them. Read the `bank:` and `ways:` lines across the
  surfaces. A bank sentence about something else, such as a bank confirming
  a card payment, isn't one. A surface that says nothing is fine; one that
  says something else, such as an automatic connection or a third way to
  use the product, is the finding.

Where two disagree, the contract decides a fact and the homepage's words
decide the category, since they're the ones the owner accepted. Fix the
module that holds the words rather than the page that shows them:
`src/content/llms.ts` for the summary and notes in `/llms.txt`;
`site.description` in `src/content/home.ts` for the search description and
both graph nodes at once; a docs page's Markdown for the docs. **Never
`src/content/app-facts.json`.** It's the external referent (`AGENTS.md`), and
editing it to agree moves the answer key rather than the answer. A change to
the tagline or a price moves `public/og.png` as well, and the homepage
card's test in `tests/export-shape.test.ts` fails until it's redrawn.

## 5. Openings that can be quoted

The paragraph under a page's title is the first thing in its Markdown copy
after the title and description, and the first thing anything summarizing
the page reads (`content.md` 5.16). A docs page opens on an answer
(`content.md` 5.17); a guide answers first and shows the product last
(`content.md` 5.14). The two reviews meet here on purpose: `seo-review` has
asked whether the opening answers the title, and this asks whether it can
be quoted without the title above it.

The command reads a list of source files on its input and prints, for each,
the title, the description and the opening from its copy. Save it once:

```sh
cat > "${TMPDIR:-/tmp}/aeo-openings.cjs" <<'EOF'
const fs = require("node:fs");
for (const file of fs.readFileSync(0, "utf8").split("\n").filter(Boolean)) {
  const [, kind, slug] = /content\/(docs|learn)\/(.+)\.md$/.exec(file);
  const copy = `out/${kind}/${slug}/index.md`;
  if (!fs.existsSync(copy)) { console.log(`\n${file}: no copy at ${copy}, so removed, a draft, or not built`); continue; }
  const group = /^section:\s*(.+)$/m.exec(fs.readFileSync(file, "utf8"))?.[1] ?? "";
  const text = fs.readFileSync(copy, "utf8");
  const [title, , description] = text.split("\n");
  const paragraphs = (text.split(/\nFrom Simple Balance: [^\n]*\n/)[1] ?? "").trim().split(/\n\s*\n/);
  console.log(`\n${title}   (${kind}, ${group})\n${description}`);
  for (const paragraph of paragraphs.slice(0, group === "Self-hosting" ? 2 : 1)) {
    console.log(`  ${paragraph.replace(/\s+/g, " ")}`);
  }
}
EOF
```

Under `merge-prep`, give it every docs page and guide the branch changed:

```sh
git fetch origin main --quiet
{ git diff --merge-base origin/main --name-only; git ls-files --others --exclude-standard; } |
  grep -E '^content/(docs|learn)/[^/]+\.md$' | sort -u | node "${TMPDIR:-/tmp}/aeo-openings.cjs"
```

On its own, give it every page:

```sh
ls content/docs/*.md content/learn/*.md | node "${TMPDIR:-/tmp}/aeo-openings.cjs"
```

- **Cover the title, and read the first two sentences alone.** An engine
  lifts them without the heading, so they name their subject and state the
  answer in plain words. "A budget is a plan for what your money will do
  this month, made before the month starts" can be quoted as it stands. A
  docs page's first sentence names the screen or the feature rather than
  "it" or "this page", and says what it does and what it doesn't. An
  opening that sets a scene first can still be the answer, by example, as
  the envelope guide's cash envelopes are. One whose answer leans on a
  sentence three paragraphs down isn't.
- **A Self-hosting page keeps its audience line first** (`content.md`
  5.18). "This page is for a copy you run yourself. On app.smpl.money
  there's nothing to configure." is the rule's own example, and it isn't
  rewritten into an answer. The sentence after it is the one that has to
  be quotable, which is why the command prints two paragraphs for a page in
  that group. The two deployment guides are exempt from the audience line,
  not from answering: their first sentence is the answer. Outside
  Self-hosting there's no exception, so "This page covers" or "These" in
  first place is the finding.
- **Facts in sentences.** A limit or a price that's only in a table cell, a
  screenshot or a code block reaches a summary without its meaning. Say it
  in a sentence as well. A diagram already travels as its description.
- **Headings that name the situation.** An engine searches several phrasings
  of one prompt, and a heading such as "When it says past due" is what a
  phrasing finds (`content.md` 5.17).

Rewrite an opening that can't be quoted, on a docs page or a guide, under
`write-content`'s rules. A changed opening is a changed page, so its
`updated` date moves, and so does its sitemap date. Keep the rewrite only if
a person reading the page is better served too. Google's guidance asks
explicitly for pages not to be rewritten in an "AI style", and an opening
that reads better to a machine and worse to a person is the wrong trade on
any page.

## 6. Questions answered on the page

The pricing FAQ is the site's question-and-answer block. Each answer sits in
a `<details>`, collapsed on screen and whole in the HTML, which is what a
crawler reads, and the `FAQPage` markup mirrors them. Google stopped showing
FAQ rich results on 7 May 2026, and Bing and the answer engines still read
questions and answers directly (`content.md` 5.13).

Under `merge-prep`, read each question the branch added or changed. On its
own, read every question in the pricing FAQ. This prints each one with its
answer's first sentence, then the §3 prompts whose page is `/pricing/`:

```sh
node -e '
const fs = require("node:fs");
const flat = (html) => html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&")
  .replace(/&#x27;|&#39;|’/g, "\x27").replace(/&quot;/g, "\"").replace(/\s+/g, " ").trim();
const html = fs.readFileSync("out/pricing/index.html", "utf8");
for (const [, question, answer] of html.matchAll(/<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)) {
  console.log(`${flat(question)}\n  ${flat(answer).split(/(?<=[.?!])\s+(?=[A-Z])/)[0]}`);
}
const prompts = fs.readFileSync(".claude/skills/aeo-review/SKILL.md", "utf8").split("\n")
  .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()))
  .filter((cells) => cells[1] === "`/pricing/`").map(([prompt]) => prompt);
console.log(`\nThe prompts in §3 that land here:\n  ${prompts.join("\n  ")}`);'
```

For each question read:

- **It's a question somebody asks**, in their words, rather than a heading
  phrased as one.
- **Its first sentence answers it.** A yes-or-no question gets the yes or
  the no first, and the detail after it.
- **It stands alone and stays within the policy**, the same as §3.

Then pair each prompt at the bottom with the question that answers it. An
engine searches with the prompt's own words, so the question should be
worded the way the prompt is: an answer under "Does Simple Balance connect
to my bank?" is easier to find for that prompt than the same answer under
"How does my spending get in?", which is how the pricing page asked it until
October 2026. A prompt with no question worded like it is
a proposal (§10), and so is an answer whose first sentence names neither
the product nor what "it" is.

A prompt in §3 that no page answers may belong on the pricing page as a
question. That's copy, so propose it (§10). A "questions people ask" block on
the homepage is the owner's decision, because the page is written to
`content.md` 1.3 and 1.4 and its words change only when there's a reason
(`content.md` 6.5). `FAQPage` markup goes only where the questions are
visible, and HowTo markup left Google in 2023.

## 7. `/llms.txt` and the copies, as an agent reads them

```sh
cat out/llms.txt
```

The summary and the notes at the top are the first thing a coding agent
learns about the product, so read them as the answer to "what is Simple
Balance":

- **The summary tells §4's story**, in the same category words and at the
  contract's prices.
- **The bank sentence is the one `content.md` 1.4 allows.** The word list in
  `tests/copy.test.ts` refuses a connection claimed here (§2). Whether the
  sentence says how data gets in, in the present tense, is still a read.
- **The MCP note agrees with `/docs/agents-and-mcp/`**: the address, the
  OAuth sign-in, and what an assistant may do there. Saying less than the
  docs is fine. Saying something different isn't.
- **Each listed page's note is its description**, so a description that
  doesn't answer its page shows here as a weak line, and the fix is the
  description, in the page's frontmatter.

For a docs page the branch changed, open its copy whole and read it as the
agent helping somebody use the product would. Are the steps in order? Are
the configuration block and the commands intact and ready to paste? Does
each callout's warning still sit beside the step it warns about, and does
each table still read as a table? A copy is generated
(`src/lib/markdown.ts`), so a fault in one is a fault in the conversion,
and it's fixed there for every page at once.

**Every address in a copy is absolute** (`content.md` 5.15). The test
refuses a root-relative link and a fragment-only one (§2), and this lists
any relative link in every copy, those two forms included, so a run on a
branch the test hasn't caught up with still sees them:

```sh
grep -nE '\]\((#|/|\.)' out/docs/*/index.md out/learn/*/index.md
```

Expect nothing. A `](#…)` inside a text file leads nowhere, and quoted away
from the page it's a dead link. The fix is in the conversion, which points
it at the HTML page that has the anchor,
`https://smpl.money/<section>/<slug>/#…`, for every copy at once.

**If the branch announced the blog**, its posts join `/llms.txt` by their
pages, and they have no copies. Giving them copies is a route like the
docs' (`content.md` 5.15). Say so in the report rather than building it
unasked.

## 8. Crawlers let in, and quoting allowed

`robots.txt` is held by its test. What can still keep a page out of an
answer, and isn't read by any test, is a snippet control:

```sh
grep -rlE 'nosnippet|max-snippet|noarchive|nocache' out --include='*.html' | head
grep -nE 'X-Robots-Tag' netlify.toml
```

Expect nothing from the first, and from the second the two `noindex` lines
for the copies and `/llms.txt`. A `nosnippet` or a `max-snippet:0`, in a
meta tag or a header, or `data-nosnippet` on an element, keeps the text out
of Google's AI answers while the page stays indexed. Bing says
`noarchive` keeps a page out of Copilot's answers and `nocache` limits it
to the title and snippet. Each of these can be a deliberate choice. One that
arrives in a diff with no sentence saying why is the finding.

**These stay as they are unless the owner decides otherwise.** Every
crawler is admitted, training crawlers included, in one group
(`operations.md` 7.3, `src/app/robots.ts`). That one is worth knowing before
anybody suggests blocking a training crawler: Google-Extended controls
grounding in the Gemini app as well as training, so blocking it to opt out
of training also takes the site out of those answers. The rules stay in one
`User-agent: *` group rather than one per crawler, because a named group
replaces the shared rules for that crawler, and a rule added to the shared
group later would quietly skip it. And there's no `Content-Usage` line while
that's an IETF draft nobody has been measured reading.

**Before a launch**, look at the host as well, since a host or CDN rule can
turn a crawler away from a page `robots.txt` admits:

```sh
for agent in Googlebot bingbot Applebot OAI-SearchBot ChatGPT-User GPTBot ClaudeBot Claude-SearchBot \
  Claude-User PerplexityBot Perplexity-User; do
  printf "%-18s" "$agent"
  for page in / /docs/getting-started/ /learn/make-a-budget/; do
    printf " %s" "$(curl -s -o /dev/null -w '%{http_code}' -A "Mozilla/5.0 (compatible; $agent)" "https://smpl.money$page")"
  done
  echo
done
curl -sI https://smpl.money/llms.txt | grep -iE '^(HTTP|content-type|x-robots-tag)'
```

The list is the search crawlers and the fetchers an assistant sends when a
person asks it to read a page (ChatGPT-User, Claude-User and
Perplexity-User), which a host can treat differently from the crawlers. The
three columns are the homepage, a docs page and a guide, since a host rule
can be scoped to a path as easily as to an agent. Every crawler should get
a 200 in each. This is the deployed `main`, not the branch, so a page the
branch adds answers 404 for every agent until it merges, which is the
branch and not the host. The finding is a code that differs from
Googlebot's on the same page. What it proves is that the host turns nobody
away by user agent or path, which is the outside view of the Netlify
setting `seo-review` asks the owner to confirm. A crawler that's turned
away is that setting, and it's the owner's (§9).

## 9. The owner's half

Most of what decides whether an engine names Simple Balance happens off this
site. In the largest study so far, Ahrefs' study of 75,000 brands, how often a brand
was mentioned on other sites tracked how often Google's AI Overviews named
it more closely than anything else measured. None of it can be done from
this repository, and none of it is an agent's to do in the owner's name.
Report it.

- **The two consoles.** Whether Google Search Console and Bing Webmaster
  Tools are set up, with the sitemap submitted (`operations.md` 8), is
  `seo-review`'s to report. Two of their reports matter here: Search Console's generative AI
  performance report, with its "Search generative AI" setting left on
  (included is the default); and Bing's AI Performance report, the one
  first-party view of which prompts cite the site and which pages they cite.
- **The repositories' descriptions, website fields and topics.** The
  descriptions are this skill's, since they're the product's description on
  the page that's linked to most, and the website field is that page's link
  back to this site. `seo-review` reads the application's website field as
  well (`operations.md` 8), and a run on its own reports both repositories'
  here too, so this report carries the owner's half whole. Read them, and
  leave setting them to the owner:

  ```sh
  gh repo view thtmnisamnstr/simple-balance --json description,homepageUrl,repositoryTopics
  gh repo view thtmnisamnstr/simple-balance-web --json description,homepageUrl,repositoryTopics
  ```

  Both descriptions should tell §4's story. One in other words, such as
  "personal accounting software", or a tagline the site has retired,
  describes a second product to an engine that reads both. Both website
  fields should be https://smpl.money, and an empty `homepageUrl` on either
  is an owner item in this report. The topics are what GitHub's search and
  the listings read, so they carry the homepage's category words, budget
  and spending tracker, and not only the bookkeeping ones.

- **Listings.** AlternativeTo, openalternative.co and Product Hunt are what
  engines cite for "an alternative to" prompts. awesome-selfhosted, under
  Money, Budgeting & Management, takes an entry once the first release is
  four months old, which is 3 December 2026, and its contributing rules
  refuse an entry an agent drafted or submitted, so the owner writes that
  one. A price or limit change makes every listing that states one stale.
- **The MCP Registry**, for the server at `https://app.smpl.money/mcp`. The
  entry comes from the application's repository.
- **Connecting Claude and ChatGPT**, and any other client the docs'
  configuration block is shaped for, to app.smpl.money at the snapshot's
  release, noting what each needed. Until somebody has, the docs name no
  assistant (§3, check 3), and "How do I connect Simple Balance to Claude or
  ChatGPT?" gets a generic answer. Once it's done, `/docs/agents-and-mcp/`
  names each client that was connected, with its own steps, and the
  homepage could say "such as Claude or ChatGPT", which is a proposal
  (§10). A release that changes the MCP server makes this due again.
- **The application's own pages**: titles that say what they are, a link
  back to smpl.money, a 404 for an address that isn't a page, and `noindex`
  on every screen, so the sign-in page doesn't answer for the product. Read
  what the host serves:

  ```sh
  curl -s https://app.smpl.money/robots.txt
  curl -sI https://app.smpl.money/ | grep -iE '^(HTTP|x-robots-tag)'
  curl -s https://app.smpl.money/ | grep -oE '<title>[^<]*</title>|https://smpl\.money[^"]*' | sort -u
  curl -s -o /dev/null -w '%{http_code}\n' https://app.smpl.money/not-a-page
  ```

  **A `Disallow` and a `noindex` together defeat each other.** A crawler
  that may not fetch a page never reads its `noindex`, so the `noindex`
  does nothing, and a search engine can still list the address, bare, from
  a link to it. So the fix is the other way round: allow crawling, and send
  `X-Robots-Tag: noindex` on every route, keeping the group that lets
  AdSense's crawler in. When this was written, in October 2026, the host
  disallowed every crawler but AdSense's, sent no `X-Robots-Tag`, and
  answered every address with a 200 and the same HTML, titled only "Simple
  Balance", with no link to smpl.money. Each of those is the application's
  repository's to fix.

- **A prompt panel, once a month.** The prompts in §3, asked in ChatGPT,
  Claude, Perplexity, Gemini, Copilot and Google's AI Mode, noting for each
  whether Simple Balance is named, whether smpl.money is cited, and whether
  what's said is true. It needs a person with accounts, and the site has no
  analytics by decision (`docs/roadmap.md` 3), so the panel and the two
  consoles are the whole measurement. A wrong answer that comes from a page
  here is a §3 finding on the next run, and one that comes from somewhere
  else is a listing to correct. An agent's own web search isn't the panel:
  it's one engine, signed out, on one day.

Under `merge-prep`, name only what the branch made due or stale: a new price
or limit (every listing), a new assistant capability (the registry entry,
and connecting the clients again), a new description (both repositories).
On its own, report the whole list, with what `gh` and `curl` read.

## 10. Fix here, propose there

**Fix in this branch:**

- A docs page or a guide whose opening doesn't answer, whose sentence is
  stronger than the policy, or which has no sentence for a prompt it owns.
  Write it in American English with contractions (`content.md` 1.5) and
  move its `updated` date. A sentence about what the product does is checked
  against the application's source at the snapshot's release, the way
  `content.md` 2.7 describes; if that check didn't run on a claim this
  wrote, say so in the report, as `merge-prep` §3 asks.
- `src/content/llms.ts`, for the summary or a note, because `/llms.txt` is
  generated from it.
- A structured-data field that reads a module follows that module. A new
  property describes something a reader can see (`content.md` 5.13).

**Propose, on the homepage and the pricing page.** Write the sentence and
where it would go, and leave the decision to the owner. Those pages are
written for a reader who has never used a finance product, under the bank
rule, and their words change only for a reason a reader could name
(`content.md` 1.3, 1.4 and 6.5). A sentence an engine would quote more
readily and a reader would read less easily is a bad trade there above all.
A wrong fact on either page, such as a price, a limit or a claim stronger
than the policy, is a fix rather than a proposal.

**A privacy-policy sentence goes to `legal-review`.** The policy is neither
a page fixed here nor one proposed, and its words are a statement about
somebody's data. So a sentence in it that fails §3's check 2, by not
standing alone, or check 5, by reading stronger lifted out than the policy
does as a whole, is rewritten by running `legal-review` for it. Report the
rewrite as copy, old beside new. "We don't sell your data or rent it" is
the case this was written for: it names no subject, and its qualifier sits
under Your rights.

**A finding a machine can decide becomes a test**, in the same change and
mutation-proved (`code/testing.md` 2.3), so the next run doesn't have to
find it again. The bank word list reaching `src/content/llms.ts` was the
first, in October 2026. Under `merge-prep`, that's its §4's rule as well.

**What moves an answer**, by Google's and Bing's own guidance and the
published studies:

- A sentence that answers in plain words, near the top.
- A figure with its source. In the GEO study (Aggarwal and others, 2024),
  adding citations, statistics and quotations raised a page's share of
  generative answers, and stuffing keywords lowered it. The learn guides'
  Sources lists are this. A docs page can cite its own limits.
- A heading that names the question, a table for a comparison, and an
  `updated` date that's accurate.

**What doesn't**, by the same evidence and Google's own guidance: breaking a
page into fragments for machines, rewriting in an "AI style", a page for
every phrasing of one query (Google treats that as scaled content), a
version of a page only bots see, and repeating the product's name in every
sentence. `llms-full.txt` and content negotiation were decided against, with
the measurements (`content.md` 5.15).

## 11. Report, and hand back

Lead with what's waiting on the owner, since `merge-prep` puts it at the top
of its own report.

- **Waiting on the owner**: the open items from §9, and every proposal for
  the homepage or the pricing page from §10, with its wording.
- **Scope**: the whole site or the pages the branch reached, and why.
- **The prompts**: for each one read, the page, the sentence an engine would
  quote, and whether it answers, stands alone, is true and current, and
  stays within the policy. What changed, if anything did.
- **The story**: the surfaces from §4 that disagreed, and where each was
  fixed.
- **The openings**: which were read, and each one rewritten, old beside new,
  so `merge-prep`'s report carries it as copy. The same for a policy
  sentence `legal-review` rewrote (§10).
- **The pricing FAQ**: each §3 prompt paired with the question that answers
  it, and any proposed question or answer (§6).
- **`/llms.txt` and the copies**: read, and what changed.
- **Crawlers and snippet controls**: the result, and the live check if it
  ran.
- **A rule that should change**: name it, for `guides-update`.

**When `merge-prep` called this, return to it** with the report, and the run
goes on to `optimize`. Don't run the full suite here: `merge-prep` §12 runs
`npm run verify` once, after every phase. After a fix, rebuild and run the
tests nearest it, such as
`npx vitest run tests/markdown.test.ts tests/structured-data.test.ts`.
Nothing here commits or pushes. `merge-prep` §13 is the one commit.

**On its own**, a run that changed nothing ends at its report. A run that
changed something runs `npm run verify` and then **`merge-prep`**, which is
how anything here gets committed and pushed.
