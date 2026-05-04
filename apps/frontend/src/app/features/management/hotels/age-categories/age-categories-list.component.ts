import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { take } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { AgeCategory } from '@runner/shared/types';
import { HotelsService } from '../hotels.service';

@Component({
  selector: 'app-age-categories-list',
  imports: [
    ButtonModule,
    CardModule,
    ProgressBarModule,
    TableModule,
    TooltipModule,
  ],
  templateUrl: './age-categories-list.component.html',
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
