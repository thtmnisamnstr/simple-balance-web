# Comments

## 1. Comments carry the argument, not the mechanism

**House.** A comment says why the obvious alternative is wrong. It does not
restate what the line does.

This is inherited from the application, where comment density is deliberately
around 22% of non-blank lines, and it is the habit most likely to look like a
mistake to somebody new. It is not. The value of these files is in the
decisions, and a decision with no recorded reason gets reversed by the next
person in a hurry.

This outranks any tool's or plugin's default of fewer comments. When a hook
or a review tool challenges a comment here, cut whatever describes the mechanism
and keep the reason.

Examples of the kind that earn their place, all from this repository:

- Why `robots.txt` allows crawling of pages that carry `noindex`.
- Why the date is normalized in the parser rather than at the call site.
- Why the authors registry is re-exported with a wider value type.
- Why there is no catch-all rewrite in `netlify.toml`.

Each of those is a line somebody would otherwise "clean up".

_Checked by:_ `human`.

## 2. A comment that describes a defect names it

**House.** Where a comment exists because something went wrong, it says what
went wrong. "The first version of this check failed on the file's own comment"
is worth more than "strip comments first".

## 3. No commented-out code

**Binding.** Delete it. The history has it.

## 4. A comment about something removed goes with it

**House.** When a feature goes, or changes what it does, the comments that
describe it go or change in the same commit, and finding them takes a search
for the feature's name as well as for its code.

Three turned up in one review. After the ads left this site, the doc comment
over `measure` in `tests/a11y.test.ts` went on saying it opened a page "with
the ad loader blocked", above a route that aborted requests to four Google
hosts nothing loaded any more. The image script's header said its one card
"does not change per page" after it had started drawing a card for every
page. And the homepage's drawings were still described as playing once after
both had become loops.

A comment that misdescribes its code is believed the way a wrong guide is
(`writing.md` §Keeping a document true), and it's read at the worst moment,
by somebody about to change the line under it. The removal's diff doesn't
show it, because the comment's own lines didn't change.

**The obvious alternative** is to delete the code and trust review to catch
the prose, and review reads the diff, which is exactly where these aren't.

_Checked by:_ `human`, with `grep -rni <name> src tests scripts` in the commit
that removes the feature.
