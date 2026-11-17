import settings from './login/presets/site-default.js';
import {initStudio} from './login/studio.js';
// Seed this site's independent browser storage with the exported local scene.
try {
  const key='examvue.studio.v2';
  if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(settings));
  for(const suffix of ['.blend261101','.pin633881716349791611','.selected20261117','.coreSphere20261117'])
    if(!localStorage.getItem(key+suffix))localStorage.setItem(key+suffix,'true');
}catch{}
initStudio();
