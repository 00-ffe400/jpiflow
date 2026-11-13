// Extend both open ends beyond the camera frustum, including depth and pointer rotation.
// All surfaces and contours share this span so resizing never exposes a cut end.
export function getRibbonSpan(aspect,fov,distance){
 const halfFov=fov*Math.PI/360;
 const visibleWidth=2*Math.tan(halfFov)*(distance+3.2)*aspect;
 return Math.max(25,visibleWidth*1.2+4);
}
