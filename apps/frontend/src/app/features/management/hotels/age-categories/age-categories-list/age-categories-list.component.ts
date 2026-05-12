import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { AgeCategory } from '@runner/shared/types';
import { ButtonModule } from 'primeng/button';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { take } from 'rxjs';
import { HotelsService } from '../../hotels.service';

@Component({
  selector: 'app-age-categories-list',
  imports: [ButtonModule, InputIconModule, InputTextModule, TableModule],
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
