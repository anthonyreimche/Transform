// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The Transform panel's spacing, as plain CSS (the app's Tailwind build never
// scans an extension). `:where()` drops the rule to zero specificity, so a
// stylesheet that restyles the panel wins over it.

const P = "safelight-transform";

export const cls = {
  panel: `${P}-panel`,
} as const;

export function transformCss(): string {
  return `
:where(.${cls.panel} > :not(:last-child)) { margin-block: 0 0.125rem; }
`;
}
