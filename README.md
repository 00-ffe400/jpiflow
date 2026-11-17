# HEX · 3D Glass Studio

A standalone copy of the 3D scene. The existing ExamVue website is separate.

## Run locally

Install Node.js, then run `node tools/serve.mjs` and open http://127.0.0.1:4182/ . No package installation or build step is required.

The right-hand 3D settings panel supports individual materials, sphere gradients, shared initial glass orientation, animation, presets, JSON import/export and PNG export. `?controls=1` opens the panel. `?controls=0` hides the controls. Changes are saved in this browser only.

`dist/login/presets/site-default.json` is the scene exported from the user's working browser. It preserves the selected camera, materials, motion, preview mode and text. The paired `.js` module is used at startup and as the reset preset. The gradient is configurable; existing colors are preserved until the user enables it.

Source modules, textures, Three.js and fonts are local to `dist/`; no CDN is required. Three.js licensing is in `dist/vendor/THREE-LICENSE.txt`.

## Continue on another computer

The original implementation lives in https://github.com/00-ffe400/jpiflow on `feature/login-3d-preview`. This standalone site is saved on `feature/hex3d-site` and in the Sites source repository. Clone the GitHub branch to continue editing:

```sh
git clone --branch feature/hex3d-site https://github.com/00-ffe400/jpiflow.git hex3d
cd hex3d
node tools/serve.mjs
node tools/check-materials.mjs
```

## Publish

The exact Sites identity is in `.openai/hosting.json`. Use the Sites workflow to push the source, package `dist/`, save a version and deploy to that project ID. Do not reuse the ExamVue project's ID. Keep the site's current access policy unless the owner asks to change it.
