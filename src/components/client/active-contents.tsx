"use client";

import { useEffect, useState } from "react";

/**
 * Marks the heading you are currently reading in the contents list.
 *
 * The list itself is rendered on the server and is complete and usable
 * without this — every link works, and the only thing hydration adds is the
 * highlight. That is the island rule: enhancement, never the content.
 *
 * `IntersectionObserver` with a top-weighted margin rather than scroll maths,
 * because scroll handlers fire constantly and get the answer wrong at the
 * bottom of a page where the last heading can never reach the top of the
 * viewport.
 */
export function ActiveContents({ ids }: { readonly ids: readonly string[] }) {
  const [active, setActive] = useState<string | undefined>(undefined);

  useEffect(() => {
    const headings = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .toSorted((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // The band is the top quarter of the viewport: a heading is "current"
      // once it has reached the reading position, not when it first appears.
      { rootMargin: "0px 0px -75% 0px", threshold: 0 },
    );

    for (const heading of headings) observer.observe(heading);
    return () => observer.disconnect();
  }, [ids]);

  useEffect(() => {
    // The class is applied to the server-rendered list rather than the list
    // being re-rendered here, so this component owns one attribute and
    // nothing else.
    for (const id of ids) {
      const link = document.querySelector(`.contents a[href="#${CSS.escape(id)}"]`);
      link?.classList.toggle("contents-active", id === active);
    }
  }, [active, ids]);

  return null;
}
