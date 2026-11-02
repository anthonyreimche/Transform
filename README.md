# Transform for Safelight

The Develop **Transform** panel: keystone and stretch corrections, Upright
and guided Upright.

- **Upright:** Level straightens the horizon, Vertical straightens vertical
  lines, Auto balances the two, Full corrects both keystones and the stretch,
  and Off clears the correction. Each reads lines from the photo as developed.
- **Guided:** draw lines on the photo along edges that should be straight;
  drag an end to move a line, × to remove it. The correction follows the
  lines. **Done** or Escape closes the lines and keeps the correction.
- **Vertical**, **Horizontal** and **Aspect** correct the keystones and the
  stretch by hand.
- **Constrain crop** keeps the crop inside the photo as it transforms. It is
  Crop & Straighten's "Constrain to image", shared between the two panels.
- **Flip horizontal** and **Flip vertical** are shortcuts, unbound until you
  bind them in Preferences ▸ Shortcuts.

Right-click the panel's header and choose **Reset to defaults** to put the
transform, straighten and Upright back as one step.

Until Safelight 3.2.0 this panel was built in. It keeps the built-in panel's
id (`core.transform`), so layouts saved before then keep it where it was. The
transform draws through Crop & Straighten's geometry, so it needs that
extension; while Transform is off or uninstalled, photos show without their
transform, and Develop says so for photos that had one.

## Development

```bash
npm install
npm run typecheck
npm run build    # dist/index.js, the file Safelight loads
npm test         # vitest; the bundle checks read dist/, so build first
npm run check    # all three, in that order
```
