import { Component, computed, inject, input, TemplateRef, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';
import { TranslocoLocaleService } from '@jsverse/transloco-locale';
import { startWith } from 'rxjs';
import { TableComponent, ColumnDef } from 'ui';
import { PublishedRouteDeal } from '../../core/models/published-route-deal.model';

@Component({
  selector: 'app-published-deals-table',
  templateUrl: './published-deals-table.component.html',
  imports: [TableComponent],
})
export class PublishedDealsTableComponent {
  readonly deals = input.required<PublishedRouteDeal[]>();

  private readonly transloco = inject(TranslocoService);
  private readonly locale = inject(TranslocoLocaleService);

  private readonly _i18nTick = toSignal(
    this.transloco.langChanges$.pipe(startWith(this.transloco.getActiveLang())),
    { initialValue: this.transloco.getActiveLang() }
  );

  protected readonly originTpl = viewChild<TemplateRef<unknown>>('originTpl');
  protected readonly destTpl = viewChild<TemplateRef<unknown>>('destTpl');
  protected readonly dateTpl = viewChild<TemplateRef<unknown>>('dateTpl');
  protected readonly priceTpl = viewChild<TemplateRef<unknown>>('priceTpl');

  protected readonly templateMap = computed(() => {
    const map: Record<string, TemplateRef<unknown>> = {};
    const o = this.originTpl();
    const d = this.destTpl();
    const dt = this.dateTpl();
    const p = this.priceTpl();
    if (o) map['originIata'] = o;
    if (d) map['destinationIata'] = d;
    if (dt) map['departureDate'] = dt;
    if (p) map['priceFrom'] = p;
    return map;
  });

  protected readonly columns = computed<ColumnDef<PublishedRouteDeal>[]>(() => {
    this._i18nTick();
    const t = (key: string) => this.transloco.translate(key);
    return [
      {
        key: 'originIata',
        header: t('publishedDeals.origin'),
        sortable: true,
        cellTemplate: 'originIata',
        accessor: row => row.originIata,
      },
      {
        key: 'destinationIata',
        header: t('publishedDeals.destination'),
        sortable: true,
        cellTemplate: 'destinationIata',
        accessor: row => row.destinationName ?? row.destinationIata,
      },
      {
        key: 'departureDate',
        header: t('table.departure'),
        sortable: true,
        cellTemplate: 'departureDate',
        accessor: row => row.departureDate.getTime(),
      },
      {
        key: 'priceFrom',
        header: t('table.price'),
        sortable: true,
        align: 'right',
        cellTemplate: 'priceFrom',
        accessor: row => row.priceFrom,
      },
    ];
  });

  protected formatDate(d: Date): string {
    return this.locale.localizeDate(d, undefined, {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  protected formatPrice(row: PublishedRouteDeal): string {
    try {
      return this.locale.localizeNumber(row.priceFrom, 'currency', undefined, {
        currency: row.currencyCode,
      });
    } catch {
      return `${row.priceFrom} ${row.currencyCode}`;
    }
  }

  protected readonly trackDealFn = (row: PublishedRouteDeal): string =>
    `${row.originIata}-${row.destinationIata}-${row.departureDate.getTime()}-${row.priceFrom}`;
}
