// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The look core gave the Transform panel with Tailwind utilities, as plain CSS
// (the app's Tailwind build never scans an extension). `:where()` drops every
// rule to zero specificity, so a stylesheet that restyles the panel or its
// buttons wins over them. The `html.sl-larger-text` rule repeats core's
// Accessibility rule for small text.

import type { UiTokens } from "./safelight";

const P = "safelight-transform";

export const cls = {
  panel: `${P}-panel`,
  modes: `${P}-modes`,
  mode: `${P}-mode`,
  active: `${P}-active`,
  check: `${P}-check`,
} as const;

export function transformCss(t: UiTokens): string {
  return `
:where(.${cls.panel} > :not(:last-child)) { margin-block: 0 0.125rem; }
:where(.${cls.modes}) { display: flex; gap: 0.125rem; margin-bottom: 0.25rem; }
:where(.${cls.mode}) { flex: 1 1 0%; border-radius: 0.25rem; padding: 0.125rem 0.25rem; font-size: 10px; background-color: ${t.surface2}; color: ${t.textSecondary}; }
:where(.${cls.mode}:hover) { background-color: ${t.surface3}; color: ${t.textPrimary}; }
:where(.${cls.mode}.${cls.active}) { background-color: ${t.accent}; color: ${t.textPrimary}; }
:where(.${cls.check}) { display: flex; align-items: center; gap: 0.375rem; padding-top: 0.25rem; font-size: 11px; color: ${t.textSecondary}; }
:where(.${cls.check} input) { accent-color: ${t.sliderFill}; }
html.sl-larger-text .${cls.mode} { font-size: 12px !important; }
`;
}
