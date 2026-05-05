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
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AgeCategory, AgeCategoryDto } from '@runner/shared/types';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { take } from 'rxjs';
import { HotelsService } from '../../hotels.service';

@Component({
  selector: 'app-age-categories-form',
  imports: [
    DialogModule,
    ReactiveFormsModule,
    InputNumberModule,
    InputTextModule,
    Button,
    ProgressSpinnerModule,
  ],
  templateUrl: './age-categories-form.component.html',
  styleUrl: './age-categories-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgeCategoriesFormComponent {
  private readonly hotelsService = inject(HotelsService);

  readonly hotelId = input.required<string>();
  readonly category = input<AgeCategory>();
  readonly visible = input.required<boolean>();

  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly isSubmitting = signal(false);
  readonly isEditMode = computed(() => !!this.category());

  readonly form = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    minAge: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0)],
    }),
    maxAge: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0)],
    }),
  });

  constructor() {
    effect(() => {
      const category = this.category();
      if (category) {
        this.form.patchValue(category);
      } else {
        this.form.reset();
      }
    });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const dto: AgeCategoryDto = {
      name: raw.name,
      minAge: raw.minAge as number,
      maxAge: raw.maxAge as number,
    };

    this.isSubmitting.set(true);

    const category = this.category();
    const request$ = category
      ? this.hotelsService.updateAgeCategory(this.hotelId(), category.id, dto)
      : this.hotelsService.createAgeCategory(this.hotelId(), dto);

    request$.pipe(take(1)).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.saved.emit();
        this.form.reset();
      },
      error: () => this.isSubmitting.set(false),
    });
  }

  deleteAgeCategory(catId: string): void {
    // this.loading.set(true);
    this.hotelsService
      .deleteAgeCategory(this.hotelId(), catId)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.saved.emit();
        },
        error: () => this.isSubmitting.set(false),
      });
  }
}
