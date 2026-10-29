import { createElement, Fragment } from "react";
import { site } from "@/content/home";
import { typeset } from "@/lib/typeset";

/** The application's address as a reader sees it written: `app.smpl.money`. */
export const appAddress = new URL(site.appUrl).host;

/*
 * The bare address, and not one with a path after it. `app.smpl.money/mcp`
 * is where a program connects, not a page to open, and
 * `app.smpl.money/transactions` is shown as what an address looks like, so
 * both stay as they're written.
 */
const BARE = new RegExp(`(${appAddress.replaceAll(".", "\\.")})(?!/)`);

/**
 * Text with every bare mention of the application's address as a link to it,
 * typeset like the rest of the page.
 *
 * For the strings that aren't Markdown and so can't write a link themselves:
 * the legal pages' paragraphs, a docs group's blurb and a docs page's lede.
 * The words don't change, so the documents that hold them don't either; a
 * reader who meets "app.smpl.money" can open it from there.
 *
 * Variadic children rather than an array, for the reason `legal-page.tsx`
 * gives: the parts are positional, and the only key an array could have is
 * the index.
 */
export function AppLinked({ text }: { readonly text: string }) {
  const parts = text
    .split(BARE)
    .map((part, index) =>
      index % 2 === 1 ? createElement("a", { href: site.appUrl }, part) : typeset(part),
    );
  return createElement(Fragment, null, ...parts);
}
