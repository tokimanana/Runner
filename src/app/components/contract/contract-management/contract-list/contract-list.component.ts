import {
  Component,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
  signal,
  inject,
  DestroyRef,
  computed,
  effect,
  Input,
} from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogConfig,
  MatDialogModule,
} from "@angular/material/dialog";
import { BehaviorSubject, firstValueFrom, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import {
  Contract,
  Hotel,
  Market,
  RoomType,
  Season,
} from "../../../../models/types";
import { ContractService } from "../../../../services/contract.service";
import { ContractFormComponent } from "../contract-form/contract-form.component";
import { HotelService } from "src/app/services/hotel.service";
import { MarketService } from "src/app/services/market.service";
import { SeasonService } from "src/app/services/season.service";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatTableModule } from "@angular/material/table";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatChipsModule } from "@angular/material/chips";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { MatPaginator } from "@angular/material/paginator";
import { MatMenuModule } from "@angular/material/menu";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { RatesConfigComponent } from "../rates-config/rates-config.component";

export interface ContractDialogData {
  mode: "create" | "edit";
  contract?: Contract;
}

@Component({
  selector: "app-contract-list",
  templateUrl: "./contract-list.component.html",
  styleUrls: ["./contract-list.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatCardModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinner,
    MatPaginator,
    MatDialogModule,
    // ... any other modules you need
  ],
})
export class ContractListComponent implements OnInit, OnDestroy {
  displayedColumns = ["name", "hotel", "market", "season", "status", "actions"];

  // Service injections using inject()
  private contractService = inject(ContractService);
  private hotelService = inject(HotelService);
  private marketService = inject(MarketService);
  private seasonService = inject(SeasonService);
  private destroyRef = inject(DestroyRef);

  // State signals
  contracts = signal<Contract[]>([]);
  hotels = signal<Hotel[]>([]);
  markets = signal<Market[]>([]);
  seasons = signal<Season[]>([]);
  roomTypes = signal<RoomType[]>([]);

  // Pagination signals
  pageSize = signal(10);
  currentPage = signal(0);
  totalContracts = signal(0);

  private destroy$ = new Subject<void>();

  // UI state signals
  loading = signal(false);
  error = signal<string | null>(null);

  // Computed values (if needed)
  hasContracts = computed(() => this.contracts().length > 0);

  @Input({ required: true }) hotel!: Hotel;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Setup effects or initial subscriptions
    effect(
      () => {
        // React to changes in pagination
        if (this.currentPage() >= 0) {
          void this.loadContracts(this.currentPage());
        }
      },
      { allowSignalWrites: true }
    ); // Add this option

