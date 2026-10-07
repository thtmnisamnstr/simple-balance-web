import { site, hero, primaryNav, headerSourceLink } from "@/content/home";
import { LogoMark } from "@/components/icons";

/**
 * The header.
 *
 * The sign-up control is a link to the application, carrying the same label
 * as the hero's and the pricing cards'. It was a `<span>` reading "Sign-ups
 * open soon" until the application went live, because a link would have
 * 404'd. `docs/standards/web.md` 6.1.
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
          {primaryNav.map((item) => (
            <a className="header-link" key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
          <a className="header-link" href={headerSourceLink.href}>
            {headerSourceLink.label}
          </a>
          <a className="button button-primary" href={site.appUrl}>
            {hero.primaryLabel}
          </a>
        </nav>
      </div>
    </header>
  );
}
