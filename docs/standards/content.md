# Content

The words on this site, and the pipeline behind `/blog` and `/docs`.

## 1. Voice

### 1.1 No marketing vocabulary

**Binding.** Seamless, effortless, revolutionary, game-changing, cutting-edge,
best-in-class, unlock, empower, leverage, supercharge, delight, magical, robust,
blazing, 10x, next-generation, synergy, paradigm.

Each of those asks the reader to feel something instead of telling them
something. This product is a ledger; it is bought on trust, and trust is not
built by a page that sounds like every other page.

_Checked by:_ `tests/copy.test.ts`, over every string in the content module.

### 1.2 The page never claims the product is simple, easy or fast

**Binding.** Including "simply" and "quickly". The product is _called_ Simple
Balance, and that is the only place the word appears.

A claim of simplicity is the reader's to make. A page that makes it for them is
arguing with somebody who has not tried it yet.

_Checked by:_ `tests/copy.test.ts`, which strips the product name and any URL
before testing — the naive version reported the repository URL and the word in
the product's own name.

### 1.3 Headings are sentences

**House.** Sentence case, not Title Case. "Budgets that carry", not "Budgets
That Carry".

_Checked by:_ `tests/copy.test.ts`, which counts capitalised words past the
first.

### 1.4 The reader has never used a personal finance product

**Binding.** Every word on the homepage and the pricing page is one a reader
with about a ninth-grade education understands without looking it up. No
accounting vocabulary, no operations vocabulary, and no vocabulary that
presumes a budgeting app they already gave up on.

Banned from those two pages unless the sentence glosses them on the spot:
double-entry, bookkeeping, ledger, register, posting, entry, leg, reconcile,
tie out, trial balance, balance sheet, cash flow, net worth, self-host,
deployment, server, PostgreSQL, Docker, AGPL, open source, repository, CSV,
MCP, API, token, scope, telemetry, staged, commit, atomically.

The copy this replaced failed in both directions at once. It opened on "Know
where your money is, and where it went" — the line PocketSmith, Tiller,
Quicken and Empower all already run, so it identified the product as one of a
crowd — and then spent the rest of the page in a vocabulary none of them use:
"the numbers do not tie out", "a register for every account", "every posting
with the balance before and after it", "AGPL-3.0, one machine and a
PostgreSQL". A reader who has no budgeting app and no server could not tell
what this was, and the tab and the search result said "Self-hosted double-entry
bookkeeping" — both of the two words they cannot parse, in the one string
Google shows them.

**The plain word is not the vague word.** "What you own minus what you owe" is
longer than "net worth" and says more. Where the accurate word is also the
plain one, it stays.

_Checked by:_ `human`. A word list in a test would catch the spellings and
miss the sentence, and the failure is a register rather than a vocabulary —
the previous copy contained no banned word at all.

### 1.5 The page describes how data gets in today, and promises nothing about tomorrow

**Binding, and contingent.** There is no automatic sync **today**: no bank
login, nothing running in the background, nothing that goes stale without
saying so. So these are banned while that holds: "syncs", "connects to your
bank", "link your accounts", "automatically updated", "kept up to date", "real
time", "live balances", "set it and forget it".

A reader arriving from any competitor assumes otherwise, because every hosted
competitor works that way. The lede once said statements "file themselves",
which is the sentence somebody leaving a dead budgeting app reads as sync, and
the product disproves it on the first afternoon.

**The opposite mistake cost more.** The page then spent a while _leading_ on
"we never ask for your bank password" — true, popular, and a promise about the
future made by a page that does not get to decide the future. Pulling
transactions on a schedule is a thing this product may do, and when it does,
a positioning built on the refusal has to be abandoned along with the hero,
the tagline, the social card, a comparison row and two FAQ answers that were
all written around it. It was.

So: describe the mechanism, never promise its absence. **The trigger to
revisit** is the product gaining a scheduled pull — at which point this rule
inverts rather than disappears, because the page will then have to stop
implying there is no connection.

This is 2.1 applied to the one claim this page is most likely to make by
accident, which is why it is written down separately.

**Unlike 1.4, a word list is the right check here.** 1.4 is about register and
a list would catch the spellings and miss the sentence; this is about specific
affirmative constructions whose presence _is_ the defect.

The check is narrow, and had to be: the obvious spelling bans "connect" and
"sync", and fires on the copy that states the position — "nothing to connect
and nothing to break", "no connection to any bank to maintain", "you can
connect an AI assistant". Those are the denial and a different subject.
`code/testing.md` 2.5.

