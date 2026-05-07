import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Hotel } from '@runner/shared/types';
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { take } from 'rxjs';
import { HotelsService } from '../hotels.service';
@Component({
  selector: 'app-hotels-list',
  imports: [AsyncPipe, TableModule, Button, RouterLink, ConfirmDialog],
  templateUrl: './hotels-list.component.html',
  styleUrl: './hotels-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelsListComponent {
  private readonly hotelsService = inject(HotelsService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly hotels$ = this.hotelsService.getHotels();
  readonly loading$ = this.hotelsService.loading$;

  confirmDelete(hotel: Hotel): void {
    const hasData =
      (hotel.ageCategories?.length ?? 0) > 0 ||
      (hotel.roomTypes?.length ?? 0) > 0;

    this.confirmationService.confirm({
      header: 'Delete Hotel',
      message: hasData
        ? `"${hotel.name}" has configured age categories or room types. Deleting it will remove all associated data. Continue?`
        : `Are you sure you want to delete "${hotel.name}"?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.hotelsService
          .deleteHotel(hotel.id)
          .pipe(take(1))
          .subscribe({
            error: (err) => {
              if (err.status === 409) {
                // HAS_CONTRACTS — backend bloque
              }
            },
          });
      },
    });
  }
}
