import { dateRangeValidator } from '@/app/shared/utils/date-range.util';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SeasonPeriod, SeasonPeriodDto } from '@runner/shared/types';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { take } from 'rxjs';
import { SeasonsService } from '../../seasons.service';

@Component({
  selector: 'app-season-period-form-dialog',
  imports: [
    DialogModule,
    Button,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
  ],
  templateUrl: './season-period-form-dialog.component.html',
  styleUrl: './season-period-form-dialog.component.scss',
})
export class SeasonPeriodFormDialogComponent {
  private readonly seasonsService = inject(SeasonsService);
  private readonly messageService = inject(MessageService);

  readonly visible = model<boolean>(false);
  readonly seasonId = input.required<string>();
  readonly period = input<SeasonPeriod | null>(null);
  readonly isSubmitting = signal(false);

  readonly isEditMode = computed(() => !!this.period());

  readonly form = new FormGroup(
    {
      name: new FormControl('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
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
    effect(() => {
      const p = this.period();
      if (p) {
        this.form.patchValue({
          name: p.name,
          startDate: new Date(p.startDate),
          endDate: new Date(p.endDate),
        });
      } else {
        this.form.reset();
      }
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const dto: SeasonPeriodDto = {
      name: raw.name,
      startDate: raw.startDate!.toISOString(),
      endDate: raw.endDate!.toISOString(),
    };

    this.isSubmitting.set(true);

    const action$ = this.isEditMode()
      ? this.seasonsService.updatePeriod(
          this.seasonId(),
          this.period()!.id,
          dto
        )
      : this.seasonsService.createPeriod(this.seasonId(), dto);

    action$.pipe(take(1)).subscribe({
      next: () => {
        this.visible.set(false);
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg =
          err.status === 409
            ? 'Date range overlaps with an existing period.'
            : 'An error has occurred';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: msg,
        });
      },
    });
  }

  close() {
    this.visible.set(false);
  }
}
