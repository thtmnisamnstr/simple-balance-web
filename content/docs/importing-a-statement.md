---
title: Importing a statement
description: Point the importer at a CSV your bank exported and review what it proposes before anything counts.
section: Using it
order: 1
updated: 2026-09-17
---

The importer reads a CSV, works out its shape, and proposes rows. Nothing it
proposes affects a balance until you commit it.

## Export from your bank

Any CSV will do. There is no required column order and no template to match —
the importer reads the header row and maps what it recognises.

<Callout kind="note">
If your bank offers OFX or QIF as well, take the CSV. The other two carry less
than their reputation suggests and neither is read here.
</Callout>

## What it works out for itself

- **The delimiter and the encoding**, including files that open wrongly in a
  spreadsheet.
- **The date format**, including the ambiguous ones. A file of days below the
  thirteenth is genuinely undecidable, and it asks rather than guessing.
- **Which column is the amount**, including the two-column debit/credit shape.
- **Payees and categories** it has seen before.

## Staging, and why nothing counts yet

Every imported row is **staged**. A staged row has no postings, appears in no
balance, and is absent from every report. It exists to be looked at.

That is what makes a wrong mapping cheap: if the importer read the wrong
column, you delete the batch and nothing in your ledger ever knew.

## Duplicates

A row that resembles one already in the ledger is flagged and shown beside the
entry it resembles, so you can compare them and drop whichever is the spare.

Importing the same statement twice is the common case, and it produces one
ledger rather than two.

## Committing

Committing turns staged rows into transactions, writes their postings, and is
atomic: either every row in the batch lands or none does.

The cap is ten thousand rows, and it is the same ten thousand everywhere in the
product.
