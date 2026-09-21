# Changelog

Written for somebody deciding whether a change matters to them, in the voice of
`docs/standards/writing.md` §The changelog. This site has no releases — every
visitor gets whatever is deployed — so this is a record for maintainers rather
than a contract with readers.

## Unreleased

### Changed

**The paid plan is $3 a month, or $30 a year.** It was $2 and $20. Six places a
reader can reach carried the old number — the price on the card, the line under
the three plans, the question about why it costs so little, the terms, the
description a search result shows, and the picture that appears when somebody
shares the link — and a price that moves in five of them is worse than a price
that moves in none.

The application has not published the new price yet. Until it does, the check
that holds every number here to what the product actually charges fails, and
that is the correct state rather than a thing to work around: this site may say
less than the product does and never more, and a page advertising a price
before billing collects it is the same error pointed the other way. Nothing
deploys while it is red.

**The homepage and the pricing page are written for somebody who has never
used a personal finance product.** They were not. The old copy opened on "Know
where your money is, and where it went" — which is, near enough, the headline
PocketSmith, Tiller, Quicken and Empower all already run — and then spent the
rest of the page in a vocabulary none of them use: "the numbers do not tie
out", "a register for every account", "every posting with the balance before
and after it", "AGPL-3.0, one machine and a PostgreSQL". The tab and the
search result read "Self-hosted double-entry bookkeeping", which is both of
the two words a general reader cannot parse, in the one string Google shows
them. A reader with no budgeting app and no server could not tell what this
was.

What replaced it leads with the one claim nobody else in the category can
make: **we never ask for your bank password.** Every hosted competitor
requires a bank login, roughly two in three people say they are uncomfortable
giving one to an app, and the products that do not ask are written for
developers. That is the whole position, and it is also why the page now says
out loud what it does not do — there is no connection to any bank, so the
reader's own action, downloading a file and dropping it in, is visible in the
hero. The previous lede said statements "file themselves", which reads as sync
to exactly the reader it was aimed at.

The product being described has not changed. `src/content/app-features.json`
and `src/content/app-facts.json` are byte-identical to what the application
publishes, and the site now covers sixteen of its seventeen features rather
than twelve — every tier A feature and, for the first time, all of tier B. The
two that moved the page most were already in the application's list and were
not on it: the list of everyone you have ever paid, which is how somebody
finds the subscription they forgot about, and being able to search what you
have recorded.

**The pricing page says "ads" before it says a price.** It used to disclose
them as "whether the page carries an ad" in the lede and "Advertising / Yes" in
the second row of a nineteen-row table. Finding out about ads in a money app
after signing up is the betrayal people write reviews about, so the word now
sits above the numbers, with what the ads are _not_ — never on the sign-in or
billing page, never chosen using your spending — immediately after it. The
comparison table leads with the only three lines that differ between plans and
says so; the FAQ asks "how do I cancel, and will you keep charging me?" instead
of "is anything in the product held back for Premium?", which nobody has ever
said out loud. There is a new strip under the prices answering what the reader
is risking.

**The pending control reads "Sign-ups open soon".** It read "Hosted version
soon", which named the thing accurately and in the product's vocabulary rather
than the reader's. It is now one string that `src/content/pricing.ts` imports
from `src/content/home.ts`, instead of two literals that happened to match.

**The social card and the page title changed with the copy**, since both
carried the old headline.

**Two section headings moved out of the markup and into
`src/content/home.ts`.** They were the only text on the homepage the
banned-words test could not see.

### Fixed

**Three screenshots were described as showing things they do not show.** The
import shot's alt text called it a populated import, listing the columns it
had worked out and the rows it was ready to add; the capture is the empty drop
target, before a file is chosen. The hero's said the overview reports dollars
and euros separately; it shows one euro account. The budgets shot's said it
compared what was planned against what was spent; it is the form for setting a
budget. All three were written from what the section argued rather than from
the picture, and alt text is what a reader who cannot see the image gets
_instead of_ it. The one that was right — "three for most, fifteen for the
local market" — was the one written with the file open.

**The homepage and pricing page overstated what an AI assistant is held to.**
Both said nothing happens until you approve it. That is true of a connection
limited to proposing, and the application's own reference says a write-scoped
one "covers every ledger operation, including direct and staged commits". The
pages now say what is actually true: when you connect an assistant you choose
what it is allowed to do.

