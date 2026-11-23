# Demo image provenance

The service hero uses an empty dashboard captured with local Mock providers. Its
source image is a 1440 × 900 PNG with SHA-256
`2fcfc4ed7f36c95110161eb959bcc1a7b0395619659625e1cf57644347060ee5`.
`build-telemedicine-demo.sh` crops away the greeting and composites the remaining
screen into the existing laptop frame. The frame input has SHA-256
`1ef3c9cdcc9c2ef6fc49a7d4f95c94216eeadc7cbac6370d008f0afed233d821`.

The PACS worklist is a capture of the local app using its Mock backend and seeded
contract studies. The displayed image is a generated grayscale gradient, not a
clinical scan. The 1600 × 832 source capture has SHA-256
`038e33314c9f8e90500825152ee10741c6711fea56df41bf33467b0369dd6581`.
`crop-pacs-demo.sh` removes the account bar before encoding the image. Both scripts
require ImageMagick and take the source image paths as arguments.
