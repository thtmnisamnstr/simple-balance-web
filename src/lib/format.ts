/**
 * Dates are formatted in UTC, deliberately.
 *
 * A post's `date` is a calendar day (`2026-09-17`), not an instant. Parsed
 * without a zone and formatted in the machine's, it renders as the day before
 * for every reader west of Greenwich — and the build machine's answer would
 * be baked into the HTML for everyone. Naming UTC on both halves keeps the
 * day that was written the day that is shown.
 */
export function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}
