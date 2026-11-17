const KEY='examvue.studio.v2';
// Each explicit user-selected preset replaces the browser state once.
// Later customization and the previous settings remain available locally.
export function seedSiteSettings(storage,settings,revision){
  const changed=storage.getItem(KEY+'.sitePresetRevision')!==revision;
  if(changed){
    const previous=storage.getItem(KEY);
    if(previous)storage.setItem(KEY+'.beforeSitePreset.'+revision,previous);
    storage.setItem(KEY,JSON.stringify(settings));
  }
  for(const suffix of ['.blend261101','.pin633881716349791611','.selected20261117','.coreSphere20261117','.clearGlass1','.gradientMotion1'])
    storage.setItem(KEY+suffix,'true');
  if(changed)storage.setItem(KEY+'.sitePresetRevision',revision);
  return changed;
}
