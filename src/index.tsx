// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// Registers the Develop "Transform" panel, guided Upright's canvas tool and
// the flip shortcuts. It was core's built-in `core.transform` until Safelight
// 3.2.0 and keeps that panel id, so saved layouts keep it where it was. The
// transform renders through Crop & Straighten's geometry stage, which reads
// these params.

import { GUIDED_TOOL } from "./GuidedCanvas";
import { TransformPanel } from "./TransformPanel";
import { initRuntime } from "./rt";
import type { SafelightAPI } from "./safelight";
import { guidedEditing, registerOptions, setGuidedEditing, subscribeGuided } from "./state";
import { transformCss } from "./styles";

export const PANEL_ID = "core.transform";
export const STYLESHEET_ID = "safelight.transform.styles";

let stop: (() => void)[] = [];

export function activate(host: SafelightAPI): void {
  initRuntime(host);
  setGuidedEditing(false);
  registerOptions();
  host.registerStylesheet({ id: STYLESHEET_ID, css: transformCss(host.ui.tokens) });
  host.registerPanel({
    id: PANEL_ID,
    title: "Transform",
    component: TransformPanel,
    defaultDock: { module: "develop", direction: "right", order: 2, width: 280, height: 320 },
    onReset: () => {
      setGuidedEditing(false);
      void host.stores.useDevelopStore
        .getState()
        .resetParams(["transform", "straighten", "uprightMode", "guidedLines"], "Reset Transform");
    },
  });
  for (const s of stop) s();
  stop = [
    // The guided overlay holds the canvas while it's open.
    subscribeGuided(() => host.develop.setCanvasTool(guidedEditing() ? GUIDED_TOOL : null)),
    // It closes once the photo's mode leaves guided (an undo, a reset, another photo).
    host.stores.useDevelopStore.subscribe((s) => {
      if (guidedEditing() && s.params.uprightMode !== "guided") setGuidedEditing(false);
    }),
  ];
  const flip = (axis: "flipH" | "flipV", label: string) => () => {
    const { params, setParam, commitEdit } = host.stores.useDevelopStore.getState();
    setParam("transform", { ...params.transform, [axis]: !params.transform[axis] });
    void commitEdit(label);
  };
  host.registerKeybinding({ id: "photo.flipH", label: "Flip horizontal", category: "Develop", defaultCombo: "", handler: flip("flipH", "Flip horizontal") });
  host.registerKeybinding({ id: "photo.flipV", label: "Flip vertical", category: "Develop", defaultCombo: "", handler: flip("flipV", "Flip vertical") });
}

export function deactivate(): void {
  for (const s of stop) s();
  stop = [];
  setGuidedEditing(false);
}
