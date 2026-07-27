import { confirmDelete } from '@/app/shared/utils/confirm-delete.util';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Season } from '@runner/shared/types';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { take } from 'rxjs';
import { SeasonsService } from '../seasons.service';
import { PeriodCountPipe } from './period-count.pipe';

@Component({
  selector: 'app-seasons-list',
  imports: [
    ButtonModule,
    ConfirmDialogModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    ReactiveFormsModule,
    RouterModule,
    TableModule,
    PeriodCountPipe,
  ],
  templateUrl: './seasons-list.component.html',
  styleUrl: './seasons-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonsListComponent {
  private readonly seasonsService = inject(SeasonsService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly search = signal('');
  readonly isAddingNew = signal(false);
  readonly isSubmitting = signal(false);

  readonly nameControl = new FormControl('', {
    validators: [Validators.required],
    nonNullable: true,
  });

  readonly seasons = toSignal(this.seasonsService.getSeasons(), {
    initialValue: [],
  });
  readonly loading = toSignal(this.seasonsService.loading$, {
    initialValue: false,
  });

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    if (!q) return this.seasons();
    return this.seasons().filter((s) => s.name.toLowerCase().includes(q));
  });

  confirmDelete(season: Season): void {
    confirmDelete({
      header: 'Delete Season',
      entityName: season.name,
      delete$: this.seasonsService.deleteSeason(season.id),
      conflictMessage: `"${season.name}" is linked to existing contract periods.`,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
    });
  }

  startAddingNew(): void {
    this.nameControl.reset('');
    this.isAddingNew.set(true);
  }

  cancelAddNew(): void {
    this.isAddingNew.set(false);
    this.nameControl.reset('');
  }

  saveNewSeason(): void {
    this.nameControl.markAsTouched();
    if (this.nameControl.invalid) return;

    this.isSubmitting.set(true);
    this.seasonsService
      .createSeason({ name: this.nameControl.value })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.isAddingNew.set(false);
          this.nameControl.reset('');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          const detail =
            err.status === 409
              ? 'A season with this name already exists'
              : 'An error has occurred';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail,
          });
        },
      });
  }
}