_Checked by:_ `tests/copy.test.ts`, over the homepage **and** the pricing
page, mutation-proved on four sentences a competitor's site would carry
happily.

### 1.6 American English, and contractions

**Binding.** Everything a reader sees is written in American English, with
contractions where somebody talking would use them. That is the homepage, the
pricing page, the privacy policy, the terms, and every Markdown file under
`content/`.

The site prices in US dollars and the application's own screens say
**Checking**. The copy said "current account", "recognises", "totalled",
"personalised", "analyse", "licence" and "cancelling", and `layout.tsx` told
every crawler and link preview `locale: "en_GB"`. None of that is a style
preference: to an American reader a current account is not the thing they
have, and `content/docs/accounts-and-transactions.md` used the phrase on the
page whose job is explaining what an account _is_ — disagreeing with the
product's own interface.

**The scope was wrong the first time this rule was written.** It said "the
homepage and the pricing page", which left the legal pages and the docs in
British English on the same site, and that is 6.3's failure again: two
surfaces using different words at one customer.

**Contractions are the register, not a lapse.** "It is not", "do not",
"cannot" and "that is" read as written-down English; "isn't", "don't",
"can't" and "that's" read as somebody talking. Formal prose is right for
these guides and wrong for a page trying to sound like a person.

Not every instance — uniform contraction is as mechanical as none. And
**"you have" is not always "you've"**: the hero reads "See everything you
have", where _have_ is the verb rather than an auxiliary, and a blind
find-and-replace turned it into "See everything you've."

**Em dashes belong in these guides and not in the copy.** The rewrite carried
seventeen in 2,349 words, which is the loudest tell there is. The count is
the point rather than the character: one is punctuation, seventeen is a
voice. Guides are prose for somebody reading closely; copy is for somebody
skimming.

_Checked by:_ `tests/copy.test.ts` for the spellings, the `locale`, and the
em dash. The **register** is `human`, for the same reason 1.4 is.

**The first draft of this rule claimed none of it could be mechanised**, on
the grounds that "a word list would catch the spellings and miss the
register". That is an argument for a word list on the spellings, not against
one — and the check found a spelling the hand pass had missed on its first
run.

## 2. Claims

### 2.1 Every claim is true of the shipped application

**Binding.** A marketing page for a ledger that overstates what the ledger does
is the one kind of copy that loses a reader permanently, because the product
they then use disproves it.

When a feature is not built, the page says so or says nothing. It does not
describe a plan in the present tense.

_Checked by:_ `human`. Nothing here can read the application — it is a
different repository — so this is the rule that most needs a person, and the
`merge-prep` skill asks for it by name.

### 2.2 Invented figures say so

**Binding.** See `web.md` 5.5. The screenshots show a seeded ledger and the
page discloses it.

_Checked by:_ `tests/home-page.test.tsx`.

### 2.3 Nothing links to what does not exist

**Binding.** No link to `app.smpl.money` while the app is not deployed, and no
empty or `#` hrefs.

_Checked by:_ `tests/copy.test.ts` and `tests/home-page.test.tsx`.

### 2.4 The marketing pages and the privacy policy say the same thing

**Binding.** A claim on the homepage or the pricing page is no stronger than
the policy it links to.

The policy is careful about advertising, because it has to be: a
non-personalised ad is still chosen from the page and the reader's rough
location, and it still sets a cookie. A pricing page is where the temptation
is to round that down, and it did — the answer to "what are the ads like?"
said they were "requested without anything about you attached", which the
document one click away contradicts in its own words. The homepage did the
same to logging, promising that "nothing counts your clicks" beside a policy
that discloses server logs with request paths.

This is 6.3's failure — two surfaces using different words at one customer —
except that the customer who notices is reading a privacy policy, which is the
worst possible moment to be caught rounding down. Neither claim was a lie
anybody wrote on purpose; both were a long document summarised from memory.

**The obvious alternative is to trust that whoever writes the copy has read
the policy.** They had. The contradiction was two levels into a sub-clause
about frequency capping, and the summary was the sentence any honest person
would write from a general memory of it.

_Checked by:_ `tests/legal.test.tsx`, which holds the ad answer and the
homepage's privacy points against what the policy supports — the claim, not
the prose.

## 3. Structure

### 3.1 Copy lives in a module, not in markup

**House.** The homepage's text is in `src/content/home.ts`.

