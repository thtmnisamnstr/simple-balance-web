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

          <ul className="footer-contact">
            {contact.lines.map((line) => (
              <li key={line.address}>
                <span className="footer-contact-label">{line.label}</span>{" "}
                <a href={`mailto:${line.address}`}>{line.address}</a>
              </li>
            ))}
          </ul>
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
