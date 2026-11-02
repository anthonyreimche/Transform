// Safelight — founded and principally authored by Anthony Reimche.
// Copyright (C) 2026 Anthony Reimche. Licensed under the GNU GPL v3 with an
// attribution-preservation term (GPL v3 §7b) — see LICENSE. This notice must
// be preserved in derived versions.

// Whether guided Upright's line overlay is open: view state, never part of the
// edit, closed each session. The crop's options (constrain to image, aspect
// lock) are Crop & Straighten's, shared through a variable, so a transform
// refits the crop the way that panel would.

import { React, api } from "./rt";

let guided = false;
const listeners = new Set<() => void>();

export const guidedEditing = (): boolean => guided;

export function setGuidedEditing(next: boolean): void {
  if (next === guided) return;
  guided = next;
  for (const listener of listeners) listener();
}

export const subscribeGuided = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};

/** React hook: whether the guided overlay is open. */
export const useGuidedEditing = (): boolean => React.useSyncExternalStore(subscribeGuided, guidedEditing);

/** Whether a crop keeps inside the image, and its aspect lock: -1 the image's
 *  own, 0 free, else width over height in pixels. */
export interface CropOptions {
  constrain: boolean;
  aspect: number;
}

export const OPTIONS = "safelight.crop.options";
const INITIAL: CropOptions = { constrain: true, aspect: -1 };

export function registerOptions(): void {
  api.variables.register<CropOptions>(OPTIONS, {
    initial: INITIAL,
    description: "Crop & Straighten: whether a crop keeps inside the image, and its aspect lock.",
  });
}

export const cropOptions = (): CropOptions => api.variables.get<CropOptions>(OPTIONS)?.value ?? INITIAL;

export const setCropOptions = (partial: Partial<CropOptions>) =>
  void api.variables.update<CropOptions>(OPTIONS, (current) => ({ ...current, ...partial }));

/** React hook: the crop's options. */
export function useCropOptions(): CropOptions {
  const [options, setOptions] = React.useState(cropOptions);
  React.useEffect(() => api.variables.subscribe<CropOptions>(OPTIONS, (s) => setOptions(s.value)), []);
  return options;
}

/** The decoded image's width over its height: the source's own size once it
 *  has a frame, the photo's stored size before. Decode paths disagree on
 *  baking EXIF orientation, so the stored size can be transposed. */
export function imageAspect(): number {
  const { sourceSize } = api.stores.useDevelopStore.getState();
  if (sourceSize.width > 0 && sourceSize.height > 0) return sourceSize.width / sourceSize.height;
  const { photos, activePhotoId } = api.stores.useCatalogStore.getState();
  const photo = photos.find((p) => p.id === activePhotoId);
  return photo && photo.width > 0 && photo.height > 0 ? photo.width / photo.height : 1;
}

/** React hook: imageAspect, kept up to date with the source's first frame and
 *  with a switch or rotate of the open photo. */
export function useImageAspect(): number {
  api.stores.useDevelopStore((s) => s.sourceSize);
  api.stores.useCatalogStore((s) => {
    const photo = s.photos.find((p) => p.id === s.activePhotoId);
    return photo ? `${photo.width}x${photo.height}` : "";
  });
  return imageAspect();
}
