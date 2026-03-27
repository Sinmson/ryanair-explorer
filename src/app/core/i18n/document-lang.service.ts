import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoLocaleService } from '@jsverse/transloco-locale';

/**
 * Keeps the document language (html lang) in sync with Transloco locale (native date picker, a11y).
 */
@Injectable({ providedIn: 'root' })
export class DocumentLangService {
  constructor() {
    const locale = inject(TranslocoLocaleService);
    const destroyRef = inject(DestroyRef);

    const sync = (): void => {
      if (typeof document === 'undefined') return;
      document.documentElement.lang = locale.getLocale();
    };

    sync();
    locale.localeChanges$.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => sync());
  }
}
