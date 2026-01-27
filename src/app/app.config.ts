import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { es } from 'primelocale/es.json';
import { definePreset } from '@primeng/themes';
import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';

registerLocaleData(localeEsPe, 'es-PE');

export const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50:  '#fdf2f2',
      100: '#fce8e8',
      200: '#f8cfcf',
      300: '#f3a9a9',
      400: '#e97d7d',
      500: '#ab4141', // tu color base
      600: '#933636',
      700: '#7a2c2c',
      800: '#622222',
      900: '#4a1818',
      950: '#2e0f0f'
    },
    colorScheme: {
      light: {
        primary: {
          color: '#ab4141',
          hoverColor: '{primary.600}',
          activeColor: '{primary.500}'
        },
        highlight: {
          background: '{primary.100}',
          focusBackground: '{primary.300}',
          color: '#000000',
          focusColor: '#000000'
        }
      },
      dark: {
        primary: {
          color: '{primary.500}',
          hoverColor: '{primary.100}',
          activeColor: '{primary.50}'
        },

      }
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),

    providePrimeNG({
        translation: es,
        theme: {
            preset: MyPreset,
            options: {
                darkModeSelector: '.dark',
                lightModeSelector: '.light'
            }
        }
    })
  ]
};
