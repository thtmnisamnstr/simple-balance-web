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

The application publishes the new price itself now. For a while it didn't, and
this repository's copy of the product's contract, the thing every price here is
checked against, was moved to $3 and $30 by hand so the site could go out ahead
of the product. That copy has since been refreshed from the application's
release pull request, thtmnisamnstr/simple-balance#39, and matches what the
application publishes there exactly. So the check is reading the application's
own figures again, and the weekly drift report has no hand edit left to show.
The price is on the release branch rather than `main` until 0.2.0 merges.

The check also covers all six places now. It used to cover one: the card was
held to the contract, the terms were held to a literal in their own test, and a
test named for agreeing with the terms never opened them.
`tests/app-facts.test.ts` now requires every dollar figure in the line under the
plans, the FAQ, the search and link-preview descriptions, the terms and the
social card to be a price the application declares, or the free plan's $0, so a
stale number fails wherever it's written. The search and link-preview
descriptions moved out of the page's markup so a test could read them.

**Every word of the site, and of the repository behind it, is American
English.** The copy had moved to American spelling, but the guides, the skills,
the comments and the code hadn't, and neither had the words that are spelled the
same on both sides and are still British. The budgets screenshot's caption said
"tickbox", the pricing page and the terms said "carry on using", the privacy
policy called the operator "contactable", and a docs page counted "a pension"
among the accounts a budget shouldn't see. Both posts still priced their
examples in pounds, written out as words ("nine hundred pounds", "forty
pounds"), which the earlier currency fix missed. Identifiers moved with the
prose (`blogNeighbors`, `docsNeighbors`, `Emphasized`, a `canceled` flag), and
dates render month first, so the legal pages say
"Last updated September 22, 2026" where they, and every post and docs page, used
to put the day first.

British spelling stays only where it's the subject: the check's own patterns and
fixtures, and quotations of what the copy used to say. `tests/copy.test.ts` now
refuses the words as well as the spellings, and any price in pounds, pence or
sterling, in the copy and in every Markdown file. Its fixtures show each pattern
catching what it's for and leaving "analysis" and "realistic" alone, both of
which the old spelling pattern would have flagged.

**The site is written from the application's release pull request, at one
commit.** Both snapshots of the application, the contract and the feature list,
and every screenshot come from thtmnisamnstr/simple-balance#39 at `a0c350b`.
Before, the two snapshots named different branches and different commits, and
one of the branches had been deleted after it merged.

Four screens were re-captured, in both themes: the Overview, Reports,
Transactions and Budgets. The Overview now leads with a dollar total across
checking, savings and a credit card, where it showed a lone euro account on a
site that prices in dollars. Their four alt texts were rewritten against the new
pictures, because the description is what a reader who can't see the picture
gets instead of it, and a refreshed picture is exactly when it goes stale.

The application reworded six of its feature descriptions in the same commit, and
the copy written from them followed: a recurring entry shows up "when it's due"
rather than "on the day", "in one go" is gone, and the export is "every
transaction", which the Fixed entries below explain.

**Links into the application open the version of it the site describes.** The
footer's license, changelog and deployment links, and the new links in the docs,
name the release branch, `deployment-and-monetization`, rather than `main`.
While a release is on its way, `main` is wrong both ways.
`deploy/compose/single/` and `docs/deployment-profiles.md` are new in 0.2.0 and
404 there, and `main`'s deployment guide is the previous release's, with none of
the billing or ad settings the configuration page describes. A commit would be
right today and never move, so the links name the branch, and they move back to
`main` in the same change as the snapshots.

`tests/app-links.test.ts` holds every link under `content/` and `src/` to the
ref the snapshot records, the footer's included, though those are built from a
variable that a search for the URL reads straight past. It also refuses a
malformed link: `http:`, a doubled slash, a period swallowed from the end of a
sentence. The weekly check holds the same links to the ref it read, which is
what notices them still naming the branch the week the release merges, when they
still agree with the snapshots.

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

**A wide table in the docs scrolls inside itself rather than pushing the page
sideways.** The configuration page's settings tables hold names like
`IDEMPOTENCY_RETENTION_HOURS` in code spans, which have nowhere to break, and on
a 320px phone they took the page to 469px, which is exactly what
`docs/standards/web.md` 4.3 forbids. Every table in Markdown is now wrapped in a
container that scrolls, the way the pricing page's comparison already did.
Breaking the names instead would have fit the page and split a setting somebody
has to copy exactly. `tests/a11y.test.ts` found it at 320px and 390px, and
passes with the wrapper.

**The Agents and MCP page describes how an assistant really connects.** It told
a reader to paste a token issued from the settings page into their client's
configuration, and that isn't how a client connects. The server is protected by
OAuth: the client is given the address and nothing else, registers itself, and
opens a browser for you to sign in. The page walks through that now, says the
scopes are the client's to ask for, and names Revoke under Connected agents as
the way to take access back.

**The pages ask for a choice of three accounts only where the product asks for
one, and say which three keep working until then.** Stopping a subscription was
described to everybody as picking three accounts to keep using. The product asks
only when more than three are in use as the plan ends, which can happen on a
first downgrade and again after a subscription in which accounts were opened or
reopened. With three or fewer, nothing is asked. Nothing said what happens
before the choice either, though nobody is present when a subscription lapses:
the three oldest of the accounts in use keep working, and the rest freeze at
once. And the terms said a frozen account accepts no changes "until you choose
them instead", one paragraph before saying the choice is made once.

The limit itself was still worded as how many accounts you can keep, in the
pricing page's first line, the lede over the comparison, the free plan's card
and the search snippet, though you keep every account on every plan and what the
free plan caps is how many are in use at once. `tests/app-facts.test.ts` holds
the FAQ's answers to the conditions, and `tests/legal.test.tsx` holds the terms
to promising "any three" in exactly one sentence, with its condition in it.

**Every promise of an export says it's every transaction, and the answer about
moving to your own copy says how.** The homepage, the pricing table, two FAQ
answers, the privacy policy and the terms all promised you could take
"everything" or "all of it" out as a spreadsheet. The export is the transaction
CSV. Budgets, templates and recurring entries have no export, and an account's
opening balance isn't in the file, so "everything" was a privacy promise rounded
up.

The FAQ answered the question about moving to your own copy with "Yes. Export
everything", and said what comes out "is built to go back in unchanged".
Followed as written, it moves one month, lands all of it in one account, and
leaves every account off by where it started: an export follows the page's date
bar, which opens on This month, an import puts every row into the one account
picked for it, and the opening balance is set on the account rather than carried
in the file. A transfer is in both accounts' files, and the importer takes
10,000 rows. The answer and the terms now give the steps, and the importing page
says the same. `tests/app-facts.test.ts` holds the answer to the four steps a
reader wouldn't guess, and `tests/legal.test.tsx` holds the terms to them.

**The privacy policy names who holds your data, says what a sign-in and a
subscription leave behind, and lists the cookies the application actually
sets.** Checked against the application, it was wrong in the places a reader
would care about most:

- The host holding every balance went unnamed. The short version, which is the
  one most people read, said the application shares data with nobody but the
  payment processor and the ad network, and the long version called the host
  "our hosting and database provider". Both name Oracle Cloud Infrastructure
  now. The policy also says an email delivery service will be named before one
  is in use, and that an AI assistant sees your ledger only if you connect one.
- It said payment records survive deleting an account for "typically six years",
  the UK tax authority's figure, carried over from the first draft. Deleting an
  account deletes the billing records the application keeps and your customer
  record at Stripe, and the payments themselves stay in Stripe's records as tax
  law requires.
- It described a preference cookie for the theme. There isn't one: the theme is
  saved on the account, with a copy in the browser's local storage. What it
  didn't mention were the short-lived cookies set during a sign-in, and Stripe's
  own cookies on the plan page.
- It left out that each session records the IP address and browser it started
  from, that sign-in attempts are counted per address, and what Stripe is sent:
  your name, your email address and an identifier for your Simple Balance
  account, not for any account in your ledger.
- It promised an unsubscribe from product email the application doesn't send,
  and told readers to opt out "when you create the account", on a form with no
  such field.
- It said, twice, that declining ad consent means no ads. The pricing page was
  corrected for this and the policy wasn't. Declining keeps the ads from being
  personalized and keeps Google from setting the cookies that need consent, and
  Google may still show what it calls a limited ad.

The terms pointed automated access at "the documented rate limits", and there
are none to document. `tests/legal.test.tsx` holds each of these. The
`legal-review` skill's cookie check now says which cookies to expect on which
page, starting from a fresh private window, because Stripe's lasts a year and
shows up on every page once the plan page has been opened.

**Every page tells a browser, a crawler and a link preview that it's American
English, and previews as itself.** Next replaces a parent's Open Graph block
rather than merging it, the trap the feed links fell into, and it cut both ways.
The ten pages that wrote their own block, the pricing page, both posts and every
docs page, dropped the site's locale, name and card with it, so a link to the
pricing page, the one most likely to be shared, previewed as a blank rectangle.
The pages that wrote none inherited the homepage's whole, so the privacy policy
and the terms previewed with the homepage's title and address. The X card,
declared once with the homepage's title, description and image, filled in for
other pages the same way. Every route now asks one helper for its block.

The document said `lang="en"` and the feeds said `en` or nothing, and that tells
a spell-checker, a screen reader or a translator only "English". All of them say
`en-US` now. The 404 had inherited the homepage's canonical, which told a
crawler that every mistyped link was the homepage, and it declares none now. Its
words moved out of its markup, where no copy test could read them, and its
second button, still labeled "Get the source" after the homepage retired that
label, takes the homepage's own. `tests/copy.test.ts` reads every page the build
emitted for the locale, the language, and a preview address that matches the
canonical, and it found ten pages with no locale and nine naming the homepage's
address. It also refuses a route that writes its own block, or none.

**All seven documentation pages were checked against the application, and
rewritten where they described something else.** Among them:

- Getting started said the first visitor to an empty deployment gets the sign-up
  form, as if the first account went to whoever arrived first. The form asks for
  a one-time setup code the server prints to its log, and the page now says
  where to find it. It also asked for PostgreSQL 16 where 15 works, and didn't
  say that any address but `localhost` has to be HTTPS.
- Importing a statement said the importer works out a file's encoding and its
  date format, asking only when the dates can't settle it. It reads UTF-8,
  always asks for the date order and the decimal separator, and starts on
  YYYY-MM-DD, which isn't how most US banks write a date. It also said a bad
  import can be deleted as if the ledger never knew, when the categories it
  created stay.
- Configuration promised every setting the server reads and listed seven. It's
  written from the application's own reference now, which it links, and it
  starts with `NODE_ENV`, which production requires and a host running
  `npm start` doesn't set.
- Accounts and transactions described four kinds of entry. There are three, and
  a transfer between currencies is one of them.
- Backups said a restored copy whose trial balance nets to zero holds a complete
  ledger. That proves the books consistent, not complete: every transaction nets
  to zero on its own, so a ledger missing some still passes. It also says to
  start that copy with its mail off.

Both posts now describe the entries in a reader's words rather than in debits
and credits, and a refund as a deposit filed under the category the money was
spent in.

**The weekly check reads the version of the application the site is launching
with, and compares the pictures too.** It read `main`, which has nothing to
compare until the release that introduces the product kit merges, so it answered
"could not tell" every week. Pointed at the release branch by hand, it answered
"in sync" while eight of the twelve pictures on the homepage were a capture the
application had replaced, the hero among them, because it compared only the
contract and the feature list.

It reads `main` once `main` carries the kit now, and until then the head of the
open pull request into `main` that does, read by commit so one run sees one
version. It compares every screenshot the site ships byte for byte, checks that
both snapshots name one source, and `main` once that's what it reads, and holds
the site's links to the ref it read. Those last two are what move the site back
to `main` the week the release merges, when the content is identical and only
the site's records still name the branch. What the application changed and what
the site's own records got wrong are reported under separate headings, in one
issue now titled "The site is out of step with the application", which takes
over one still open under the old title rather than opening a second. The
decisions are separate from the network, so `tests/app-sync.test.ts` holds them
offline. And the `sync-from-app` skill's own comparison of the brand tokens,
which the script doesn't make, read the stylesheet a line at a time and so was
silent about the one declaration wrapped across two: it compared 79 of 80.

**The AdSense guide puts the steps in the order Google requires, and names the
settings the application reads.** It put `ads.txt` after approval and never
connected the site to the account, and review doesn't start until the site is
connected. The publisher id exists as soon as the account does, and the file
carrying it is how this site verifies, so it goes in before the review request.
The guide told the operator to set `ADSENSE_PERSONALIZED`, which doesn't exist,
left out `PRIVACY_POLICY_URL`, without which the application refuses to start
with ads configured, and still said the privacy policy wasn't written. It now
says the machine has to be running 0.2.0 and selling Premium before any ad
setting does anything. It also keeps `ADSENSE_CONSENT_MANAGED` unset where the
application's own docs say to turn it on, because Google's consent message asks
only visitors in the EEA, the UK and Switzerland, and everybody else would be
shown the personalized ads the policy says need consent.

**The redirect check and the em dash check read what the host and the renderer
read.** The check that no redirect can answer `/ads.txt` with HTML, the one
mistake that silently costs the application its ad revenue, failed a harmless
moved-path redirect such as `/old-docs/*` and passed `/:page /index.html 200`,
which can reach the file. It took a status from a commented-out line, missed a
table header written with spaces inside its brackets, and never opened a
`_redirects` file, which Netlify reads as well. It reads `netlify.toml` a line
at a time now, fails a rule it can't read rather than passing it, and reads
`_redirects` in both `public/` and `out/` with the same predicate, whose
fixtures show it telling the two kinds of rule apart.

The em dash check read the two marketing pages and nothing else, while the legal
pages, the 404 and every post and docs page are copy under the same rule, and
the legal pages and seven of the nine posts and docs pages carried them. It
reads all of those now, and in Markdown it also reads what the renderer turns
into an em dash: exactly two hyphens outside code, and the three character
references. "Run it with --dry-run" publishes as "—dry-run", so a flag in prose
goes in a code span. `tests/copy.test.ts` compiles its fixtures through the
site's own Markdown plugins, so a change to that pipeline fails the check
instead of leaving it describing one that's gone.

**The label over the Premium plan no longer sits on top of the plan's name.**
At the widths where the three cards are narrowest — a small laptop, roughly —
"If you outgrow Free or hate ads" wrapped onto a second line, and that line
landed across "Premium". The space above the name was reserved for one line,
which is what kept the three plan names level with one another, and a label
that needed two had nowhere to go. It now reserves whatever the label actually
takes, at every width, so the names stay level and nothing collides. The
pricing page only, in both themes.

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
pages now say what is actually true, and a second pass against the
application's consent screen corrected the first attempt at it, which said you
choose what an assistant is allowed to do. The screen lists the scopes the
assistant's client asked for and offers Allow access or Deny. It grants the
request or nothing and can't narrow it, so a client that asks for every scope
gets write access with the rest. The homepage now says you see what it's asking
for and can refuse, that one limited to suggesting lines entries up for you to
approve, and that Settings shows what each one can do and lets you cut it off.
The pricing page says it gets only what you agree to when you connect it.

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
be mechanized, on the grounds that a word list "would catch the spellings and
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

**`public/og.png` was a 126 KB truecolor PNG** of flat color, one gradient
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

**A record of which picture each phone-sized copy was made from.** The homepage
serves a 1200px copy of every screenshot to narrow screens, made from the 1600px
original by the image build. A pull that replaced the originals and skipped that
build left the old copies in place, and a phone went on showing the previous
screen while a desktop showed the new one, with a green build and nothing on
either to say so. The build now records the hash of every original and of the
copy made from it, and `tests/home-page.test.tsx` fails when either stops
matching the files, when a copy outlives a deleted screen, or when a screen the
homepage names is missing a theme.

**The copy's record names the pull it was checked against.**
`src/content/copy-source.json` says which feature list the site's words were
last accepted for, and it was recording the list before this one: the
`sync-from-app` skill accepts the copy in §3 and moves the snapshot's commit in
§5. `tests/copy-provenance.test.ts` now fails until the two agree, and §5 runs
the accept once more.

**A check that every skill a document sends somebody to exists.** When
`app-alignment` became `sync-from-app`, the old name stayed in the legal review
skill, the roadmap, a comment in the brand stylesheet and the snapshot's own
note about what refreshes it, and nothing failed, because a skill is named in
prose and a name is only text. `tests/skills.test.ts` reads the guides, the
skills, the source and the workflows for skill names and the sections cited in
them, and checks each is one this repository has. It also checks that every
skill's name matches its directory, and that `AGENTS.md` lists all of them.

**Two rules earned this week.** `content.md` 2.4 — a marketing claim is never
stronger than the privacy policy it links to, after the pricing page rounded
the ad disclosure down to "nothing about you attached". And
`code/testing.md` 2.6 — a check finds its subject by identity, not by what it
is called, after four tests broke on a copy rewrite that changed no behavior
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
full procedure, including why this site's `ads.txt` authorizes revenue earned
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
color appears anywhere else. A marketing page that is a slightly different
green from the product reads as a different company.

**Standards and skills.** `docs/standards/` for the design, content, operations
and source; `.claude/skills/` for the five procedures that repeat — preparing a
branch for merge, updating dependencies, bringing the guides back to true,
reviewing the design, and re-capturing screenshots.
