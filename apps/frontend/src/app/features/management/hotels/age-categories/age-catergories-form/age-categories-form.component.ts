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
import { take } from 'rxjs';
import { HotelsService } from '../../hotels.service';

interface DialogState {
  visible: boolean;
  submitting: boolean;
}

@Component({
  selector: 'app-age-categories-form',
  imports: [
    DialogModule,
    ReactiveFormsModule,
    InputNumberModule,
    InputTextModule,
    Button,
  ],
  templateUrl: './age-categories-form.component.html',
  styleUrl: './age-categories-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgeCategoriesFormComponent {
  private readonly hotelsService = inject(HotelsService);

  readonly hotelId = input.required<string>();
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  protected readonly _category = signal<AgeCategory | undefined>(undefined);
  readonly isEditMode = computed(() => !!this._category());

  readonly dialogState = signal<DialogState>({
    visible: false,
    submitting: false,
  });

  private _suppressCancelledOnHide = false;

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
      const category = this._category();
      if (category) {
        this.form.patchValue(category);
      } else {
        this.form.reset();
      }
    });
  }

  open(category?: AgeCategory): void {
    this._category.set(category);
    this.dialogState.set({ visible: true, submitting: false });
  }

  close(): void {
    this._suppressCancelledOnHide = true;
    this.dialogState.update((s) => ({ ...s, visible: false }));
    this._reset();
  }

  onDialogHide(): void {
    this._reset();
    if (!this._suppressCancelledOnHide) {
      this.cancelled.emit();
    }
    this._suppressCancelledOnHide = false;
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { name, minAge, maxAge } = this.form.getRawValue();
    const dto: AgeCategoryDto = { name, minAge: minAge!, maxAge: maxAge! };
    const category = this._category();

    this.dialogState.update((s) => ({ ...s, submitting: true }));

    const request$ = category
      ? this.hotelsService.updateAgeCategory(this.hotelId(), category.id, dto)
      : this.hotelsService.createAgeCategory(this.hotelId(), dto);

    request$.pipe(take(1)).subscribe({
      next: () => {
        this.dialogState.update((s) => ({ ...s, submitting: false }));
        this.saved.emit();
      },
      error: () =>
        this.dialogState.update((s) => ({ ...s, submitting: false })),
    });
  }

  deleteAgeCategory(catId: string): void {
    this.hotelsService
      .deleteAgeCategory(this.hotelId(), catId)
      .pipe(take(1))
      .subscribe({
        next: () => this.saved.emit(),
      });
  }

  private _reset(): void {
    this.form.reset();
    this._category.set(undefined);
  }
}
