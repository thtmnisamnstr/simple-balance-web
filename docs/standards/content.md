# Content

The words on this site, and the pipeline behind `/blog`, `/docs` and `/learn`.

## 1. Voice

### 1.1 No marketing vocabulary

**Binding.** Seamless, effortless, revolutionary, game-changing, cutting-edge,
best-in-class, unlock, empower, leverage, supercharge, delight, magical, robust,
blazing, 10x, next-generation, synergy, paradigm.

Each of those asks the reader to feel something instead of telling them
something. This product is a ledger; it is bought on trust, and trust is not
built by a page that sounds like every other page.

_Checked by:_ `tests/copy.test.ts`, over every string in the content module.

### 1.2 Headings are sentences

**House.** Sentence case, not Title Case. "Budgets that carry", not "Budgets
That Carry".

_Checked by:_ `tests/copy.test.ts`, on the homepage alone
(`tests/copy.test.ts:168-189`): the section titles, the proof claims and the
feature titles it lists, refused at more than two capitals in one heading.
Every other page's headings, the docs' and the learn guides' included, are
`human`. The count can't tell a name from Title Case: widened as it is, it
would fire on every learn guide's "How to do it in Simple Balance", and on any
docs heading naming a screen.

### 1.3 The reader has never used a personal finance product

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

**A gloss can be what the word buys the reader.** The hero's note, the
owner's wording, reads "The software is open source, so you can also
self-host it, on a computer you control, with no limits." "Open source" is
glossed by the clause after it, which says what it means to somebody who
isn't going to read the code, and "self-host" by 1.6's phrase. Either word
bare, as "open-source and self-hostable", is the operations vocabulary this
rule keeps off the page.

_Checked by:_ `human`. A word list in a test would catch the spellings and
miss the sentence, and the failure is a register rather than a vocabulary —
the previous copy contained no banned word at all.

### 1.4 The page describes how data gets in today, and promises nothing about tomorrow

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

**And say so once, plainly, in the present tense.** Not implying a connection
and not promising there will never be one still left a third state, and the
page sat in it: nothing anywhere said there is no connection today. Silence is
not neutral here. Every hosted competitor pulls transactions, so a reader
arriving from one assumes this does too, and the first thing that corrects
them is their own first afternoon. That is the worst place to learn it and the
most expensive.

The disclosure goes **after the value and inside the import copy**, never in
the hero and never as a positioning line. "There's no automatic pull from your
bank today. You download the file and bring it in yourself" is a description of
the present that survives the day a scheduled pull ships, which is the whole
test a sentence here has to pass. The homepage carries it in the import card
and the pricing page in the answer to "does Simple Balance connect to my bank".
Leading on
it is the mistake above, wearing a different coat.

This is 2.1 applied to the one claim this page is most likely to make by
accident, which is why it is written down separately.

**Unlike 1.3, a word list is the right check here.** 1.3 is about register and
a list would catch the spellings and miss the sentence; this is about specific
affirmative constructions whose presence _is_ the defect.

The check is narrow, and had to be: the obvious spelling bans "connect" and
"sync", and fires on the copy that states the position — "nothing to connect
and nothing to break", "no connection to any bank to maintain", "you can
connect an AI assistant". Those are the denial and a different subject.
`code/testing.md` 2.5.

_Checked by:_ `tests/copy.test.ts`, over the homepage **and** the pricing
page, and the summary and notes in `/llms.txt` (`src/content/llms.ts`),
proved against fixtures in both directions: sentences a competitor's site
would carry happily, which it must refuse, and the denials and other
subjects above, which it must let through.
Not over the docs, which say "doesn't connect to your bank" in the denial the
first pattern would refuse.

### 1.5 American English, and contractions

**Binding.** Everything a reader sees is written in American English, with
contractions where somebody talking would use them. That is the homepage, the
pricing page, the privacy policy, the terms, the 404, and every Markdown file
under `content/`.

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
**"you have" is not always "you've"**: the hero once read "See everything
you have", where _have_ is the verb rather than an auxiliary, and a blind
find-and-replace turned it into "See everything you've."

**Em dashes belong in these guides and not in the copy.** The rewrite carried
seventeen in 2,349 words, which is the loudest tell there is. The count is
the point rather than the character: one is punctuation, seventeen is a
voice. Guides are prose for somebody reading closely; copy is for somebody
skimming.

_Checked by:_ `tests/copy.test.ts`, for everything but the register:

- **the spellings**, and **the words** that are British even when spelled
  the American way (_tickbox_, _carry on_, _contactable_, _a pension_), in
  the copy and in every Markdown file under `content/`;
- **the currency**: no example priced in pounds, pence or sterling, in the
  copy or in `content/`;
- **the declared language**: `lang="en-US"` on the document and on every
  page the build emitted, `og:locale` `en_US` on each of them, and `en-US`
  in all three feeds;
- **the dates**, rendered month first;
- **the em dash**, in the copy, the legal pages, the 404, and every
  Markdown file under `content/`, all in one test, "keeps the em dash out
  of the copy, whatever the guides do", which reads the content modules'
  strings and then every Markdown file. It reads the character and every
  spelling the pipeline turns into one: exactly two hyphens outside code,
  and `&mdash;`, `&#8212;` and `&#x2014;`. A flag written as plain text,
  "run it with --dry-run", publishes as "—dry-run", so a flag goes in a code
  span. "reads an em dash the way the pipeline writes one" compiles fixtures
  through `prose.tsx`'s own remark plugins, so a change to that pipeline
  fails here rather than on the page.

The **register** is `human`, for the same reason 1.3 is.

**The first draft of this rule claimed none of it could be mechanized**, on
the grounds that "a word list would catch the spellings and miss the
register". That is an argument for a word list on the spellings, not against
one — and the check found a spelling the hand pass had missed on its first
run.

### 1.6 The two ways to use it have names, and the app's words stay the app's

**House.** The version at app.smpl.money is **our cloud app**, or the address
itself. The version somebody installs is **a copy you run yourself**, or
**your own copy**. The homepage and the pricing page say "self-host it", with
"on a computer you control" beside it, because 1.3 keeps the bare word off
those pages unless the sentence says what it means. These are the owner's
words, and they replaced "run it on your own computer" and "if we run it for
you" (`src/content/home.ts:686`).

**Retired:** "the version we run for you", which was written for the months
the cloud app wasn't open, always beside "isn't open yet", and went when that
stopped being true. Outside the Self-hosting group, "instance" and
"deployment" are avoided too: they're an operator's words for what a reader
calls their copy, and today only the Self-hosting pages use either.

**A label on the screen is the app's word, and the reader's comes first.**
Where a step needs the label, it's in bold beside the reader's own word, as
in "the **What happens next** forecast on **Budgets**": the reader knows what
a forecast is, and the label is how they find it.

**A quoted message is the app's sentence.** Quote it exactly as the app
shows it, contracted or not, plain or not: "This recurring transaction does
not set an amount. Fill one in before committing." stays uncontracted, and
"CSV exceeds the 10485760-byte limit" keeps its number, because a reader
searching the docs for the message they're looking at searches for those
words. So no contraction pass, spelling pass or rewrite for 1.3's reader
touches one. If the app's sentence breaks a rule here, the owner is told,
because the fix belongs in the application, and a spelling check here that
fails on a quoted message is reporting the app rather than the page.

The obvious alternative is each page choosing its own words for the two ways
to use it and its own paraphrase of what the screen says. That's 6.3's
failure, two surfaces using different words at one customer, spread across
every page instead of two.

_Checked by:_ `human`. A word list could find "instance", and would fire on
the Self-hosting pages that are right to say it; whether a quote is exact can
only be read against the application's source.

## 2. Claims

### 2.1 Every claim is true of the shipped application

**Binding.** A marketing page for a ledger that overstates what the ledger does
is the one kind of copy that loses a reader permanently, because the product
they then use disproves it.

When a feature is not built, the page says so or says nothing. It does not
describe a plan in the present tense.

_Checked by:_ `human`. Nothing here can read the application — it is a
different repository — so this is the rule that most needs a person, and
`merge-prep` §3 asks for it by name.

