import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';
import { AhoyDtuPlatform } from './ahoy-dtu-platform';

export = (api: API) => {
  api.registerPlatform('AhoyDTU', AhoyDtuPlatform);
};