**The pricing page said refusing ad consent means you see no ads.** The
application serves the slot regardless; consent decides whether the request is
personalized, not whether an ad appears. It also said flatly that there is no
tracking inside the product, two answers below its own description of the
advertising cookies.

**The social card advertised a tagline that appeared nowhere on the site.** It
carried its headline and subtitle as literals, and the copy moved four times
without it. It reads `src/content/home.ts` now, the way it already reads
`brand.css` for the palette.

**The privacy policy did not say what reaches Google, while the pricing page
told readers it did.** Shortening the ads answer moved that disclosure off the
pricing page and replaced it with "the privacy policy covers the rest,
including what does reach Google" — and the policy had never carried it. A cut
on one page deleted a disclosure from the site.

The policy now states it, matching what the application documents: the
publisher id and the address of the page, where a path can name a row, and the
limits — no account name, no balance, no figure, no email address as a
targeting parameter, and a referrer held to this origin. Two assertions in
`tests/legal.test.tsx` hold it, one of them checking the pricing page is not
promising a disclosure the policy lacks.

**Sterling in the blog and the docs, dollars everywhere else.** Every money
figure under `content/` was written in pounds while the pricing page, the
terms and the policy are in US dollars.

**A blog post kept "current account" because the phrase was wrapped across two
lines**, and the check added to catch exactly that reads Markdown line by
line. It sweeps each file a second time with the whitespace collapsed now, at
the cost of a line number on the wrapped case.

**The privacy policy, the terms and two docs pages were still British after
the marketing pages were fixed.** The first version of the rule scoped itself
to "the homepage and the pricing page", which left the rest of the site in the
other dialect: the policy said personalised, analyse and licence, and
`content/docs/accounts-and-transactions.md` said "a current account, a savings
account" on the page whose whole job is explaining what an account is. That is
the same two-surfaces-one-customer failure the Premium-and-plus rule exists
for.

It is checked now rather than remembered. `tests/copy.test.ts` sweeps both
marketing pages, both legal pages and every Markdown file under `content/`,
plus the declared locale and the em dash. The rule had argued this could not
be mechanised, on the grounds that a word list "would catch the spellings and
miss the register" — which is an argument for a word list on the spellings.
The check found one the hand pass had missed on its first run.

**The copy was written in British English for an American reader.** The site
prices in US dollars and the application's own screens say _Checking_, while
the page said "current account", along with "recognises", "totalled",
"personalised" and "cancelling" — and `layout.tsx` told every crawler and link
preview the page was `en_GB`. To an American reader a current account is not
the thing they have, and it disagreed with the product's own interface.

**It also read as machine-written.** Seventeen em dashes in 2,349 words, four
semicolons, eleven mid-sentence colons, and not one contraction anywhere. Em
dashes and semicolons are now zero, and the copy uses "isn't", "don't" and
"that's" where a person would. Not everywhere: uniform contraction is as
mechanical as none, and "you have" is not always "you've" — a blind pass
turned the headline "See everything you have" into "See everything you've",
which is the kind of thing that ships.

**Four claims in the new copy were wrong, and an audit against the
application caught them before they shipped.** Each was checked against the
application's own published documents rather than against memory:

- The pricing page said an account you close "still counts, because its
  history stays in your record and in your totals". The conclusion was right
  and the reason was backwards: closing an account settles it to zero and
  takes it _out_ of your totals. It still counts toward the plan limit, which
  is what the row is about.
- The ads answer said "nothing in your ledger reaches Google". The
  application's own monetization document says the opposite in as many words:
  what reaches Google is the publisher id and the address of the page — and
  this application's addresses carry record ids. The page now says so, and
  names it as the plainest reason to prefer a plan without ads.
- The homepage said "every number on every page opens". The drill-down is an
  account's register, not every figure on every page, and the section's own
  screenshot is the reports page — where the figures are text.
- The homepage's privacy list promised "nothing watches how you use it" in a
  section whose stated contract is that every sentence is true of the hosted
  version too. On the free plan the ads bring Google's script with them. The
  line now says that, which is both honest and a better argument for paying.

**Two checks could not fail.** The pricing page's structured-data test
searched the whole built file for each FAQ question — and the questions are
_inside_ the JSON-LD block it was validating against, so deleting every
visible answer kept it green; it never looked at an answer at all. It strips
the script tags first now and checks both halves. And the security-header test
asserted four of the six headers `operations.md` 3.1 names, while the coverage
table credited it with the whole rule: `X-Frame-Options` and
`Permissions-Policy` could both be deleted without a failure.