**The kit does not carry behavior, so a release can falsify a sentence and
leave every check green.** 0.2.1 changed the contract by its version number
alone and the feature list not at all, and still made the pricing FAQ and
both of the terms' downgrade paragraphs false, by letting a frozen account be
archived or deleted. The application's changelog said so in its first
section. `sync-from-app` §1 reads that changelog from the release the
snapshot names to the one it is pulling, and checks each entry against the
places this site describes behavior.

### 2.2 Invented figures say so

**Binding.** See `web.md` 5.5. The screenshots show a seeded ledger and the
page discloses it.

_Checked by:_ `tests/home-page.test.tsx`.

### 2.3 Nothing links to what does not exist

**Binding.** No empty or `#` hrefs, and no link to an address that does not
answer.

This used to say "no link to `app.smpl.money` while the app is not deployed",
which held from the first commit until the application went live on 7 October 2026. The sign-up control links there now (`web.md` 6.1), and the address is
written once, as `site.appUrl`, so it cannot drift between the places it is
used: the header (wider than a phone, `web.md` 4.3), the homepage's hero and
closing panel, both plan cards and the end of every learn article. Not counted, because the count is the thing
that went stale when the closing panel became the third on the homepage.

_Checked by:_ `tests/home-page.test.tsx` for empty hrefs and `tests/copy.test.ts`
for the address being written once; `scripts/check-links.mjs`, in GitHub
Actions, for every internal link in the build reaching a page or a file, and
a link with a `#` reaching the heading it names. It used to skip any link
with a `#` or a `?` in it, page and all, so a link to a renamed page's section
passed with the page gone, which is exactly the link a rename leaves behind.
Whether an outside address answers is `human`: nothing here makes a network
call (`AGENTS.md`).

### 2.4 The marketing pages and the privacy policy say the same thing

**Binding.** A claim on the homepage or the pricing page is no stronger than
the policy it links to.

The policy is careful about advertising, because it has to be: a
non-personalized ad is still chosen from the page and the reader's rough
location, and it still sets a cookie. A pricing page is where the temptation
is to round that down, and it did — the answer to "what are the ads like?"
said they were "requested without anything about you attached", which the
document one click away contradicts in its own words. The homepage did the
same to logging, promising that "nothing counts your clicks" beside a policy
that discloses server logs with request paths.

This is 6.3's failure — two surfaces using different words at one customer —
except that the customer who notices is reading a privacy policy, which is the
worst possible moment to be caught rounding down. Neither claim was a lie
anybody wrote on purpose; both were a long document summarized from memory.

**The obvious alternative is to trust that whoever writes the copy has read
the policy.** They had. The contradiction was two levels into a sub-clause
about frequency capping, and the summary was the sentence any honest person
would write from a general memory of it.

_Checked by:_ `tests/legal.test.tsx`, which holds the ad answer and the
homepage's privacy points against what the policy supports — the claim, not
the prose.

### 2.5 A link into the application names the ref the snapshots came from

**Binding.** Every link a reader can follow to a file or a folder in the
application's repository, a `blob/<ref>/` or `tree/<ref>/` address under
`https://github.com/thtmnisamnstr/simple-balance`, names the ref that
`src/content/app-facts.json` and `src/content/app-features.json` record as
`source.ref`. That includes the footer's links, which are built from
`site.sourceUrl` rather than written out. A link to the repository itself
names no ref and is not covered.

The site describes the version of the application its snapshots were taken
from, so a link out of it has to open that version. **`main` is the obvious
choice, and while a release is on its way it is wrong in both directions.** A
file the release adds is a 404 on `main`: `deploy/compose/single/` and
`docs/deployment-profiles.md` were both new in 0.2.0, and neither was on
`main` until it merged. A file both have is the previous release's copy on
`main`, and until 0.2.0 merged, `main`'s `docs/deployment.md` had none of the
billing and ad settings the configuration page describes. Either way the
reader follows a page about one product to a file about another.

**A commit is the other obvious choice, and it never moves.** A link pinned
to one would go on showing the commit the page was written against long
after the release had merged and moved on. The ref is what
`sync-from-app` §7 changes when the site moves back to `main`, and tying
every link to it makes that move one change the checks ask for, rather than
a search for every link somebody wrote while the release was open.

_Checked by:_ `tests/app-links.test.ts` on every build, which finds every
link into the application under `content/` and `src/`, the footer's
spelling included, and holds each to the ref `app-facts.json` records; and
`scripts/check-app-sync.mjs` weekly, which holds them to the ref it read over
the network. The second is what notices the links still naming the branch
the week the release merges, because on that day they agree with the
snapshots and only the network knows they are stale. Whether the file is
still at that path is `human`: offline, a link can only be well-formed.

**Well-formed is narrower than it sounds.** A link is `https:`, because a
reader whose browser has no preload list follows `http:` in the clear first,
even though github.com is on the list. A `tree/` link may name the ref's root,
`tree/<ref>` or `tree/<ref>/`, and a `blob/` link may not, because a blob is a
file. An empty segment from a doubled slash is refused, `<ref>//` included,
and so are `.` and `..`, a segment ending in a period, and more than one `#`.

### 2.6 A sentence naming the current release names the snapshot's

**Binding.** Wherever a page says which release the application's deploy
programs pin, the version it names is `facts.derived.appVersion` in
`src/content/app-facts.json`. The two deployment guides say it to somebody
about to run `pulumi up` or start Compose, and clone the release by its tag.

A version written in prose is the one fact a pull moves that no kit file
carries. Both pages went on naming 0.2.0 after 0.2.1 had been pulled, and
every other check passed, because the kit holds numbers and pictures and the
sentence holds the number. A version that is history stays: "the server reads
these settings from 0.2.0 on" is as true after 0.2.1 as before it, which is
why this is held to the phrasings that mean _now_ rather than to every version
a page contains.

_Checked by:_ `tests/app-facts.test.ts`, which finds every "pinned release
image, which is …", "must name the … image" and `--branch v…` under
`content/docs/`, refuses fewer than it found the day it was written, and
holds each to the snapshot. A new sentence about the current release in some
other phrasing is `human`, and `sync-from-app` §1's version grep is where it
is found.

### 2.7 A page about the product is written from its source at a release, then read by somebody trying to prove it wrong

**House.** A docs page, a learn guide's product section, or anything else
that says what a screen does is written with the application's source open,
at the commit the snapshot describes, fetched by URL the way `AGENTS.md`
says. Outside a sync that's `source.commit` in `src/content/app-facts.json`;
during one it's the commit the sync pinned, so the pages and the snapshot are
checked against the same code. The labels and the messages a reader sees are
in the client; the limits and the refusals are on the server, and a page that
states a limit states the server's.

**A commit, not the release's tag.** The tag was the first choice, and it
fails twice: midway through a sync from an open release pull request the new
version has no tag yet, and once it does, `main` can sit ahead of it, so a
sync reading `main` and a page read at the tag check the same sentence
against two different programs. The tag is still the name to give a reader
or the owner, in a report.

**Except on a Self-hosting page**, which tells its reader to clone the tag,
`v` and the snapshot's `appVersion`, and so is written from that tag's code:
it's the program that reader runs, and `main` can be ahead of it with the
deploy programs changed. Until the tag exists, that's the commit the release
will be cut from. The rest of the docs follow the commit app.smpl.money runs,
which is the one the sync pinned unless the owner says otherwise.
`sync-from-app` §5 says how to pin each.

**The application's own docs are a map, not the truth.** They say where to
look, and they're written by the same hands as the code, so they're usually
right. Where they disagree with the code, the page says what the code does,
and the owner is told with a file and line on each side, because one of the
two repositories is wrong and only the owner decides which to fix.

**Not from this site's other pages, and not from memory.** A neighboring
page is somebody else's reading of the code, errors included, and a page
summarized from memory is how 2.4's contradictions were written. The alt text
went the same way: the one description `web.md` 5.4 records as right "was the
one written while looking at the file".

**Then somebody who didn't write it tries to prove it wrong.** A second
reader takes each claim and looks for the line in the source that makes it
true. A claim with no line is cut or fixed, not softened. Writing and
checking are separate passes, and separate people where that's possible,
because a writer rereading their own page reads what they meant.

