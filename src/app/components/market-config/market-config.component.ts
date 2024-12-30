import {
  Component,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  signal,
  computed,
  input,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatChipListbox } from "@angular/material/chips";
import { MatMenuModule } from "@angular/material/menu";
import { MatDialogModule } from "@angular/material/dialog";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import { RouterModule } from "@angular/router";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";

import { MarketService } from "../../services/market.service";
import {
  Market,
  MarketGroup,
  CurrencySetting,
  Hotel,
} from "../../models/types";
import { ModalComponent } from "../modal/modal.component";
import { CurrencyService } from "../../services/currency.service";

@Component({
  selector: "app-market-config",
  templateUrl: "./market-config.component.html",
  styleUrls: ["./market-config.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatDialogModule,
    MatSelectModule,
    MatFormFieldModule,
    RouterModule,
    ModalComponent,
  ],
})
export class MarketConfigComponent implements OnInit, OnDestroy {
  // Input signals
  hotel = input.required<Hotel>();

  // State signals
  markets = signal<Market[]>([]);
  marketGroups = signal<MarketGroup[]>([]);
  currencySettings = signal<CurrencySetting[]>([]);
  selectedMarket = signal<Market | null>(null);
  selectedMarketGroup = signal<MarketGroup | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Modal signals
  showMarketModal = signal(false);
  showGroupModal = signal(false);

  // Computed values
  modalTitle = computed(() => {
    if (this.showMarketModal()) {
      return this.selectedMarket() ? "Edit Market" : "Add Market";
    }
    return this.selectedMarketGroup() ? "Edit Region" : "Add Region";
  });

  // Forms
  marketForm!: FormGroup;
  groupForm!: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private marketService: MarketService,
    private currencyService: CurrencyService
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadData();
  }

  private initializeForms() {
    this.marketForm = this.fb.group({
      name: ["", Validators.required],
      code: ["", Validators.required],
      currency: ["", Validators.required],
      region: ["", Validators.required],
      description: [""],
      groupId: [null],
      isActive: [true],
      hasRates: [false],
    });

    this.groupForm = this.fb.group({
      name: ["", Validators.required],
      region: ["", Validators.required],
      markets: [[]],
      defaultCurrency: ["", Validators.required],
      description: [""],
      isActive: [true],
    });
  }

  private async loadData() {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      // Subscribe to markets
      this.marketService.markets$.pipe(takeUntil(this.destroy$)).subscribe({
        next: (markets) => this.markets.set(markets),
        error: (err) => {
          console.error("Error loading markets:", err);
          this.error.set("Failed to load markets");
        },
      });

      // Subscribe to market groups
      this.marketService.marketGroups$
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (groups) => this.marketGroups.set(groups),
          error: (err) => {
            console.error("Error loading market groups:", err);
            this.error.set("Failed to load market groups");
          },
        });

      // Load currency settings
      this.currencyService
        .getCurrencySettings()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (currencies) => this.currencySettings.set(currencies),
          error: (err) => {
            console.error("Error loading currencies:", err);
            this.error.set("Failed to load currencies");
          },
        });

      // Initial load of market data
      await this.marketService.refresh();
    } catch (error) {
      console.error("Error in data loading:", error);
      this.error.set("Failed to load data");
    } finally {
      this.isLoading.set(false);
    }
  }

  // Modal handlers
  openMarketModal(market?: Market, group?: MarketGroup) {
    this.selectedMarket.set(market || null);
    this.selectedMarketGroup.set(group || null);

    if (market) {
      this.marketForm.patchValue(market);
    } else {
      this.marketForm.reset({
        groupId: group?.id,
        currency: group?.defaultCurrency,
        isActive: true,
        hasRates: false,
      });
    }

    this.showMarketModal.set(true);
  }

  openGroupModal(group?: MarketGroup) {
    this.selectedMarketGroup.set(group || null);

    if (group) {
      this.groupForm.patchValue(group);
    } else {
      this.groupForm.reset({
        isActive: true,
        markets: [],
      });
    }

    this.showGroupModal.set(true);
  }

  closeModals() {
    this.showMarketModal.set(false);
    this.showGroupModal.set(false);
    this.selectedMarket.set(null);
    this.selectedMarketGroup.set(null);
    this.marketForm.reset();
    this.groupForm.reset();
  }

  // Save handlers
  async saveMarket() {
    if (this.marketForm.valid) {
      try {
        this.isLoading.set(true);
        const formData = this.marketForm.value;

        if (this.selectedMarket()) {
          await this.marketService.updateMarket(
            this.selectedMarket()!.id,
            formData
          );
        } else {
          await this.marketService.createMarket(formData);
        }

        this.closeModals();
      } catch (error) {
        console.error("Error saving market:", error);
        this.error.set("Failed to save market");
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  async saveMarketGroup() {
    if (this.groupForm.valid) {
      try {
        this.isLoading.set(true);
        const formData = this.groupForm.value; // Get form values

        if (this.selectedMarketGroup()) {
          await this.marketService.updateMarketGroup(
            this.selectedMarketGroup()!.id,
            formData
          );
        } else {
          await this.marketService.createMarketGroup(formData);
        }

        this.closeModals();
      } catch (error) {
        console.error("Error saving market group:", error);
        this.error.set("Failed to save market group");
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  getMarket(marketId: number): Market | undefined {
    return this.markets().find((m) => m.id === marketId);
  }

  getMarketDescription(marketId: number): string {
    const market = this.getMarket(marketId);
    return market?.description || "";
  }

  // Helper methods
  getMarketCurrency(marketId: number): string {
    const market = this.marketService.getMarketById(marketId);
    return market?.currency || "";
  }

  getMarketName(marketId: number): string {
    return this.marketService.getMarketName(marketId);
  }

  hasRates = computed(() => {
    return (marketId: number) => {
      const market = this.markets().find((m) => m.id === marketId);
      return market?.hasRates || false;
    };
  });

  isMarketInUse(marketId: number): boolean {
    return this.marketService.isMarketInUse(marketId);
  }

  // Cleanup
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Error handling
  retryLoad() {
    this.loadData();
  }

  getGroupColor(region: string): string {
    // You can customize these colors based on your needs
    const colorMap: { [key: string]: string } = {
      Europe: "#e3f2fd",
      "North America": "#f3e5f5",
      Asia: "#e8f5e9",
      "United Kingdom": "#fff3e0",
      Default: "#f5f5f5",
    };
    return colorMap[region] || colorMap["Default"];
  }

  async deleteMarket(marketId: number) {
    try {
      if (!confirm("Are you sure you want to delete this market?")) {
        return;
      }

      // Check if market is in use
      if (this.isMarketInUse(marketId)) {
        alert("Cannot delete market as it is currently in use.");
        return;
      }

      this.isLoading.set(true);
      await this.marketService.deleteMarket(marketId);

      // Refresh the data after deletion
      await this.loadData();
    } catch (error) {
      console.error("Error deleting market:", error);
      this.error.set("Failed to delete market");
    } finally {
      this.isLoading.set(false);
    }
  }
}