**Only six of twenty-three pages advertised the feeds.** Next replaces the
`alternates` metadata field rather than merging it, so every route that
declared its own canonical silently dropped the three feed links the root
layout sets — including `/blog/`, which is the one page a feed reader would
think to look at. One route had re-declared them by hand, which is what a
patch to the symptom looks like. There is a single `feedAlternates` helper
now, every route uses it, all twenty-three pages carry the links, and the test
checks the population rather than the one page where the bug happened to be
invisible.

**The feed tests would have started failing on correct code at the
twenty-first post.** They asserted the item count against every post ever
written, while the feeds are capped at twenty. They compare against the capped
list now — and because that makes both sides move together, a second check
recounts the cap itself against the number the guide states.

**Four classes in the markup styled nothing.** Each sat on an element that
earns its place through `aria-label` or `aria-labelledby`, so the class read
as styling and did nothing; that shape survives refactors precisely because
removing it looks risky. The dead-CSS sweep only ever asked the other
question — whether a rule is reachable — and now asks both.

**In-page anchors landed underneath the sticky header.** Every heading link in
the docs scrolled its target out of sight behind 65 pixels of chrome. There was
no `scroll-padding-top` anywhere; there is one now, derived from the same
`--header-h` as the header itself.

**Every page scrolled sideways on a phone.** `web.md` said the comparison
table scrolls inside its own container so the page does not, and the page did
anyway — at 390px it was 453px wide, and 320px was worse. There were four
causes and none of them was the table:

- the header is a flex row, and a flex row that cannot wrap does not clip, it
  pushes. The brand, two links and the pending label came to 453px. It wraps
  below `34rem` now;
- every tick in the pricing table carries a `.visually-hidden` word, and that
  class is `position: absolute`. Those words escaped the table's own scroll
  container, because it was unpositioned, and sat at x=452 inside a table that
  was itself being clipped correctly;
- `.code-tabs` is a grid, and a grid track will not shrink below its content's
  intrinsic width, so one unbreakable line of a code sample made a docs page
  482px wide;
- the privacy policy has to print a forty-six character URL with no space in
  it, which is wider than a 320px screen.

`tests/a11y.test.ts` now checks every emitted page at 320px and 390px, which
is WCAG 2.1 AA reflow (1.4.10) — the criterion axe has no rule for, and the
one failure a clean axe report is most likely to be hiding. The failure names
the element that actually extends the document rather than the widest thing
past the edge, because those were not the same element in three of the four
cases.

**Four tests were coupled to the words on the page rather than to what they
were checking.** `tests/app-facts.test.ts` found the account-limit row by its
visible label, so rewording a heading for a general reader broke the check
that holds this site's numbers against the application's contract. Comparison
rows carry an `id` now, and the tests hold that. The same applies to the
screenshot disclosure, which was matched against the phrase "demo ledger" —
the product's words for it, not a reader's — and to the pricing FAQ, which
required questions containing "archived" and "self-hosting".

**The monospace font stack was written out three times** — the terminal,
inline code and the code-block language label — and is one `--mono`
declaration now. Three copies of a value are three chances for it to disagree
with itself, which is the argument this repository already makes for the
pending label and the header height.

Checking it also turned up the thing `web.md` 3.2 was silent on: the **sans**
stack is byte-identical to the application's, verified against
`src/client/styles.css` over the network, but the **mono** stacks differ and
should. The app has one mono rule, an 11px internal label; this site renders
code blocks, and `ui-monospace` has no Windows implementation in several
browsers, so dropping `Consolas` would land a code block on Courier New. The
rule now records the divergence, the reason, and what would end it — the
application rendering code to a user.

**`public/og.png` was a 126 KB truecolour PNG** of flat colour, one gradient
wash and some text. It is a palette PNG now, at 57 KB, and the wash was looked
at rather than assumed — it does not band. It stays a PNG rather than becoming
WebP because the only things that fetch it are link-preview scrapers, whose
format support this repository cannot test.

**`docs/standards/content.md` 4.1 described two contact addresses.** There has
been one since the second was removed, and the rule still argued for the pair.

**`operations.md` 6.2 said one dependency was pre-1.0 and that every other was
at a stable major.** Three are: `rehype-pretty-code`, which ships, and `sharp`
and `@xmldom/xmldom`, which do not. The two that arrived after the rule was
written were never weighed, because the count was prose. It is derived from
`package.json` now and `tests/repo-references.test.ts` fails when a `0.x`
dependency is unnamed — so adding one costs a sentence about what breaks if it
breaks.

