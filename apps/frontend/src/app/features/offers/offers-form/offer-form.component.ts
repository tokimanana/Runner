import { confirmDelete } from '@/app/shared/utils/confirm-delete.util';
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
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DiscountMode, Offer, OfferDto, OfferType } from '@runner/shared/types';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { RadioButton } from 'primeng/radiobutton';
import { Tooltip } from 'primeng/tooltip';
import { take } from 'rxjs';
import { OffersService } from '../offers.service';

@Component({
  selector: 'app-offer-form',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    Button,
    ConfirmDialog,
    RadioButton,
    InputNumber,
    Checkbox,
    Message,
    Tooltip,
  ],
  templateUrl: './offer-form.component.html',
  styleUrl: './offer-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferFormComponent {
  private readonly offersService = inject(OffersService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly offer = input<Offer | null>(null);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly isEditMode = computed(() => !!this.offer());
  readonly isSubmitting = signal(false);

  readonly form = this.fb.group({
    code: this.fb.control('', { validators: [Validators.required] }),
    name: this.fb.control('', { validators: [Validators.required] }),
    description: this.fb.control(''),
    type: this.fb.control<OfferType>('PERCENTAGE', {
      validators: [Validators.required],
    }),
    value: this.fb.control(0, {
      validators: [Validators.required, Validators.min(0)],
    }),
    discountMode: this.fb.control<DiscountMode>('SEQUENTIAL', {
      validators: [Validators.required],
    }),
    applyToRoomOnly: this.fb.control(false),
    applyToMealSupplements: this.fb.control(false),
    minStay: new FormControl<number | null>(null),
  });

  constructor() {
    effect(() => {
      const offer = this.offer();
      if (offer) {
        this.form.patchValue({
          ...offer,
          minStay: offer.minStay ?? null,
        });
      } else {
        this.form.reset({
          type: 'PERCENTAGE',
          discountMode: 'SEQUENTIAL',
          value: 0,
        });
      }
    });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const dto: OfferDto = {
      ...raw,
      description: raw.description || undefined,
      minStay: raw.minStay ?? undefined,
    };
    const offer = this.offer();

    this.isSubmitting.set(true);

    const request$ = offer
      ? this.offersService.update(offer.id, dto)
      : this.offersService.create(dto);

    request$.pipe(take(1)).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: offer ? 'Updated' : 'Created',
          detail: `Offer "${dto.name}" has been ${offer ? 'updated' : 'created'}.`,
        });
        this.isSubmitting.set(false);
        this.saved.emit();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not save offer. Please try again.',
        });
        this.isSubmitting.set(false);
      },
    });
  }

  confirmDelete(): void {
    const offer = this.offer();
    if (!offer) return;

    confirmDelete({
      header: 'Delete Offer',
      entityName: offer.name,
      delete$: this.offersService.remove(offer.id),
      onSuccess: () => this.saved.emit(),
      conflictMessage: `"${offer.name}" is still linked to existing periods or supplements.`,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
    });
  }
}
