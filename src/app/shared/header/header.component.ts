import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { startWith } from 'rxjs';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [TranslocoPipe],
})
export class HeaderComponent {
  protected readonly theme = inject(ThemeService);
  protected readonly transloco = inject(TranslocoService);

  protected readonly activeLang = toSignal(
    this.transloco.langChanges$.pipe(startWith(this.transloco.getActiveLang())),
    { initialValue: this.transloco.getActiveLang() }
  );

  protected setLang(code: string): void {
    this.transloco.setActiveLang(code);
  }
}