**Then every figure the page states is searched for** across `content/` and
`src/content/`, because a figure is said on more than one page and a fix on
one leaves the others. The changelog records what that costs when it's
skipped: the configuration page gave a failed payment a seven-day grace
period where the app gives 15, and five docs pages disagreed with the app or
with each other.

The obvious alternative is writing from the application's changelog or from
the neighboring pages, which is faster and copies their errors with the
confidence of a second source.

_Checked by:_ `human`. The procedure is `sync-from-app` §5, which writes the
docs for a release and has the second reader refute them, and the sweeps in
`sync-from-app` §1 do the part a search can: a bold label the application's
code doesn't contain, and a sentence naming a release that isn't the current
one. A sync
doesn't rewrite a learn guide's product section, though the rule holds it
too: `sync-from-app` §1 lists any guide whose steps name a label, a button or
a message the release changed, and the guide is rewritten through
`write-content`.

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

**House.** The reader arrives not knowing what this is, and asks three
questions in order: what is it, will it help with what I came for, and why
this one. So: the hero says what it is, and the
real dashboard rises out of it carrying the one disclosure that the money in
every picture is made up (`web.md` 5.5); the jobs answer the second question;
the proof section answers the third; the features answer "does it do the
normal things"; the assistant is a reason to stay; privacy answers the
question a money product always raises; and the plans panel is where the
reader goes next.

**The jobs come straight after the hero, because "will it help with what I
came for" is asked before "why this one".** Six of them, from the October
2026 search read behind the learn articles (5.14): seeing where the money
goes, a budget you'll keep, the bills you can see coming, a subscription you
forgot, a credit card without the surprise, and whether you're getting ahead.
Each is in the reader's words, says in a sentence or two what the product
does for it, and is a card carrying its guide's own picture and linking to
that guide, which teaches the job with any tool. They are `jobs` in
`src/content/home.ts`, and each one's `covers` names the features it rests
on, so they count, like every other section's, toward the rule that the site
may say less than the product does and never more (`AGENTS.md`). A job that
is a way of using the product rather than a feature of it, such as paying a
card off as a transfer, covers nothing, and says so with an empty list.

The obvious alternative was to keep the proof first, as the strongest
argument on the page. But an argument for why this product is better lands
on a reader who has not yet seen that it does the thing they came to do, and
the search read says what that thing usually is. **The jobs are relevance,
not a claim of difference**, which is why they can sit above the proof
without breaking the rule below: "See where your money actually goes" is the
first of six things a reader can pick, not the page's headline, and nothing
in the section says a competitor cannot do it.

**The assistant comes after the features, and the reason is a market fact
rather than a taste.** This rule used to end "and agents is the thing nothing
else does", which was true when it was written and is the sort of sentence
that outlives its evidence. A competitive read in October 2026 found
PocketSmith shipping a first-party MCP server with read and full-access
permission levels and an explicit promise that an answer can be checked
against the figures behind it, which is this product's own pitch almost
clause for clause. A capability two products share decides nothing, so it
stopped being allowed to decide the section order. The application's own
feature list had reached the same conclusion first and ranks `agents` at tier
C, so the page was also contradicting the kit it is written from. It is drawn
as what it is, a question and an answer, rather than as the terminal it used
to be, which told a reader who is not a developer that the section was not
for them.

**What makes the case is the thing the comparison left standing.** "All your
accounts in one place" is run by eight competitors and "know where your money
went" by four, so neither can open the page. What no competitor's copy
answers is the reader's next question, which is why they should believe the
total: the running balance beside every row, a correction that never erases
what it corrected, and an import nothing counts until somebody has looked at
it. The proof section is those three, numbered, each beside its evidence: two
screenshots, and a drawing for the correction, because a figure not being
overwritten cannot be photographed. A screenshot is evidence for a sentence
somebody has reason to doubt, and it loses that job the moment it is moved
into a gallery of its own.

**The page ends on plans, not on privacy.** Privacy is a good last impression
and a bad last sentence: it leaves a reader persuaded and with nowhere to go.
The closing panel states the monetization model in one paragraph, carries the
page's third sign-up control after the header's and the hero's, and links the
pricing page, which is where somebody convinced by the rest of it was always
going to have to end up. It is drawn on the art panel with the learn index's
own picture, so the page closes where `/learn` begins (`web.md` 5.7).

The privacy section itself is stated as a promise to the reader rather than as
a property of the software. "This is software you run, not a service you join"
was an earlier opening, and it asks the reader to translate an architecture
into a reason to feel safe, which is the translation this reader cannot do. It
opened on "we never ask for your bank password" for a while, and 1.4 is where
that went and why.

Reordering is fine. Reordering without a reason is what this rule is about.

_Checked by:_ `human` for the order. `tests/home-page.test.tsx` holds that
every job links, by its own words, to a guide that exists, and
`tests/app-features.test.ts` reads each job's `covers` with the rest of the
page's.

### 3.3 A homepage section's words, and the words in its drawing

**Guidance.** Every section in `src/content/home.ts` is built from the same
parts, and a new one reads as part of the page when it uses them:

- an **eyebrow** of a few words naming the topic or the reader it's for,
  "What it's for", "Day to day", "If you use an AI assistant";
- a **title** that is a full sentence with a period, "It does the ordinary
  things too.";
- an optional **lede** under it;
- **card titles** that are labels with no period, "Budgets that carry what
  you don't spend".

The shape is what lets somebody skim the page by its eyebrows and titles and
know where they are, and it's why a title can make an argument: the eyebrow
has already said what the section is about.

**A drawing's words live in the same module**, not in the component that
draws them: the hero's payments (`heroArt`), the correction (`correctionArt`),
the chat's lines and the tools it calls (`agents`), and the stop label every
loop carries (`motion.stop`, `src/content/home.ts:309`). That is 3.1's
reason again: `tests/copy.test.ts` reads every string the module exports and
none of the JSX.

**A drawing's words are claims.** A sum in one adds up: the hero's three
payments come to its balance, because a drawing about money adding up that
didn't would be the one joke this page can't make. A real name in one is
true at the snapshot's release: the chat calls `list_payees` and then
`list_transactions`, which are read-only tools on the application's MCP
server (`src/content/home.ts:650`), and a rename there leaves the picture
describing something the product can't do, which only reading the release
catches. An invented example is plainly an example: Meridian Power and Corner
Cafe are made up, and nothing in the drawing presents them as anything else.

How words that move are read, once and whole, is `web.md` 8.6.

The obvious alternative is a section shaped by whoever writes it, and a
drawing's words typed into its JSX where they're convenient. The first makes
one page read as several; the second puts words a test could check where
none can.

_Checked by:_ `tests/home-page.test.tsx` for the hero's sum, and
`tests/copy.test.ts` for every word in the module. Whether the tool names are
still the application's is `human`, and `sync-from-app` §1 is where a release
read finds a rename.

## 4. Contact

### 4.1 One address, and therefore no label

**House.** `info@smpl.money`, and nothing else.

There were two — a second for help with a deployment — on the argument that an
unlabeled pair is how a support question reaches a mailbox nobody reads on a
weekday. The pair was the worse problem: publishing two asks the reader to
classify their own message before they have written it, and a marketing site
is where somebody arrives _before_ they are a customer with a support
question, so the split was sorting mail nobody had sent. A single address
needs no label, and a lone `mailto:` under a heading reading "General" is a
category with nothing to distinguish it from.

_Checked by:_ `tests/copy.test.ts` and `tests/home-page.test.tsx`.

## 5. The content pipeline

`/blog`, `/docs` and `/learn` are Markdown files under `content/`, read at
build time by `src/content/collections/index.ts` and rendered by this site's
own layouts.

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
post, and for a learn article (`src/content/collections/index.ts:170`), where
it orders nothing but is the date the page shows and its structured data
carries. A missing one fails the build, because the alternative is a published
page with an empty `<title>` discovered by a reader.

**A docs page has no `date`, and needs `updated` all the same.** Nothing in
the loader asks for it, but the sitemap test refuses a listed URL with no
`lastmod` (`tests/sitemap.test.ts:91`), and a docs page's `lastmod` is its
`updated`. The same test refuses a date before the site's first commit, or
later than today. Within those, it's the day the page's words last changed
rather than the day it was first written.

