import { Component, input, output, computed, signal, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  cellTemplate?: string;
  accessor?: (row: T) => unknown;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortState {
  key: string;
  direction: SortDirection;
}

@Component({
  selector: 'ui-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  imports: [NgTemplateOutlet],
})
export class TableComponent<T = unknown> {
  readonly data = input.required<T[]>();
  readonly columns = input.required<ColumnDef<T>[]>();
  readonly trackBy = input<keyof T | ((item: T) => unknown)>();
  readonly pageSize = input<number>(10);
  readonly striped = input<boolean>(true);
  readonly hoverable = input<boolean>(true);
  readonly cellTemplates = input<Record<string, TemplateRef<unknown>>>({});

  readonly rowClicked = output<T>();

  protected readonly sortState = signal<SortState | null>(null);
  protected readonly currentPage = signal(0);

  protected readonly sortedData = computed(() => {
    const data = [...this.data()];
    const sort = this.sortState();
    if (!sort || !sort.direction) return data;

    const col = this.columns().find(c => c.key === sort.key);
    return data.sort((a, b) => {
      const aVal = col?.accessor ? col.accessor(a) : (a as Record<string, unknown>)[sort.key];
      const bVal = col?.accessor ? col.accessor(b) : (b as Record<string, unknown>)[sort.key];
      const cmp = aVal != null && bVal != null
        ? (aVal < bVal ? -1 : aVal > bVal ? 1 : 0)
        : 0;
      return sort.direction === 'asc' ? cmp : -cmp;
    });
  });

  protected readonly paginatedData = computed(() => {
    const size = this.pageSize();
    const start = this.currentPage() * size;
    return this.sortedData().slice(start, start + size);
  });

  protected readonly totalPages = computed(() =>
    Math.ceil(this.sortedData().length / this.pageSize())
  );

  protected toggleSort(col: ColumnDef<T>): void {
    if (!col.sortable) return;
    const current = this.sortState();
    if (current?.key === col.key) {
      const next: SortDirection = current.direction === 'asc' ? 'desc' : current.direction === 'desc' ? null : 'asc';
      this.sortState.set(next ? { key: col.key, direction: next } : null);
    } else {
      this.sortState.set({ key: col.key, direction: 'asc' });
    }
    this.currentPage.set(0);
  }

  protected getCellValue(row: T, col: ColumnDef<T>): unknown {
    if (col.accessor) return col.accessor(row);
    return (row as Record<string, unknown>)[col.key];
  }

  protected goToPage(page: number): void {
    this.currentPage.set(Math.max(0, Math.min(page, this.totalPages() - 1)));
  }

  protected trackByFn(_index: number, item: T): unknown {
    const tb = this.trackBy();
    if (!tb) return _index;
    if (typeof tb === 'function') return tb(item);
    return (item as Record<string, unknown>)[tb as string];
  }
}
