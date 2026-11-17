import settings,{SITE_PRESET_REVISION} from './login/presets/site-default.js';
import {initStudio} from './login/studio.js';
import {seedSiteSettings} from './login/site-settings.js';
try {seedSiteSettings(localStorage,settings,SITE_PRESET_REVISION);}catch{}
initStudio();
