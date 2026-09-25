import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { comparison, faq, pricing, pricingMeta, tiers } from "@/content/pricing";
import { privacy as privacySection } from "@/content/home";
import { render } from "@testing-library/react";
import PrivacyPage from "@/app/privacy/page";
import TermsPage from "@/app/terms/page";
import { legalUpdated, privacy, terms, type Section } from "@/content/legal";
import { slugify } from "@/content/collections";

/**
 * The legal pages.
 *
 * These are the documents somebody arrives at with one question, and the
 * failure mode is not a typo — it is a policy that describes a product nobody
 * built, or one that omits the disclosure a vendor's terms require. So these
 * check for the disclosures rather than for prose quality.
 */

/**
 * One section's paragraphs, lowercased, found by its heading.
 *
 * For a claim that has to sit where a reader looking for it will look: a
 * cookie the policy discloses under "Payments" is still undisclosed to
 * somebody reading the cookies section.
 */
function section(doc: { readonly sections: readonly Section[] }, heading: RegExp): string {
  const found = doc.sections.find((s) => heading.test(s.heading));
  expect(found, `no section heading matches ${heading}`).toBeDefined();
  return found!.paragraphs.join(" ").toLowerCase();
}

/**
 * The notice a sentence promises, as "between N and M days before", or
 * undefined. A window rather than a floor, because California's automatic
 * renewal law caps the notice of a fee change as well as setting its minimum.
 */
function noticeWindow(sentence?: string): readonly [number, number] | undefined {
  const found = /\bbetween (\d+) and (\d+) days before\b/.exec(sentence ?? "");
  return found ? [Number(found[1]), Number(found[2])] : undefined;
}

/** A section's sentences, lowercased. */
function sentencesOf(doc: { readonly sections: readonly Section[] }, heading: RegExp) {
  return section(doc, heading).split(/(?<=[.!?])\s+/);
}

/** Every string in a content value, however deeply it is nested. */
function stringsIn(value: unknown): readonly string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringsIn);
  if (value && typeof value === "object") return Object.values(value).flatMap(stringsIn);
  return [];
}

