import { Component, input, model, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

let nextId = 0;

/** Slider stays on [min,max]; text fields may go higher up to this cap (trip days etc.). */
const MAX_TYPED_VALUE = 999;

@Component({
  selector: 'ui-range-slider',
  templateUrl: './range-slider.component.html',
  styleUrl: './range-slider.component.scss',
  imports: [FormsModule],
})
export class RangeSliderComponent {
  readonly label = input<string>('');
  protected readonly sliderId = `ui-range-slider-${nextId++}`;
  readonly min = input<number>(0);
  readonly max = input<number>(100);
  readonly step = input<number>(1);
  readonly disabled = input<boolean>(false);
  readonly unit = input<string>('');

  readonly minValue = model<number>(0);
  readonly maxValue = model<number>(100);

  /** Draft text while the min value field is focused (avoids clamping partial input). */
  private readonly minDraft = signal<string | null>(null);
  /** Draft text while the max value field is focused. */
  private readonly maxDraft = signal<string | null>(null);

  protected readonly minFieldInvalid = signal(false);
  protected readonly maxFieldInvalid = signal(false);

  private minValueSnapshot = 0;
  private maxValueSnapshot = 0;

  /** Fill maps only the slider track; values beyond track are clamped for the bar. */
  protected readonly fillLeft = computed(() => {
    const trackLo = this.min();
    const trackHi = this.max();
    const range = trackHi - trackLo;
    if (range <= 0) return 0;
    const v = Math.max(trackLo, Math.min(trackHi, this.minValue()));
    return ((v - trackLo) / range) * 100;
  });

  protected readonly fillWidth = computed(() => {
    const trackLo = this.min();
    const trackHi = this.max();
    const range = trackHi - trackLo;
    if (range <= 0) return 100;
    const a = Math.max(trackLo, Math.min(trackHi, this.minValue()));
    const b = Math.max(trackLo, Math.min(trackHi, this.maxValue()));
    return Math.max(0, ((b - a) / range) * 100);
  });

  protected minFieldDisplay(): string {
    const d = this.minDraft();
    return d !== null ? d : String(this.minValue());
  }

  protected maxFieldDisplay(): string {
    const d = this.maxDraft();
    return d !== null ? d : String(this.maxValue());
  }

  /** Thumbs use slider bounds only; model can exceed via text fields. */
  protected clampedMinForSlider(): number {
    return Math.max(this.min(), Math.min(this.max(), this.minValue()));
  }

  protected clampedMaxForSlider(): number {
    return Math.max(this.min(), Math.min(this.max(), this.maxValue()));
  }

  protected onMinChange(value: number): void {
    const v = Math.max(this.min(), Math.min(this.max(), value));
    this.minValue.set(Math.min(v, this.maxValue()));
  }

  protected onMaxChange(value: number): void {
    const v = Math.max(this.min(), Math.min(this.max(), value));
    this.maxValue.set(Math.max(v, this.minValue()));
  }

  protected onMinFieldFocus(ev: FocusEvent): void {
    this.minValueSnapshot = this.minValue();
    this.minFieldInvalid.set(false);
    this.minDraft.set(String(this.minValue()));
    (ev.target as HTMLInputElement).select();
  }

  protected onMinFieldInput(ev: Event): void {
    const v = (ev.target as HTMLInputElement).value;
    this.minDraft.set(v);
    this.updateMinFieldInvalidFromText(v);
  }

  protected onMinFieldBlur(): void {
    const raw = (this.minDraft() ?? '').trim();
    this.minDraft.set(null);
    this.minFieldInvalid.set(false);

    if (raw === '') {
      this.minValue.set(this.minValueSnapshot);
      return;
    }

    let n = Number.parseFloat(raw.replace(',', '.'));
    if (Number.isNaN(n)) {
      this.minValue.set(this.minValueSnapshot);
      return;
    }

    const globalLo = this.min();
    const st = this.step();
    if (st > 0) {
      n = Math.round(n / st) * st;
    }

    if (n < globalLo || n > MAX_TYPED_VALUE || n > this.maxValue()) {
      this.minValue.set(this.minValueSnapshot);
      return;
    }

    this.minValue.set(n);
  }

  protected onMaxFieldFocus(ev: FocusEvent): void {
    this.maxValueSnapshot = this.maxValue();
    this.maxFieldInvalid.set(false);
    this.maxDraft.set(String(this.maxValue()));
    (ev.target as HTMLInputElement).select();
  }

  protected onMaxFieldInput(ev: Event): void {
    const v = (ev.target as HTMLInputElement).value;
    this.maxDraft.set(v);
    this.updateMaxFieldInvalidFromText(v);
  }

  protected onMaxFieldBlur(): void {
    const raw = (this.maxDraft() ?? '').trim();
    this.maxDraft.set(null);
    this.maxFieldInvalid.set(false);

    if (raw === '') {
      this.maxValue.set(this.maxValueSnapshot);
      return;
    }

    let n = Number.parseFloat(raw.replace(',', '.'));
    if (Number.isNaN(n)) {
      this.maxValue.set(this.maxValueSnapshot);
      return;
    }

    const globalLo = this.min();
    const st = this.step();
    if (st > 0) {
      n = Math.round(n / st) * st;
    }

    if (n < globalLo || n > MAX_TYPED_VALUE || n < this.minValue()) {
      this.maxValue.set(this.maxValueSnapshot);
      return;
    }

    this.maxValue.set(n);
  }

  private updateMinFieldInvalidFromText(text: string): void {
    const raw = text.trim();
    if (raw === '') {
      this.minFieldInvalid.set(false);
      return;
    }
    const n = Number.parseFloat(raw.replace(',', '.'));
    if (Number.isNaN(n)) {
      this.minFieldInvalid.set(true);
      return;
    }
    const gLo = this.min();
    if (n < gLo || n > MAX_TYPED_VALUE) {
      this.minFieldInvalid.set(true);
      return;
    }
    this.minFieldInvalid.set(n > this.maxValue());
  }

  private updateMaxFieldInvalidFromText(text: string): void {
    const raw = text.trim();
    if (raw === '') {
      this.maxFieldInvalid.set(false);
      return;
    }
    const n = Number.parseFloat(raw.replace(',', '.'));
    if (Number.isNaN(n)) {
      this.maxFieldInvalid.set(true);
      return;
    }
    const gLo = this.min();
    if (n < gLo || n > MAX_TYPED_VALUE) {
      this.maxFieldInvalid.set(true);
      return;
    }
    this.maxFieldInvalid.set(n < this.minValue());
  }
}
