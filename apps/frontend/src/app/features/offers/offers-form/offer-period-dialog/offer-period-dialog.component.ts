import {
  fromDateOnlyIso,
  toDateOnlyIso,
} from '@/app/shared/utils/date-only.util';
import { dateRangeValidator } from '@/app/shared/utils/date-range.util';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { OfferPeriodDto } from '@runner/shared/types';
import { Button } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-offer-period-dialog',
  imports: [DialogModule, ReactiveFormsModule, DatePickerModule, Button],
  templateUrl: './offer-period-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfferPeriodDialogComponent {
  readonly visible = model(false);
  readonly period = input<OfferPeriodDto | null>(null);
  readonly confirmed = output<OfferPeriodDto>();

  readonly isEditMode = computed(() => !!this.period());
  readonly minEndDate = signal<Date | null>(null);

  readonly form = new FormGroup(
    {
      startDate: new FormControl<Date | null>(null, {
        validators: [Validators.required],
      }),
      endDate: new FormControl<Date | null>(null, {
        validators: [Validators.required],
      }),
    },
    { validators: dateRangeValidator }
  );

  constructor() {
    // à chaque ouverture, repartir de la ligne éditée, ou d'un formulaire vide
    effect(() => {
      if (!this.visible()) return;
      const p = this.period();
      this.form.reset({
        startDate: p ? fromDateOnlyIso(p.startDate) : null,
        endDate: p ? fromDateOnlyIso(p.endDate) : null,
      });
    });

    this.form.controls.startDate.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((start) => this.minEndDate.set(start));
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { startDate, endDate } = this.form.getRawValue();
    // émettre avant de fermer : le parent lit encore la ligne en cours d'édition
    this.confirmed.emit({
      startDate: toDateOnlyIso(startDate!),
      endDate: toDateOnlyIso(endDate!),
    });
    this.visible.set(false);
  }

  close(): void {
    this.visible.set(false);
  }
}
