// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// Guided Upright on the canvas: the canvas tool this extension holds while the
// guided overlay is open. Lines live in source UV and are drawn through the
// photo's transform onto the region the canvas shows; letting go of a line
// recomputes the correction from all of them.

import { React, api } from "./rt";
import type { CanvasTool, OverlayRect } from "./safelight";
import { buildForwardTransform, buildInverseTransform } from "./transform";
import { applyGuided } from "./apply";
import { GuidedLines } from "./GuidedLines";
import { setGuidedEditing } from "./state";

export function GuidedCanvas({ rect }: { rect: OverlayRect }) {
  const useDevelopStore = api.stores.useDevelopStore;
  const lines = useDevelopStore((s) => s.params.guidedLines);
  const straighten = useDevelopStore((s) => s.params.straighten);
  const transform = useDevelopStore((s) => s.params.transform);
  const crop = useDevelopStore((s) => s.params.crop);
  const setParam = useDevelopStore((s) => s.setParam);
  const commitEdit = useDevelopStore((s) => s.commitEdit);
  // While the Transform panel's preview-off eye is held, the renderer shows the
  // un-transformed frame: hide the lines, which follow the live edit.
  const bypassed = useDevelopStore((s) => !!s.bypassedPanels["core.transform"]);
  const { region, imageAspect } = api.develop.useDevelopOverlay();
  if (bypassed) return null;
  return (
    <GuidedLines
      rect={rect}
      forward={buildForwardTransform(straighten, transform, imageAspect)}
      inv={buildInverseTransform(straighten, transform, imageAspect)}
      crop={region ?? crop}
      lines={lines}
      onChange={(next) => setParam("guidedLines", next)}
      onCommit={() => {
        applyGuided();
        void commitEdit("Guided Upright");
      }}
    />
  );
}

/** The tool held while the guided overlay is open. */
export const GUIDED_TOOL: CanvasTool = {
  overlay: GuidedCanvas,
  zoomable: false,
  // Close the overlay but keep guided as the active mode.
  onEscape: () => setGuidedEditing(false),
};


