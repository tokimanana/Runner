import { confirmDelete } from '@/app/shared/utils/confirm-delete.util';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DiscountMode, Offer } from '@runner/shared/types';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { take } from 'rxjs';
import { OffersService } from '../offers.service';

export function getDiscountModeSeverity(discountMode: DiscountMode): string {
  return discountMode === 'SEQUENTIAL' ? 'info' : 'success';
}

@Component({
  selector: 'app-offers-list',
  standalone: true,
  imports: [Button, TableModule, ConfirmDialog, RouterLink, Tag],
  templateUrl: './offers-list.component.html',
  styleUrl: './offers-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersListComponent implements OnInit {
  private readonly offersService = inject(OffersService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly hasError = signal<boolean>(false);
  readonly getSeverity = getDiscountModeSeverity;

  readonly offers = toSignal(this.offersService.offers$, { initialValue: [] });
  readonly loading = toSignal(this.offersService.loading$, {
    initialValue: false,
  });

  ngOnInit(): void {
    this.fetchOffers();
  }

  confirmDeleteOffer(offer: Offer): void {
    confirmDelete({
      header: 'Delete Offer',
      entityName: offer.name,
      delete$: this.offersService.remove(offer.id),
      conflictMessage: `"${offer.name}" is still linked to existing periods or supplements.`,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
    });
  }

  retry(): void {
    this.fetchOffers();
  }

  goToCreate(): void {
    // TODO(S5-FE-008): route '/management/offers/create' pas encore enregistrée
    console.log('Navigate to create offer — pending S5-FE-008');
  }

  private fetchOffers() {
    this.hasError.set(false);

    return this.offersService
      .findAll()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => {
          this.hasError.set(true);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load offers',
          });
        },
      });
  }
}
