// src/app/components/special-offers/special-offers.component.ts

import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { OffersService } from "../../services/offers.service";
import { SpecialOffer } from "../../models/types";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatIconModule } from "@angular/material/icon";
import { MatDivider } from "@angular/material/divider";
import { MatCardModule } from "@angular/material/card";
import { CommonModule, DatePipe } from "@angular/common";
import { OfferFormComponent } from "./offer-form/offer-form.component";

@Component({
  selector: "app-special-offers",
  templateUrl: "special-offers.component.html",
  styleUrls: ["./special-offers.component.scss"],
  standalone: true,
  imports: [MatIconModule, MatDivider, MatCardModule, DatePipe, CommonModule],
})
export class SpecialOffersComponent implements OnInit, OnDestroy {
  offers$ = this.offersService.offers$;
  private destroy$ = new Subject<void>();

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
    dialogConfig.width = "800px";
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
  }

  editOffer(offer: SpecialOffer): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "800px";
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      title: "Edit Special Offer",
      offer: { ...offer }, // Clone to avoid direct mutations
    };

    const dialogRef = this.dialog.open(OfferFormComponent, dialogConfig);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result) {
            this.snackBar.open("Offer updated successfully", "Close", {
              duration: 3000,
            });
          }
        },
        error: (error) => {
          console.error("Error in offer edit dialog:", error);
          this.snackBar.open("Error updating offer", "Close", {
            duration: 3000,
          });
        },
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
}
