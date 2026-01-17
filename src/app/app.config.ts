import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { es } from 'primelocale/es.json';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),

    providePrimeNG({
        translation: es,
        theme: {
            preset: Aura,
            options: {
                darkModeSelector: '.dark',
                lightModeSelector: '.light'
            }
        }
    })
  ]
};
