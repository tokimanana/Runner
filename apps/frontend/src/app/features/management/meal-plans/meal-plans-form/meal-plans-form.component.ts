import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  output,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MealPlan, MealPlanDto } from '@runner/shared/types';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { take } from 'rxjs';
import { MealPlansService } from '../meal-plans.service';

@Component({
  selector: 'app-meal-plans-form',
  imports: [
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    Button,
  ],
  templateUrl: './meal-plans-form.component.html',
  styleUrl: './meal-plans-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MealPlansFormComponent {
  private readonly mealPlansService = inject(MealPlansService);
  private readonly messageService = inject(MessageService);

  private readonly _mealPlan = signal<MealPlan | undefined>(undefined);
  readonly isEditMode = computed(() => !!this._mealPlan());
  readonly isSubmitting = signal(false);

  readonly saved = output<void>();
  visible = false;

  readonly form = new FormGroup({
    code: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    name: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    description: new FormControl('', {
      nonNullable: true,
    }),
  });

  constructor() {
    effect(() => {
      const mealPlan = this._mealPlan();
      if (mealPlan) {
        this.form.patchValue(mealPlan);
      } else {
        this.form.reset();
      }
    });
  }

  open(mealPlan?: MealPlan): void {
    this._mealPlan.set(mealPlan);
    this.visible = true;
  }

  close(): void {
    this.visible = false;
    this._reset();
  }

  onDialogHide(): void {
    this._reset();
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const dto = this.form.getRawValue() as MealPlanDto;
    const mealPlan = this._mealPlan();

    this.isSubmitting.set(true);

    const request$ = mealPlan
      ? this.mealPlansService.update(mealPlan.id, dto)
      : this.mealPlansService.create(dto);

    request$.pipe(take(1)).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: mealPlan ? 'Updated' : 'Created',
          detail: `Meal plan "${dto.name}" has been ${mealPlan ? 'updated' : 'created'}.`,
        });
        this.isSubmitting.set(false);
        this.close();
        this.saved.emit();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not save meal plan. Please try again.',
        });
        this.isSubmitting.set(false);
      },
    });
  }

  private _reset(): void {
    this.form.reset();
    this._mealPlan.set(undefined);
  }
}