Two reasons, both about keeping it honest: it can be read by a test, and it can
be reviewed as prose in one file without JSX around it. A claim about the
product is something somebody has to be able to check, and claims scattered
through markup do not get checked.

_Checked by:_ `tests/copy.test.ts` exists at all, which is only possible
because of this.

### 3.2 Section order is an argument

**House.** The reader arrives not knowing what this is: the hero says what it
is, the problems say why they would want it, the showcase shows it, the
features say what else is in the box, privacy answers the question a finance
product always raises, and agents is the thing nothing else does.

The privacy section is stated as a promise to the reader — "we never ask for
your bank password" — rather than as a property of the software. "This is
software you run, not a service you join" was the previous opening, and it
asks the reader to translate an architecture into a reason to feel safe, which
is the translation this reader cannot do.

Reordering is fine. Reordering without a reason is what this rule is about.

## 4. Contact

### 4.1 One address, and therefore no label

**House.** `info@smpl.money`, and nothing else.

There were two — a second for help with a deployment — on the argument that an
unlabelled pair is how a support question reaches a mailbox nobody reads on a
weekday. The pair was the worse problem: publishing two asks the reader to
classify their own message before they have written it, and a marketing site
is where somebody arrives _before_ they are a customer with a support
question, so the split was sorting mail nobody had sent. A single address
needs no label, and a lone `mailto:` under a heading reading "General" is a
category with nothing to distinguish it from.

_Checked by:_ `tests/copy.test.ts` and `tests/home-page.test.tsx`.

## 5. The content pipeline

`/blog` and `/docs` are Markdown files under `content/`, read at build time by
`src/content/collections/index.ts` and rendered by this site's own layouts.

### 5.1 No docs framework, and when to revisit

**Contested, decided for now.** Fumadocs, Starlight and Docusaurus each do this
better than a few hundred lines can — generated sidebars, full-text search,
versioning.

Each also brings its own theme system, and this site's whole design argument is
that one token set is shared with the application. Adopting one means either
overriding its theme until nothing of it is left, or letting the docs look like
a different product from the page that links to them.

**The trigger to revisit:** when search becomes the way people find a doc, or
when there are enough pages that a hand-ordered sidebar is a chore. The escape
hatch is deliberate — these are plain Markdown files with conventional
frontmatter, which is exactly what all three of those frameworks read.

### 5.2 Frontmatter is the conventional vocabulary

**House.** `title`, `description`, `date`, `updated`, `authors`, `tags`,
`featured`, `image`, `imageAlt`, `section`, `order`, `draft`, `slug`,
`canonical`.

Deliberately the set somebody arriving from Jekyll, Hugo or Astro already
expects, so a writer does not learn a vocabulary invented here. An unknown key
is kept rather than rejected: a key this site does not use yet is not an error,
and failing a build over one would make adding a feature a two-step change.

`title` and `description` are required everywhere; `date` is required for a
post. A missing one fails the build, because the alternative is a published
page with an empty `<title>` discovered by a reader.

_Checked by:_ `tests/content.test.ts`.

### 5.3 A date is a calendar day

**Binding.** Stored and rendered as `YYYY-MM-DD`, formatted in UTC.

`gray-matter` returns a `Date` object for an unquoted `2026-09-17`, because
that is what YAML says it is. Interpolated into a string it becomes
"Wed Sep 17 2026 …" and then an Invalid Date — which failed a build here, and
would otherwise have rendered the day before for every reader west of
Greenwich. Normalising at the parser means every consumer gets one shape
however the file was written.

_Checked by:_ `tests/content.test.ts`.

### 5.4 Authors are keys, not names

**Binding.** A post names authors by key into `src/content/authors.ts`. A key
that does not exist fails the build.

Two posts spelling one person's name differently is the ordinary failure, and
it shows up as a missing photo on one of them. A typo that fails a build is a
typo nobody ships.

Multiple authors are the normal case: every one is rendered with their photo,
not "and 2 others". A co-author visible only in a tooltip was not credited.

_Checked by:_ `tests/content.test.ts`.

### 5.5 Sidebar order is one file

**House.** `content/docs/_sections.json` names the group order; each page's
`order` places it within its group.

Groups need an order that is not alphabetical — "Install" belongs above
"Reference" — and there is nowhere in per-page frontmatter to say so without
repeating it on every page in the group and letting two disagree. A section
missing from the file sorts last, so adding a group is a one-file change.

