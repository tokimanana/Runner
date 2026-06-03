import { confirmDelete } from '@/app/shared/utils/confirm-delete.util';
import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Season } from '@runner/shared/types';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { SeasonsService } from '../seasons.service';

@Component({
  selector: 'app-seasons-list',
  imports: [
    ButtonModule,
    ConfirmDialogModule,
    DatePipe,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    RouterModule,
    TableModule,
  ],
  templateUrl: './seasons-list.component.html',
  styleUrl: './seasons-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonsListComponent {
  private readonly seasonsService = inject(SeasonsService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly search = signal('');

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
      onSuccess: () => this.seasonsService.reload(),
      conflictMessage: `"${season.name}" is linked to existing contract periods.`,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
    });
  }
}
