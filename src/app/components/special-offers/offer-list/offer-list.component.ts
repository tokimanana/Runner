import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpecialOffer, Hotel } from '../../../models/types';
import { SpecialOffersService } from '../special-offers.service';
import { OfferFormComponent } from '../offer-form/offer-form.component';

@Component({
  selector: 'app-offer-list',
  templateUrl: './offer-list.component.html',
  styleUrls: ['./offer-list.component.css'],
  standalone: true,
  imports: [CommonModule, OfferFormComponent]
})
export class OfferListComponent implements OnInit {
  @Input() hotel!: Hotel;
  offers: SpecialOffer[] = [];
  isFormVisible = false;

  constructor(private offersService: SpecialOffersService) {}

  ngOnInit() {
    this.offersService.getOffers().subscribe(offers => {
      this.offers = offers;
    });

    this.offersService.getIsFormVisible().subscribe(isVisible => {
      this.isFormVisible = isVisible;
    });
  }

  openOfferForm(offer?: SpecialOffer) {
    this.offersService.openForm(offer);
  }

  closeOfferForm() {
    this.offersService.closeForm();
  }

  deleteOffer(offerId: number) {
    if (confirm('Are you sure you want to delete this offer?')) {
      this.offersService.deleteOffer(offerId);
    }
  }
}