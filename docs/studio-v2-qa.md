# Three-group studio verification — 2026-11-16

## Latest model replacement

The latest user image replaces the default tile composition with three intersecting clear-blue glass spline curves. The previous tile compositions remain loadable built-in presets.

- Real swept elliptical cross-section meshes: two closed loops and one open spatial curve. No reference screenshot is used as a surface or animation asset.
- Finite vertex data and outward triangle winding pass geometry checks for all three meshes.
- Width/depth/curvature/twist/spacing and count controls connect to the mesh generation. A width change and restoration were exercised in the browser without warnings.
- Whole-model movement and position-only reset work with the new curves. The camera and model remain separately controlled.
- Current-model targets are Whole / Glass curves. Tile picking is disabled with a reason for this model. Older presets restore the older target groups.
- Latest 320 × 740 phone check: no horizontal overflow, panel width 296px, glass-curve accessible description present. The preserved account modal opens and closes normally after the launcher was moved above the mobile form.
- Browser console after the replacement: no warnings or errors. All five application modules pass syntax checks.

## Earlier tile-model verification

The existing login form, typography, account modal and surrounding site remain unchanged. Changes are scoped to `dist/login/` and this documentation.

Verified through the local Chromium browser preview:

- Right panel at 1440 × 900: x=1020, width=400, 20px right inset. It can close and reopen with the floating button.
- Three independently stored groups. Changing crystal color does not change tile color when unlinked. Enabling material links propagates the changed property to another group; disabling restores independent edits.
- Real internal octahedron is visible when the external crystal is disabled. Both visibility controls operate independently.
- Instanced default grid reports 112 visible tiles. Border pattern selects 40. Height/color overrides visibly change the border; clicking a rendered tile selects one instance through raycasting.
- Perspective/orthographic switching; FOV input disables for orthographic mode while its zoom input remains editable.
- Whole-model panel changes X/Y/Z to 1.2 / 0.3 / -0.5 while camera distance remains 17. Position-only reset is provided.
- Ambient light position inputs disable with an explanation; brightness remains editable.
- Built-in reference and previous-material presets switch successfully. User preset save, rename, load and delete were exercised. Wrong JSON types are rejected; numeric limits and built-in preset validity also pass direct schema checks.
- Transparent PNG preview loads as an actual image (761 × 853 in the tested canvas). Automatic retrieval of data URL exports is blocked by the browser automation protocol policy, so file reception and PNG alpha bytes were not inspected. The UI includes a preview and explicit download link.
- A 390px scene preview can be enabled without horizontal overflow. Phone panel at 390 × 844 is x=12, width=366, height=820 and its numeric touch controls are 44px high.
- Current reference material uses actual gently curved top geometry, physical roughness/clearcoat and a procedural softbox reflection environment. No screenshot is used as a moving tile surface.
- Browser console has no application warning or error after the PMREM blur range adjustment.
- Syntax checks for `app.js`, `studio-state.js`, `studio.js`, `scene-v2.js` and `git diff --check` pass.

This is the requested first-stage basic scene and core control review. The README lists the remaining detailed material, reflection-panel, edge-fade and motion extensions that should follow feedback. No public deployment or main merge was performed.
