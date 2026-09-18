import { site, hero } from "@/content/home";
import { LogoMark } from "@/components/icons";

/**
 * The header.
 *
 * The sign-in control is a `<span>` carrying the "Coming soon" label, not a
 * disabled `<button>` or a link to app.smpl.money. The app is not deployed, so
 * a link would 404 and a disabled button would imply something on this page
 * could enable it. A word that states the situation is the honest control.
 * `docs/standards/web.md` 6.4.
 */
export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="page site-header-inner">
        <a className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            <LogoMark />
          </span>
          {site.name}
        </a>

        <nav className="header-actions" aria-label="Site">
          <a className="header-link" href={site.sourceUrl}>
            Source
          </a>
          <span className="button button-pending">{hero.primaryLabel}</span>
        </nav>
      </div>
    </header>
  );
}
