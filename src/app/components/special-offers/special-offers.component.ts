// src/app/components/special-offers/special-offers.component.ts

import { Component, OnInit, OnDestroy, Input } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { OffersService } from "../../services/offers.service";
import { Hotel, SpecialOffer } from "../../models/types";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatIconModule } from "@angular/material/icon";
import { MatDivider } from "@angular/material/divider";
import { MatCardModule } from "@angular/material/card";
import { CommonModule } from "@angular/common";
import { OfferFormComponent } from "./offer-form/offer-form.component";
import { OfferListComponent } from "./offer-list/offer-list.component";

@Component({
  selector: "app-special-offers",
  templateUrl: "special-offers.component.html",
  styleUrls: ["./special-offers.component.scss"],
  standalone: true,
  imports: [
    MatIconModule,
    MatDivider,
    MatCardModule,
    CommonModule,
    OfferFormComponent,
    OfferListComponent,
  ],
})
export class SpecialOffersComponent implements OnInit, OnDestroy {
  @Input() hotel!: Hotel;
  private destroy$ = new Subject<void>();
  offers$ = this.offersService.offers$;

  showOfferForm = false;
  selectedOffer: SpecialOffer | null = null;

  constructor(
    private offersService: OffersService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Initial load of offers
    this.offersService.load().catch((error) => {
      console.error("Error loading offers:", error);
      this.snackBar.open("Error loading offers", "Close", { duration: 3000 });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // In special-offers.component.ts

  createOffer(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "1000px"; // Increased from 800px
    dialogConfig.height = "800px"; // Added height
    dialogConfig.maxWidth = "90vw"; // Ensures dialog doesn't exceed viewport width
    dialogConfig.maxHeight = "90vh"; // Ensures dialog doesn't exceed viewport height
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      title: "Create Special Offer",
      offer: null,
    };

    const dialogRef = this.dialog.open(OfferFormComponent, dialogConfig);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result) {
            this.snackBar.open("Offer created successfully", "Close", {
              duration: 3000,
            });
          }
        },
        error: (error) => {
          console.error("Error in offer creation dialog:", error);
          this.snackBar.open("Error creating offer", "Close", {
            duration: 3000,
          });
        },
      });

    dialogRef.backdropClick().subscribe(() => {
      dialogRef.close();
    });
  }

  editOffer(offer: SpecialOffer): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "1000px";
    dialogConfig.height = "800px";
    dialogConfig.maxWidth = "90vw";
    dialogConfig.maxHeight = "90vh";
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      title: "Edit Special Offer",
      offer: { ...offer }, 
    };

    const dialogRef = this.dialog.open(OfferFormComponent, dialogConfig);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (result) => {
          if (result) {
            try {
              // Update the offer using the service
              await this.offersService.updateOffer(offer.id, result);

              // Reload offers to refresh the list
              await this.offersService.load();

              this.snackBar.open("Offer updated successfully", "Close", {
                duration: 3000,
              });
            } catch (error) {
              console.error("Error updating offer:", error);
              this.snackBar.open("Error updating offer", "Close", {
                duration: 3000,
              });
            }
          }
        },
        error: (error) => {
          console.error("Error in offer edit dialog:", error);
          this.snackBar.open("Error updating offer", "Close", {
            duration: 3000,
          });
        },
      });

    dialogRef.backdropClick().subscribe(() => {
      dialogRef.close();
    });
  }

  async deleteOffer(offer: SpecialOffer): Promise<void> {
    if (confirm(`Are you sure you want to delete the offer "${offer.name}"?`)) {
      try {
        await this.offersService.deleteOffer(offer.id);
        this.snackBar.open("Offer deleted successfully", "Close", {
          duration: 3000,
        });
      } catch (error) {
        console.error("Error deleting offer:", error);
        this.snackBar.open("Error deleting offer", "Close", { duration: 3000 });
      }
    }
  }

  // onSaveOffer(offerData: Partial<SpecialOffer>) {
  //   if (this.selectedOffer) {
  //     this.offersService.updateOffer(this.selectedOffer.id, offerData);
  //   } else {
  //     this.offersService.createOffer(offerData as Omit<SpecialOffer, "id">);
  //   }
  //   this.showOfferForm = false;
  //   this.selectedOffer = null;
  // }

  onSaveOffer(offerData: Partial<SpecialOffer>) {
    // Ensure all required properties are defined
    const completeOfferData: Omit<SpecialOffer, "id"> = {
      code: offerData.code ?? '',
      name: offerData.name ?? '',
      type: offerData.type ?? 'combinable',
      description: offerData.description ?? '',
      discountType: offerData.discountType ?? 'percentage',
      discountValues: offerData.discountValues ?? [],
      travelDateRange: offerData.travelDateRange ?? { start: '', end: '' },
      conditions: offerData.conditions ?? [],
      minimumNights: offerData.minimumNights ?? 0,
      blackoutDates: offerData.blackoutDates ?? [],
      bookingWindow: offerData.bookingWindow ?? { start: '', end: '' },
    };
  
    if (this.selectedOffer) {
      this.offersService.updateOffer(this.selectedOffer.id, completeOfferData);
    } else {
      this.offersService.createOffer(completeOfferData);
    }
    this.showOfferForm = false;
    this.selectedOffer = null;
  }

  onCancelOffer() {
    this.showOfferForm = false;
    this.selectedOffer = null;
  }
}
