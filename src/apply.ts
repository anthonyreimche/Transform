// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// Writing a transform: the params, then the crop refit to it while Crop &
// Straighten's "Constrain to image" is on, and Upright's corrections.

import { api } from "./rt";
import type { TransformParams, UprightMode } from "./safelight";
import { maxCropForTransform } from "./crop-maths";
import { buildInverseTransform } from "./transform";
import { computeGuidedCorrection, computeUprightCorrection, detectLines, type UprightResult } from "./upright";
import { cropOptions, imageAspect } from "./state";

/** Refit the crop to `straighten` and `transform` while the crop is
 *  constrained: the largest crop of its aspect lock inside the image. */
export function fitCrop(straighten: number, transform: TransformParams): void {
  const { constrain, aspect: lock } = cropOptions();
  if (!constrain) return;
  const aspect = imageAspect();
  const inv = buildInverseTransform(straighten, transform, aspect);
  // -1 = Original: resolve to the image's own aspect.
  api.stores.useDevelopStore.getState().setParam("crop", maxCropForTransform(inv, lock === -1 ? aspect : lock, aspect));
}

/** Write an Upright correction: straighten, the keystones (and the stretch,
 *  when it has one), then refit the crop. */
export function applyCorrection(result: UprightResult): void {
  const { params, setParam } = api.stores.useDevelopStore.getState();
  const next: TransformParams = {
    ...params.transform,
    perspectiveV: Math.round(result.perspectiveV),
    perspectiveH: Math.round(result.perspectiveH),
    ...(result.aspect != null ? { aspect: Math.round(result.aspect) } : {}),
  };
  setParam("straighten", result.straighten);
  setParam("transform", next);
  fitCrop(result.straighten, next);
}

/** Guided Upright's correction from the lines drawn so far. */
export function applyGuided(): void {
  const { guidedLines } = api.stores.useDevelopStore.getState().params;
  const { straighten, perspectiveV, perspectiveH } = computeGuidedCorrection(guidedLines, imageAspect());
  applyCorrection({ straighten, perspectiveV, perspectiveH });
}

/** Detect lines in the developed photo, untransformed, and the correction
 *  `mode` makes of them; no correction without a frame to read. */
export async function detectUpright(mode: Exclude<UprightMode, "off" | "guided">): Promise<UprightResult> {
  const pixels = await api.develop.readDevelopedPixels(256);
  if (!pixels) return { straighten: 0, perspectiveV: 0, perspectiveH: 0 };
  const lines = detectLines(pixels.data, pixels.width, pixels.height);
  return computeUprightCorrection(lines, mode, pixels.width, pixels.height);
}