_Checked by:_ `tests/content.test.ts`, and `tests/sitemap.test.ts` for a docs
page's `updated`.

### 5.3 A date is a calendar day

**Binding.** Stored and rendered as `YYYY-MM-DD`, formatted in UTC.

`gray-matter` returns a `Date` object for an unquoted `2026-09-17`, because
that is what YAML says it is. Interpolated into a string it becomes
"Wed Sep 17 2026 …" and then an Invalid Date — which failed a build here, and
would otherwise have rendered the day before for every reader west of
Greenwich. Normalizing at the parser means every consumer gets one shape
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

**Guidance.** A key in `authors` claims that person wrote the words, which is
5.14's reason for the learn guides naming nobody. So an agent drafting a post
asks whose name goes on it rather than copying `authors: [gavin]` from the
example in `write-content` or from the posts already published: a byline with
no key renders cleanly, as the date and the reading time alone
(`src/components/byline.tsx`). It stays a person's call rather than a rule
that posts are anonymous, because the owner does write posts.

_Checked by:_ `tests/content.test.ts` for the keys. Whose name belongs on a
post is `human`.

### 5.5 Sidebar order is one file

**House.** `content/docs/_sections.json` names the group order; each page's
`order` places it within its group. The learn articles are ordered the same
way by their own `content/learn/_sections.json`, which is a reading order for
somebody starting from nothing rather than a filing system.

Groups need an order that is not alphabetical — "Using Simple Balance"
belongs above "Self-hosting" — and there is nowhere in per-page frontmatter to
say so without repeating it on every page in the group and letting two
disagree.

**A new group is more than the one file.** This said a group missing from the
file sorts last, so adding one was a one-file change. The loader still sorts
it last, and the grouping test refuses it
(`tests/docs-features.test.ts:101-112`), because a group nobody placed is a
group nobody decided the reading order for. Each group also has words on its
index, and a docs group a picture, both held to the same set of names:

- a docs group is three changes: its place in `_sections.json`, its words in
  `docsIndex.groups` (`src/content/sections.ts:142`), and its picture in
  `groupArt` (`src/components/docs-art/pictures.tsx:308`);
- a learn group is two: its place, and its sentence in `learnIndex.groups`
  (`src/content/learn.ts:49`).

A page with no `order` sorts after every page that has one, rather than
alphabetically among them. That is what makes adding `order: 2` to one page do
the obvious thing without renumbering its neighbors.

**Guidance.** The docs index's own words, in `docsIndex`, have a job each, and
a new one reads best in the shape of the ones there:

- a group's `blurb` is a sentence, two at most, on what the reader does in
  that group, not a list of its pages;
- `audience` is only for a group most readers should skip, which today is
  Self-hosting alone, so that a reader who wandered in can tell from the
  heading that they can leave;
- `starts` are the reader's own questions ("New here?", "Have a statement from
  your bank?"), each leading to the one page that answers it;
- `steps` are the `##` ids of a newcomer's walk-through, so a page that has
  them names each of those headings as an imperative step, "Add your first
  account" rather than "Accounts";
- a card's text is the page's own title and description, never written again
  here, so the index and the page can't describe it two ways.

_Checked by:_ `tests/content.test.ts`, for both collections;
`tests/docs-features.test.ts` for the grouping, a docs group's words and
picture, and every start and step leading somewhere; and `tests/learn.test.ts`
for a learn group's words. How the words read is `human`.

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

**Advertised on the blog's pages, and on every page once the blog is
announced.** Until then only a page under `/blog/` links the three from its
head (`src/lib/feed.ts:84`). They were on every page for a while, which put
three links to an unannounced section in the head of the homepage, the
pricing page and every guide: the half-launch 7.1 exists to prevent, arriving
through `<link rel="alternate">` instead of a nav link.

A route never writes its own `alternates`. It asks `feedAlternates` in
`src/lib/feed.ts` for them, because Next replaces a metadata key rather than
merging it, and `code/next.md` 1.1 has the mechanism and the times it bit.

_Checked by:_ `tests/feeds.test.ts`, which **parses** the XML rather than
matching strings — an unescaped ampersand in a title is the classic break and a
substring check sails straight past it. It also holds every emitted blog page
to advertising all three and every other page to advertising them exactly
when the blog is announced, and recounts the twenty above against
`FEED_ITEMS`: the item assertions compare the feed to `feedPosts()`, so both
sides move together and the cap itself would otherwise go unchecked.

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

**Binding.** `BlogPosting`, `TechArticle`, `Article`, `BreadcrumbList`,
`FAQPage`, and on the homepage one `@graph` of `Organization`, `WebSite`,
`WebApplication` and `SoftwareSourceCode`. Every field must be true of
something a reader can see on the page. A learn article is an `Article`: not
news, so not a `BlogPosting`, and not written for somebody who reads a
`TechArticle`.

Google's structured-data policy treats markup describing invisible content as
spam, and it is also simply lying. So there is no `aggregateRating`, no
invented `wordCount`, and no author whose name is not in the byline, which
for the guides and the docs means no author at all.

**The homepage graph says who and what, once, by `@id`.** The
`Organization` (`/#org`) is the publisher every article names; the `WebSite`
carries `alternateName: "smpl.money"`, because Google's site-name guidance
asks for the name people type when the domain isn't the brand; the
`WebApplication` (`/#app`) is the hosted product, with its `offers` read from
`src/content/app-facts.json` so the price in the markup is the price the
application charges; and the `SoftwareSourceCode` holds `codeRepository`,
which was on the application node once and isn't a property of it. Every docs
page's `TechArticle` points `about` at `/#app`.

**Breadcrumbs are emitted by the component that draws them.** A
`BreadcrumbList` written beside a `<Breadcrumbs>` drifted from it once, so
`src/components/breadcrumbs.tsx` emits both from one trail.

**`image` on an article is its page card** (5.16), which isn't on the page.
It's the one field here a reader doesn't see in the article itself; they see
it wherever the link is shared, and it shows only the title and address the
page already shows, which is why it passes the rule above rather than bending
it.

**`FAQPage` stays although Google stopped showing it** as a rich result on
7 May 2026. The questions and answers are visible on the pricing page, Bing
and the answer engines read question-and-answer markup directly, and keeping
it costs nothing. A comment that says Google renders it is the thing to
correct.

The JSON is emitted with `<` escaped, because a literal `</script>` inside a
string ends the element early and turns the rest of the payload into markup.

_Checked by:_ `tests/structured-data.test.ts`, which parses every built page's
payload, refuses a rating or a review anywhere, and holds the graph's ids, its
`alternateName`, its offers against the contract, and every guide's and docs
page's article, image and breadcrumbs; `tests/docs-features.test.ts`; and
`tests/learn.test.ts` for the absent author. Whether each field still
describes what its page shows is `seo-review`'s read on every branch.

### 5.14 A learn article says why, then how, then how in Simple Balance

**Binding.** Every article under `content/learn/` explains why the job
matters, how to do it with any tool, and, last, how to do it in Simple Balance.
The headings carry it: a `##` beginning "Why", a later one beginning "How",
and a final one ending "in Simple Balance".

The order is the argument. A reader who arrives from a search for "what is a
sinking fund" wants the answer, and an article that opens on the product is an
advertisement they leave. One that never reaches the product is a detour this
site paid for. Answering first and showing the product last is what makes the
last section credible: by the time it says "Simple Balance does this with a
budget that carries", the reader knows why they would want one.

**Credited to nobody.** The articles were written by an AI, so they name no
author: no byline, no `authors` in the frontmatter, and no author in the
structured data, which names the site as publisher instead. The owner took
the byline off on 25 October 2026, because a byline naming a person who
didn't write the words is a claim about authorship, and the loader in
`src/content/collections/index.ts` refuses an author on a learn article so a
post's frontmatter copied over can't bring one back.

**Written for the reader 1.3 describes**, even though 1.3 binds only the
homepage and pricing. These articles are found by the people least likely to
know what a ledger is, so an accounting word is glossed where it first
appears ("Accountants call it reconciling") rather than assumed.

