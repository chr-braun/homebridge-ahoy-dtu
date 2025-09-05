import { API } from 'homebridge';
import { AhoyDtuPlatform } from './ahoy-dtu-platform';

export = (api: API) => {
  api.registerPlatform('AhoyDTU', AhoyDtuPlatform);
};
