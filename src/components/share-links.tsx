import { site } from "@/content/home";

/**
 * Share links.
 *
 * Plain anchors to each service's own share URL, not their JavaScript widgets.
 * A widget loads a third-party script onto a page that otherwise loads none,
 * sets cookies for a reader who did not ask to be tracked, and needs a CSP
 * exception. A link does the same job, costs nothing, and works with
 * JavaScript off.
 *
 * The copy-link control is the one thing here that needs a client component,
 * so it is separate: this file stays on the server.
 */
export function ShareLinks({ title, path }: { readonly title: string; readonly path: string }) {
  const url = `https://${site.domain}${path}`;
  const text = encodeURIComponent(title);
  const target = encodeURIComponent(url);

  const services = [
    {
      label: "Share on Mastodon",
      short: "Mastodon",
      href: `https://mastodonshare.com/?text=${text}&url=${target}`,
    },
    {
      label: "Share on Bluesky",
      short: "Bluesky",
      href: `https://bsky.app/intent/compose?text=${text}%20${target}`,
    },
    {
      label: "Share on LinkedIn",
      short: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${target}`,
    },
    { label: "Share by email", short: "Email", href: `mailto:?subject=${text}&body=${target}` },
  ];

  return (
    <div className="share">
      <p className="share-label">Share</p>
      <ul className="share-list">
        {services.map((service) => (
          <li key={service.short}>
            {/* The visible text is short; the accessible name says what it
                does and where, because "Bluesky" alone in a links list tells
                a screen-reader user nothing. */}
            <a href={service.href} aria-label={service.label} rel="noopener">
              {service.short}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
