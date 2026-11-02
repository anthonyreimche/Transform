// What activate() registers, the Upright modes (the detected ones read the
// developed frame through core), guided Upright's canvas tool and lines, the
// sliders and Constrain crop, which refit the crop to the transform, and the
// flip shortcuts.

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PANEL_ID, STYLESHEET_ID, activate, deactivate } from "../src/index";
import { React, initRuntime } from "../src/rt";
import type { DevelopParams, TransformParams } from "../src/safelight";
import { TransformPanel } from "../src/TransformPanel";
import { GUIDED_TOOL, GuidedCanvas } from "../src/GuidedCanvas";
import { maxCropForTransform } from "../src/crop-maths";
import { buildInverseTransform } from "../src/transform";
import { computeGuidedCorrection } from "../src/upright";
import { DEFAULT_TRANSFORM } from "../src/defaults";
import { OPTIONS, guidedEditing, registerOptions, setCropOptions, setGuidedEditing } from "../src/state";
import { fakeApi, type Rig } from "./support/fake-api";

HTMLElement.prototype.setPointerCapture ??= () => {};
Element.prototype.setPointerCapture ??= () => {};
Element.prototype.releasePointerCapture ??= () => {};

let rig: Rig;
const params = () => rig.develop.getState().params;
const setParams = (over: Partial<DevelopParams>) => rig.develop.setState({ params: { ...params(), ...over } });
const fitted = (straighten: number, transform: TransformParams, lock = 1.5) =>
  maxCropForTransform(buildInverseTransform(straighten, transform, 1.5), lock, 1.5);

function start(opts?: Parameters<typeof fakeApi>[0]) {
  rig = fakeApi(opts);
  initRuntime(rig.api);
  setGuidedEditing(false);
  registerOptions();
  activate(rig.api);
}

beforeEach(() => start());

afterEach(() => {
  deactivate();
  cleanup();
});

describe("activate", () => {
  it("registers the Transform panel, as core's core.transform did", () => {
    expect(PANEL_ID).toBe("core.transform");
    expect(rig.panels).toEqual([
      {
        id: "core.transform",
        title: "Transform",
        component: TransformPanel,
        defaultDock: { module: "develop", direction: "right", order: 2, width: 280, height: 320 },
        onReset: expect.any(Function),
      },
    ]);
    expect(rig.stylesheets.map((s) => s.id)).toEqual([STYLESHEET_ID]);
  });

  it("resets the transform, straighten and Upright as one step, closing the guided lines", () => {
    act(() => setGuidedEditing(true));
    rig.panels[0].onReset?.();
    expect(guidedEditing()).toBe(false);
    expect(rig.calls).toEqual([
      { resetParams: ["transform", "straighten", "uprightMode", "guidedLines"], label: "Reset Transform" },
    ]);
  });

  it("flips with the flip shortcuts, unbound until the person binds them", () => {
    expect(rig.keys.map((k) => [k.id, k.defaultCombo])).toEqual([
      ["photo.flipH", ""],
      ["photo.flipV", ""],
    ]);
    rig.keys[0].handler();
    rig.keys[1].handler();
    rig.keys[1].handler();
    expect(params().transform).toMatchObject({ flipH: true, flipV: false });
    expect(rig.calls.filter((c) => "commitEdit" in c)).toEqual([
      { commitEdit: "Flip horizontal" },
      { commitEdit: "Flip vertical" },
      { commitEdit: "Flip vertical" },
    ]);
  });
});