**Every product step is a button on the shipped screen.** The application's
own `docs/how-to.md` says every button it names is the button on the screen,
and the articles were checked against that file and against the client source
at the release the snapshot names, not against memory or this site's docs,
which is 2.7 applied to the part of a guide most likely to be tried. A label
that is close is wrong: the report is **Categories**, not "spending by
category", and the Transactions page searches and sorts but has no amount
filter, which an early draft promised. Where the product falls short of what
the method asks for, the article says so: no automatic detection of
subscriptions, no market prices for a net worth, no automatic pull from a
bank (1.4 applies here as it does on the homepage).

**Every borrowed idea and every quoted figure is credited**, with a link to
the source where one exists, and the article ends with a `## Sources` list
naming each one. The methods these articles teach were somebody's before they
were ours: zero-based budgeting is Peter Pyhrr's, from a 1970 _Harvard
Business Review_ article. A reader who wants to go further deserves the
original, and an article about money that cannot say where its numbers came
from is asking to be taken on trust.

**A method a company made popular is taught from a public source that teaches
it.** The first drafts credited YNAB, a competing budgeting app, for "give
every dollar a job" and "live on last month's income." Neither idea is YNAB's
alone, and both are now taught from extension services: zero-based budgeting
at home from the University of Florida's, and the cushion that lets an
irregular income be budgeted a month behind from Penn State's. The articles
do not borrow a competitor's slogan without crediting it, and have no reason
to use it at all.

**The sources are ones a careful reader would accept.** Government and
regulators first (the CFPB, the Federal Reserve, the BLS, the IRS, FINRA),
then university extension programs, then the person or company that
originated a method, then established reference publishers. Not
personal-finance personalities: the $1,000 starter emergency fund that an
early draft repeated is Dave Ramsey's, and the article now uses a figure a
regulator publishes instead. A method that is only known through a
personality gets a mainstream source that states it, or it is left out.

**Written at a 5th to 8th grade reading level.** Measured, not guessed: the
prose (headings, tables and the sources list left out) scores at grade 8 or
below on Flesch-Kincaid and on the textstat consensus grade. Dale-Chall reads
higher on every article, because "budget", "category" and "transaction" are
not on its list of familiar words and cannot be avoided in an article about
budget categories; it is used to find the long words that can be swapped,
not as a target.

**Every article is illustrated three ways.** A hero picture at the top, which
is also its card on the index (`web.md` 5.7). At least one diagram where the
article explains something with numbers or steps, drawn from the article's own
figures (`web.md` 5.8). And screenshots of the real screens in its "in Simple
Balance" part, each under the subsection that uses that screen. A diagram's
words, its labels, caption and description, live in
`src/content/learn-art/<slug>.ts` beside the article's other copy rules, so the
copy checks read them, and a figure in a diagram is a figure in the article:
changing one is changing both.

**A screenshot says its money is made up, on the line under it**, because 5.5
of `web.md` binds every page, and a Markdown page has nowhere else to say it.

**A screen the article names is linked to its docs page.** The last part walks
through screens by their bold names, and the docs page for each is the next
thing its reader needs, and the most descriptive link that page gets from
anywhere. Three articles named seven screens between them without linking
their pages, which a count of docs links couldn't see, because each linked
some other docs page. Where the link sits is a judgment, at the first mention
or a line later in words that name it; that it's there is not. "The
**Categories** report" is a tab of Reports, not the Categories screen.

**Why these topics.** Twelve articles chosen in October 2026 from a read of
what people search for and what consumer-education lists lead with,
intersected with what the product can do. Search volumes were Google's US
monthly figures as published on 24 October 2026, rounded, and are a ranking
rather than a forecast: "how to make a budget" about 165,000, net worth
questions about 18,000, "zero based budget" about 15,000, "emergency fund"
about 12,000, "sinking funds" about 8,000, "track expenses" about 8,000,
"budget categories list" about 5,000, "envelope budgeting" a few thousand, and
balancing an account, subscriptions, credit cards and irregular income each in
the low thousands. The CFPB's _Your Money, Your Goals_ toolkit and the
r/personalfinance plan both start with tracking and a budget, which is why
"Start here" holds those two, with choosing categories between them. Another,
on the 50/30/20 rule ("50/30/20 rule" about 40,000, the second-largest figure
here), was written and taken out before launch at the owner's call. It is not
in the queue of guides to write, so the search volume is not a reason to write
it again.

Left out on purpose, because the product cannot do them well and an article
that ends "and Simple Balance can't help" is the detour above: investing and
retirement accounts, credit scores, taxes, debt snowball against avalanche (a
question about which debt to pay first, which nothing here answers), "best
budgeting app" (its searchers want automatic bank sync), and money-saving tips
(the product shows spending; it does not lower prices).

**What comes next is in one place, `docs/roadmap.md` 4.** The queue was kept
here and in the roadmap, and the two lists disagreed: each named a guide the
other didn't. A queue is a list of work rather than a rule, so it lives with
the rest of the work, in the order this section's search read gives it, and
this section keeps only the reasons a topic is in or out.

_Checked by:_ `tests/learn.test.ts`, for the three headings in order, the
date and the absence of any author, in the frontmatter and on every built
page, every link to another article or a docs page resolving, a
closing sources list with at least one link, every outside page the article
links to appearing in that list, every screen named in bold linking its
docs page, and every screenshot existing in both themes, sized in the
spelling the renderer keeps, with the disclosure under it. Whether a source
is reputable, whether every borrowed idea is credited, the reading level, the
register and whether each product step is still true are `human`. `sync-from-app` §1's changelog read is where a release that
moves a button is found, and the sync reports the guide rather than
rewriting it, because a guide's product section is the last third of an
argument the sync doesn't own.

### 5.15 A plain copy for readers that aren't browsers

**House.** Every docs page and learn guide has a Markdown copy at
`<page>/index.md`, linked from the page as
`<link rel="alternate" type="text/markdown">`, and `/llms.txt` lists them.
Both are served `noindex`. There is no `llms-full.txt` and no content
negotiation.

House rather than Binding, though a test fails on a missing copy: nothing
outside this repository asks for either file. `llms.txt` is a convention a
site may adopt, and the measurements below are why this one does. A test
enforcing a rule doesn't make the rule an outside authority's.

**What reads them, as measured rather than hoped.** Ahrefs' study of 137,000
sites (June 2026) found 97% of `llms.txt` files got no requests at all, and
Google says Search ignores the file. But the requests that did come were led
by GPTBot and Claude Code, Lighthouse 13.3 audits for one, and Dries
Buytaert's logs show GPTBot and OAI-SearchBot fetching linked `.md` copies by
the thousand. So the file is published cheaply and expected to do little,
and the copies are for the agent helping somebody use the product, which is
what the docs are for.

**Built from the same sources as the pages, never written by hand.** The
pages are Markdown already, so a copy is the source with the site's
components turned back into Markdown (`src/lib/markdown.ts`): a `<Shot>`
becomes an image with its alt text and keeps the made-up-money line under it,
a `<Diagram>` becomes its caption and full description, a `<Callout>` a
blockquote led by its title, `<CodeTabs>` a labeled code block per tab, and
every site link becomes absolute.

**`<Figure>` is the sixth component (`src/components/prose.tsx:54`) and has no
conversion, so it is the blog's alone.** The blog has no copies, so nothing
needs one yet. Used on a docs page or a guide, it would reach the copy as a
tag, and `tests/markdown.test.ts:48` fails on any capitalized tag left in a
copy, so it arrives on those pages with a conversion or not at all.

`/llms.txt` is generated from `site`, `app-facts.json`, `_sections.json` and
the frontmatter (`src/app/llms.txt/route.ts`), so its prices are the
contract's and its list is the build's. Drift between a summary and the pages
is the one real cost of either file, and generating them is what removes it.

**`noindex`, because the HTML is the page.** A second indexable copy of every
page is duplicate content, and every engine cites the HTML anyway. The
headers are in `netlify.toml` by exact pattern (`/*/*/index.md` and
`/llms.txt`), because a header path's `*` matches one segment and a looser
one would put `noindex` on the HTML pages beside them.

