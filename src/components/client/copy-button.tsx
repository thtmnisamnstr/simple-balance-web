"use client";

import { useRef, useState } from "react";

/**
 * Copy the code block this button sits in.
 *
 * One of three client components on this site, and the rule they follow is in
 * `docs/standards/code/react.md` 1.1: an island exists only where the
 * behavior is impossible without the browser, it holds no application state,
 * and the page is correct before it hydrates.
 *
 * That last clause is what makes this safe to ship. Until hydration the button
 * is inert — so it is rendered `disabled` on the server and enabled by the
 * effect of mounting, rather than looking pressable and silently doing
 * nothing. A control that does not work yet should look like one.
 */
export function CopyButton({ code }: { readonly code: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  async function copy() {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(code);
      setState("copied");
    } catch {
      // Clipboard access is refused in some contexts and over plain http.
      // Saying so beats a button that appears to have worked.
      setState("failed");
    }
    timer.current = setTimeout(() => setState("idle"), 2000);
  }

  return (
    <button type="button" className="copy-button" onClick={copy}>
      {/* The live region is what tells a screen-reader user the copy
          happened; the visible label change alone is silent to them. */}
      <span aria-hidden="true">
        {state === "copied" ? "Copied" : state === "failed" ? "Failed" : "Copy"}
      </span>
      {/* `<output>` carries an implicit live region, so this is announced
          without an explicit role. */}
      <output className="visually-hidden">
        {state === "copied"
          ? "Copied to clipboard"
          : state === "failed"
            ? "Could not copy to clipboard"
            : "Copy code to clipboard"}
      </output>
    </button>
  );
}
