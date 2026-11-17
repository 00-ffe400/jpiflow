// One closed cycle: rest outside, ease into the opening, rest inside, ease out.
// Smootherstep has zero velocity and acceleration at each joining point.
const smootherstep=t=>t*t*t*(t*(t*6-15)+10);
export function dipProgress(cycles){
  const t=((cycles%1)+1)%1;
  if(t<.12||t>=.88)return 0;
  if(t<.44)return smootherstep((t-.12)/.32);
  if(t<=.56)return 1;
  return 1-smootherstep((t-.56)/.32);
}