**Three documents still pointed at `scripts/capture-screenshots.mjs`**, which
was deleted when the application took over publishing its own screenshots:
`web.md` 5.1, `operations.md` 6.3 and the comment in `netlify.toml` explaining
why native dependencies are safe there. The reasoning survived the script; the
reference did not.

**Two "what is checked" tables had drifted from the rules they index.**
`operations.md` listed dependencies as sections 5.1–5.3 and DNS as 6 — both
had moved when a section was inserted above them — and still called the
pre-1.0 rule `human` after a test started holding it. It was also missing the
weight budget and CI entirely. `web.md`'s table credited 6.2 for link text,
which is 6.4, and had no row for third-party branding.

**The rule that the site must never imply a bank connection is a test now**,
not a note asking someone to remember. It covers the pricing page as well as
the homepage, and it is narrow on purpose: banning "connect" and "sync"
outright fires on the copy that states the position — "nothing to connect and
nothing to break", "you can connect an AI assistant" — so it matches only the
constructions where the product is the thing doing the fetching. Proved
against four sentences a competitor's site would carry happily.

**`docs/roadmap.md` told a future reader to capture a screenshot here.** That
has not been possible since the application took over publishing them; the
item now says who captures it and which procedure brings it across.

**Nothing checked the citations in the skills.** `update-dependencies` and
`guides-update` both pointed at `operations.md` 5.2 and 5.3, which became 6.2
and 6.3 when a section was inserted above them, and `optimize` named a script
that had been deleted. `tests/standards-citations.test.ts` read `docs/` and
`AGENTS.md` and stopped there, so thirty-five section citations and every file
path in `.claude/` were unchecked — in the documents most likely to be read by
somebody about to act on them.

It reads the skills now, and its pattern accepts a full path as well as a bare
filename, which is the form the skills mostly use: the citations were invisible
to it twice over. The population check names both halves separately, so losing
`.claude/` again fails loudly instead of quietly returning to the old scope.

**Five subsections of the content standard sat after the section that followed
them.** They were appended to the file and landed below `## 6`, so `5.9` to
`5.13` were orphaned. Every one read correctly on its own and the document was
wrong. `tests/guide-structure.test.ts` now refuses it, because appending is
both the natural way to add a rule and the natural way to get this wrong.

**`AGENTS.md` said there were five skills when there were six**, and did not
list the sixth.

**`npm start` fetched an unpinned `serve` through `npx`.** It is a
devDependency now.

### Added

**Two rules earned this week.** `content.md` 2.4 — a marketing claim is never
stronger than the privacy policy it links to, after the pricing page rounded
the ad disclosure down to "nothing about you attached". And
`code/testing.md` 2.6 — a check finds its subject by identity, not by what it
is called, after four tests broke on a copy rewrite that changed no behaviour
any of them was testing. One of those four was the check that holds this
site's prices to the application's contract, and it failed because a heading
was reworded.

**A second, narrower copy of every screenshot, and a `sizes` that matches the
CSS.** The application publishes them at 1600px, which a desktop genuinely
uses — a full-span shot is 1024 CSS pixels there, wanting 2048 at 2x, so 1600
was already a compromise downwards. A phone renders the same picture at about
356, so a 3x screen was being handed four and a half times what it could show,
on the connection least able to afford it. Measured across the homepage: **300
KB of screenshots before, 187 KB after** on a phone, and 237 KB on a desktop
at 2x, where the full-span shots still take the 1600px file because they can
use it.

Re-encoding was considered and rejected: at 1600px the published files are
already near-optimal, and dropping the quality far enough to matter costs 5%
for a lossy-on-lossy pass. The size was the lever, not the compression.

**A screenshot of the payee list**, on the section about the renewal you
forgot about. It is the one claim on the page a reader has most reason to
doubt — every competitor sells subscription-spotting, and most of them cancel
things for you, which this does not — so the evidence is worth the 53 KB.
Pulled from the application's published kit, like the other five.

**A pricing page.** Two plans and a third column for self-hosting, a
feature-by-feature comparison, and eight questions a plan with a limit
actually raises. Every figure is what the application enforces: three accounts
free, unlimited on Premium at $20 a year or $2 a month, and nothing else held
back from either. Self-hosting is on the page because a product that tells you
how to avoid paying it is making an honest case for paying it.

