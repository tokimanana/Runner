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
import {
  Supplement,
  SupplementDto,
  SupplementUnit,
} from '@runner/shared/types';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { take } from 'rxjs';
import { SupplementsService } from '../supplements.service';

@Component({
  selector: 'app-supplements-form',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    SelectModule,
    CheckboxModule,
    Button,
    ConfirmDialog,
  ],
  templateUrl: './supplements-form.component.html',
  styleUrl: './supplements-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplementsFormComponent {
  private readonly supplementsService = inject(SupplementsService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly supplement = input<Supplement | null>(null);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly isEditMode = computed(() => !!this.supplement());
  readonly isSubmitting = signal(false);

  readonly unitOptions = [
    { label: 'Per person / per night', value: 'PER_PERSON_PER_NIGHT' },
    { label: 'Per person / per stay', value: 'PER_PERSON_PER_STAY' },
    { label: 'Per room / per night', value: 'PER_ROOM_PER_NIGHT' },
    { label: 'Per room / per stay', value: 'PER_ROOM_PER_STAY' },
  ];

  readonly form = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    description: new FormControl('', {
      nonNullable: true,
    }),
    price: new FormControl(0, {
      validators: [Validators.required, Validators.min(0)],
      nonNullable: true,
    }),
    unit: new FormControl('' as SupplementUnit, {
      validators: [Validators.required],
      nonNullable: true,
    }),
    canReceiveDiscount: new FormControl(false, {
      nonNullable: true,
    }),
  });

  constructor() {
    effect(() => {
      const supplement = this.supplement();
      if (supplement) {
        this.form.patchValue(supplement);
      } else {
        this.form.reset();
      }
    });
  }

  readonly unitLabel = computed(() => {
    const unit = this.supplement()?.unit;
    return this.unitOptions.find((o) => o.value === unit)?.label ?? '';
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const dto = this.form.getRawValue() as SupplementDto;
    const supplement = this.supplement();

    this.isSubmitting.set(true);

    const request$ = supplement
      ? this.supplementsService.update(supplement.id, dto)
      : this.supplementsService.create(dto);

    request$.pipe(take(1)).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: supplement ? 'Updated' : 'Created',
          detail: `"${dto.name}" has been ${supplement ? 'updated' : 'created'}.`,
        });
        this.isSubmitting.set(false);
        this.saved.emit();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not save supplement. Please try again.',
        });
        this.isSubmitting.set(false);
      },
    });
  }

  confirmDelete(): void {
    const supplement = this.supplement();
    if (!supplement) return;

    this.confirmationService.confirm({
      header: 'Delete Supplement',
      message: `Are you sure you want to delete "${supplement.name}"?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.supplementsService
          .remove(supplement.id)
          .pipe(take(1))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Deleted',
                detail: `"${supplement.name}" has been deleted.`,
              });
              this.saved.emit();
            },
            error: (err) => {
              this.messageService.add({
                severity: err.status === 409 ? 'warn' : 'error',
                summary: err.status === 409 ? 'Cannot delete' : 'Error',
                detail:
                  err.status === 409
                    ? `"${supplement.name}" is used in existing contracts.`
                    : 'An unexpected error occurred.',
              });
            },
          });
      },
    });
  }
}
