/**
 * Dates are formatted in UTC, deliberately.
 *
 * A post's `date` is a calendar day (`2026-09-17`), not an instant. Parsed
 * without a zone and formatted in the machine's, it renders as the day before
 * for every reader west of Greenwich — and the build machine's answer would
 * be baked into the HTML for everyone. Naming UTC on both halves keeps the
 * day that was written the day that is shown.
 *
 * And in `en-US`, month first: "September 18, 2026". It said `en-GB`, so the
 * terms and the privacy policy read "Last updated 18 September 2026" on a
 * site written for an American reader. The locale is named rather than left
 * to the runtime for the same reason the zone is: whatever the build machine
 * prefers would be baked into the page for everyone.
 */
export function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
