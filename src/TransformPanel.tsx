// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// The Develop "Transform" panel: Upright (Off, Level, Vertical, Auto, Full,
// Guided), the Vertical, Horizontal and Aspect sliders, and Constrain crop.
// Until Safelight 3.2.0 it was core's built-in.

import { React, api } from "./rt";
import type { TransformParams, UprightMode } from "./safelight";
import { applyCorrection, applyGuided, detectUpright, fitCrop } from "./apply";
import { setCropOptions, setGuidedEditing, useCropOptions, useGuidedEditing } from "./state";
import { cls } from "./styles";

const UPRIGHT_MODES: { mode: UprightMode; label: string }[] = [
  { mode: "off", label: "Off" },
  { mode: "level", label: "Level" },
  { mode: "vertical", label: "Vert" },
  { mode: "auto", label: "Auto" },
  { mode: "full", label: "Full" },
  { mode: "guided", label: "Guided" },
];

const SLIDERS: { key: "perspectiveV" | "perspectiveH" | "aspect"; label: string }[] = [
  { key: "perspectiveV", label: "Vertical" },
  { key: "perspectiveH", label: "Horizontal" },
  { key: "aspect", label: "Aspect" },
];

export function TransformPanel() {
  const { Panel, Slider } = api.components;
  const useDevelopStore = api.stores.useDevelopStore;
  const transform = useDevelopStore((s) => s.params.transform);
  const uprightMode = useDevelopStore((s) => s.params.uprightMode);
  const setParam = useDevelopStore((s) => s.setParam);
  const commitEdit = useDevelopStore((s) => s.commitEdit);
  const guidedEditing = useGuidedEditing();
  const { constrain } = useCropOptions();
  const [analyzing, setAnalyzing] = React.useState(false);

  const onChange = (key: keyof TransformParams, v: number) => {
    const { params } = useDevelopStore.getState();
    const next: TransformParams = { ...params.transform, [key]: v };
    setParam("transform", next);
    fitCrop(params.straighten, next);
  };

  const applyUpright = async (mode: UprightMode) => {
    if (mode === "off") {
      // Clear the upright correction: zero the sliders it drives and reset tilt.
      setGuidedEditing(false);
      setParam("uprightMode", "off");
      applyCorrection({ straighten: 0, perspectiveV: 0, perspectiveH: 0, aspect: 0 });
      void commitEdit("Upright off");
      return;
    }
    if (mode === "guided") {
      // Guided stays the selected mode. The button toggles the drawing overlay:
      // open it on entry, close it on "Done" (which releases the canvas without
      // dropping the mode). Either way, recompute from the lines drawn so far.
      const closing = uprightMode === "guided" && guidedEditing;
      setParam("uprightMode", "guided");
      setGuidedEditing(!closing);
      applyGuided();
      void commitEdit("Guided Upright");
      return;
    }
    const prevMode = uprightMode;
    setGuidedEditing(false);
    setParam("uprightMode", mode);
    setAnalyzing(true);
    try {
      applyCorrection(await detectUpright(mode));
      void commitEdit(`Upright ${mode}`);
    } catch (err) {
      // Analysis failed: drop back to the mode that was selected so the button
      // doesn't claim a correction that was never applied.
      setParam("uprightMode", prevMode);
      console.error("[upright]", err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <Panel title="Transform" defaultOpen={false}>
      <div className={cls.panel}>
        <div className={cls.modes}>
          {UPRIGHT_MODES.map((u) => {
            const active = uprightMode === u.mode;
            // While the guided overlay is open the button finishes editing.
            const label = u.mode === "guided" && active && guidedEditing ? "Done" : u.label;
            return (
              <button
                key={u.mode}
                type="button"
                disabled={analyzing}
                onClick={() => void applyUpright(u.mode)}
                aria-pressed={active}
                className={`${cls.mode}${active ? ` ${cls.active}` : ""}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {SLIDERS.map((s) => (
          <Slider
            key={s.key}
            label={s.label}
            value={transform[s.key]}
            min={-100}
            max={100}
            step={1}
            onChange={(v) => onChange(s.key, v)}
            onCommit={() => void commitEdit("Transform")}
          />
        ))}

        <label className={cls.check}>
          <input
            type="checkbox"
            checked={constrain}
            onChange={(e) => {
              const on = e.target.checked;
              setCropOptions({ constrain: on });
              if (on) {
                // Re-enabling constrain must pull the crop back inside the
                // image: while it was off the crop could be rotated or dragged
                // into the margins, leaving handles out of bounds, and the
                // next drag would collapse it to a sliver.
                const { params } = useDevelopStore.getState();
                fitCrop(params.straighten, params.transform);
                void commitEdit("Constrain crop");
              }
            }}
          />
          Constrain crop
        </label>
      </div>
    </Panel>
  );
}
