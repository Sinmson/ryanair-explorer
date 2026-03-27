import { Component, signal } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { RangeSliderComponent } from 'ui';

@Component({
  selector: 'app-days-selector',
  templateUrl: './days-selector.component.html',
  imports: [RangeSliderComponent, TranslocoPipe],
})
export class DaysSelectorComponent {
  readonly minDays = signal(1);
  readonly maxDays = signal(7);
}
