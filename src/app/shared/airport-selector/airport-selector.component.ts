import { Component, input, signal, computed, effect } from '@angular/core';
import { AutocompleteComponent, AutocompleteOption, TagInputComponent, Tag } from 'ui';
import { Airport } from '../../core/models/airport.model';

@Component({
  selector: 'app-airport-selector',
  templateUrl: './airport-selector.component.html',
  imports: [AutocompleteComponent, TagInputComponent],
})
export class AirportSelectorComponent {
  readonly airports = input.required<Airport[]>();
  readonly label = input<string>('');
  readonly placeholder = input<string>('Search airports...');

  readonly selectedAirports = signal<Airport[]>([]);

  /** After language change, store serves new Airport objects; remap selection by IATA so tags/autocomplete labels match. */
  private readonly _syncSelectionToAirportList = effect(() => {
    const list = this.airports();
    const selected = this.selectedAirports();
    if (selected.length === 0 || list.length === 0) return;

    const byCode = new Map(list.map(a => [a.iataCode, a]));
    const remapped = selected.map(a => byCode.get(a.iataCode) ?? a);
    if (remapped.some((a, i) => a !== selected[i])) {
      this.selectedAirports.set(remapped);
    }
  });

  protected readonly autocompleteOptions = computed<AutocompleteOption<Airport>[]>(() => {
    const selected = this.selectedAirports();
    return this.airports()
      .filter(a => !selected.some(s => s.iataCode === a.iataCode))
      .map(a => ({
        label: `${a.name} (${a.iataCode}) - ${a.cityName}, ${a.countryName}`,
        value: a,
      }));
  });

  protected readonly tags = computed<Tag[]>(() =>
    this.selectedAirports().map(a => ({
      id: a.iataCode,
      label: `${a.name} (${a.iataCode})`,
    }))
  );

  protected onAirportSelected(option: AutocompleteOption<Airport>): void {
    const airport = option.value;
    if (!this.selectedAirports().some(a => a.iataCode === airport.iataCode)) {
      this.selectedAirports.update(list => [...list, airport]);
    }
  }

  protected onTagRemoved(tag: Tag): void {
    this.selectedAirports.update(list =>
      list.filter(a => a.iataCode !== tag.id)
    );
  }
}
