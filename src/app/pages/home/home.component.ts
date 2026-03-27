import { Component, DestroyRef, inject, viewChild, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { FlightStore } from '../../core/store/flight.store';
import { FlightSearchParams } from '../../core/models/flight-search.model';
import { AirportSelectorComponent } from '../../shared/airport-selector/airport-selector.component';
import { DateRangeComponent } from '../../shared/date-range/date-range.component';
import { DaysSelectorComponent } from '../../shared/days-selector/days-selector.component';
import { FlightTableComponent } from '../../shared/flight-table/flight-table.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [
    AirportSelectorComponent,
    DateRangeComponent,
    DaysSelectorComponent,
    FlightTableComponent,
    TranslocoPipe,
  ],
})
export class HomeComponent implements OnInit {
  protected readonly store = inject(FlightStore);
  private readonly transloco = inject(TranslocoService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly departureSel = viewChild<AirportSelectorComponent>('departureSel');
  private readonly arrivalSel = viewChild<AirportSelectorComponent>('arrivalSel');
  private readonly dateRange = viewChild<DateRangeComponent>('dateRange');
  private readonly daysSelector = viewChild<DaysSelectorComponent>('daysSelector');

  constructor() {
    this.transloco.langChanges$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      void this.store.loadAirports();
    });
  }

  ngOnInit(): void {
    this.store.loadAirports();
  }

  protected get isSearchDisabled(): boolean {
    const dep = this.departureSel()?.selectedAirports() ?? [];
    const arr = this.arrivalSel()?.selectedAirports() ?? [];
    return dep.length === 0 && arr.length === 0;
  }

  protected async onSearch(): Promise<void> {
    const dep = this.departureSel()?.selectedAirports() ?? [];
    const arr = this.arrivalSel()?.selectedAirports() ?? [];
    const dr = this.dateRange();
    const ds = this.daysSelector();

    if (!dr || !ds) return;

    const startDate = new Date(dr.startDate());
    const endDate = new Date(dr.endDate());
    const durationFrom = ds.minDays();
    const durationTo = ds.maxDays();

    const earliestEndDate = new Date(startDate);
    earliestEndDate.setDate(startDate.getDate() + durationFrom);

    const latestEndDate = new Date(endDate);
    latestEndDate.setDate(endDate.getDate() + durationFrom);

    const params: FlightSearchParams = {
      departureAirportCodes: dep.map(a => a.iataCode),
      arrivalAirportCodes: arr.map(a => a.iataCode),
      outboundDateFrom: dr.startDate(),
      outboundDateTo: dr.endDate(),
      inboundDateFrom: this.formatDate(earliestEndDate),
      inboundDateTo: this.formatDate(latestEndDate),
      durationFrom,
      durationTo,
    };

    await this.store.search(params);
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
