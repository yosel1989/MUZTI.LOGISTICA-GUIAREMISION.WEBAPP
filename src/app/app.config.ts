import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { es } from 'primelocale/es.json';
import { definePreset } from '@primeng/themes';

export const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{amber.50}',
      100: '{amber.100}',
      200: '{amber.200}',
      300: '{amber.300}',
      400: '{amber.400}',
      500: '{amber.500}',
      600: '{amber.600}',
      700: '{amber.700}',
      800: '{amber.800}',
      900: '{amber.900}',
      950: '{amber.950}'
    },
    colorScheme: {
      light: {
        primary: {
          color: '#ab4141',
          hoverColor: '{amber.600}',
          activeColor: '{amber.500}'
        },
        highlight: {
          background: '{amber.100}',
          focusBackground: '{amber.300}',
          color: '#000000',
          focusColor: '#000000'
        }
      },
      dark: {
        primary: {
          color: '{amber.500}',
          hoverColor: '{amber.100}',
          activeColor: '{amber.50}'
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
