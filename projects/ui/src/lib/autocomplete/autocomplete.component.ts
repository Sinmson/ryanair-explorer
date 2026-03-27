import { Component, input, output, signal, computed, ElementRef, viewChild, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface AutocompleteOption<T = unknown> {
  label: string;
  value: T;
  disabled?: boolean;
}

@Component({
  selector: 'ui-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.scss',
  imports: [FormsModule],
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class AutocompleteComponent<T = unknown> implements OnDestroy {
  readonly options = input.required<AutocompleteOption<T>[]>();
  readonly placeholder = input<string>('Search...');
  readonly minChars = input<number>(1);
  /** Max items in the dropdown; `null` or ≤0 = no limit (scroll full list). */
  readonly maxResults = input<number | null>(null);
  readonly disabled = input<boolean>(false);

  readonly selected = output<AutocompleteOption<T>>();

  private readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('inputEl');

  protected readonly query = signal('');
  protected readonly isOpen = signal(false);
  protected readonly highlightedIndex = signal(-1);

  /** Skip one click after focus so the same pointer gesture does not immediately toggle closed. */
  private skipNextInputClickToggle = false;

  protected readonly filteredOptions = computed(() => {
    const q = this.query().toLowerCase().trim();
    const all = this.options();
    if (q.length < this.minChars()) {
      return this.isOpen() ? this.applyMaxResults(all) : [];
    }
    return this.applyMaxResults(all.filter(opt => opt.label.toLowerCase().includes(q)));
  });

  private applyMaxResults<U>(items: U[]): U[] {
    const cap = this.maxResults();
    if (cap == null || cap <= 0) return items;
    return items.slice(0, cap);
  }

  protected onOptionHover(index: number): void {
    this.highlightedIndex.set(index);
  }

  protected onInputFocus(): void {
    if (this.disabled() || this.options().length === 0) return;
    this.isOpen.set(true);
    this.skipNextInputClickToggle = true;
  }

  protected onInputClick(): void {
    if (this.disabled() || this.options().length === 0) return;
    if (this.skipNextInputClickToggle) {
      this.skipNextInputClickToggle = false;
      return;
    }
    this.isOpen.update(open => !open);
  }

  protected onInput(value: string): void {
    this.query.set(value);
    this.highlightedIndex.set(-1);
    if (value.length >= this.minChars()) {
      this.isOpen.set(true);
    }
  }

  protected selectOption(option: AutocompleteOption<T>): void {
    if (option.disabled) return;
    this.selected.emit(option);
    this.query.set('');
    this.isOpen.set(false);
    this.highlightedIndex.set(-1);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.isOpen.set(false);
      return;
    }

    if (event.key === 'ArrowDown' && !this.isOpen() && this.options().length > 0) {
      event.preventDefault();
      this.isOpen.set(true);
      this.highlightedIndex.set(0);
      return;
    }

    const opts = this.filteredOptions();
    if (!opts.length) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex.update(i => Math.min(i + 1, opts.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex.update(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        const idx = this.highlightedIndex();
        if (idx >= 0 && idx < opts.length) {
          this.selectOption(opts[idx]);
        }
        break;
    }
  }

  protected onDocumentClick(event: MouseEvent): void {
    const el = this.inputRef()?.nativeElement;
    if (el && !el.closest('.ui-autocomplete')?.contains(event.target as Node)) {
      this.isOpen.set(false);
    }
  }

  ngOnDestroy(): void {
    this.isOpen.set(false);
  }
}
