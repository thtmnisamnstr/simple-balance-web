import { adsense } from "@/content/ads";

/**
 * The one banner unit this site shows, on every page except the legal pages
 * and the 404.
 *
 * A server component rendering the account's own manual-unit snippet
 * unmodified — an `<ins class="adsbygoogle">` and the `push({})` that asks
 * for an ad — the same shape the loader script in `src/app/layout.tsx`
 * follows for the same reason: a static export has nothing to hydrate this
 * with, and the push has to run in document order, right after the `<ins>`
 * it is for, which an inline script with no `src` does without needing to be
 * a client component at all.
 *
 * **Renders nothing at all where `adsense` is `undefined`** — every
 * contributor's machine and every CI run that has not set
 * `ADSENSE_CLIENT_ID` and `ADSENSE_BANNER_SLOT_ID`. A reserved, empty box is
 * worse than no box; `.ad-banner` in `site.css` additionally collapses the
 * one case code here cannot see, an ad that is requested and comes back
 * unfilled.
 */
export function AdBanner() {
  if (!adsense) return null;

  // Forced unless a consent platform is collecting consent, matching the
  // application's own `src/client/ads.tsx` exactly: the flag is read when the
  // request is made, so it has to be set in the same script, before the push,
  // rather than in a separate one that might run after. With one, it is
  // deliberately *not* forced — the platform's whole job is to ask and then
  // tell Google the answer, and forcing the flag on top would override
  // somebody who consented just as surely as it protects one who did not.
  const push = adsense.consentManaged
    ? "(adsbygoogle = window.adsbygoogle || []).push({});"
    : "(adsbygoogle = window.adsbygoogle || []).requestNonPersonalizedAds = 1;" +
      "(adsbygoogle = window.adsbygoogle || []).push({});";

  return (
    // `aria-hidden` is deliberately absent, matching the application's own
    // `AdSlot`: an ad is content, and hiding it from a screen reader while
    // showing it to everybody else is concealment rather than accessibility.
    // The region names itself so somebody navigating by landmark can skip it.
    <aside className="ad-banner" aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adsense.clientId}
        data-ad-slot={adsense.bannerSlotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
      {/* No src, so React does not hoist it: it has to stay here, immediately
          after the <ins> it fills, in the order Google's own snippet puts it
          in. `dangerouslySetInnerHTML` is the same mechanism
          `src/components/structured-data.tsx` uses for the same reason, and
          is safe here for a simpler one — the string is one of two fixed
          literals above, never interpolated data. */}
      <script dangerouslySetInnerHTML={{ __html: push }} />
    </aside>
  );
}
