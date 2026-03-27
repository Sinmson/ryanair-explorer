import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

let nextId = 0;

@Component({
  selector: 'ui-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  imports: [FormsModule],
})
export class DatePickerComponent {
  readonly label = input<string>('');
  readonly min = input<string>('');
  readonly max = input<string>('');
  readonly disabled = input<boolean>(false);
  /** BCP 47 language tag on the native input, e.g. de-DE, fr-CA — hints browser locale for the picker. */
  readonly htmlLang = input<string>('');

  readonly value = model<string>('');
  protected readonly inputId = `ui-date-picker-${nextId++}`;
}
