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
import {
  DiscountMode,
  Offer,
  OfferDto,
  OfferPeriod,
  OfferPeriodDto,
  OfferType,
} from '@runner/shared/types';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Checkbox } from 'primeng/checkbox';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputNumber } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { RadioButton } from 'primeng/radiobutton';
import { Tooltip } from 'primeng/tooltip';
import {
  concatMap,
  EMPTY,
  from,
  Observable,
  switchMap,
  take,
  tap,
  toArray,
} from 'rxjs';
import { PeriodRow } from '../offer-period-row.types';
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

  private readonly rows = signal<ReadonlyMap<string, PeriodRow>>(new Map());
  private readonly createdOffer = signal<Offer | null>(null);

  readonly offer = input<Offer | null>(null);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly isEditMode = computed(() => !!this.offer());
  readonly isSubmitting = signal(false);
  readonly visibleRows = computed(() =>
    [...this.rows().values()].filter((row) => row.status !== 'DELETED')
  );
  readonly currentOffer = computed(() => this.offer() ?? this.createdOffer());

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
        this.form.patchValue({ ...offer, minStay: offer.minStay ?? null });
        this.rows.set(this.toRows(offer.offerPeriods));
      } else {
        this.form.reset({
          type: 'PERCENTAGE',
          discountMode: 'SEQUENTIAL',
          value: 0,
        });
        this.rows.set(new Map());
        this.createdOffer.set(null);
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
    const existing = this.currentOffer();

    this.isSubmitting.set(true);

    const offer$ = existing
      ? this.offersService.update(existing.id, dto)
      : this.offersService
          .create(dto)
          .pipe(tap((created) => this.createdOffer.set(created)));

    offer$
      .pipe(
        switchMap((saved) => this.syncPeriods$(saved.id)),
        take(1)
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: existing ? 'Updated' : 'Created',
            detail: `Offer "${dto.name}" has been ${existing ? 'updated' : 'created'}.`,
          });
          this.isSubmitting.set(false);
          this.saved.emit();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Some changes could not be saved. Please try again.',
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

  addPeriod(data: OfferPeriodDto): void {
    const clientKey = crypto.randomUUID();
    this.patchRows((m) =>
      m.set(clientKey, { clientKey, data, status: 'CREATED' })
    );
  }

  editPeriod(clientKey: string, data: OfferPeriodDto): void {
    this.patchRows((m) => {
      const row = m.get(clientKey);
      if (!row) return;
      m.set(clientKey, {
        ...row,
        data,
        status: row.status === 'CREATED' ? 'CREATED' : 'UPDATED',
      });
    });
  }

  removePeriod(clientKey: string): void {
    this.patchRows((m) => {
      const row = m.get(clientKey);
      if (!row) return;
      if (row.status === 'CREATED') m.delete(clientKey);
      else m.set(clientKey, { ...row, status: 'DELETED' });
    });
  }

  private toRows(periods: OfferPeriod[]): ReadonlyMap<string, PeriodRow> {
    return new Map(
      periods.map((p): [string, PeriodRow] => {
        const clientKey = crypto.randomUUID();
        return [
          clientKey,
          {
            clientKey,
            serverId: p.id,
            data: { startDate: p.startDate, endDate: p.endDate },
            status: 'UNCHANGED',
          },
        ];
      })
    );
  }

  private patchRows(mutate: (draft: Map<string, PeriodRow>) => void): void {
    this.rows.update((current) => {
      const next = new Map(current);
      mutate(next);
      return next;
    });
  }

  private syncRow$(offerId: string, row: PeriodRow): Observable<unknown> {
    switch (row.status) {
      case 'CREATED':
        return this.offersService.createPeriod(offerId, row.data).pipe(
          tap((created) =>
            this.patchRows((m) =>
              m.set(row.clientKey, {
                ...row,
                serverId: created.id,
                status: 'UNCHANGED',
              })
            )
          )
        );
      case 'UPDATED':
        return this.offersService
          .updatePeriod(offerId, this.requireServerId(row), row.data)
          .pipe(
            tap(() =>
              this.patchRows((m) =>
                m.set(row.clientKey, { ...row, status: 'UNCHANGED' })
              )
            )
          );
      case 'DELETED':
        return this.offersService
          .removePeriod(offerId, this.requireServerId(row))
          .pipe(tap(() => this.patchRows((m) => m.delete(row.clientKey))));
      case 'UNCHANGED':
        return EMPTY;
    }
  }

  private requireServerId(row: PeriodRow): string {
    if (!row.serverId)
      throw new Error(`Period ${row.clientKey} has no serverId`);
    return row.serverId;
  }

  private syncPeriods$(offerId: string): Observable<unknown> {
    const pending = [...this.rows().values()].filter(
      (r) => r.status !== 'UNCHANGED'
    );
    return from(pending).pipe(
      concatMap((row) => this.syncRow$(offerId, row)),
      toArray()
    );
  }
}