**No negotiation on `Accept: text/markdown`.** It needs an edge function,
which `operations.md` 1.1 rules out, and no AI crawler in the measured logs
sent the header. **No `llms-full.txt`**: it isn't in the format, the copies
it would join came to about 430 KB when measured on 25 October 2026, and
nobody was measured reading one. Revisit either if the host's logs ever show
demand.

**The announced flag reaches the list, not the copies** (7.1). A section that
isn't announced isn't listed in `/llms.txt` (`src/app/llms.txt/route.ts`
reads `announcedSections()`). The copies are built for every docs page and
learn guide and linked from its head whatever the flag says, because the
copy routes and the alternate link don't read it; served `noindex`, a copy of
an unannounced section is reachable by URL the way its page is, and indexed
nowhere. Making the copies follow the flag is a line in each copy route and
in `feedAlternates` (`src/lib/feed.ts`), and is worth doing the day a docs or
learn section is built ahead of its announcement. The blog has no Markdown
copies yet, so once it's announced its posts are listed there by their
pages; giving them copies is a route like the docs' and a line in
`src/app/llms.txt/route.ts`.

_Checked by:_ `tests/markdown.test.ts`, for a copy of every page, its title
and description, no component left as a tag, a picture never without its
line, absolute links, the alternate link on each page, and `/llms.txt`'s
shape, links, prices and sections; `tests/export-shape.test.ts` for the two
header blocks and that nothing else is `noindex`. Whether a copy and the
summary still say plainly what the page and the product are is
`aeo-review`'s read.

### 5.16 A title says what the page is, in the words people search

**House.** Every page in the sitemap has a title of at most 70 characters, a
description of 70 to 160, and asks for large image previews. Every page but
the homepage ends its title in the site's name, through the root layout's
template (`src/app/layout.tsx:28`), and so doesn't name the site itself; the
homepage's default title puts the name first. The homepage's title and description name the category in the
words people search.

House rather than Binding, though `tests/sitemap.test.ts` fails on a long
title: no search engine publishes a length limit. 70 and 160 are about where
a result gets cut, which is observed behavior rather than a published rule,
and the check holds the site to them because a cut title makes a worse
result, not a broken page.

The homepage was titled "Personal finance that's simple", which names no
product anybody searches for, and its page never said "budget app",
"spending tracker" or "expense tracker", the nouns searched about 90,000,
3,000 and 6,600 times a month in the US. An answer engine asked for a free
budget app needs one sentence that says this is one. So the title, the
description and a label above the hero say it, and the hero headline stays
the argument.

**The preview directive is `max-image-preview:large`**, and a route asks
`src/lib/indexing.ts` for it rather than writing its own `robots`. Set once in
the root layout, it reached four pages of forty-five, because of how Next
merges metadata: `code/next.md` 1.1 has the mechanism.

An index page's heading can be short under the site's header and useless in a
list of ten results, so `metaTitle` in `src/content/sections.ts` is the title
a tab and a result show where it differs from the heading.

**Every page that's shared has its own card.** `scripts/build-images.mjs`
draws a 1200 by 630 typographic card for the pricing page, both indexes and
every guide and docs page, into `public/og/`, and each page's `og:image`
names it. They all shared the homepage's card, and Google picks a result's
thumbnail from `og:image` and advises against one generic image across pages.
The script runs by hand and its output is committed (`operations.md` 6.3), so
**a new or retitled page needs `npm run build:images`**, and a test says so.

