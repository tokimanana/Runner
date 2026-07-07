import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { SeasonDto } from '@runner/shared/types';
import { Button } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import { take } from 'rxjs';
import { SeasonsService } from '../seasons.service';

@Component({
  selector: 'app-seasons-form',
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    Button,
    TabsModule,
    DatePickerModule,
  ],
  templateUrl: './seasons-form.component.html',
  styleUrl: './seasons-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonsFormComponent {
  private readonly router = inject(Router);
  private readonly seasonsService = inject(SeasonsService);

  readonly seasonId = input<string>();
  readonly isEditMode = computed(() => !!this.seasonId());
  readonly isSubmitting = signal(false);

  readonly form = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });

  constructor() {
    effect(() => {
      const seasonId = this.seasonId();
      if (!seasonId) return;

      this.seasonsService
        .getSeasonById(seasonId)
        .pipe(take(1))
        .subscribe((season) => {
          this.form.patchValue({
            name: season.name,
          });
        });
    });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const dto: SeasonDto = {
      name: raw.name,
    };

    const seasonId = this.seasonId();
    this.isSubmitting.set(true);

    const request$ = seasonId
      ? this.seasonsService.updateSeason(seasonId, dto)
      : this.seasonsService.createSeason(dto);

    request$.pipe(take(1)).subscribe({
      next: () => this.navigateToList(),
      error: () => this.isSubmitting.set(false),
    });
  }

  cancel(): void {
    this.navigateToList();
  }

  private navigateToList(): void {
    this.router.navigate(['/management/seasons/seasons-list']);
  }
}
