import { confirmDelete } from '@/app/shared/utils/confirm-delete.util';
import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { SeasonPeriod } from '@runner/shared/types';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputText } from 'primeng/inputtext';
import { take } from 'rxjs';
import { SeasonsService } from '../seasons.service';
import { SeasonPeriodFormDialogComponent } from './season-period-form-dialog/season-period-form-dialog.component';

@Component({
  selector: 'app-season-detail',
  imports: [
    Button,
    ConfirmDialogModule,
    DatePipe,
    InputText,
    ReactiveFormsModule,
    SeasonPeriodFormDialogComponent,
  ],
  templateUrl: './season-detail.component.html',
  styleUrl: './season-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonDetailComponent {
  private readonly seasonsService = inject(SeasonsService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly seasonId = input.required<string>();

  readonly isEditingName = signal(false);
  readonly isSubmitting = signal(false);

  readonly nameControl = new FormControl('', {
    validators: [Validators.required],
    nonNullable: true,
  });

  private readonly seasons = toSignal(this.seasonsService.seasons$, {
    initialValue: [],
  });
  readonly loading = toSignal(this.seasonsService.loading$, {
    initialValue: false,
  });

  readonly season = computed(() =>
    this.seasons().find((s) => s.id === this.seasonId())
  );

  readonly _periodBeingEdited = signal<SeasonPeriod | null | undefined>(
    undefined
  );
  readonly isDialogVisible = computed(
    () => this._periodBeingEdited() !== undefined
  );

  constructor() {
    this.seasonsService.getSeasons().pipe(take(1)).subscribe();
  }

  enableEditing(currentName: string): void {
    this.nameControl.setValue(currentName);
    this.isEditingName.set(true);
  }

  saveName(): void {
    if (this.nameControl.invalid) return;
    const currentSeason = this.season();
    if (!currentSeason) return;

    this.isSubmitting.set(true);
    this.seasonsService
      .updateSeason(currentSeason.id, { name: this.nameControl.value })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.isEditingName.set(false);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const detail =
            err.status === 409
              ? 'A season already has this name'
              : 'An error has occurred';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail,
          });
        },
      });
  }

  cancelEdit(): void {
    this.nameControl.reset(this.season()?.name);
    this.isEditingName.set(false);
  }

  deletePeriod(period: SeasonPeriod): void {
    confirmDelete({
      header: 'Delete Period',
      entityName: period.name,
      delete$: this.seasonsService.deletePeriod(this.seasonId(), period.id),
      conflictMessage: `"${period.name}" is used in existing contracts.`,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
    });
  }

  openCreatePeriod(): void {
    this._periodBeingEdited.set(null);
  }

  editPeriod(period: SeasonPeriod): void {
    this._periodBeingEdited.set(period);
  }
}
