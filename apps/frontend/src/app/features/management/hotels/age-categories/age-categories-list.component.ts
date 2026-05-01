import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { AgeCategory } from '@runner/shared/types';
import { take } from 'rxjs';
import { HotelsService } from '../hotels.service';

@Component({
  selector: 'app-age-categories-list',
  imports: [],
  templateUrl: './age-categories-list.component.html',
  styleUrl: './age-categories-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@Component({
  selector: 'app-age-categories-list',
  imports: [],
  templateUrl: './age-categories-list.component.html',
  styleUrl: './age-categories-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgeCategoriesListComponent {
  private readonly hotelsService = inject(HotelsService);

  readonly hotelId = input.required<string>();

  readonly categories = signal<AgeCategory[]>([]);
  readonly loading = signal(false);

  constructor() {
    effect(() => this.loadCategories(this.hotelId()));
  }

  deleteAgeCategory(catId: string): void {
    this.loading.set(true);
    this.hotelsService
      .deleteAgeCategory(this.hotelId(), catId)
      .pipe(take(1))
      .subscribe({
        next: () => this.loadCategories(this.hotelId()),
        error: () => this.loading.set(false),
      });
  }

  private loadCategories(hotelId: string): void {
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
