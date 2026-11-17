// A continuously differentiable closed cycle, without frozen sections at the
// glass boundary. Velocity naturally reaches zero at each turnaround.
export function dipProgress(cycles){
  const t=((cycles%1)+1)%1;
  return .5-.5*Math.cos(t*Math.PI*2);
}

// Smooth only the editable base position. Animation is an absolute offset,
// never a new interpolation target. Changing a pointer/settle blend must not
// delay the sphere and then snap it back onto its trajectory.
export function applyAnimatedTranslation(position,previousOffset,base,offset,blend){
  position.sub(previousOffset).lerp(base,blend).add(offset);
  previousOffset.copy(offset);
}
