# Comments

## 1. Comments carry the argument, not the mechanism

**House.** A comment says why the obvious alternative is wrong. It does not
restate what the line does.

This is inherited from the application, where comment density is deliberately
around 22% of non-blank lines, and it is the habit most likely to look like a
mistake to somebody new. It is not. The value of these files is in the
decisions, and a decision with no recorded reason gets reversed by the next
person in a hurry.

Examples of the kind that earn their place, all from this repository:

- Why `robots.txt` allows crawling of pages that carry `noindex`.
- Why the date is normalised in the parser rather than at the call site.
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
