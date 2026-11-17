# Shape studies — 2026-11-17

The shape was redesigned before further material work. Three hand-authored open spline gestures replace the repeated ellipses: Fold, Long S, and Loose Knot. Each defaults to one dominant variable-width stroke and a thinner counter-stroke. Long S is the default study.

Verified:

- All three designs generate finite vertex positions and normals; two meshes are produced at the default count. Width/taper deformation is followed by normal recalculation and UV seam normal welding.
- New schema values and all built-in presets validate. Legacy loop JSON without shape-study fields loads the old circular geometry in glass mode.
- Gray mode uses fixed neutral material, lighting and background without overwriting the stored glass settings. The glass transmission input disables with an explanation in clay mode and enables in glass mode.
- Default motion is paused; pointer parallax defaults to zero. Manual camera orbit and whole-model controls remain available. Position-only reset was exercised.
- 1440 × 900 desktop: all three shapes render through the right-panel selector. The study screenshots use the same camera, lighting, material and crop.
- 390 × 844 and 320 × 740: no horizontal overflow. At 320px the panel is 296px wide and all three study selection buttons are 44px high.
- Browser console: no application warnings or errors during the final checks.
- JavaScript syntax checks and `git diff --check` pass.

Existing login markup and styles, account flows and hosting settings were not modified. No public deployment or main merge was performed. This is a shape-review pass; the user should choose the silhouette before further glass-material work.
