import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  input,
  ChangeDetectorRef,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDialog, MatDialogModule } from "@angular/material/dialog";
import { BehaviorSubject, firstValueFrom, Subject, takeUntil } from "rxjs";

import { CurrencyService } from "../../services/currency.service";
import { CurrencySetting, Hotel } from "../../models/types";
import { CurrencyModalComponent } from "./currency-modal.component";

@Component({
  selector: "app-currency",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  templateUrl: "./currency.component.html",
  styleUrls: ["./currency.component.scss"],
})
export class CurrencyComponent implements OnInit, OnDestroy {
  hotel = input.required<Hotel>();
  title = input<string>("Currency Management");

  private destroy$ = new Subject<void>();
  currencies = signal<CurrencySetting[]>([]);
  displayedColumns = ["code", "symbol", "name", "actions"];
  isLoading = signal(false);
  loading = signal(false);

  constructor(
    private currencyService: CurrencyService,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.loading.set(true);

    // Subscribe to currency changes
    this.currencyService.getCurrencySettings()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (currencies) => {
          this.currencies.set(currencies || []);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error in currency subscription:', error);
          this.loading.set(false);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async refreshCurrencies() {
    try {
      this.loading.set(true);
      await firstValueFrom(
        this.currencyService.getCurrencySettings()
      );
    } catch (error) {
      console.error('Error refreshing currencies:', error);
    } finally {
      this.loading.set(false);
    }
  }
  

  openAddCurrencyModal(): void {
    const dialogRef = this.dialog.open(CurrencyModalComponent, {
      width: "400px",
      data: {
        title: "Add Currency",
        currency: null,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshCurrencies();
      }
    });
  }

  openEditCurrencyModal(currency: CurrencySetting): void {
    const dialogRef = this.dialog.open(CurrencyModalComponent, {
      width: "400px",
      data: {
        title: "Edit Currency",
        currency: currency,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.refreshCurrencies();
      }
    });
  }

  async deleteCurrency(currency: CurrencySetting): Promise<void> {
    if (confirm(`Are you sure you want to delete ${currency.name}?`)) {
      try {
        await this.currencyService.deleteCurrency(currency);
        this.refreshCurrencies();
      } catch (error: any) {
        console.error("Error deleting currency:", error);
      }
    }
  }
}
