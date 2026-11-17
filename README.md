# HEX · 3D Glass Studio

A standalone copy of the 3D scene. The existing ExamVue website is separate.

## Run locally

Install Node.js, then run `node tools/serve.mjs` and open http://127.0.0.1:4182/ . No package installation or build step is required.

The right-hand 3D settings panel supports individual materials, sphere gradients, shared initial glass orientation, animation, presets, JSON import/export and PNG export. `?controls=1` opens the panel. `?controls=0` hides the controls. Changes are saved in this browser only.

`dist/login/presets/site-default.json` contains the user's selected JSON settings from November 17, 2026. Every supplied value is preserved; newer fields absent from that export retain the existing rotating-gradient defaults and inherit the shared glass wall thickness. The original export is kept in `tools/fixtures/user-preset-20261117.json`. The paired `.js` module is used at startup and as the reset preset.

`dist/login/site-settings.js` applies an explicit preset revision once to new and existing browsers, backing up their previous settings under `examvue.studio.v2.beforeSitePreset.<revision>`. Later browser edits remain untouched on reload. For another requested default change, update both default files and the exported `SITE_PRESET_REVISION` in the JS module. Historical automatic material/shape migrations are marked complete so they cannot replace the user's exact settings.

The previous saved scene had opaque clay preview enabled. `glass-look.js` switches it to glass once, uses transmission with opacity 1, reduces absorption and optical thickness, and adds soft studio reflections through `glass-environment.js`. Existing visitors receive this material-only migration once (`examvue.studio.v2.clearGlass1`); subsequent material edits remain theirs. The original settings are backed up in the browser under `examvue.studio.v2.beforeClearGlass` and available in the Save tab as **이전 재질 · 변경 전 비교**. **사이트 기본 설정 · HEX** restores the new default.

Actual wall thickness controls geometry. Material optical thickness controls refraction/absorption independently; the unit-diameter core mesh converts this scene-unit value into mesh-local units before applying its scale. Environment softboxes affect reflections without replacing the page background. Per-object materials and the existing depth-layer compositor remain in use.

**Thickness:** select a numbered glass hemisphere, then use **실제 유리 두께** at the top of Color/Material or in Shape/Arrangement. Each shell stores `pinRings.layers.<key>.wallThickness` separately. Selecting all glass and changing **전체 유리 벽 두께** applies that value to all shells; material links do not affect geometry. Older JSON inherits the former shared thickness. The core has its own physical wall slider. Existing thicknesses remain the starting values.

**Rotating center gradient:** select the central object, then use **그라데이션 회전** in Color/Material or Motion. Color sampling rotates in the PBR shader without rebuilding geometry. Axis, signed speed (degrees/second), and start angle are saved under `pinCore.gradient`. Speed zero freezes the phase; whole/group pause and reduced motion also stop it. Scroll/manual progress and restart work with this animation. Radial gradients are symmetric around Z; choose X/Y or a linear direction for visible rotation. A one-time browser migration enables a two-color rotating gradient using the existing stops, backing up the prior settings under `examvue.studio.v2.beforeGradientMotion`; the `gradientMotion1` marker preserves later user edits.

Source modules, textures, Three.js and fonts are local to `dist/`; no CDN is required. Three.js licensing is in `dist/vendor/THREE-LICENSE.txt`.

## Continue on another computer

The original implementation lives in https://github.com/00-ffe400/jpiflow on `feature/login-3d-preview`. This standalone site is saved on `feature/hex3d-site` and in the Sites source repository. Clone the GitHub branch to continue editing:

```sh
git clone --branch feature/hex3d-site https://github.com/00-ffe400/jpiflow.git hex3d
cd hex3d
node tools/serve.mjs
node tools/check-materials.mjs
node tools/check-glass-look.mjs
node tools/check-thickness-motion.mjs
node tools/check-site-preset.mjs
```

## Publish

The exact Sites identity is in `.openai/hosting.json`. Use the Sites workflow to push the source, package `dist/`, save a version and deploy to that project ID. Do not reuse the ExamVue project's ID. Keep the site's current access policy unless the owner asks to change it.
