import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideTransloco } from '@jsverse/transloco';
import { provideTranslocoLocale } from '@jsverse/transloco-locale';
import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat';
import { provideTranslocoPersistLang } from '@jsverse/transloco-persist-lang';
import { provideTranslocoPersistTranslations } from '@jsverse/transloco-persist-translations';
import { provideTranslocoPreloadLangs } from '@jsverse/transloco-preload-langs';

import { routes } from './app.routes';
import { TranslocoHttpLoader } from './core/i18n/transloco-http.loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withFetch()),

    provideTranslocoPersistTranslations({
      loader: TranslocoHttpLoader,
      storage: { useValue: localStorage },
      storageKey: 'ryanair-explorer-i18n-cache',
      ttl: 86_400_000,
    }),
    ...provideTransloco({
      config: {
        availableLangs: ['en', 'de'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
    }),
    provideTranslocoPreloadLangs(['en', 'de']),
    provideTranslocoPersistLang({
      storage: { useValue: localStorage },
      storageKey: 'ryanair-explorer-lang',
    }),
    provideTranslocoMessageformat(),
    ...provideTranslocoLocale({
      defaultLocale: 'en-US',
      defaultCurrency: 'EUR',
      langToLocaleMapping: { en: 'en-US', de: 'de-DE' },
    }),
  ],
};