A page with no `order` sorts after every page that has one, rather than
alphabetically among them. That is what makes adding `order: 2` to one page do
the obvious thing without renumbering its neighbours.

_Checked by:_ `tests/content.test.ts`.

### 5.6 A draft is absent from production

**House.** `draft: true` builds in development and is excluded from the
production export entirely, so an unfinished page cannot be reached by guessing
its URL on the live site.

_Checked by:_ `human`. The production build is where it would show, and the
test tier builds in production mode — worth a case the first time a draft
exists.

### 5.7 The table of contents ignores fenced code

**Binding.** A `## ` inside a code fence is a shell comment, not a heading.

This is the bug every hand-rolled contents list has.

_Checked by:_ `tests/content.test.ts`.

### 5.8 Heading ids match the renderer's

**Binding.** `slugify` in the collections module has to agree with
`rehype-slug`, or every anchor in a contents list points at nothing.

That coupling is the fragile part of this pipeline, and it is pinned with cases
carrying punctuation, inline code and formatting.

_Checked by:_ `tests/content.test.ts`.

### 5.9 Three feeds, not one

**House.** RSS 2.0, Atom 1.0 and JSON Feed 1.1, all generated from one module.

They are read by different things and cost almost nothing together: RSS is
what most readers still take, Atom is what the strict ones prefer, and JSON
Feed is what anything written this decade would rather parse. A blog that
publishes only RSS is choosing for its readers.

Each carries the summary rather than the full body. A feed that ships the whole
post is a second copy of the site to keep correct, and the point of the link is
that the post is at the other end of it. Twenty items, because a feed carrying
everything ever written grows without bound and is re-downloaded in full on
every poll.

**Advertised on every page, and that took a helper.** Next _replaces_
`alternates` rather than merging it, so the root layout's declaration was lost
on every route that set its own canonical — ten of them, including `/blog/`,
which is the one page a feed reader would think to look at. One route had
re-declared the three by hand, which is what a patch to the symptom looks
like. `feedAlternates` in `src/lib/feed.ts` is the single place that knows,
and the count is recounted rather than written down here twice.

_Checked by:_ `tests/feeds.test.ts`, which **parses** the XML rather than
matching strings — an unescaped ampersand in a title is the classic break and a
substring check sails straight past it. It also holds every emitted page to
advertising all three, and recounts the twenty above against `FEED_ITEMS`:
the item assertions compare the feed to `feedPosts()`, so both sides move
together and the cap itself would otherwise go unchecked.

### 5.10 Search is in the browser, until it cannot be

**Contested, decided.** The index is a JSON file built at compile time and
fetched on first keystroke, not on page load. Matching substrings over a few
kilobytes is exact, instant, private and works offline.

Algolia and its equivalents are the right answer at a scale this is nowhere
near, and they cost a vendor, an API key in the client, and a crawl that can
be stale.

**The trigger to revisit:** when the index passes a few hundred kilobytes, or
when readers need ranking better than "title beats description beats body".
Ranking here is deliberately crude and explainable — nobody should have to
guess why a result is where it is.

**Identifiers survive the flattening.** The first version stripped Markdown
punctuation including `_` and `-`, which turned `AUTH_SECRET` into
"authsecret" and made every environment variable unsearchable — the thing
people search a docs site for most.

_Checked by:_ `tests/docs-features.test.ts`.

### 5.11 Tags, authors and series are derived, never listed

**House.** Tag pages exist for the tags in use; author pages exist for authors
who have published. Neither is a list somebody maintains.

An author page with no posts is a dead end, and the registry is allowed to hold
somebody before their first post lands — so the pages come from the posts, not
from the registry.

Tags are matched by slug, so "Bookkeeping" and "bookkeeping" are one tag. Two
spellings splitting an archive in half is the ordinary failure and neither half
has everything.

_Checked by:_ `tests/blog-features.test.ts`.

### 5.12 Related posts are explainable

**House.** Ranked by shared tags, then series, then recency. Deliberately not a
similarity model: on a blog with a dozen posts "shares two tags" is a better
signal than anything derived from the prose, and it is one a writer controls by
tagging.

_Checked by:_ `tests/blog-features.test.ts`.

### 5.13 Structured data describes what is visible

**Binding.** `BlogPosting`, `TechArticle`, `BreadcrumbList`, `WebSite` and
`SoftwareApplication`, and every field must be true of something a reader can
see on the page.

