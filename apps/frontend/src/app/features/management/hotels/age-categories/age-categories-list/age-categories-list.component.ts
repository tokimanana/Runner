import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgeCategory } from '@runner/shared/types';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { take } from 'rxjs';
import { HotelsService } from '../../hotels.service';

@Component({
  selector: 'app-age-categories-list',
  imports: [
    ButtonModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TableModule,
  ],
  templateUrl: './age-categories-list.component.html',
  styleUrl: './age-categories-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgeCategoriesListComponent {
  private readonly hotelsService = inject(HotelsService);

  readonly hotelId = input.required<string>();
  readonly categories = signal<AgeCategory[]>([]);
  readonly loading = signal(false);
  readonly addCategory = output<void>();
  readonly editCategory = output<AgeCategory>();

  readonly search = signal('');

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    if (!q) return this.categories();
    return this.categories().filter((c) => c.name.toLowerCase().includes(q));
  });

  constructor() {
    effect(() => this.loadCategories(this.hotelId()));
  }

  loadCategories(hotelId: string): void {
    this.loading.set(true);
    this.hotelsService
      .getAgeCategories(hotelId)
      .pipe(take(1))
      .subscribe({
        next: (categories) => {
          this.categories.set(categories);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }
}
