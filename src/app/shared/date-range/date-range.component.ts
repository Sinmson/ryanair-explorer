import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { TranslocoLocaleService } from '@jsverse/transloco-locale';
import { startWith } from 'rxjs';
import { DatePickerComponent } from 'ui';

@Component({
  selector: 'app-date-range',
  templateUrl: './date-range.component.html',
  imports: [DatePickerComponent, TranslocoPipe],
})
export class DateRangeComponent {
  private readonly locale = inject(TranslocoLocaleService);

  /** BCP 47 locale for native date input (attr.lang), e.g. en-US / de-DE. */
  protected readonly activeLocaleId = toSignal(
    this.locale.localeChanges$.pipe(startWith(this.locale.getLocale())),
    { initialValue: this.locale.getLocale() }
  );

  readonly startDate = signal(this.formatDate(new Date()));
  readonly endDate = signal(this.formatDate(this.getDefaultEndDate()));

  protected readonly todayStr = this.formatDate(new Date());

  protected readonly minEndDate = computed(() => this.startDate());

  /** When start moves past end, keep the previous start→end span on the new range. */
  protected onStartChange(iso: string): void {
    const prevStart = this.parseISOLocal(this.startDate());
    const prevEnd = this.parseISOLocal(this.endDate());
    const nextStart = this.parseISOLocal(iso);
    const spanMs = prevEnd.getTime() - prevStart.getTime();

    this.startDate.set(iso);

    if (nextStart.getTime() > prevEnd.getTime()) {
      const safeSpan = Math.max(0, spanMs);
      const nextEnd = new Date(nextStart.getTime() + safeSpan);
      this.endDate.set(this.formatDateLocal(nextEnd));
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private formatDateLocal(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /** Parse yyyy-mm-dd as local calendar date (matches native date input). */
  private parseISOLocal(iso: string): Date {
    const [y, mo, d] = iso.split('-').map(Number);
    return new Date(y, mo - 1, d);
  }

  private getDefaultEndDate(): Date {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d;
  }
}
