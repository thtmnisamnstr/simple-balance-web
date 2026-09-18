/**
 * Inline SVG icons.
 *
 * Hand-written rather than pulled from an icon package. A marketing page uses
 * seven glyphs; a dependency would ship a few hundred and put the site's
 * largest asset outside this repository's review. They are drawn on the same
 * 24-unit grid and 1.75 stroke as the application's set so the two surfaces
 * look related.
 *
 * Every icon here is decorative — each sits beside a heading that already says
 * what it means — so they carry `aria-hidden` and no title.
 * `docs/standards/web.md` 7.2.
 */

import type { ReactNode } from "react";

type IconProps = { readonly size?: number };

function Svg({ size = 20, children }: IconProps & { readonly children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

function WalletIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v1" />
      <path d="M3 7.5V17a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3" />
      <path d="M21 10.5h-4a2 2 0 0 0 0 4h4z" />
    </Svg>
  );
}

function SplitIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 12h4l3-6 4 12 3-6h4" />
    </Svg>
  );
}

function TargetIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.5" />
    </Svg>
  );
}

function CopyIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h8" />
    </Svg>
  );
}

function LayersIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m12 3 8 4.5-8 4.5-8-4.5z" />
      <path d="m4 12.5 8 4.5 8-4.5" />
    </Svg>
  );
}

function ListIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 6h12M8 12h12M8 18h12" />
      <path d="M4 6h.01M4 12h.01M4 18h.01" />
    </Svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m4.5 12.5 5 5 10-11" />
    </Svg>
  );
}

export function LogoMark({ size = 18 }: IconProps) {
  return (
    <Svg size={size}>
      {/* The application's own mark, copied from its `public/favicon.svg` so
          the two surfaces carry one logo rather than two that nearly match.
          A circled currency glyph on the brand gradient; the gradient lives
          on the element around this, in `.brand-mark`. */}
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 18V6" />
    </Svg>
  );
}

/**
 * The closed icon set a feature card may name. Keyed to `Feature["icon"]`.
 *
 * The six are not exported individually: this map is the only way in, which
 * is what makes `Feature["icon"]` a closed set rather than a suggestion.
 * `CheckIcon` and `LogoMark` are exported because they are used directly.
 */
export const featureIcons = {
  wallet: WalletIcon,
  split: SplitIcon,
  target: TargetIcon,
  copy: CopyIcon,
  layers: LayersIcon,
  list: ListIcon,
} as const;
