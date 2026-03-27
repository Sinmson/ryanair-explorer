import { Component, computed, inject, input, TemplateRef, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';
import { TranslocoLocaleService } from '@jsverse/transloco-locale';
import { startWith } from 'rxjs';
import { TableComponent, ColumnDef } from 'ui';
import { FlightFare } from '../../core/models/flight-fare.model';

@Component({
  selector: 'app-flight-table',
  templateUrl: './flight-table.component.html',
  imports: [TableComponent],
})
export class FlightTableComponent {
  readonly fares = input.required<FlightFare[]>();

  private readonly transloco = inject(TranslocoService);
  private readonly locale = inject(TranslocoLocaleService);

  private readonly _i18nTick = toSignal(
    this.transloco.langChanges$.pipe(startWith(this.transloco.getActiveLang())),
    { initialValue: this.transloco.getActiveLang() }
  );

  protected readonly fromTpl = viewChild<TemplateRef<unknown>>('fromTpl');
  protected readonly toTpl = viewChild<TemplateRef<unknown>>('toTpl');
  protected readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');
  protected readonly returnDateTpl = viewChild<TemplateRef<unknown>>('returnDateTpl');
  protected readonly priceTpl = viewChild<TemplateRef<unknown>>('priceTpl');

  protected readonly templateMap = computed(() => {
    const map: Record<string, TemplateRef<unknown>> = {};
    const from = this.fromTpl();
    const to = this.toTpl();
    const date = this.dateTpl();
    const returnDate = this.returnDateTpl();
    const price = this.priceTpl();
    if (from) map['from'] = from;
    if (to) map['to'] = to;
    if (date) map['departureDate'] = date;
    if (returnDate) map['returnDate'] = returnDate;
    if (price) map['totalPrice'] = price;
    return map;
  });

  protected readonly columns = computed<ColumnDef<FlightFare>[]>(() => {
    this._i18nTick();
    const t = (key: string) => this.transloco.translate(key);
    return [
      {
        key: 'from',
        header: t('table.from'),
        sortable: true,
        cellTemplate: 'from',
        accessor: (row: FlightFare) =>
          row.outbound.departureAirport.countryName + row.outbound.departureAirport.cityName,
      },
      {
        key: 'to',
        header: t('table.to'),
        sortable: true,
        cellTemplate: 'to',
        accessor: (row: FlightFare) =>
          row.outbound.arrivalAirport.countryName + row.outbound.arrivalAirport.cityName,
      },
      {
        key: 'departureDate',
        header: t('table.departure'),
        sortable: true,
        cellTemplate: 'departureDate',
        accessor: (row: FlightFare) => row.outbound.departureDate,
      },
      {
        key: 'returnDate',
        header: t('table.return'),
        sortable: true,
        cellTemplate: 'returnDate',
        accessor: (row: FlightFare) => row.inbound.departureDate,
      },
      {
        key: 'tripDurationDays',
        header: t('table.days'),
        sortable: true,
        accessor: (row: FlightFare) => row.tripDurationDays,
      },
      {
        key: 'totalPrice',
        header: t('table.price'),
        sortable: true,
        align: 'right',
        cellTemplate: 'totalPrice',
        accessor: (row: FlightFare) => row.totalPrice,
      },
    ];
  });

  protected formatDate(dateStr: string): string {
    return this.locale.localizeDate(dateStr, undefined, {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  protected formatPrice(fare: FlightFare): string {
    try {
      return this.locale.localizeNumber(fare.totalPrice, 'currency', undefined, {
        currency: fare.currency,
      });
    } catch {
      return `${fare.totalPrice} ${fare.currency}`;
    }
  }

  protected getFlagUrl(countryCode: string, size = 24): string {
    if (!countryCode || countryCode.length !== 2) return '';
    const code = countryCode.toLowerCase();
    return `https://flagcdn.com/${size}x${Math.round(size * 0.75)}/${code}.png`;
  }

  protected getFlagSrcset(countryCode: string): string {
    if (!countryCode || countryCode.length !== 2) return '';
    const code = countryCode.toLowerCase();
    return `https://flagcdn.com/48x36/${code}.png 2x, https://flagcdn.com/72x54/${code}.png 3x`;
  }
}