**A privacy policy and terms of use.** Written for this product rather than
from a template — the actual processors, the actual lawful bases, the actual
retention — and carrying the three disclosures Google requires of a site
serving AdSense. The privacy policy is what unblocks the AdSense application.

**Three more documentation pages** on entries, budgets and agents, taking the
docs to seven across four sections. **Generated cover images** for posts, in
the product's palette. **Tag descriptions**, **search result snippets** with
the match highlighted, and a **weight budget** on what the build ships.

**A social preview card.** A link to this site pasted anywhere used to render a
blank rectangle. `scripts/build-og-image.mjs` draws one at build time — the
alternative renders per request, which is a server, which is the thing the
static export exists to avoid.

**Continuous integration.** `npm run verify` and an internal link check on
every push and pull request, with Node taken from `.nvmrc` so CI, Netlify and a
developer using nvm cannot drift apart.

**An accessibility audit in the test suite.** axe against every page the build
emits, in both themes, in a real browser, as part of `npm run verify`. It is the only test
here that runs a browser and it earns it: contrast and computed styles cannot
be checked in jsdom, and a token change is exactly the sort of edit nobody
renders before committing.

**A roadmap and an AdSense guide.** `docs/roadmap.md` lists every outstanding
item with why it is not done and what done looks like; `docs/adsense.md` is the
full procedure, including why this site's `ads.txt` authorises revenue earned
on a different domain.

**The site, at smpl.money.** A single marketing page: what the product is, four
problems it addresses, screenshots of the running application, what
self-hosting means, and what an agent can and cannot do with the ledger. The
sign-in control reads "Coming soon" because the application is not deployed
yet, and it is a word rather than a disabled button so that nothing implies a
reader could enable it.

**Screenshots captured from a real instance.** `scripts/capture-screenshots.mjs`
seeds a ledger, drives the application with Playwright, and writes a WebP per
page per theme. Ten files, about 500 KB in total, chosen by the browser through
`<picture>` so a reader in dark mode never downloads the light ones. The page
says once, plainly, that the ledger in them is demo data.

**Three feeds.** RSS 2.0, Atom 1.0 and JSON Feed 1.1, each carrying the twenty
most recent posts as summaries rather than full bodies, and advertised in the
head of every page so a reader pointed anywhere finds them.

**Everything a post is normally expected to have.** Tag archives, author pages,
pagination, a by-year archive, previous and next, related posts ranked by
shared tags and series, multi-part series with their own navigation, share
links that are plain anchors rather than third-party widgets, and
`BlogPosting` structured data naming a real person.

**Everything a documentation page is normally expected to have.** Search across
every page — an index built at compile time, fetched on first keystroke, with
`/` to focus and Escape to clear — plus breadcrumbs, an edit-this-page link,
previous and next, a contents list that tracks the heading you are reading, and
copy buttons on every code block.

**Markdown that supports what people actually write.** Tables, footnotes, task
lists, real quotation marks, headings that link to themselves, syntax
highlighting rendered at build time in both themes from one copy of the markup,
callouts, figures with captions, and side-by-side alternatives for
instructions that differ by tool.

**A blog, built and not announced.** Markdown in `content/blog/` with the
conventional frontmatter — multiple authors with photos, tags, featured posts,
cover images, drafts, canonical URLs. Featured posts get their own block at the
top of the index.

**Documentation, built and not announced.** Markdown in `content/docs/`, with a
sidebar grouped and ordered by `content/docs/_sections.json`, previous and next
links, and a table of contents on longer pages.

Both sections are reachable by URL and linked from nowhere. One flag decides the
link, the `noindex` and the sitemap together, so neither can be half-launched.

**Markdown that supports what people actually write.** GitHub tables, footnotes
and task lists; real quotation marks and dashes; headings that link to
themselves; syntax highlighting rendered at build time in both light and dark
from one copy of the markup. Two components are available inside Markdown —
callouts and screenshots — and both are the same implementations the marketing
page uses.

**The brand contract.** `src/styles/brand.css` carries the application's
palette, the two theme blocks holding one key set, and a test that fails if a
colour appears anywhere else. A marketing page that is a slightly different
green from the product reads as a different company.

**Standards and skills.** `docs/standards/` for the design, content, operations
and source; `.claude/skills/` for the five procedures that repeat — preparing a
branch for merge, updating dependencies, bringing the guides back to true,
reviewing the design, and re-capturing screenshots.