describe("Upright", () => {
  const press = async (name: string) => {
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name }));
    });
  };

  // A 64×32 frame with a single tilted dark line on white.
  const tilted = () => {
    const [w, h] = [64, 32];
    const data = new Uint8Array(w * h * 4).fill(255);
    for (let x = 4; x < 60; x++) {
      const y = Math.round(16 + (x - 32) * 0.1);
      for (const c of [0, 1, 2]) data[(y * w + x) * 4 + c] = 0;
    }
    return { data, width: w, height: h };
  };

  it("reads the developed frame at 256 px and applies the correction it detects", async () => {
    deactivate();
    cleanup();
    start({ developed: tilted() });
    render(<TransformPanel />);
    await press("Auto");
    expect(rig.reads).toEqual([256]);
    expect(params().uprightMode).toBe("auto");
    expect(rig.calls.at(-1)).toEqual({ commitEdit: "Upright auto" });
  });

  it("makes no correction without a frame to read", async () => {
    setParams({ straighten: 3 });
    render(<TransformPanel />);
    await press("Level");
    expect(params().straighten).toBe(0);
    expect(params().transform).toMatchObject({ perspectiveV: 0, perspectiveH: 0 });
  });

  it("drops back to the mode before when the read fails", async () => {
    deactivate();
    cleanup();
    start({ developed: new Error("context lost") });
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    setParams({ uprightMode: "level" });
    render(<TransformPanel />);
    await press("Full");
    expect(params().uprightMode).toBe("level");
    error.mockRestore();
  });

  it("clears the correction with Off and refits the crop", async () => {
    setParams({ uprightMode: "auto", straighten: 4, transform: { ...DEFAULT_TRANSFORM, perspectiveV: 20, aspect: 10, scale: 120 } });
    render(<TransformPanel />);
    await press("Off");
    expect(params()).toMatchObject({ uprightMode: "off", straighten: 0 });
    expect(params().transform).toEqual({ ...DEFAULT_TRANSFORM, scale: 120 });
    expect(params().crop).toEqual(fitted(0, { ...DEFAULT_TRANSFORM, scale: 120 }));
    expect(rig.calls.at(-1)).toEqual({ commitEdit: "Upright off" });
  });

  it("opens guided lines on the canvas, then finishes with Done, applying them each time", async () => {
    const lines = [{ x1: 0.1, y1: 0.2, x2: 0.12, y2: 0.8 }];
    setParams({ guidedLines: lines });
    render(<TransformPanel />);
    await press("Guided");
    expect(rig.held()).toBe(GUIDED_TOOL);
    expect(params().uprightMode).toBe("guided");
    const want = computeGuidedCorrection(lines, 1.5);
    expect(params().straighten).toBe(want.straighten);
    expect(params().transform.perspectiveV).toBe(Math.round(want.perspectiveV));
    await press("Done");
    expect(rig.held()).toBeNull();
    expect(params().uprightMode).toBe("guided");
  });

  it("closes the guided lines on Escape, keeping guided", async () => {
    render(<TransformPanel />);
    await press("Guided");
    act(() => GUIDED_TOOL.onEscape?.());
    expect(guidedEditing()).toBe(false);
    expect(params().uprightMode).toBe("guided");
  });

  it("closes the guided lines once the photo's mode leaves guided", async () => {
    render(<TransformPanel />);
    await press("Guided");
    act(() => setParams({ uprightMode: "off" }));
    expect(guidedEditing()).toBe(false);
    expect(rig.held()).toBeNull();
  });
});

describe("the sliders", () => {
  it("write the transform and refit the crop to it, at the crop's aspect lock", () => {
    act(() => setCropOptions({ aspect: 1 }));
    const view = render(<TransformPanel />);
    const [vertical] = rig.sliders(view.container);
    act(() => vertical.onChange(30));
    const next = { ...DEFAULT_TRANSFORM, perspectiveV: 30 };
    expect(params().transform).toEqual(next);
    expect(params().crop).toEqual(fitted(0, next, 1));
    act(() => vertical.onCommit?.());
    expect(rig.calls.at(-1)).toEqual({ commitEdit: "Transform" });
  });

  it("leave the crop alone unconstrained", () => {
    act(() => setCropOptions({ constrain: false }));
    const view = render(<TransformPanel />);
    const [, horizontal] = rig.sliders(view.container);
    act(() => horizontal.onChange(-25));
    expect(params().transform.perspectiveH).toBe(-25);
    expect(rig.calls.some((c) => "setParam" in c && c.setParam === "crop")).toBe(false);
  });

  it("refit the crop when Constrain crop comes back on, sharing it with Crop & Straighten", () => {
    act(() => setCropOptions({ constrain: false }));
    setParams({ straighten: 5 });
    render(<TransformPanel />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Constrain crop" }));
    expect(rig.api.variables.get(OPTIONS)?.value).toEqual({ constrain: true, aspect: -1 });
    expect(params().crop).toEqual(fitted(5, DEFAULT_TRANSFORM));
    expect(rig.calls.at(-1)).toEqual({ commitEdit: "Constrain crop" });
  });
});

describe("the guided lines on the canvas", () => {
  const RECT = { x: 0, y: 0, w: 600, h: 400 };

  it("draws a line, then applies the correction it makes", () => {
    rig.overlay.setState({ region: { x: 0, y: 0, width: 1, height: 1 }, imageAspect: 1.5 });
    setParams({ uprightMode: "guided" });
    const view = render(<GuidedCanvas rect={RECT} />);
    const svg = view.container.querySelector("svg")!;
    fireEvent.pointerDown(svg, { pointerId: 1, button: 0, clientX: 60, clientY: 40 });
    fireEvent.pointerMove(svg, { pointerId: 1, buttons: 1, clientX: 80, clientY: 360 });
    fireEvent.pointerUp(svg, { pointerId: 1, clientX: 80, clientY: 360 });
    expect(params().guidedLines).toHaveLength(1);
    const want = computeGuidedCorrection(params().guidedLines, 1.5);
    expect(params().straighten).toBe(want.straighten);
    expect(rig.calls.at(-1)).toEqual({ commitEdit: "Guided Upright" });
  });

  it("hides while the Transform panel's preview-off eye is held", () => {
    rig.develop.setState({ bypassedPanels: { "core.transform": true } });
    const view = render(<GuidedCanvas rect={RECT} />);
    expect(view.container.innerHTML).toBe("");
  });
});