Google's structured-data policy treats markup describing invisible content as
spam, and it is also simply lying. So there is no `aggregateRating`, no
invented `wordCount`, and no author whose name is not in the byline.

The JSON is emitted with `<` escaped, because a literal `</script>` inside a
string ends the element early and turns the rest of the payload into markup.

_Checked by:_ `tests/docs-features.test.ts`.

## 6. Pricing and legal copy

### 6.1 A price claim is checked against the application

**Binding.** Every number on the pricing page is true of what the application
enforces: three accounts on the free plan, unlimited on Premium, $20 a year or
$2 a month, and no feature held back from either.

Nothing here can read the application — it is a different repository — so
`tests/pricing.test.tsx` holds what it can: that the limit agrees with itself
across the tier summary, the comparison table and the FAQ, and that no row
claims a feature Free lacks and Premium has. A pricing page that overstates is
the one page whose error the customer discovers personally.

_Checked by:_ `tests/pricing.test.tsx` for internal agreement; `human` for
agreement with the application.

### 6.2 Self-hosting is a column on the pricing page

**House.** Most pricing pages would leave it out. It is the reason to believe
the other two columns: a product that tells you how to avoid paying it is a
product making an honest case for paying it.

### 6.3 The paid tier is "Premium" here and `plus` on the wire

**Binding.** The application's `plans` enum, session payload and `whoami` all
carry `plus`. The word a person reads is **Premium**, in both repositories.

Renaming the wire value would break every client that has seen it; renaming
the label would not. What must never happen is the two surfaces using
different words at a customer — which is what would have shipped, because the
application had "Plus" in exactly one string.

_Checked by:_ `human`, across two repositories. Worth knowing when either
changes.

### 6.4 A legal page describes this product, not a template

**Binding.** The privacy policy names the actual processors — Stripe, Google,
Netlify — the actual lawful bases, and the actual retention. A generic policy
is not merely unhelpful: it is a false statement about what happens to
somebody's data.

It also carries the three disclosures Google requires of a site serving
AdSense — third-party cookies, the vendors that set them, and how to opt out —
because missing any one is a breach whose penalty is suspension.

_Checked by:_ `tests/legal.test.tsx`, which asserts the AdSense disclosures,
that every processor is named, the GDPR and CCPA rights, and that the terms
do not purport to restrict the AGPL.

### 6.5 The copy is rewritten only where the product's description moved

**Binding.** `src/content/copy-source.json` holds the application's
description of each feature as it was when this site's words were written,
and `tests/copy-provenance.test.ts` fails for any feature whose description
has since changed — naming it, and showing both sentences.

**This is what keeps the site's voice steady.** Without it every sync is an
open invitation to rewrite the homepage, and the page drifts release to
release for no reason a reader could name. With it, a release that changes
three descriptions prompts three rewrites and the other fourteen keep wording
somebody already agreed was good.

Three things fail that test, and each is a decision rather than a chore: a
**reworded** description, an **added** feature (taking it or declining it must
be deliberate; declining is fine), and a **re-tiered** one, because tier
decides where a feature belongs on the page and a promotion the site ignores
is the application saying "this matters most" while the page buries it.

Accepting is explicit — `npm run copy:accept` — and is done **after** changing
the copy, never instead of it. Accepting without rewriting turns the test
green and leaves the page describing the old product.

_Checked by:_ `tests/copy-provenance.test.ts`, mutation-proved on all three:
a reworded description, a promotion from C to A, and a new feature.

## 7. Announced versus built

### 7.1 One flag decides three things

**Binding.** `announced` in `src/content/sections.ts` controls whether a
section is linked, whether its pages are indexed, and whether it enters the
sitemap.

Today both sections are built, styled, reachable by URL, and announced nowhere.
That is the shipped state: the machinery is finished so that publishing is
writing a Markdown file rather than building a blog, and an empty blog
advertised in the header is worse than no blog.

One flag rather than three habits, because a section half-launched by somebody
adding a link is the failure this prevents.

_Checked by:_ `tests/sections.test.tsx`, which asserts all three.

### 7.2 Crawling is allowed; indexing is not

**Binding.** `robots.txt` allows everything. Unannounced pages carry `noindex`.

`Disallow: /blog` is the reflex and it is exactly wrong: a crawler that cannot
fetch the page never sees the `noindex`, so a URL somebody links to can still
be indexed — as a bare link with no description, which is the worst of both.

_Checked by:_ `tests/sections.test.tsx`.
