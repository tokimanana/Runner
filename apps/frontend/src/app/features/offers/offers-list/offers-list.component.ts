import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DiscountMode } from '@runner/shared/types';
import { ConfirmationService, MessageService } from 'primeng/api';
import { OffersService } from '../offers.service';
import { take } from 'rxjs';

export function getDiscountModeSeverity(discountMode: DiscountMode): string {
  return discountMode === 'SEQUENTIAL' ? 'info' : 'success';
}

@Component({
  selector: 'app-offers-list',
  imports: [],
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

  readonly offers = toSignal(this.offersService.offers$, { initialValue: [] });
  readonly loading = toSignal(this.offersService.loading$, {
    initialValue: false,
  });

  ngOnInit(): void {
    this.fetchOffers();
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