**Guidance: naming the tool in a guide.** Where a learn guide's job has a
name people search for the tool that does it, the guide's product section
says once, in plain words, that Simple Balance works as one, or says what it
isn't. Five of the twelve did when this was written: an expense tracker, a
zero-based budgeting app, a net worth tracker ("works as a net worth
tracker"), an envelope budgeting app, and what it isn't, a subscription
tracker that finds them for you. Where no such name exists, as for an
emergency fund, the guide says nothing, because a category invented for the
job is a phrase nobody searches and reads as the advertisement 5.14 keeps out
of the first two parts. It never claims more than the product does. This was
in the Binding sentence above for a while, and nothing checked it and seven
guides didn't do it, which is what a recipe looks like when it's written as a
rule.

**Guidance: how a title answers.**

- A learn title is the search itself: usually the question as people type it,
  "How to make a budget" or "What are sinking funds?", or the noun they
  search where the search is one, "A list of budget categories, with
  examples". Its description answers the question in its first sentence.
- A docs title is the app's own name for the feature, "Recurring
  transactions", or the task in its -ing form, "Importing a statement", with
  an acronym in parentheses after the plain words, "Connecting an AI
  assistant (MCP)", so the page is found by either.
- The page's opening paragraph answers again, because it's the first thing in
  the Markdown copy after the title and description
  (`src/lib/markdown.ts:31`), and the first thing anything summarizing the
  page reads.
- A title has about 53 characters before " — Simple Balance" takes it to
  the 70.

The obvious alternative is a title that's clever or a label that's short,
which is what the homepage had and what an index heading is. Both are right
on the page, where the header already says what site this is, and wrong in a
list of ten results, where nothing does.

_Checked by:_ `tests/sitemap.test.ts` for the lengths, the site's name said
twice and the preview directive, on the built pages;
`tests/copy.test.ts` for the homepage's title; `tests/export-shape.test.ts`
for every card, its size, and the title it was drawn from. Whether a
description answers the page's question, and both pieces of guidance, are
`human`: `seo-review` is that read for the titles and descriptions, and
`aeo-review` for the opening paragraph.

### 5.17 A docs page answers first, and names the screen the way the screen does

**Guidance.** The docs share a shape, and a new page is easiest to write and
to read in it. `content/docs/recurring-transactions.md` is the worked example,
with every part below.

- **It opens on an answer.** A paragraph with no heading above it says what
  the thing is, what it does, and what it doesn't: "It never adds anything to
  your books on its own." Where two features are easily confused, a
  comparison table comes next, as Transaction templates opens on templates
  against recurring transactions (`content/docs/templates.md:15`). Then a
  screenshot, with the made-up-money line under it.
- **A procedure is numbered**, one action to a step, starting from where the
  reader already is: "Open **Recurring** and press **New recurring
  transaction**."
- **A label is bold and spelled as the screen spells it** (1.6). Bold is
  otherwise kept for a list item's lead, and a lead that's a whole sentence
  ends on its period inside the bold, so a bold phrase without one can be
  taken for a label.
- **A form is a table**, `| Field | What it does |`, saying for each field
  whether it's required, its limit, and the quoted message a wrong value gets.
- **A heading names the situation somebody searches for**, "Bills that change
  every month" or "When it says past due", rather than the feature's internal
  name.
- **Edge cases are a list with a bold lead**, each lead the whole point in a
  few words, so a reader scanning for their case finds it.
- **A page whose feature has limits of its own ends on `## Limits`**, quoting
  each refusal, and links Limits, which promises every limit in one place, so
  a limit stated on a page is stated there too.
- **A callout's kind says how much it matters**: `tip` for a common mistake,
  `warning` for something that can't be undone or that rewrites past months,
  `danger` for a way to lose data, and `note` for an aside. Its title states
  the point, "A merge can't be undone", because a title replaces the kind's
  own word on the page (`src/components/callout.tsx`) and has to carry what
  the color does.
- **It closes on where to go next**: its neighbors, the AI assistant page
  where an assistant can do the same job, and the learn guide that teaches the
  job with any tool.

The obvious alternative is a reference page, a list of every field and
setting in the order the code declares them. That's complete and a newcomer
can't act on it, and these pages are read by somebody with the screen open
in another tab, trying to do one thing.

_Checked by:_ `human`. `sync-from-app` §1's label sweep finds a bold phrase
the application's code doesn't contain, skipping one that ends on a period
or a colon, which catches a renamed label and is why bold is kept for labels
and leads.

### 5.18 The docs are written for the cloud app, and self-hosting says who it's for

**House.** Outside the Self-hosting group, a docs page is for somebody using
app.smpl.money. The groups are Get started, Using Simple Balance, Budgets and
reports, Your account, and Self-hosting last, under "For people who run their
own copy" (`src/content/sections.ts:159-168`).

That's a reversal. Until the docs were rewritten in late October 2026, the
groups were Install, Using it, Reference and Operations, and Getting started
opened on Docker and PostgreSQL, written while the cloud app wasn't open and
installing it was the only way to have it. Once it opened, the reader most
likely to arrive was somebody who had just signed up, and the first page they
found told them to install a database.

- **A self-hosted difference is a note, not a step.** Where a copy you run
  yourself behaves differently, the page says so after the cloud answer, in a
  note titled "On a copy you run yourself", a sentence that opens with those
  words, or a closing section under that heading, linking Configuration for
  the setting. It never goes into the numbered steps, which a cloud reader
  follows to the letter.
- **A Self-hosting page says who it's for in its first lines**, and where a
  reader of the cloud app should go instead: "This page is for a copy you run
  yourself. On app.smpl.money there's nothing to configure." The two
  deployment guides are the exception, because their first sentence is about
  building a server and can't be misread.
- **The register follows the reader.** The groups before Self-hosting are
  written for 1.3's reader, with a bookkeeping word glossed where it first
  appears, as 5.14 asks of the learn guides; Self-hosting may use an
  operator's vocabulary, because an operator is reading it.

The obvious alternative is one register for the whole set. Written for the
operator, it loses a new user on the first page; written for the new user,
it explains to somebody configuring a reverse proxy what a server is.

_Checked by:_ `tests/content.test.ts` holds the groups to the order
`_sections.json` gives, and `tests/docs-features.test.ts` gives each its
words and picture. That Self-hosting comes last with its `audience` line,
where each self-hosted difference sits, and the register of every page, are
`human`.

## 6. Pricing and legal copy

### 6.1 A price claim is checked against the application

**Binding.** Every number on the pricing page is true of what the application
enforces: three accounts in use at once on the free plan and no limit on
Premium, $30 a year or $3 a month in US dollars, and no feature held back
from either.

Nothing in a test here can read the application — it is a different
repository — so the application's own contract is read through the snapshot
of it in `src/content/app-facts.json`. **`tests/app-facts.test.ts` holds the
page to that snapshot**: the free account limit, both plans' labels, which
plan sees ads, and every dollar figure in the paid tier's card, the note
under the cards, the FAQ, the search and link-preview descriptions, the
terms and the social card, each of which has to be a price the application
declares or the $0 of the free plan. `tests/pricing.test.tsx` holds the rest:
that the limit agrees with itself across the tier summary, the comparison
table and the FAQ, and that no row claims a feature Free lacks and Premium
has. A pricing page that overstates is the one page whose error the customer
discovers personally.

**"Everything is on the free plan" carries the limit, wherever it's said.**
The box closing every learn guide said everything the guides do is on the
free plan and named no limit, under a net worth guide that tells the reader
to add every account they have, and it was the one place on the site that
said it without "three accounts". It says "for three accounts you can use at
once" now, the homepage's words, as the homepage's plans panel and the
pricing page's lede do.

**The first version of this rule checked only internal agreement**, so the
price could agree with the comparison table and the FAQ and all three be
wrong together. The snapshot is what gave the numbers a referent outside
this repository, and whether the snapshot is still the application's is
`scripts/check-app-sync.mjs`, weekly and in `sync-from-app` §1, not a test.

_Checked by:_ `tests/app-facts.test.ts` against the snapshot, the free
plan's limit in the learn guides' closing box, the plans panel and the
pricing lede included; `tests/pricing.test.tsx` for internal agreement;
`scripts/check-app-sync.mjs` for whether the snapshot is still what the
application publishes.

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

**Binding.** The privacy policy names the actual processors — Stripe,
Google (for advertising, for Google sign-in, and through Gmail for the
application's email), Cloudflare (for the mail sent to the contact address),
Netlify and Oracle Cloud Infrastructure — the actual lawful bases, and the
actual retention. A generic policy is not merely unhelpful: it is a false
statement about what happens to somebody's data.

**It calls them providers, not processors.** A processor is a role under
each provider's own terms, not a word the page gets to choose. Google is a
controller for advertising under its Controller-Controller Data Protection
Terms unless restricted data processing is on, and a controller of its own
sign-in; for Gmail it is a processor only where the mailbox is Google
Workspace, and nothing smpl.money publishes shows one. So the policy says
Google decides for itself how it uses what it receives for advertising and
sign-in, and says nothing about its role for Gmail until the operator does.

**Oracle was the one left out**, as "our hosting provider", and it is the
one holding every balance: it hosts the application and its database, while
Netlify hosts only this site. The short version, which is what most people
read, named two of the application's providers and not the host.

**The mail service was the last one unnamed**, as "an email delivery
service" the policy promised to name before one was in use. It is Gmail, and
naming it took more than a word. The policy says what each of the
application's four messages carries to Google, read from the builders in its
`mail.ts`: a recurring transaction's name and dates are ledger data somebody
typed, so the Stripe paragraph's "nothing from your ledger" cannot be said
of it. The limit is on what the builders add, not on what the mail holds:
both names are free text, and a recurrence called "Chase Visa payment" puts a
payee and an account in the subject line, so "none of them holds a payee"
carries its exception in the same sentence. And Gmail keeps a copy of each
message the application sends by signing in to one mailbox through
smtp.gmail.com, in that mailbox's Sent mail, and a bounce or an automatic
reply can bring another copy back; a deletion in the application reaches
none of them, so the short version and the deletion section stopped saying
that deleting an account deletes everything. The copy is said as what that
route does rather than as what Gmail does, because the Workspace relay keeps
no such copy unless comprehensive mail storage is on, which is why a change
of `SMTP_HOST` on the application is a change to the retention paragraph.

**A deletion inside the ledger erases nothing, and the policy says so.** The
application records every change to a ledger, by its owner, a connected
assistant or its own schedule, with a copy of what the change touched as it
was before and after, a deletion included, and nothing prunes that history
before the account goes. A transaction is only marked deleted, and can be
restored. The policy said "an audit history of changes ... visible to you"
and "your ledger is kept until you delete it", which a reader takes as a
deletion that erases, while the homepage sells "a correction doesn't erase
what it corrected": the policy was weaker than the marketing about what is
kept, which is 2.4 from the other side. It says what the history keeps where
collection is, and that a deleted transaction and the history's copy both
stay until the account is deleted where retention is. The docs page on the
Activity screen says the same, and the policy is where it points for how
long.

**What outlasts a deletion is listed, not counted.** The short version said
"two things outlast a deleted account" while the long version already kept
server logs for a period of their own, and the hosted machine dumps the
whole database every night and keeps the newest 14 (`backupKeep` in the
application's Oracle stack). Nothing mentioned the backups. The list now
names each thing and how long, and a count is refused, because the next
thing added would leave the number behind. The 14 is a literal: nothing
here can read the stack, so a change to `backupKeep` is a change to the page.

**A legal conclusion rests on something the page can name.** "We do not
sell or share personal information as the CCPA defines it" holds only while
Google is a service provider for the ad requests, which is what its
restricted data processing makes it, and by default AdSense requests do not
limit how data is processed. The application's tag sets no restriction, so
the sentence rested on an AdSense account setting nothing here can read.
The policy says the facts instead, what leaves for advertising and that
Premium sends nothing, and the conclusion may come back only naming
restricted data processing beside it.

**CalOPPA asks two questions every policy has to answer**, however small the
operator (Bus. & Prof. Code 22575(b)(5) and (b)(6)): whether another party
may collect information about somebody's activity across other sites, which
Google's advertising cookies may, and how the operator responds to Do Not
Track, which is that nothing reads it. "What Google receives" lists what the
reader's browser hands over, the IP address, the browser's details and
Google's own cookies, as well as what the application adds, because a
heading that reads as the whole list made it look shorter than it is.

**The terms describe what the application charges and where a dispute
goes.** No tax is added to the price, because the application sets no
`automatic_tax` and adds no tax rate; "exclude any tax that may apply"
promised a total the checkout never shows. Governing law is California's,
the operator's decision, replacing an England and Wales clause nobody chose,
and the consumer carve-out covers the courts as well as the law. There is no
arbitration clause and no class-action waiver, by the same decision.

**And they follow California's automatic renewal law**, Bus. & Prof. Code
17602 as amended for contracts from July 1, 2025. A fee change is notified
"no less than 7 days and no more than 30 days" before it takes effect, with
what it will cost and how to cancel; "at least 30 days" left one day to send
it on. A material change is notified before it takes effect, with how to
cancel. And a cancellation needs a way that asks for no signing in, which is
writing to the contact address from the account's own. Each of these is a
promise the operator keeps by hand: the application sends none of that mail.

It also carries the three disclosures Google requires of a site serving
AdSense — third-party cookies, the vendors that set them, and how to opt out —
because missing any one is a breach whose penalty is suspension. The site
serving it is the application, and this is the policy its
`PRIVACY_POLICY_URL` links from every page, so the disclosures are about the
application and sit where a reader looks for them: under Advertising and
again under Cookies.

**And it says what this website does, which is nothing of anybody
else's.** A script that reaches another origin is a disclosure, and the
website loads nothing from another origin and sets no cookie, so the policy
says so in the short version, in its own section and in the cookies
section. Those sentences are true because of two
headers in `netlify.toml`, a content security policy naming no other origin
and a Permissions-Policy denying the Topics API, so the check holds the
sentences to the headers rather than to anybody's memory of them.

_Checked by:_ `tests/legal.test.tsx`, which asserts:

- the three AdSense disclosures for the application, under Advertising and
  under Cookies, with the website said to show no ad and load no advertising
  script; and that non-personalized ads are not described as cookie-free;
- that the website loads nothing from another origin and sets no cookie, in
  the short version, the website's section and the cookies section, with the
  hosts and the cookie it used to disclose held gone; that `netlify.toml`'s
  content security policy names no other origin while that is said, and its
  Permissions-Policy denies the Topics API the policy says this website
  refuses; and that no sentence points at a consent message on the website;
- every processor named, Cloudflare included, in the policy and, for the
  host and the mail service, in the short version's list of providers; and
  that they are listed as providers, no sentence naming Gmail calls anybody
  a processor, and Google is said to decide for itself for advertising and
  sign-in and not for Gmail;
- that Gmail is named as the mail service and the promise to name one is
  gone; what reaches Google through it, message by message, with no
  sentence saying the mail carries nothing from the ledger, the name in the
  subject line, and the limit carrying the exception for a name somebody
  typed; and that Gmail's copies are disclosed where retention is, as what
  signing in to one mailbox does rather than as what Gmail does, with the
  bounces and automatic replies, how long they are kept, and every copy
  deleted on request, while neither the deletion section nor the short
  version says deleting an account removes them;
- that the history of changes keeps a copy of what each change touched,
  before and after, until the account is deleted, and that the ledger lasts
  as long as the account rather than until something in it is deleted, with
  a deleted transaction restorable; held to the application's contract too,
  so a snapshot that stops declaring an append-only history fails it;
- the nightly backups, with the 14 kept and the two weeks that makes, where
  retention is and where deleting is; a deletion that reaches the database
  and no further; and the short version listing what outlasts a deletion,
  backups, logs, Stripe and Gmail, without counting it;
- where Stripe, Google and Cloudflare hold what they receive, the Gmail
  copies included, and the framework each takes part in;
- what the reader's browser hands Google for an ad, the IP address, the
  browser's details and Google's cookies; that Google may collect across
  other sites; and how Do Not Track is answered;
- the GDPR and CCPA rights; that no sentence says personal information is
  not sold or shared unless it names restricted data processing in the same
  paragraph; that the rights section says what leaves for advertising and
  that Premium sends nothing; and that the terms do not purport to restrict
  the AGPL;
- that declining ad consent leaves the ads in place, on the policy and the
  pricing page alike, and that neither says it means no ads;
- that the cookies section names what the application actually sets: local
  storage rather than a cookie for the theme, and Stripe's own cookies. Not
  that the plan page is the only one loading Stripe's script: that depends
  on how the application imports it, which nothing here can read, and
  `legal-review` §5's devtools check is what looks;
- that deleting an account deletes the billing records the application
  keeps and the customer record at Stripe, that the payments stay in
  Stripe's records, and that those billing records are never called payment
  details;
- what Stripe receives, what a session records, and that an AI assistant
  somebody connects reads their ledger;
- the downgrade as the product runs it: the choice is made once and may
  name any three, and until it is made, a first downgrade keeps the three
  oldest accounts, while after an earlier choice it keeps the oldest three
  among the accounts still chosen and any opened or restored since;
- that "choose any three" is promised in exactly one sentence, and that
  sentence carries its condition: more than three accounts in use when a
  subscription ends. "The choice is put to you again" is refused, and the
  plans section calls it a choice a downgrade _may_ put to you;
- that the billing record is described as every request it keeps:
  subscribing, changing or canceling, replacing a card, and how the request
  ended;
- no rate limit the terms point at that is not documented, and no export
  promised larger than the one the product has;
- that the terms add no tax to the price, give tax added to a renewal the
  same notice by email as a price change, and that the pricing page never
  says tax is extra;
- that every promise of notice of a price or a tax gives a window inside
  California's 7 to 30 days, by email, with what it will cost and how to
  cancel, and no bare "at least N days"; that the notice of a material
  change is by email, before it takes effect, with what is changing and how
  to cancel; and that the cancellation sentence names a way that needs no
  signing in;
- California's law with its conflict-of-laws rules excluded, California's
  state and federal courts, and a consumer elsewhere keeping the law and
  the courts of where they live; and no English law, arbitration clause or
  class-action waiver in either document;
- that the way back in is spelled out: each account exported from its own
  page with the dates set to All time, a date range at a time past 10,000
  rows, and a transfer flagged as a duplicate by the second import.

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

Today `/learn` and `/docs` are announced and `/blog` is not. The learn articles
and the documentation are linked from the header and the footer, indexed, and
in the sitemap; the blog is built, styled and reachable by URL, and nothing
points at it. The learn articles lead the header because they are written for
the reader the homepage is written for. The split is the shipped
state and is deliberate on both sides: the blog's machinery is finished so that
publishing the first post is writing a Markdown file rather than building a
blog, and it stays unannounced because what goes in it has not been decided —
an empty section advertised in the header is worse than none.

One flag rather than three habits, because a section half-launched by somebody
adding a link is the failure this prevents.

**It decides two more things now, both derived from the first three.** A
section's pages are listed in `/llms.txt` only if it's announced (5.15), and
the blog's feeds are linked from every page's head only once the blog is;
until then only the blog's own pages link them (`src/lib/feed.ts`). Each
reads the same flag, so announcing the blog adds its posts to `/llms.txt` and
its feeds to every page in the same change. **It doesn't decide the Markdown
copies**: a docs page or a learn guide has one, linked from its head, whether
or not its section is announced, which 5.15 records with what moving it
would take.

**It has to prevent the mirror failure too, and for most of this file's life it
could not.** The rule above was written as though the flag moved all three, and
two of them were real: each route file reads it for its `robots` metadata and
`src/app/sitemap.ts` walks `announcedSections()`. The link did not. `primaryNav`
and `footer.links` in `src/content/home.ts` were hand-written literals, so
`announcedSections()` had one caller and announcing a section would have
stopped its `noindex`, entered it in the sitemap, and linked it from nowhere —
a page Google is invited to index and no reader can reach. Both lists derive
from `announcedSections()` now. Writing a section's link back out by hand is
what would restore the defect, and it would leave every behavioral check green.

_Checked by:_ `tests/sections.test.tsx`. Each of the three is asserted in both
directions, over every section in the registry: announced means linked,
indexable and in the sitemap, unannounced means none of the three. The
derivation is asserted separately and structurally — that `src/content/home.ts`
calls `announcedSections()` and names no section's href — because it is a claim
about how the link is produced rather than about what a page shows. The link
half reads the rendered header and footer; the `noindex` and sitemap halves
read the built output, so both need a current build to mean anything.

### 7.2 Crawling is allowed; indexing is not

**Binding.** `robots.txt` allows everything. Unannounced pages carry `noindex`.

`Disallow: /blog` is the reflex and it is exactly wrong: a crawler that cannot
fetch the page never sees the `noindex`, so a URL somebody links to can still
be indexed — as a bare link with no description, which is the worst of both.

_Checked by:_ `tests/sections.test.tsx`.
