# Login preview verification — 2026-11-16

Target: Figma `dBqLrPQwdGVtFdGX66AYJf`, node `1854:44180` (1920 × 1080 login composition).
Reference: Pinterest `852658141991184044`, Guavapay 3D Portfolio by Maksim Shamray. Uses only its material, lighting and spatial direction; the interactive scene is original procedural geometry.

Verified in the local Chromium preview at `/login/`:

| Viewport | Result |
| --- | --- |
| 1920 × 1080 | Two columns, 374px login form, original field/button dimensions |
| 1440 × 900 | Desktop composition |
| 1024 × 768 | Two columns, no horizontal overflow |
| 768 × 1024 | Stacked visual and form, form width 420px, no horizontal overflow |
| 390 × 844 | Phone composition, no horizontal overflow |
| 320 × 640 | Form fits, lower account links reachable by scrolling, buttons at least 44px high, account text 12px |

- Figma SVGs loaded locally at their original 24 × 24 and 16 × 16 dimensions.
- Login empty-field errors, email format validation, password visibility, demonstrative success modal.
- Account modal closes with confirmation; reopening restarts 0 / 70 / 140 / 210 / 280ms staggered animations.
- Live shape/material/twist changes, local persistence, settings copy, JSON import across all adjustable properties, reset, hiding controls.
- Both manual and emulated OS reduced motion disable CSS animations and pause 3D. OS emulation was removed after the check.
- Browser console: no application warnings or errors during final verification.
- JavaScript syntax checks and `git diff --check` pass.

Fixed during verification: narrow-screen implicit grid width overflow; tablet breakpoint; mobile settings drawer stacking; accessible slider names; modal stagger selectors.

Limits: viewport emulation was used, not a physical phone. Authentication remains an explicit demo without a backend. Other pages await user feedback. No public deployment or main merge.
