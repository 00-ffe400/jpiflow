import assert from 'node:assert/strict';
import fs from 'node:fs';
import preset,{SITE_PRESET_REVISION} from '../dist/login/presets/site-default.js';
import {selectedSettings,validate} from '../dist/login/studio-state.js';
import {seedSiteSettings} from '../dist/login/site-settings.js';

const supplied=JSON.parse(fs.readFileSync(new URL('./fixtures/user-preset-20261117.json',import.meta.url),'utf8'));
function compareSupplied(input,actual,path=''){
  for(const [key,value]of Object.entries(input)){
    const label=path?`${path}.${key}`:key;
    if(value&&typeof value==='object')compareSupplied(value,actual[key],label);
    else assert.equal(actual[key],value,`Preserve supplied setting: ${label}`);
  }
}
compareSupplied(supplied,preset);
assert.deepEqual(selectedSettings(),preset,'Reset preset and initial preset are identical');
assert.deepEqual(validate(preset),preset,'No supplied value changes during runtime validation');
assert.equal(preset.pinCore.gradient.rotate,true,'Keep the previously requested motion absent from older JSON');
const KEY='examvue.studio.v2',values=new Map([[KEY,JSON.stringify({old:'custom'})]]);
const storage={getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)};
assert.equal(seedSiteSettings(storage,preset,SITE_PRESET_REVISION),true);
assert.deepEqual(JSON.parse(values.get(KEY)),preset,'Existing browsers receive the explicit preset');
assert.deepEqual(JSON.parse(values.get(KEY+'.beforeSitePreset.'+SITE_PRESET_REVISION)),{old:'custom'},'Old browser settings are backed up');
for(const suffix of ['.clearGlass1','.gradientMotion1','.coreSphere20261117'])assert.equal(values.get(KEY+suffix),'true','Older migrations must not overwrite the selected values');
values.set(KEY,JSON.stringify({later:'edit'}));
assert.equal(seedSiteSettings(storage,preset,SITE_PRESET_REVISION),false);
assert.deepEqual(JSON.parse(values.get(KEY)),{later:'edit'},'Reload preserves edits made after applying the preset');
console.log('PASS: every supplied value preserved; matching reset, existing-browser upgrade, backup and later customization.');
