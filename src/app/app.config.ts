import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { LOCALE_ID, isDevMode } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePT from '@angular/common/locales/pt';
import localeES from '@angular/common/locales/es';
import localeDE from '@angular/common/locales/de';
import localeFR from '@angular/common/locales/fr';

import { numberInterceptor } from './interceptors/number/number.interceptor';
import { httpStatusInterceptor } from './interceptors/http-status/http-status.interceptor';
import { ConfigService } from './services/config.service';
import { ConfigStatusService } from './services/configStatus.service';
import { provideServiceWorker } from '@angular/service-worker'; //npm install @angular/service-worker

registerLocaleData(localePT);
registerLocaleData(localeES);
registerLocaleData(localeDE);
registerLocaleData(localeFR);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([numberInterceptor, httpStatusInterceptor])
    ),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    ConfigService,
    {// Configurações de inicialização do ConfigService
      provide: APP_INITIALIZER,
      useFactory: (configService: ConfigService) => () => configService.loadConfig(),
      deps: [ConfigService],
      multi: true,
    },

    { // Configurações de inicialização do ConfigStatusService
      provide: APP_INITIALIZER,
      useFactory: (configStatusService: ConfigStatusService) => () => configStatusService.loadConfig(),
      deps: [ConfigStatusService],
      multi: true,
    }, provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
  ],
};
