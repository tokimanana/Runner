import { contractRates } from "./../../../../data/mock/rates.mock";
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
import { BehaviorSubject, EMPTY, firstValueFrom, from, Subject } from "rxjs";
import { catchError, finalize, takeUntil } from "rxjs/operators";
import {
  Contract,
  ContractPeriodRate,
  ContractStatus,
  Hotel,
  Market,
  Period,
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
import { ContractRateService } from "src/app/services/contract-rates.service";

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
  displayedColumns = [
    "name",
    "hotel",
    "market",
    "season",
    "baseMealPlan",
    "status",
    "actions",
  ];

  // Service injections using inject()
  private contractService = inject(ContractService);
  private hotelService = inject(HotelService);
  private marketService = inject(MarketService);
  private seasonService = inject(SeasonService);
  private contractRateService = inject(ContractRateService);
  private destroyRef = inject(DestroyRef);

  // State signals
  contracts = signal<Contract[]>([]);
  hotels = signal<Hotel[]>([]);
  markets = signal<Market[]>([]);
  seasons = signal<Map<number, Season[]>>(new Map());
  roomTypes = signal<RoomType[]>([]);
  contractRates = signal<Map<number, ContractPeriodRate[]>>(new Map());

  // Pagination signals
  pageSize = signal(10);
  currentPage = signal(0);
  totalContracts = signal(0);

  private destroy$ = new Subject<void>();

  async loadContractWithRates(contract: Contract) {
    try {
      const rates = await this.contractRateService.getContractRates(
        contract.id
      );
      this.contractRates.update((map) => {
        const newMap = new Map(map);
        newMap.set(contract.id, rates);
        return newMap;
      });
    } catch (error) {
      this.handleError("Error loading contract rates", error);
    }
  }

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
      this.loading.set(true);

      // First load seasons for all hotels
      await this.loadSeasonsForHotels([1, 2, 3]); // Your hotel IDs

      // Then load contracts
      await this.loadContracts();
    } catch (error) {
      this.handleError("Error initializing component", error);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadSeasonsForHotels(hotelIds: number[]) {
    try {
      this.loading.set(true);

      const seasonPromises = hotelIds.map(async (hotelId) => {
        try {
          const seasons = await this.seasonService.getSeasonsByHotel(hotelId);
          return { hotelId, seasons };
        } catch (error) {
          console.error(`Error loading seasons for hotel ${hotelId}:`, error);
          return { hotelId, seasons: [] };
        }
      });

      const results = await Promise.all(seasonPromises);

      this.seasons.update((map) => {
        const newMap = new Map(map);
        results.forEach(({ hotelId, seasons }) => {
          newMap.set(hotelId, seasons);
        });
        return newMap;
      });
    } catch (error) {
      console.error("Error loading seasons:", error);
      this.snackBar.open("Error loading seasons", "Close", {
        duration: 3000,
      });
    } finally {
      this.loading.set(false);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadContracts(pageIndex = 0) {
    try {
      await Promise.all([
        this.loadHotels(),
        this.loadMarkets(),
        this.loadSeasons(),
      ]);

      const result = await firstValueFrom(
        this.contractService.getContracts(this.pageSize(), pageIndex)
      );

      if (result) {
        // Load rates for each contract
        await Promise.all(
          result.map((contract) => this.loadContractWithRates(contract))
        );

        this.contracts.set(
          result.map((contract) => ({
            ...contract,
            hotelName: this.getHotelName(contract.hotelId),
            marketName: this.getMarketName(contract.marketId),
            seasonName: this.getSeasonName(contract.seasonId, contract.hotelId),
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

  private loadSeasons() {
    // Early return if no hotel selected
    if (!this.hotel?.id) {
      console.log('No hotel selected');
      return;
    }
  
    const hotelId = this.hotel.id;
    console.log("Loading seasons for hotel:", hotelId);
    this.loading.set(true);
  
    from(this.seasonService.getSeasonsByHotel(hotelId)).pipe(
      finalize(() => this.loading.set(false)),
      catchError((error) => {
        console.error("Error loading seasons:", error);
        this.snackBar.open("Error loading seasons", "Close", {
          duration: 3000,
        });
        return EMPTY; // Return empty observable to prevent subscription error
      })
    ).subscribe((seasons: Season[]) => {
      console.log("Loaded seasons:", seasons);
      const seasonsMap = new Map(this.seasons());
      seasonsMap.set(hotelId, seasons);
      this.seasons.set(seasonsMap);
    });
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

  async openRatesConfigDialog(contract: Contract) {
    try {
      // Get the season periods from the correct hotel's seasons
      const hotelSeasons = this.seasons().get(contract.hotelId) || [];
      const periods =
        hotelSeasons.find((s) => s.id === contract.seasonId)?.periods || [];

      // Get room types
      const roomTypes = this.roomTypes().filter((room) =>
        contract.selectedRoomTypes.includes(room.id)
      );

      // Load existing rates for the contract
      const existingRates = await this.contractRateService.getContractRates(
        contract.id
      );
      console.log("Loaded existing rates:", existingRates);

      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = "90vw";
      dialogConfig.maxWidth = "1200px";
      dialogConfig.height = "90vh";
      dialogConfig.disableClose = true;
      dialogConfig.data = {
        contract,
        periods,
        roomTypes,
        mealPlans: contract.selectedMealPlans,
        rates: existingRates,
      };

      const dialogRef = this.dialog.open(RatesConfigComponent, dialogConfig);
      const result = await firstValueFrom(dialogRef.afterClosed());

      if (result) {
        // Refresh the contracts list if rates were updated
        await this.loadContracts();
      }
    } catch (error) {
      console.error("Error configuring rates:", error);
      this.error.set("Failed to configure rates. Please try again.");
    }
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

  getContractStatus(contract: Contract): ContractStatus {
    if (!contract || !contract.seasonId) {
      return "no_rate";
    }

    const hotelSeasons = this.seasons().get(contract.hotelId) || [];
    const season = hotelSeasons.find((s) => s.id === contract.seasonId);

    if (!season) {
      console.warn(
        `Season not found for contract: ${contract.id} in hotel: ${contract.hotelId}`
      );
      return "no_rate";
    }

    if (!contract.isRatesConfigured) {
      return "no_rate";
    }

    return "configured";
  }

  async configureRates(contract: Contract) {
    try {
      // First ensure we have all required data
      const periods = await firstValueFrom(this.seasonService.periods$).then(
        (periodMap) => periodMap.get(contract.seasonId) || []
      );

      const allRoomTypes = await firstValueFrom(
        this.hotelService.getRoomTypes(contract.hotelId)
      );
      const roomTypes = allRoomTypes.filter((room) =>
        contract.selectedRoomTypes.includes(room.id)
      );

      // Load existing rates for the contract
      const existingRates = await this.contractRateService.getContractRates(
        contract.id
      );

      const dialogConfig = new MatDialogConfig();
      dialogConfig.width = "90vw";
      dialogConfig.maxWidth = "1200px";
      dialogConfig.height = "90vh";
      dialogConfig.data = {
        contract,
        periods,
        roomTypes,
        mealPlans: contract.selectedMealPlans,
        rates: existingRates,
      };

      dialogConfig.ariaDescribedBy = null;

      const dialogRef = this.dialog.open(RatesConfigComponent, dialogConfig);

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.loadContracts();
        }
      });

      const result = await firstValueFrom(dialogRef.afterClosed());

      if (result) {
        // Update contract rates in local state
        this.contractRates.update((map) => {
          const newMap = new Map(map);
          newMap.set(contract.id, result);
          return newMap;
        });
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
    const market = this.markets().find((m) => m.id === marketId);
    if (!market) {
      console.warn(`Market not found for ID: ${marketId}`);
      return "Unknown Market";
    }
    return market.name;
  }

  getSeasonName(seasonId: number, hotelId: number): string {
    const hotelSeasons = this.seasons().get(hotelId) || [];
    const season = hotelSeasons.find((s: Season) => s.id === seasonId);
    if (!season) {
      console.warn(`Season not found for ID: ${seasonId} in hotel: ${hotelId}`);
      return "Unknown Season";
    }
    return season.name;
  }

  clearError() {
    this.error.set(null);
  }

  async updateContractStatus(contract: Contract): Promise<void> {
    try {
      this.loading.set(true);
      await this.contractService.updateContractStatus(contract.id, contract);
      await this.loadContracts(this.currentPage()); // Refresh the contracts list
      this.snackBar.open("Contract status updated successfully", "Close", {
        duration: 3000,
      });
    } catch (error) {
      this.handleError("Error updating contract status", error);
    } finally {
      this.loading.set(false);
    }
  }
}
