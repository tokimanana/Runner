import { confirmDelete } from '@/app/shared/utils/confirm-delete.util';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Hotel } from '@runner/shared/types';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
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
  private readonly messageService = inject(MessageService);

  readonly hotels$ = this.hotelsService.getHotels();
  readonly loading$ = this.hotelsService.loading$;

  confirmDelete(hotel: Hotel): void {
    const hasData =
      (hotel.ageCategories?.length ?? 0) > 0 ||
      (hotel.roomTypes?.length ?? 0) > 0;

    confirmDelete({
      header: 'Delete Hotel',
      entityName: hotel.name,
      // Message custom uniquement si l'hôtel a des données liées
      message: hasData
        ? `"${hotel.name}" has configured age categories or room types. Deleting it will remove all associated data. Continue?`
        : undefined,
      delete$: this.hotelsService.deleteHotel(hotel.id),
      onSuccess: () => this.hotelsService.reload(),
      conflictMessage: `"${hotel.name}" cannot be deleted because it is used in existing contracts.`,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
    });
  }
}
