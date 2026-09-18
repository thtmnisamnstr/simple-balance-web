import { contact, footer, site } from "@/content/home";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page footer-inner">
        <p className="footer-note">{footer.blurb}</p>

        <div className="footer-cols">
          <nav className="footer-links" aria-label="Footer">
            {footer.links.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          {/* One address, so no label: a single mailto under the word
              "General" is a category with nothing to distinguish it from.
              `docs/standards/content.md` 4.1. */}
          <p className="footer-contact">
            <a href={`mailto:${contact.address}`}>{contact.address}</a>
          </p>
        </div>
      </div>

      <div className="page footer-legal">
        <p className="footer-note">
          {site.name} — {site.domain}
        </p>
      </div>
    </footer>
  );
}
