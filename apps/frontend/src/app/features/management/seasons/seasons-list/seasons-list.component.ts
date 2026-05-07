import { AsyncPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Season } from '@runner/shared/types';
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { take } from 'rxjs';
import { SeasonsService } from '../seasons.service';

@Component({
  selector: 'app-seasons-list',
  imports: [
    AsyncPipe,
    DatePipe,
    TableModule,
    Button,
    RouterLink,
    ConfirmDialog,
  ],
  templateUrl: './seasons-list.component.html',
  styleUrl: './seasons-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonsListComponent {
  private readonly seasonsService = inject(SeasonsService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly seasons$ = this.seasonsService.getSeasons();
  readonly loading$ = this.seasonsService.loading$;

  confirmDelete(season: Season): void {
    this.confirmationService.confirm({
      header: 'Delete Season',
      message: `Are you sure you want to delete "${season.name}"?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.seasonsService
          .deleteSeason(season.id)
          .pipe(take(1))
          .subscribe({
            error: (err) => {
              if (err.status === 409) {
                // HAS_PERIODS — backend bloque
              }
            },
          });
      },
    });
  }
}