describe("the privacy policy", () => {
  const text = privacy.sections
    .flatMap((s) => s.paragraphs)
    .join(" ")
    .toLowerCase();

  it("discloses everything Google requires of a site serving AdSense", () => {
    // Google's program policies: third-party cookies, the vendors that set
    // them, and how to opt out. Missing any of the three is a breach, and the
    // penalty is suspension rather than the ads not rendering.
    for (const required of ["adsense", "cookies", "non-personalized", "opt out"]) {
      expect(text, `the policy never mentions "${required}"`).toContain(required);
    }
  });

  it("names every processor that sees the data", () => {
    // Netlify hosts only this site; Oracle hosts the application and holds
    // its database, which makes it the processor with every balance in it,
    // and it was the one the policy left as "our hosting provider". Gmail
    // carries the application's email, and was "an email delivery service"
    // until it was chosen. Cloudflare receives the mail sent to the contact
    // address, which is where every request this policy invites arrives.
    for (const processor of ["stripe", "google", "netlify", "oracle", "gmail", "cloudflare"]) {
      expect(text, `"${processor}" is not named`).toContain(processor);
    }
    const others = section(privacy, /^who else sees/i);
    expect(others, "Cloudflare is not said to receive the contact address's mail").toMatch(
      /\bcloudflare\b[^.]*\breceives the mail you send to info@smpl\.money\b/,
    );
    // The short version is what most people read, and it listed two of the
    // application's four providers and left out the host.
    const summary = section(privacy, /^the short version/i);
    expect(summary, "the summary leaves out the host").toContain("oracle");
    // In the list itself: the summary's sentence about deleting names Gmail
    // too, as the place a copy of your email outlasts the account, and a
    // whole-summary check was satisfied by that alone.
    const list = /the providers that run the service: ([^.]*)\./.exec(summary)?.[1] ?? "";
    expect(list, "the summary's providers leave out the mail service").toContain("gmail");
  });

  it("calls the providers providers, and says Google decides for itself where it does", () => {
    /*
     * "Processor" is a role under each provider's own terms, not a word this
     * page gets to choose. Google is a controller for advertising unless
     * restricted data processing is on, under its Controller-Controller Data
     * Protection Terms, and a controller of its own sign-in; for Gmail it is a
     * processor only if the mailbox is Google Workspace, which nothing shows.
     * So no sentence that names Gmail calls anybody a processor, the list is
     * of providers, and Google's own role is said for the two uses where it
     * is known.
     */
    const others = sentencesOf(privacy, /^who else sees/i);
    for (const sentence of others.filter((s) => s.includes("gmail"))) {
      expect(sentence, "Gmail is called a processor").not.toMatch(/\bprocessors?\b/);
    }
    expect(others.join(" "), "the providers are listed as processors").not.toMatch(
      /\bthose processors are\b/,
    );
    const role = others.find((sentence) => /\bdecides for itself\b/.test(sentence));
    expect(role, "Google's own role is not said").toBeDefined();
    expect(role, "Google's role is not said for advertising and sign-in").toMatch(
      /\bfor advertising and for sign-in, google decides for itself\b/,
    );
    expect(role, "Google's role is said for Gmail too, which nothing shows").not.toContain("gmail");
    expect(role, "Google's own policy is not named").toContain("policies.google.com/privacy");
  });

  it("keeps each provider in the summary apart from the next", () => {
    // With commas, "Oracle Cloud Infrastructure, which hosts it, the payment
    // processor, the advertising network..." read as Oracle hosting all of
    // them, in the paragraph most readers stop at. One item per provider,
    // and the host's item names nobody else.
    const summary = section(privacy, /^the short version/i);
    const list = /the providers that run the service: ([^.]*)\./.exec(summary)?.[1];
    expect(list, "the summary no longer lists the providers").toBeDefined();
    const items = (list ?? "").split(";").map((item) => item.trim());
    expect(items.length, `one run-on item: ${list}`).toBeGreaterThanOrEqual(4);
    const host = items.find((item) => item.includes("oracle"));
    expect(host, "no item names the host").toBeDefined();
    expect(host).not.toMatch(/payment|advertising|email/);
  });

  it("says plainly that card details are never stored here", () => {
    expect(text).toContain("never see or store your card details");
  });

  it("covers the rights the GDPR and the CCPA give", () => {
    for (const right of ["gdpr", "erased", "portable", "california"]) {
      expect(text).toContain(right);
    }
  });

  it("claims nothing about selling or sharing that rests on a setting it can't see", () => {
    /*
     * "We do not sell or share personal information as those laws define it"
     * is a conclusion, and it holds only while Google is our service provider
     * for the ad requests, which is what its restricted data processing makes
     * it. By default AdSense requests do not limit how data is processed, and
     * the application's tag sets no restriction, so the conclusion rests on
     * an AdSense account setting this repository cannot read. Any sentence
     * making it has to name what makes it true, in the same paragraph.
     *
     * What stays is the fact: what leaves for advertising is what Google
     * receives, on the free plan, and nothing on Premium.
     */
    const SELLS = /\b(do not|don't|never|doesn't|does not) sell or share\b|\bnot sold or shared\b/;
    for (const paragraph of privacy.sections.flatMap((s) => s.paragraphs)) {
      if (!SELLS.test(paragraph.toLowerCase())) continue;
      expect(paragraph.toLowerCase(), "no sale or sharing, without what makes it so").toMatch(
        /\brestricted data processing\b/,
      );
    }
    const rights = section(privacy, /^your rights/i);
    expect(rights, "what leaves for advertising is not said where the rights are").toMatch(
      /\bfor advertising is what google receives\b[^.]*\bfree plan\b/,
    );
    expect(rights, "Premium is not said to send nothing for advertising").toMatch(
      /\bon premium nothing does\b/,
    );
  });

  it("distinguishes the hosted deployment from somebody else's", () => {
    // The software is self-hostable. A policy that did not say so would be
    // claiming responsibility for deployments we have never seen.
    expect(privacy.intro.join(" ").toLowerCase()).toContain("somebody else runs");
  });

  it("gives a contact address that is the published one", () => {
    expect(text).toContain("info@smpl.money");
  });

  it("says why this site has no cookie banner, rather than leaving it unsaid", () => {
    // The question a reader has, answered in the document rather than in a
    // support email. The site sets nothing, so a banner would be theater.
    expect(text).toContain("sets no cookies at all");
    expect(text).toContain("no banner");
  });

  it("does not claim non-personalized ads are cookie-free", () => {
    // The mistake that would make this policy false. Non-personalized ads
    // still set cookies for frequency capping and fraud prevention, which is
    // why consent is asked for in the EEA regardless.
    expect(text).toContain("non-personalized is not the same as cookie-free");
    expect(text).toMatch(/frequency capping/);
  });

  it("says what Google actually receives, because the pricing page promises it does", () => {
    /*
     * The pricing page's ad answer ends "the privacy policy covers the rest,
     * including what does reach Google". It was shortened to that from a
     * paragraph that said so itself, and the policy did not carry the detail
     * — so the honest disclosure was deleted from the site by a cut made on
     * a different page.
     *
     * The application documents it: the publisher id and the page address
     * reach Google, and its paths carry record ids. A policy that omits that
     * while the product's own docs state it is the policy that is wrong.
     */
    expect(text).toContain("what google receives");
    expect(text).toContain("publisher id");
    expect(text).toContain("address of the page");
    // The limit matters as much as the disclosure: no balance, no name.
    expect(text).toContain("targeting parameter");
    /*
     * And what the reader's own browser hands over. The ad is requested by
     * the browser, so Google gets the IP address the rough location is read
     * from, the browser's details and its own cookies. A paragraph headed as
     * the whole list with only the publisher id and the page on it made the
     * list look shorter than it is, which is `content.md` 2.4's failure.
     */
    const receives = privacy.sections
      .flatMap((s) => s.paragraphs)
      .find((paragraph) => /^\*\*what google receives\.\*\*/i.test(paragraph))
      ?.toLowerCase();
    expect(receives, "no paragraph says what Google receives from an ad").toBeDefined();
    for (const [what, pattern] of [
      ["the IP address", /\byour ip address\b/],
      ["the browser's details", /\byour browser's details\b/],
      ["Google's cookies", /\bgoogle's own cookies\b/],
    ] as const) {
      expect(receives, `what Google receives leaves out ${what}`).toMatch(pattern);
    }
  });

  it("answers CalOPPA's two questions: other parties across sites, and Do Not Track", () => {
    /*
     * Bus. & Prof. Code 22575(b)(6): whether other parties may collect
     * information about somebody's activity over time and across other
     * sites. Google's advertising cookies are its own and read wherever its
     * ads run, so it may, and "rather than on a profile of you", which is
     * about how an ad here is chosen, read as saying nothing was collected.
     *
     * 22575(b)(5): how the operator responds to Do Not Track. Nothing in the
     * application reads the signal, and the website collects nothing either
     * way, so that is what is said, and nothing about what Google's own
     * script does with it.
     */
    const ads = section(privacy, /^advertising/i);
    expect(ads, "collection across other sites is not disclosed").toMatch(
      /\bgoogle may collect information about what you do over time and across other websites\b/,
    );
    const dnt = privacy.sections
      .flatMap((s) => s.paragraphs)
      .find((paragraph) => /\bdo not track\b/i.test(paragraph))
      ?.toLowerCase();
    expect(dnt, "the policy says nothing about Do Not Track").toBeDefined();
    expect(dnt, "how the website and the application respond is not said").toMatch(
      /\bneither smpl\.money nor the application responds\b/,
    );
    expect(dnt, "the response is said to be more than the application does").not.toMatch(
      /\b(we|the application) (honou?rs?|respects?)\b/,
    );
  });

  it("is not promised something it does not contain", () => {
    // Whatever the pricing page says the policy covers, it has to cover.
    const pointer = faq.find((item) => /privacy policy/i.test(item.a));
    expect(pointer, "no pricing answer points at the policy").toBeDefined();
    if (/what does reach google/i.test(pointer!.a)) {
      expect(text, "the pricing page points at a disclosure the policy lacks").toContain(
        "what google receives",
      );
    }
  });

  it("says consent is collected before an ad cookie is set, and can be withdrawn", () => {
    expect(text).toContain("before any ad cookie is set");
    expect(text).toContain("withdraw");
  });

  it("separates service email from product email, and only one has an unsubscribe", () => {
    // Service mail rests on the contract and has no unsubscribe; product mail
    // rests on legitimate interests and must carry one in every message.
    // Conflating them is how a maintenance notice ends up unsendable.
    expect(text).toContain("there is no unsubscribe from them");
    expect(text).toContain("unsubscribe link that works immediately");
    expect(text).toContain("legitimate interests");
  });

  it("describes product email as not sent, and no opt-out the product lacks", () => {
    // The application sends no product email, and its sign-up form asks for
    // a name, an address and a password. "Say so when you create the
    // account" sent a reader looking for a field that does not exist.
    expect(text).not.toContain("when you create the account");
    expect(text).toContain("none is sent today");
  });

  it("names Gmail as the mail service, in the list and the summary, and still sends mail", () => {
    /*
     * The policy said "an email delivery service" carries the application's
     * email and promised to name it before one was in use. Gmail is that
     * service, so the promise is kept by naming it and then goes: a page
     * that still says it will name a service it has named reads as a second
     * one on the way.
     *
     * Gmail is Google's, and a reader counting who sees their data counts
     * companies, so both places that name Gmail say whose it is.
     *
     * "So it sends none of those messages today" once took in the service
     * email the Email section says goes to every account, and the notice by
     * email the Changes section promises, so no sentence anywhere in the
     * policy may say mail is not sent.
     */
    const processors = section(privacy, /^who else sees/i);
    expect(processors, "Gmail is not said to be Google's").toMatch(/\bgoogle\b[^.]*\bgmail\b/);
    expect(processors, "Gmail is not said to carry the application's email").toMatch(
      /\bgmail\b[^.]*\bcarries the email the application sends\b/,
    );
    // The application's own messages, not "the messages above", which took
    // in the service email the application has no way to send.
    expect(processors).not.toContain("carries the messages above");
    const list = /the providers that run the service: ([^.]*)\./.exec(
      section(privacy, /^the short version/i),
    )?.[1];
    const mail = (list ?? "").split(";").find((item) => item.includes("gmail"));
    expect(mail, "the summary's list of providers leaves out Gmail").toBeDefined();
    expect(mail, "the summary does not say Gmail is Google's").toMatch(/\bgoogle\b/);
    for (const promise of [
      /email delivery service/,
      /\bname the (e-?mail |mail )?service\b/,
      /doesn't use one yet|once one is in use/,
    ]) {
      expect(text, "the policy still promises a mail service it has named").not.toMatch(promise);
    }
    expect(text).not.toMatch(/\bsends? (none|nothing)\b/);
    expect(text).not.toMatch(/\bsends? no (e-?mails?|mail|messages?)\b/);
  });

  it("says what reaches Google through Gmail, message by message, and no more", () => {
    /*
     * The builders in the application's `mail.ts`, each sent to the
     * account's address alone with no name on it: an address confirmation
     * and a password reset, each carrying a link that lasts an hour; a
     * recurring transaction's notice, carrying its name, the count and each
     * date; and a template's reminder, carrying its name and the one date.
     * None carries an amount, a payee or an account.
     *
     * The limit is held as closely as the disclosure. A recurrence's name
     * and dates are ledger data somebody typed, so "nothing from your
     * ledger", true of what Stripe is sent, is refused here.
     */
    const gmail = privacy.sections
      .flatMap((s) => s.paragraphs)
      .find((paragraph) => /what google receives through gmail/i.test(paragraph))
      ?.toLowerCase();
    expect(gmail, "no paragraph says what Google receives through Gmail").toBeDefined();
    const said = gmail ?? "";
    for (const message of [
      /\bconfirm (that|your) address\b/,
      /\bpassword reset\b/,
      /\brecurring transaction\b/,
      /\breminder you set on a template\b/,
    ]) {
      expect(said, `one of the application's messages is left out: ${message}`).toMatch(message);
    }
    expect(said, "Google is not said to receive the address").toMatch(
      /\breceives your email address\b/,
    );
    // What follows each subject, up to the end of its clause, so the
    // reminder's "date" cannot be satisfied by the notice's "date of each".
    const after = (subject: string) => (said.split(subject)[1] ?? "").split(/\.\s|, and a /)[0]!;
    expect(after("confirmation or reset"), "the links are not said to expire").toMatch(
      /\blink\b[^.]*\bwithin an hour\b/,
    );
    const notice = after("recurring transaction's notice");
    for (const part of [/\bname you gave it\b/, /\bhow many\b/, /\bdate of each\b/]) {
      expect(notice, `the notice's contents leave out ${part}`).toMatch(part);
    }
    const reminder = after("template's reminder");
    for (const part of [/\btemplate's name\b/, /\bdate\b/]) {
      expect(reminder, `the reminder's contents leave out ${part}`).toMatch(part);
    }
    const limit = after("none of them holds");
    for (const absent of ["your name", "an amount", "a balance", "a payee", "account"]) {
      expect(limit, `the messages are not said to leave out ${absent}`).toContain(absent);
    }
    // The limit is on what the application adds. Both names are free text,
    // so a recurrence called "Chase Visa payment" sends a payee and an
    // account in its subject line, and the limit said without that was false.
    expect(limit, "the limit forgets that a name you typed can hold one").toMatch(
      /\bunless you put one into the name you gave the recurring transaction or the template\b/,
    );
    expect(said, "the name is not said to be in the subject line").toMatch(
      /\bboth put that name in the subject line\b/,
    );
    expect(said, "a name and dates from the ledger are said not to be sent").not.toMatch(
      /nothing (else )?from your ledger|no ledger data/,
    );
  });

  it("says Gmail keeps a copy, for how long, and what deleting an account leaves", () => {
    /*
     * Google's IMAP help: "Sent messages are automatically copied to the
     * Gmail/Sent folder if your email client uses SMTP", and the application
     * reaches smtp.gmail.com over SMTP. Deleting an account in the
     * application reaches nothing in a mailbox, so the copy outlasts it, and
     * it stays until the operator deletes it, then up to 30 days in the
     * trash. No shorter period is promised, because none is set.
     *
     * Said where a reader looks for how long, where a reader looks for what
     * deleting does, and in the summary's sentence about deleting, which
     * otherwise reads as deleting everything.
     *
     * Said as what signing in to one mailbox does, not as what Gmail does:
     * the Workspace relay keeps no Sent copy unless comprehensive mail
     * storage is on, so "Gmail saves every message sent through it" was one
     * route's behavior stated as Gmail's. And Sent is not the only copy: a
     * bounce, or an automatic reply that ignores `Auto-Submitted`, can quote
     * the message back, so the promise to delete covers every copy.
     */
    const retention = section(privacy, /^where it is held/i);
    expect(retention, "the Sent copy is not tied to the route that makes it").toMatch(
      /\bby signing in to one gmail mailbox\b[^.]*\bin that mailbox's sent mail\b/,
    );
    expect(retention, "one route's behavior is said to be Gmail's").not.toMatch(
      /\bgmail (saves|keeps) (a copy of )?every message sent through it\b/,
    );
    expect(retention, "a bounce or an automatic reply's copy is not said").toMatch(
      /\bbounces\b[^.]*\bautomatic reply\b[^.]*\bcopy of it\b/,
    );
    expect(retention, "how long the copies are kept is not said").toMatch(
      /\bthose copies stay until we delete them\b/,
    );
    expect(retention, "the trash is not said").toMatch(/trash for up to 30 days/);
    expect(retention).toMatch(/deleting your account doesn't reach them/);
    expect(retention, "not every copy is deleted on request").toMatch(
      /we'll delete every copy of the email sent to you/,
    );
    const deleting = section(privacy, /^deleting your account/i);
    expect(deleting, "deleting is said to remove every record").not.toMatch(
      /every associated record|all (of )?your data/,
    );
    expect(deleting).toMatch(/copies gmail keeps[^.;]*aren't part of it/);
    const summary = privacy.sections
      .find((s) => /^the short version/i.test(s.heading))!
      .paragraphs.find((paragraph) => /deleting your account/i.test(paragraph))
      ?.toLowerCase();
    expect(summary, "the summary no longer says what deleting does").toBeDefined();
    expect(summary, "the summary's deletion leaves out the Gmail copy").toMatch(
      /outlasts? a deleted account[^.]*\bgmail\b/,
    );
  });

  it("says what outlasts a deleted account, backups and logs included, with how long", () => {
    /*
     * The hosted machine runs `simple-balance-backup` every night, and it
     * dumps the whole database and keeps the newest `SB_BACKUP_KEEP`, which
     * the Oracle stack sets from `backupKeep`, 14 unless changed. So a
     * deleted account's ledger stays in the dumps taken before the deletion
     * until 14 newer ones replace them. The policy never mentioned backups,
     * and the summary said "two things outlast a deleted account" while the
     * long version already kept server logs for a period of their own.
     *
     * The 14 is a literal because nothing here can read the application's
     * stack: a change to `backupKeep` is a change to this and to the page.
     */
    const retention = section(privacy, /^where it is held/i);
    expect(retention, "the nightly backups are not disclosed").toMatch(
      /\bbacked up every night\b[^.]*\bthe 14 most recent backups are kept\b/,
    );
    expect(retention, "how long a deletion stays in the backups is not said").toMatch(
      /\buntil 14 newer ones have replaced them\b[^.]*\btwo weeks\b/,
    );
    const deleting = section(privacy, /^deleting your account/i);
    expect(deleting, "deleting is said to reach past the database").toMatch(
      /\bevery record the application keeps about you from its database\b/,
    );
    expect(deleting, "deleting leaves out the backups").toMatch(
      /\bbackups taken before then still hold it\b[^.]*\btwo weeks\b/,
    );
    const summary = privacy.sections
      .find((s) => /^the short version/i.test(s.heading))!
      .paragraphs.find((paragraph) => /deleting your account/i.test(paragraph))
      ?.toLowerCase();
    const outlasts = /outlasts? a deleted account: ([^.]*)\./.exec(summary ?? "")?.[1];
    expect(outlasts, "the summary no longer says what outlasts a deleted account").toBeDefined();
    expect(summary, "the summary counts what outlasts it").not.toMatch(
      /\b(two|three|four|five) things outlast\b/,
    );
    for (const [what, pattern] of [
      ["the backups, with their period", /\bnightly backups for about two weeks\b/],
      ["the server logs", /\bserver logs\b/],
      ["Stripe's record", /\bstripe keeps its own record\b/],
      ["Gmail's copies", /\bgmail\b/],
    ] as const) {
      expect(outlasts, `the summary's list leaves out ${what}`).toMatch(pattern);
    }
  });

  it("says where the other providers hold what they receive, the Gmail copies included", () => {
    /*
     * The section said where Oracle holds the data and what the transfer
     * rests on, then kept copies at Google in the paragraph after it with no
     * word on where. A reader of a section that names one place takes
     * everything to be there. So the other three are named, with where, and
     * with the framework each takes part in.
     */
    const held = sentencesOf(privacy, /^where it is held/i).find((sentence) =>
      /\bheld by them\b/.test(sentence),
    );
    expect(held, "no sentence says where the other providers hold it").toBeDefined();
    for (const provider of ["stripe", "google", "cloudflare", "gmail"]) {
      expect(held, `where ${provider} holds it is not said`).toContain(provider);
    }
    expect(held, "no country is named").toMatch(/\bunited states and in other countries\b/);
    expect(section(privacy, /^where it is held/i), "no safeguard is named for them").toMatch(
      /\beach of them takes part in the eu-u\.s\. data privacy framework and its uk extension\b/,
    );
  });

  it("lists the cookies the application actually sets, where a reader looks for them", () => {
    const cookies = section(privacy, /^cookies/i);
    // The theme is saved on the account and cached in local storage. The
    // policy called it "a preference cookie", which a reader checking with
    // devtools finds is not there.
    expect(cookies).not.toMatch(/(preference|theme) cookie|cookie remembering/);
    expect(cookies).toContain("local storage");
    // Stripe.js sets its own fraud-prevention cookies on the page that loads
    // it. A cookies section that stops at the application's own is missing
    // the third party that sets them.
    expect(cookies).toContain("stripe");
  });

  it("says what a deleted account's payments leave behind, and where", () => {
    /*
     * Deleting an account deletes the Stripe customer and the row that maps
     * to it. It does not delete the charges and invoices, which stay in the
     * operator's Stripe account. So the retention paragraph says what the
     * software deletes and where the payments stay; "deletes what we hold
     * about your payments" said the operator kept nothing, which is stronger
     * than the product. "Typically six years" was HMRC's figure, and
     * "survives deleting your account" said the application's own record
     * outlasted the account.
     */
    expect(text).not.toContain("six years");
    expect(text).not.toContain("survives deleting your account");
    expect(text).not.toContain("what we hold about your payments");
    expect(text).toContain("stripe keeps its own record");
    const retention = section(privacy, /^where it is held/i);
    expect(retention).toContain(
      "billing records the application keeps and your customer record at stripe",
    );
    expect(retention).toContain("payments themselves stay in stripe's records");
  });

  it("names the billing records it keeps, and never calls them payment details", () => {
    /*
     * `billing_customer` holds a Stripe customer id and `billing_subscription`
     * a subscription id, its status, the price and its dates. "The payment
     * details the application keeps" said, in ordinary usage, that the card
     * was here, against "we never see or store your card details" in the
     * same document. Named where the policy says what is collected, what is
     * stored, and what deleting removes.
     */
    expect(text).not.toContain("payment details");
    for (const [heading, where] of [
      [/^what the application collects/i, "collected"],
      [/^payments/i, "stored"],
      [/^where it is held/i, "deleted"],
    ] as const) {
      const said = section(privacy, heading);
      expect(said, `what is ${where} names no Stripe identifier`).toMatch(
        /identifiers stripe gives|stripe's identifiers/,
      );
      expect(said, `what is ${where} leaves out the subscription's status and dates`).toContain(
        "subscription's status and dates",
      );
      expect(said, `what is ${where} does not rule out the card`).toContain("card details");
    }
  });

  it("names every billing request it keeps a record of, the card included", () => {
    /*
     * `billing_operation` is written by `underIdempotency` for four requests:
     * `subscription.set`, `subscription.cancellation`, `payment.setup` and
     * `payment.setup.confirm`. The last two replace a card. "A record of each
     * change to your subscription you ask for" left them out, in the list the
     * retention paragraph says is what deleting removes, and a failed attempt
     * keeps Stripe's error too, so the record is of how a request ended.
     */
    const payments = section(privacy, /^payments/i);
    expect(payments).not.toContain("each change to your subscription");
    expect(payments).toContain("a record of each billing request you make");
    for (const request of [
      "subscribing",
      "changing or canceling your plan",
      "replacing your card",
    ]) {
      expect(payments, `the billing record leaves out ${request}`).toMatch(
        new RegExp(`each billing request you make[^.]*${request}`),
      );
    }
    expect(payments, "the record is said to hold only the request").toMatch(
      /replacing your card, and how it ended/,
    );
  });

  it("says what leaves for Stripe, what a session records, and where an assistant fits", () => {
    // Each of these is something the application does that a reader would
    // not guess and the policy did not say: `customers.create` sends three
    // fields, Better Auth fills two columns on every session row, and an
    // assistant the homepage invites people to connect reads the ledger.
    const payments = section(privacy, /^payments/i);
    for (const field of [
      "your name",
      "your email address",
      "internal identifier for your simple balance account",
    ]) {
      expect(payments, `the policy does not say Stripe receives ${field}`).toContain(field);
    }
    // The id is the person's, and "accounts" in this policy are also the
    // checking and savings accounts somebody enters: "an internal account
    // identifier" read as one of those going to Stripe.
    expect(payments).not.toContain("internal account identifier");
    expect(payments).toContain("not for any account in your ledger");
    expect(payments).toContain("nothing from your ledger");
    expect(section(privacy, /^what the application collects/i)).toContain("ip address and browser");
    expect(section(privacy, /^who else sees/i)).toContain("ai assistant you connect");
  });
});

describe("the terms", () => {
  const text = terms.sections
    .flatMap((s) => s.paragraphs)
    .join(" ")
    .toLowerCase();

  // The prices are held by `tests/app-facts.test.ts`, which reads every dollar
  // figure in these terms against the application's own snapshot. A literal
  // here held them to what this file had been told rather than to what the
  // application charges.

  it("covers cancellation, refunds and the statutory right", () => {
    for (const topic of ["cancel at any time", "14 days", "non-refundable"]) {
      expect(text).toContain(topic);
    }
  });

  it("says what happens to data when a subscription ends", () => {
    // The thing people are actually afraid of.
    expect(text).toContain("nothing is deleted when a subscription ends");
  });

  it("does not claim to restrict the AGPL", () => {
    // Terms that purported to limit the license would be both wrong and
    // unenforceable. The intro says so explicitly.
    expect(terms.intro.join(" ").toLowerCase()).toContain("nothing here restricts the rights");
  });

  it("promises notice before the service could disappear", () => {
    expect(text).toContain("60 days");
  });

  it("tells account holders which email they cannot opt out of", () => {
    expect(text).toContain("no unsubscribe from those");
  });

  it("does not describe product news as something already sent", () => {
    // It said "occasional news about the product carries an unsubscribe
    // link", in the present tense, about mail the application has never had
    // a way to send.
    expect(text).toContain("don't send news about the product today");
  });

  it("describes the downgrade the product runs, not a kinder one", () => {
    /*
     * `frozenAccountIds` and `activeAccountChange` in the application. The
     * choice of three is made once; until it is, the oldest of the accounts
     * marked in use keep working and the rest freeze at once, with nobody
     * asked.
     *
     * Three sentences broke that. "Until you choose them instead" described
     * a swap the choose-once rule refuses, in the section before the one
     * that states the rule. "Never frozen on the strength of a choice made
     * before it existed" promised the opposite of what the ordering does to
     * an account opened during a second subscription: the older ones are
     * kept, and the new one is frozen until the choice is made. And "your
     * three oldest accounts" is true of a first downgrade only: after that,
     * the accounts frozen the first time are no longer marked in use, and
     * the ordering passes over them.
     *
     * The replacement, "the oldest of the accounts you were using", was true
     * and said neither case: somebody subscribed had been using every
     * account, so it read as the three oldest again. So both cases are
     * named, each in its own clause, and "three oldest" may appear only in
     * the clause that says it is a first downgrade.
     */
    expect(text).toContain("made once");
    expect(text).toContain("choose any three");
    expect(text).toMatch(/on a first downgrade, your three oldest accounts/);
    expect(text).toMatch(
      /after an earlier choice, the oldest three among the accounts still chosen and any you've opened or restored since/,
    );
    expect(text, "the kept set is not said to pass over what the choice froze").toContain(
      "frozen when you subscribed again isn't one of them",
    );
    expect(text).not.toContain("oldest of the accounts you were using");
    for (const clause of text.split(/[.;:]/)) {
      if (!clause.includes("three oldest")) continue;
      expect(clause, "three oldest, without saying it is a first downgrade").toContain(
        "first downgrade",
      );
    }
    expect(text).not.toContain("choose them instead");
    expect(text).not.toMatch(/\bnever\b[^.]*\bfrozen\b/);
    // The ways out, where the frozen state is first described. It named a
    // place coming free and subscribing, and left out the one a downgrade
    // opens first: `activeChoicePending` lets the first choice name any
    // accounts within the limit, frozen ones included. And "may", because
    // "the one-time choice after a downgrade" said every downgrade opens one.
    const plans = section(terms, /^plans and payment/i);
    expect(plans).toContain("one-time choice");
    expect(plans).not.toMatch(/choice (after|that follows) a downgrade|choice a downgrade opens/);
    expect(plans).toMatch(/one-time choice a downgrade (may|can) put to you/);
  });

  it("promises the choice of three only where the product opens one", () => {
    /*
     * `activeChoicePending` holds only while more live accounts are marked in
     * use than the plan keeps. Somebody who chose three, subscribed again,
     * opened nothing and lapsed again has three marked, is asked nothing, and
     * has a different three refused as a swap. "You return to the free plan,
     * keep every account you have, and choose any three" promised them the
     * choice anyway, and the paragraph's last sentence, "if you subscribe
     * again and open more accounts, the choice is put to you again",
     * contradicted its first. So the sentence that promises the choice names
     * when it is open, and no sentence promises it bare.
     */
    const sentences = section(terms, /^canceling/i).split(/(?<=[.!?])\s+/);
    const promise = sentences.filter((sentence) => sentence.includes("choose any three"));
    expect(promise, "no sentence offers the choice of three").toHaveLength(1);
    expect(promise[0], "the choice is promised without its condition").toMatch(
      /\bif more than three are in use\b/,
    );
    expect(promise[0], "the promise does not say when there are more than three").toMatch(
      /first downgrade/,
    );
    expect(promise[0], "the promise leaves out a later subscription").toMatch(
      /opened or restored accounts/,
    );
    expect(promise[0], "the promise leaves out the case with nothing to ask").toMatch(
      /three or fewer[^.]*nothing is asked/,
    );
    // "In use" is what the condition counts, so it is said what puts an
    // account there and what takes one out.
    expect(section(terms, /^canceling/i)).toMatch(
      /in use from when you open or restore it until a choice leaves it out/,
    );
    expect(section(terms, /^canceling/i), "the bare promise is back").not.toMatch(
      /keep every account you have, and choose/,
    );
    expect(section(terms, /^canceling/i), "an unconditional second choice is back").not.toContain(
      "the choice is put to you again",
    );
  });

  it("points at no rate limit that is not documented", () => {
    // The application limits sign-up, sign-in and the setup code, and
    // nothing on the API or the MCP surface. A clause binding automated
    // access to "the documented rate limits" pointed at nothing.
    expect(text).not.toContain("rate limit");
  });

  it("adds no tax to the price, and gives a price increase's notice before it would", () => {
    /*
     * `createStripeSubscription` in the application sets no `automatic_tax`
     * and names no tax rate, and nothing asks for an address to work one out
     * from. The one tax rate it ever sends is one somebody set on a
     * subscription in Stripe's dashboard, which `scheduleStripeSubscriptionPrice`
     * carries into the next phase. So what a subscriber pays is the price,
     * and "exclude any tax that may apply where you are" told them to expect
     * a total the checkout never shows.
     *
     * Tax added to a renewal is more money for the same plan, so it is held
     * to the notice a price change gets: the same window of days, by email,
     * with the right to cancel first. And the pricing page, which
     * says nothing about tax, may not start saying it is extra.
     */
    const plans = section(terms, /^plans and payment/i);
    expect(text, "the terms reserve a tax the application never adds").not.toMatch(
      /\bexclud\w* (any )?tax|\bplus (any )?tax|\btax (may|might|will|could) apply|\bbefore tax\b/,
    );
    expect(plans, "the terms do not say no tax is added").toMatch(
      /\bno sales tax\b[^.]*\bis added to them today\b/,
    );
    const sentences = plans.split(/(?<=[.!?])\s+/);
    const increase = sentences.find((sentence) =>
      /\bchange the price\b|\bprice (increase|change)\b/.test(sentence),
    );
    const taxed = sentences.find((sentence) =>
      /\btax is added to (a renewal|what a renewal costs)\b/.test(sentence),
    );
    expect(noticeWindow(increase), "no notice before a price change").toBeDefined();
    expect(noticeWindow(taxed), "tax on a renewal gets other notice than a price change").toEqual(
      noticeWindow(increase),
    );
    expect(taxed, "the notice of tax is not by email").toMatch(/\bemail\b/);
    expect(taxed, "no right to cancel before tax is added").toMatch(/\bcancel before\b/);
    const pricingPage = [pricing, pricingMeta, tiers, comparison, faq].flatMap(stringsIn);
    expect(pricingPage.length, "found no pricing copy to read").toBeGreaterThan(20);
    for (const said of pricingPage.filter((s) => /\btax/i.test(s))) {
      expect(said, "the pricing page says tax is extra").toMatch(
        /\bno\b[^.]*\btax\b[^.]*\badded\b/i,
      );
    }
  });

  it("gives notice of a fee change inside California's window, with how to cancel", () => {
    /*
     * Bus. & Prof. Code 17602(g)(2), for contracts from July 1, 2025
     * (17602(j)): notice of a change in the fee "no less than 7 days and no
     * more than 30 days before the fee change takes effect", carrying the
     * change and "information regarding how to cancel". The terms promised
     * "at least 30 days", which with the statute's ceiling leaves one day to
     * send it on, and said nothing of how to cancel. So every sentence
     * promising notice of a price or a tax gives a window inside 7 to 30,
     * and says what the notice holds.
     */
    const plans = sentencesOf(terms, /^plans and payment/i);
    const notices = plans.filter((sentence) =>
      /\b(change the price|price (increase|change)|tax is added to (a renewal|what a renewal costs))\b/.test(
        sentence,
      ),
    );
    expect(notices, "no sentence promises notice of a fee change").not.toEqual([]);
    for (const sentence of notices) {
      expect(sentence, "a floor with no ceiling").not.toMatch(/\bat least \d+ days\b/);
      const window = noticeWindow(sentence);
      expect(window, `no window of days: ${sentence}`).toBeDefined();
      const [floor, ceiling] = window ?? [0, Infinity];
      expect(floor, "notice can come later than California allows").toBeGreaterThanOrEqual(7);
      expect(ceiling, "notice can come earlier than California allows").toBeLessThanOrEqual(30);
      expect(floor, "the window is upside down").toBeLessThanOrEqual(ceiling);
      expect(sentence, "the notice is not by email").toMatch(/\bemail you\b/);
      expect(sentence, "the notice does not say what it will cost").toMatch(
        /\bwhat it will cost\b/,
      );
      expect(sentence, "the notice does not say how to cancel").toMatch(/\bhow to cancel\b/);
    }
    expect(section(terms, /^plans and payment/i)).not.toMatch(/\bat least \d+ days' notice\b/);
  });

  it("offers a way to cancel that needs no signing in", () => {
    /*
     * 17602(d)(3): the online cancellation may require signing in, but
     * somebody unwilling or unable to may not be kept from canceling another
     * way under 17602(c), which names an email address. The plan page is the
     * only way the terms gave, and it needs a session.
     */
    const cancel = sentencesOf(terms, /^canceling/i).find((sentence) =>
      sentence.includes("cancel at any time"),
    );
    expect(cancel, "the terms no longer say how to cancel").toBeDefined();
    expect(cancel, "the plan page is gone").toMatch(/\bfrom the plan page\b/);
    expect(cancel, "no way to cancel without signing in").toMatch(
      /\bwithout signing in, by writing to info@smpl\.money\b/,
    );
  });

  it("gives notice of a material change before it takes effect, with how to cancel", () => {
    /*
     * 17602(g)(1) and (i)(3): notice of a material change says how to cancel
     * and goes out before the change is implemented. The clause relies on
     * continued use as acceptance, so the notice is the one chance to leave,
     * and it said only that notice would be given.
     */
    const change = sentencesOf(terms, /^changes, and law/i).find((sentence) =>
      /\bchange materially\b/.test(sentence),
    );
    expect(change, "no sentence says what a material change brings").toBeDefined();
    for (const [what, pattern] of [
      ["by email", /\bemail you\b/],
      ["before it takes effect", /\bbefore the change takes effect\b/],
      ["what is changing", /\bwhat's changing\b/],
      ["how to cancel", /\bhow to cancel\b/],
    ] as const) {
      expect(change, `the notice of a material change leaves out ${what}`).toMatch(pattern);
    }
  });

  it("is governed by California law, and leaves a consumer their own law and courts", () => {
    /*
     * The operator's decision: California's law, with its conflict-of-laws
     * rules excluded so the choice cannot send a dispute to another state's
     * law, and the state and federal courts in California. It said England
     * and Wales, carried over from the British draft.
     *
     * The consumer carve-out stays, and reaches the forum as well as the
     * law, because a consumer in the EU or the UK may bring a claim where
     * they live whatever a clause chose beforehand. No arbitration clause
     * and no class-action waiver, in either document, by the same decision.
     */
    const law = section(terms, /^changes, and law/i);
    expect(law).toMatch(/\bgoverned by the laws of the state of california\b/);
    expect(law, "conflict-of-laws rules are not excluded").toMatch(
      /\bwithout regard to its conflict-of-laws rules\b/,
    );
    expect(law, "the courts are not California's").toMatch(
      /\bstate and federal courts located in california\b/,
    );
    const carveOut = law.split(/(?<=[.!?])\s+/).find((sentence) => /\bconsumer\b/.test(sentence));
    expect(carveOut, "a consumer elsewhere is not carved out").toBeDefined();
    expect(carveOut, "the carve-out is not for somebody living elsewhere").toMatch(
      /\bsomewhere else\b/,
    );
    expect(carveOut, "a consumer elsewhere loses their own law").toMatch(
      /\bmandatory consumer law where you live\b/,
    );
    expect(carveOut, "a consumer elsewhere loses their own courts").toMatch(
      /\bclaim in your own courts\b/,
    );
    for (const doc of [privacy, terms]) {
      const said = doc.sections
        .flatMap((s) => s.paragraphs)
        .join(" ")
        .toLowerCase();
      expect(said, `${doc.title} still names English law`).not.toMatch(
        /\bengland\b|\bwales\b|\benglish law\b|\bcourts there\b/,
      );
      expect(said, `${doc.title} takes away a day in court`).not.toMatch(
        /\barbitrat\w*|\bclass[- ]action\b|\bjury trial\b/,
      );
    }
  });
});

describe("the marketing pages, against the policy", () => {
  /**
   * The two surfaces have to say the same thing about advertising.
   *
   * The policy is careful: a non-personalized ad is still chosen from the
   * page and your rough location, and it still sets a cookie. A pricing page
   * is where the temptation is to round that down to "nothing about you",
   * and it did: the answer to "what are the ads like?" said they were
   * "requested without anything about you attached", which the document it
   * links to contradicts in its own words.
   *
   * This is the same failure `AGENTS.md` names for Premium and `plus` — two
   * surfaces using different words at the same customer — except that here
   * the customer who notices is reading a privacy policy, which is the worst
   * possible moment to be caught rounding down.
   */
  const ads = faq.find((item) => /\bads\b/i.test(item.q));

  it("answers what the ads are, somewhere on the pricing page", () => {
    // Population check: the assertions below pass vacuously without it.
    expect(ads, "no pricing question asks what the ads are").toBeDefined();
  });

  it("does not round the policy down to nothing about you", () => {
    const answer = ads!.a.toLowerCase();
    for (const overclaim of [
      "nothing about you",
      "no cookies",
      "without anything about you",
      "never tracked",
    ]) {
      expect(answer, `the pricing page claims "${overclaim}"; the policy does not`).not.toContain(
        overclaim,
      );
    }
  });

  it("names the two things the policy names", () => {
    // Personalization and consent. The policy turns on both, so a pricing
    // page that mentions neither is describing a different product.
    const answer = ads!.a.toLowerCase();
    expect(answer).toMatch(/personalised|personalized/);
    expect(answer).toMatch(/agreed|consent|asked before/);
  });

  /*
   * What saying no to ad consent does, which both surfaces describe.
   *
   * The application renders the slot whatever the answer: consent decides
   * how Google may fill it, not whether there is an ad. The pricing page had
   * that right, "saying no keeps the ads off your spending rather than off
   * the page", and `CHANGELOG.md` records it being corrected to say so. The
   * policy kept the false version in two sections, "Declining means no ads
   * are served to you" and "Declining means you see no advertising", so a
   * reader who declined on the policy's word found an ad on the next screen.
   *
   * Read a declining sentence together with the one after it, in the same
   * paragraph. The sentence alone was not enough: "Declining is your choice.
   * It means you see no ads." puts the claim in the second sentence, and a
   * check that read only the first passed it. Within the paragraph, so a
   * neighboring paragraph's "paid accounts are shown no advertising" is not
   * mistaken for a claim about declining.
   */
  const DECLINING = /\b(declin\w*|saying no|say no)\b/i;
  const MENTIONS_ADS = /\bads?\b|\badvertis/i;
  /*
   * The ways a sentence says the ads go. A verb like "remove" counts only
   * when nothing negates it, because "doesn't remove the ads" is the right
   * answer and uses the same verb. A double negative ("doesn't mean you won't
   * see ads") reads as the wrong one; if a correct sentence ever needs that
   * construction, narrow this rather than rewording the policy around it.
   */
  // The ads themselves, and not "advertising cookies": "declining stops
  // the advertising cookies" is the right answer, and a bare "advertising"
  // would read it as the wrong one.
  const THE_ADS = String.raw`(ads?|advertising)\b(?! cookies?\b)`;
  const TAKES_THE_ADS_AWAY = new RegExp(
    [
      String.raw`\bno ${THE_ADS}`,
      String.raw`\b(see|shown|get) no ${THE_ADS}`,
      String.raw`\bwithout (any )?${THE_ADS}`,
      String.raw`\bad-free\b`,
      String.raw`\b(won['’]t|don['’]t|doesn['’]t|never|not) (see|get|be shown|show) (any )?${THE_ADS}`,
      String.raw`(?<!\b(not|never|doesn['’]t|don['’]t|won['’]t|can['’]t) )\b(removes?|hides?|turns? off|switch(es)? off|takes? away|blocks?|stops?) (the |any |all )?${THE_ADS}`,
      String.raw`\bturns? (the )?ads off\b`,
      String.raw`\b${THE_ADS} (go(es)? away|disappears?|vanish(es)?|(is|are) (removed|hidden|gone|turned off|switched off))\b`,
    ].join("|"),
    "i",
  );
  const LEAVES_THE_ADS =
    /\b(not|doesn['’]t|won['’]t|never) (remove|hide|turn off|take away)\b[^.]*\bads?\b|\boff your \w+ rather than off the page\b|\bads (stay|remain)\b/i;
  const declines = (paragraphs: readonly string[]) =>
    paragraphs.flatMap((paragraph) => {
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      return sentences.flatMap((sentence, index) =>
        DECLINING.test(sentence) ? [sentences.slice(index, index + 2).join(" ")] : [],
      );
    });
  const policyDeclines = declines(privacy.sections.flatMap((s) => s.paragraphs));
  const pricingDeclines = declines(ads ? [ads.a] : []);

  it("reads the ways declining gets misdescribed, and not the right way", () => {
    // The patterns are the check, so they are checked. Each wrong sentence is
    // one the policy said or one a rewrite could plausibly say; each right one
    // is on a page now or is the same claim in other words.
    for (const wrong of [
      "Declining means no ads are served to you.",
      "Declining means you see no advertising.",
      "Declining is your choice. It means you see no ads.",
      "Declining turns the ads off.",
      "Declining turns off the ads.",
      "If you decline, you won't see ads.",
      "Declining removes the ads.",
      "Declining hides the ads.",
      "Say no and the ads go away.",
      "Say no and the ads disappear.",
    ]) {
      expect(wrong, "a wrong answer the check would miss").toMatch(TAKES_THE_ADS_AWAY);
    }
    for (const right of [
      "Declining doesn't remove the ads.",
      "Saying no keeps the ads off your spending rather than off the page.",
      "Declining won't hide the ads.",
      "If you decline, the ads stay.",
    ]) {
      expect(right, "a right answer the check would refuse").not.toMatch(TAKES_THE_ADS_AWAY);
      expect(right, "a right answer the check would not recognize").toMatch(LEAVES_THE_ADS);
    }
    // Right about the cookies, and silent about the ads, so it is refused by
    // neither pattern and left to the passage around it.
    expect("Declining stops the advertising cookies.").not.toMatch(TAKES_THE_ADS_AWAY);
    expect("Declining means no advertising cookies are set.").not.toMatch(TAKES_THE_ADS_AWAY);
  });

  it("finds what both pages say about declining", () => {
    // Population check: the two below read only passages that mention ads,
    // and without one on each side they pass by having nothing to read.
    expect(
      policyDeclines.filter((passage) => MENTIONS_ADS.test(passage)),
      "the policy says nothing about what declining does to the ads",
    ).not.toEqual([]);
    expect(
      pricingDeclines.filter((passage) => MENTIONS_ADS.test(passage)),
      "the pricing page's ad answer says nothing about it",
    ).not.toEqual([]);
  });

  it("never says declining ad consent means no ads", () => {
    for (const passage of [...policyDeclines, ...pricingDeclines]) {
      expect(passage, "declining is said to take the ads away").not.toMatch(TAKES_THE_ADS_AWAY);
    }
  });

  it("says declining leaves the ads in place, every time either page says what it does", () => {
    // The same outcome everywhere, rather than each passage merely avoiding
    // the wrong one: a passage that said nothing either way about the ads
    // would pass the check above and still disagree with the pricing page by
    // omission. Every passage, not some: with `some`, one section saying the
    // ads stay covered for another saying something else.
    for (const passage of [...policyDeclines, ...pricingDeclines]) {
      if (!MENTIONS_ADS.test(passage)) continue;
      expect(passage, "a passage about declining that does not say the ads stay").toMatch(
        LEAVES_THE_ADS,
      );
    }
  });

  it("claims no more about tracking than the policy supports", () => {
    // The homepage's privacy list used to promise "nothing counts your
    // clicks", which the policy's own server-log paragraph contradicts for
    // the hosted plan.
    const points = privacySection.points.join(" ").toLowerCase();
    for (const overclaim of ["counts your clicks", "no logs", "nothing is recorded"]) {
      expect(points, `the homepage claims "${overclaim}"`).not.toContain(overclaim);
    }
    expect(points, "the homepage no longer says anything about analytics").toContain("analytics");
  });
});

describe("both documents", () => {
  it("renders a contents entry per section, with anchors that match", () => {
    for (const [Page, doc] of [
      [PrivacyPage, privacy],
      [TermsPage, terms],
    ] as const) {
      const { container } = render(<Page />);
      const headings = [...container.querySelectorAll("h2")].map((h) => h.id);
      expect(headings).toEqual(doc.sections.map((s) => slugify(s.heading)));

      // Every contents link points at a heading that exists on the page.
      for (const link of container.querySelectorAll(".contents a")) {
        const id = (link.getAttribute("href") ?? "").slice(1);
        expect(headings, `contents links to #${id}, which is not a heading`).toContain(id);
      }
    }
  });

  it("carries a last-updated date", () => {
    expect(legalUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    for (const path of ["out/privacy/index.html", "out/terms/index.html"]) {
      // Case-insensitively: Next serializes the attribute as `dateTime`, and
      // HTML attribute names are case-insensitive, so both parse the same.
      // Asserting on one spelling would be asserting on the serializer.
      expect(readFileSync(path, "utf8")).toMatch(new RegExp(`datetime="${legalUpdated}"`, "i"));
    }
  });

  it("is reachable from the footer of every page", () => {
    // A policy nobody can find is a policy that does not satisfy anybody's
    // terms, Google's included.
    for (const path of ["out/index.html", "out/pricing/index.html"]) {
      const html = readFileSync(path, "utf8");
      expect(html).toContain('href="/privacy/"');
      expect(html).toContain('href="/terms/"');
    }
  });

  it("keeps somebody from doing a thing, the American way", () => {
    /*
     * "Stops Google setting the advertising cookies" is the British
     * construction, carried over from the en-GB draft, and it sat beside
     * "keeps Google from setting" in the same policy saying the same thing.
     * American English puts "from" in: "stops Google from setting". A
     * determiner where the somebody would be ("stops the recurring entry")
     * and a verb with no somebody at all ("stops working") are not read as
     * the construction.
     */
    const BRITISH_STOP =
      /\b(stops?|stopped|stopping|prevents?|prevented|preventing) (?!(?:the|a|an|any|every|your|its|their|our|this|that|from)\b)[\w'’]+ \w+ing\b/i;
    expect("stops Google setting cookies").toMatch(BRITISH_STOP);
    expect("stops Google from setting cookies").not.toMatch(BRITISH_STOP);
    expect("is prevented from making changes").not.toMatch(BRITISH_STOP);
    for (const doc of [privacy, terms]) {
      for (const paragraph of doc.sections.flatMap((s) => s.paragraphs)) {
        expect(paragraph, `${doc.title} leaves out "from"`).not.toMatch(BRITISH_STOP);
      }
    }
  });

  it("says it is not legal advice", () => {
    const { container } = render(<PrivacyPage />);
    expect(container.textContent).toContain("not legal advice");
  });

  it("promises no export larger than the one the product has", () => {
    // The application exports the transaction CSV and nothing else: no
    // budgets, templates or recurring entries. "Export everything" in a
    // policy is a portability claim, and somebody moving to their own copy
    // on the strength of it loses what the file never held.
    for (const doc of [privacy, terms]) {
      const text = doc.sections
        .flatMap((s) => s.paragraphs)
        .join(" ")
        .toLowerCase();
      expect(text, `${doc.title} overstates the export`).not.toMatch(
        /export (everything|all of it)/,
      );
    }
  });

  it("says how the export goes back in, not only that it can", () => {
    /*
     * An import puts every row into the one account picked for it, so a
     * whole-ledger export loaded as it stands lands in one account. The
     * terms made size sound like the only obstacle, while the pricing page's
     * answer about moving to your own copy already said one account at a
     * time, so the binding document was the less careful of the two.
     *
     * "One account at a time" alone left out where the file comes from: the
     * Transactions page's export holds every account, and loading that file
     * into each account in turn is what the words literally said. And an
     * account's opening balance is set on the account, not written to the
     * file, so a copy that leaves it unsaid is a copy that restores wrong.
     *
     * And the account page's Export CSV exports the date range on screen,
     * which starts at This month. "Export each account from its own page",
     * followed as written, moved one month of each account and dropped
     * everything older, so the step names the range by the date bar's own
     * label. "It holds every transaction" was true only of a range that
     * covers them, so it holds every transaction you ask it for.
     */
    const availability = section(terms, /^availability/i);
    expect(availability).toContain("one account at a time");
    expect(availability).toMatch(
      /export each account from its own page with the dates set to all time, and bring that file into the matching account/,
    );
    expect(availability).not.toMatch(/it holds every transaction,/);
    expect(availability).toMatch(/10,000 transactions[^.]*a date range at a time/);
    expect(availability).toMatch(/not what sits around them[^.]*opening balance/);
    // Both accounts' exports carry a transfer between them, and the second
    // import badges it. Said, so it is expected rather than committed twice.
    expect(availability).toMatch(/transfer[^.]*in both files[^.]*flags it as a duplicate/);
  });
});
