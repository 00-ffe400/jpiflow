# HEX · 3D Glass Studio

A standalone copy of the 3D scene. The existing ExamVue website is separate.

## Run locally

Install Node.js, then run `node tools/serve.mjs` and open http://127.0.0.1:4182/ . No package installation or build step is required.

The right-hand 3D settings panel supports individual materials, sphere gradients, shared initial glass orientation, animation, presets, JSON import/export and PNG export. `?controls=1` opens the panel. `?controls=0` hides the controls. Changes are saved in this browser only.

`dist/login/presets/site-default.json` starts from the scene exported from the user's working browser. Its camera, geometry, motion, gradient controls and text are preserved; the clear-glass revision updates materials and reflection lighting. The paired `.js` module is used at startup and as the reset preset.

The previous saved scene had opaque clay preview enabled. `glass-look.js` switches it to glass once, uses transmission with opacity 1, reduces absorption and optical thickness, and adds soft studio reflections through `glass-environment.js`. Existing visitors receive this material-only migration once (`examvue.studio.v2.clearGlass1`); subsequent material edits remain theirs. The original settings are backed up in the browser under `examvue.studio.v2.beforeClearGlass` and available in the Save tab as **이전 재질 · 변경 전 비교**. **사이트 기본 설정 · HEX** restores the new default.

Actual wall thickness controls geometry. Material optical thickness controls refraction/absorption independently; the unit-diameter core mesh converts this scene-unit value into mesh-local units before applying its scale. Environment softboxes affect reflections without replacing the page background. Per-object materials and the existing depth-layer compositor remain in use.

Source modules, textures, Three.js and fonts are local to `dist/`; no CDN is required. Three.js licensing is in `dist/vendor/THREE-LICENSE.txt`.

## Continue on another computer

The original implementation lives in https://github.com/00-ffe400/jpiflow on `feature/login-3d-preview`. This standalone site is saved on `feature/hex3d-site` and in the Sites source repository. Clone the GitHub branch to continue editing:

```sh
git clone --branch feature/hex3d-site https://github.com/00-ffe400/jpiflow.git hex3d
cd hex3d
node tools/serve.mjs
node tools/check-materials.mjs
node tools/check-glass-look.mjs
```

## Publish

The exact Sites identity is in `.openai/hosting.json`. Use the Sites workflow to push the source, package `dist/`, save a version and deploy to that project ID. Do not reuse the ExamVue project's ID. Keep the site's current access policy unless the owner asks to change it.
