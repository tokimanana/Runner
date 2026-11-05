import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { checkOfferCompatibility } from '@runner/shared/business-rules';
import { Offer } from '@runner/shared/types';
import { Checkbox } from 'primeng/checkbox';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { getDiscountModeSeverity } from '../offers-list/offers-list.component';
import { isOfferEligible, Stay } from './offer-eligibility.util';

@Component({
  selector: 'app-offers-selection',
  imports: [FormsModule, Checkbox, Tag, Tooltip],
  templateUrl: './offers-selection.component.html',
  styleUrl: './offers-selection.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersSelectionComponent {
  readonly offers = input.required<Offer[]>();
  readonly stay = input.required<Stay>();
  readonly selectedIds = model<string[]>([]);

  protected readonly getSeverity = getDiscountModeSeverity;

  private readonly eligibleOffers = computed(() =>
    this.offers().filter((offer) => isOfferEligible(offer, this.stay()))
  );

  protected readonly rows = computed(() => {
    const ids = new Set(this.selectedIds());
    const eligible = this.eligibleOffers();
    const selected = eligible.filter((offer) => ids.has(offer.id));

    return eligible.map((offer) => {
      const isSelected = ids.has(offer.id);
      const result = isSelected
        ? null
        : checkOfferCompatibility([...selected, offer]);
      return {
        offer,
        isSelected,
        disabled: result !== null && !result.compatible,
        reason: result?.reason,
      };
    });
  });

  constructor() {
    effect(() => {
      const eligibleIds = new Set(
        this.eligibleOffers().map((offer) => offer.id)
      );
      const current = this.selectedIds();
      const kept = current.filter((id) => eligibleIds.has(id));

      if (kept.length !== current.length) {
        this.selectedIds.set(kept);
      }
    });
  }

  protected toggle(offerId: string, checked: boolean): void {
    this.selectedIds.update((ids) =>
      checked ? [...ids, offerId] : ids.filter((id) => id !== offerId)
    );
  }
}