    void this.initializeData();
  }

  private async initializeData() {
    try {
      await this.loadInitialData();
      this.setupSubscriptions();
    } catch (error) {
      this.handleError("Failed to initialize contract list", error);
    }
  }

  private setupSubscriptions() {
    // Use takeUntilDestroyed instead of manual Subject
    this.marketService.markets$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (markets) => this.markets.set(markets),
        error: (error) => this.handleError("Error loading markets", error),
      });

    // Other subscriptions...
  }

  private async loadInitialData() {
    this.loading.set(true);
    try {
      await Promise.all([
        this.loadContracts(),
        this.loadHotels(),
        this.loadMarkets(),
        this.loadSeasons(),
      ]);
    } finally {
      this.loading.set(false);
    }
  }

  async ngOnInit() {
    try {
      await this.loadInitialData();
      this.setupSubscriptions();
    } catch (error) {
      this.handleError("Failed to initialize contract list", error);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadContracts(pageIndex = 0) {
    try {
      // First load all reference data
      await Promise.all([
        this.loadHotels(),
        this.loadMarkets(),
        this.loadSeasons(),
      ]);

      const result = await firstValueFrom(
        this.contractService.getContracts(this.pageSize(), pageIndex)
      );

      if (result) {
        this.contracts.set(
          result.map((contract) => ({
            ...contract,
            hotelName: this.getHotelName(contract.hotelId),
            marketName: this.getMarketName(contract.marketId),
            seasonName: this.getSeasonName(contract.seasonId),
          }))
        );
      }
    } catch (error) {
      this.handleError("Error loading contracts", error);
    }
  }

  private async loadHotels() {
    try {
      const hotels = await firstValueFrom(this.hotelService.getHotels());
      this.hotels.set(hotels);
    } catch (error) {
      this.handleError("Error loading hotels", error);
    }
  }

  private loadMarkets() {
    this.marketService.markets$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (markets) => this.markets.set(markets),
      error: (error) => this.handleError("Error loading markets", error),
    });
  }

  private async loadSeasons() {
    try {
      const seasonMap = await firstValueFrom(this.seasonService.seasons$);
      // Flatten all seasons from the map
      const allSeasons = Array.from(seasonMap.values()).flat();
      this.seasons.set(allSeasons);
    } catch (error) {
      this.handleError("Error loading seasons", error);
    }
  }

  onPageChange(event: { pageIndex: number; pageSize: number }) {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadContracts(event.pageIndex);
  }

  openContractDialog(
    contract?: Contract,
    mode: "create" | "edit" = "create"
  ): void {
    const dialogConfig = new MatDialogConfig<ContractDialogData>();

    dialogConfig.width = "800px";
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      mode: mode,
      contract: contract ? { ...contract } : undefined,
    };

    const dialogRef = this.dialog.open(ContractFormComponent, dialogConfig);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result) {
            this.loadContracts();
          }
        },
        error: (error) => {
          console.error("Error in contract dialog:", error);
        },
      });
  }

  editContract(contract: Contract): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "800px";
    dialogConfig.disableClose = true; // Optional: prevents closing by clicking outside
    dialogConfig.data = {
      mode: "edit",
      contract: { ...contract }, // Clone the contract to avoid direct mutations
    };

    const dialogRef = this.dialog.open(ContractFormComponent, dialogConfig);

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result) {
            this.loadContracts(this.currentPage()); // Refresh the contracts list
          }
        },
        error: (error) => {
          console.error("Error in contract edit dialog:", error);
          this.handleError("Error updating contract", error);
        },
      });
  }

  openRatesConfigDialog(contract: Contract): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "90%";
    dialogConfig.height = "90%";
    dialogConfig.disableClose = true;
    dialogConfig.data = {
      contractId: contract.id,
    };

    this.dialog.open(RatesConfigComponent, dialogConfig);
  }

  viewRates(contract: Contract): void {
    if (!contract.id) {
      console.error("Contract ID is required to view rates");
      return;
    }

    if (!contract.isRatesConfigured) {
      this.snackBar.open(
        "Please configure rates for this contract first.",
        "OK",
        {
          duration: 5000,
          panelClass: ["alert-snackbar"],
          horizontalPosition: "center",
          verticalPosition: "top",
        }
      );
      return;
    }

    // Navigate to rates configuration view
    this.router.navigate(["contracts", contract.id, "rates"], {
      state: { contract },
    });
  }

  async deleteContract(contract: Contract) {
    if (
      await this.showConfirmDialog(
        "Are you sure you want to delete this contract?"
      )
    ) {
      try {
        this.loading.set(true);
        await this.contractService.deleteContract(contract.id);
        await this.loadContracts(this.currentPage());
        // Optional: Show success message
      } catch (error) {
        this.handleError("Error deleting contract", error);
      } finally {
        this.loading.set(false);
      }
    }
  }

  async configureRates(contract: Contract) {
    try {
      // First ensure we have all required data
      const periods = await firstValueFrom(this.seasonService.periods$).then(
        (periodMap) => periodMap.get(contract.seasonId) || []
      );

      const roomTypes = await firstValueFrom(this.hotelService.getRoomTypes(contract.hotelId));

      const mealPlans = contract.selectedMealPlans;

      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = "90vw";
      dialogConfig.maxWidth = "1200px";
      dialogConfig.height = "90vh";
      dialogConfig.data = {
        contract,
        periods,
        roomTypes,
        mealPlans,
      };

      const dialogRef = this.dialog.open(RatesConfigComponent, dialogConfig);

      const result = await firstValueFrom(dialogRef.afterClosed());

      if (result) {
        // Refresh contracts list if rates were updated
        await this.loadContracts();
      }
    } catch (error) {
      console.error("Error configuring rates:", error);
      this.error.set("Failed to configure rates. Please try again.");
    }
  }

  private handleError(message: string, error: any) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error(message, error);
    // Fix: Proper template literal syntax
    this.error.set(`${message}: ${errorMessage}`);
    this.loading.set(false);
  }

  private showConfirmDialog(message: string): Promise<boolean> {
    return Promise.resolve(window.confirm(message));
  }

  // Helper methods for template
  getHotelName(hotelId: number): string {
    return this.hotels().find((h) => h.id === hotelId)?.name || "Unknown Hotel";
  }

  getMarketName(marketId: number): string {
    return (
      this.markets().find((m) => m.id === marketId)?.name || "Unknown Market"
    );
  }

  getSeasonName(seasonId: number): string {
    return (
      this.seasons().find((s) => s.id === seasonId)?.name || "Unknown Season"
    );
  }

  clearError() {
    this.error.set(null);
  }
}
