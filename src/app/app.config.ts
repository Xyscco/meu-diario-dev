import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    { provide: LOCALE_ID, useValue: 'pt-BR' }
  ]
};
