import { CurrencyService } from "./../../services/currency.service";
// src/app/components/reservation/reservation.component.ts
import { Component, Input, ViewChild, computed, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import {
  Hotel,
  SpecialOffer,
  MealPlan,
  Contract,
  Market,
  RoomType,
  RoomTypeRate,
  ContractPeriodRate,
  MEAL_PLAN_NAMES,
  MealPlanType,
  Period,
} from "../../models/types";
import { ContractService } from "src/app/services/contract.service";
import { ContractRateService } from "src/app/services/contract-rates.service";
import { firstValueFrom } from "rxjs";
import { HotelService } from "src/app/services/hotel.service";
import { MarketService } from "src/app/services/market.service";
import { MatChipsModule } from "@angular/material/chips";
import { MatStepper, MatStepperModule } from "@angular/material/stepper";
import {
  MatListModule,
  MatListOption,
  MatSelectionListChange,
} from "@angular/material/list";
import { Router } from "@angular/router";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { OffersService } from "src/app/services/offers.service";

// Add interface for type safety
interface RoomRateWithPeriod extends RoomTypeRate {
  periodStartDate: string;
  periodEndDate: string;
}

interface MealPlanSupplement {
  type: MealPlanType;
  name: string;
  rates: {
    adult: number;
    child: number;
    infant: number;
  };
}

interface PersonTypeRates {
  rates: {
    [key: number]: number;
    extra: number;
  };
}

interface MealPlanResult {
  value: string;
  error?: string;
}

interface RoomRate {
  roomTypeId: number;
  rateType: "per_villa" | "per_person";
  villaRate?: number;
  personTypeRates?: {
    adult?: PersonTypeRates;
    child?: PersonTypeRates;
  };
}

interface ReservationStep {
  room?: RoomType;
  selectedMealPlans?: MealPlanType[];
  baseRate?: number;
  supplementRates?: {
    type: MealPlanType;
    name: string;
    rates: {
      adult: number;
      child: number;
      infant: number;
    };
  }[];
  total?: number;
}

interface MarketConfig {
  currency: string;
  // other market-specific configurations
}

interface PricingError extends Error {
  code: string;
  context?: any;
}

@Component({
  selector: "app-reservation",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatChipsModule,
    MatStepperModule,
    MatListModule,
    MatSnackBarModule,
  ],
  templateUrl: "./reservation.component.html",
  styleUrls: ["./reservation.component.scss"],
})
export class ReservationComponent {
  searchForm!: FormGroup;
  hotels = signal<Hotel[]>([]);
  markets = signal<Market[]>([]);
  availableMarkets = signal<Market[]>([]);
  activeContract = signal<Contract | null>(null);
  contractRates = signal<ContractPeriodRate[]>([]);
  contracts = signal<Contract[]>([]);
  roomTypes = signal<RoomType[]>([]);
  filteredRooms = signal<RoomType[]>([]);
  periods = signal<Period[]>([]);

  selectedOffers = signal<SpecialOffer[]>([]);
  private marketCurrency = signal<string | null>(null);

  availableOffers = signal<SpecialOffer[]>([]);

  currentStep = signal<ReservationStep>({});
  cartItems = signal<ReservationStep[]>([]);

  @ViewChild("stepper") stepper!: MatStepper;

  private initialBooking = signal<{
    hotelId?: number;
    marketId?: number;
    checkIn?: Date;
    checkOut?: Date;
  } | null>(null);

  readonly MEAL_PLAN_NAMES: Record<MealPlanType, string> = {
    [MealPlanType.RO]: "Room Only",
    [MealPlanType.BB]: "Bed & Breakfast",
    [MealPlanType.BB_PLUS]: "Bed & Breakfast Plus",
    [MealPlanType.HB]: "Half Board",
    [MealPlanType.HB_PLUS]: "Half Board Plus",
    [MealPlanType.FB]: "Full Board",
    [MealPlanType.FB_PLUS]: "Full Board Plus",
    [MealPlanType.AI]: "All Inclusive",
    [MealPlanType.AI_PLUS]: "All Inclusive Plus",
    [MealPlanType.UAI]: "Ultra All Inclusive",
  };

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private marketService: MarketService,
    private contractService: ContractService,
    private contractRateService: ContractRateService,
    private router: Router,
    private snackBar: MatSnackBar,
    private currencyService: CurrencyService,
    private offersService: OffersService
  ) {
    this.initForm();
  }

  ngOnInit() {
    // Load hotels when component initializes
    this.hotelService.getHotels().subscribe((hotels) => {
      this.hotels.set(hotels);
    });

    // Listen to hotel selection changes to update markets
    this.searchForm.get("hotelId")?.valueChanges.subscribe((hotelId) => {
      if (hotelId) {
        this.loadMarketsForHotel(hotelId);
      } else {
        this.availableMarkets.set([]);
      }
    });
  }

  private initForm(): void {
    this.searchForm = this.fb.group({
      hotelId: ["", Validators.required],
      marketId: ["", Validators.required],
      checkIn: ["", [Validators.required]],
      checkOut: ["", [Validators.required]],
      adults: [1, [Validators.required, Validators.min(1)]],
      children: [0, [Validators.required, Validators.min(0)]],
      infants: [0, [Validators.required, Validators.min(0)]],
    });

    // Subscribe to check-in date changes
    this.searchForm.get("checkIn")?.valueChanges.subscribe((date) => {
      if (date) {
        this.updateCheckOutDate(new Date(date));
      }
    });
  }

  private updateCheckOutDate(checkInDate: Date): void {
    const minCheckOut = new Date(checkInDate);
    minCheckOut.setDate(minCheckOut.getDate() + 1); // Minimum 1 night stay

    const defaultCheckOut = new Date(checkInDate);
    defaultCheckOut.setDate(defaultCheckOut.getDate() + 3); // Default 3 nights stay

    const currentCheckOut = this.searchForm.get("checkOut")?.value;
    const currentCheckOutDate = currentCheckOut
      ? new Date(currentCheckOut)
      : null;

    // Only update if there's no check-out date or if it's before the check-in date
    if (!currentCheckOutDate || currentCheckOutDate <= checkInDate) {
      this.searchForm.patchValue({
        checkOut: defaultCheckOut.toISOString().split("T")[0],
      });
    }
  }

  viewDetails(room: RoomType): void {
    console.log("Viewing details for room:", room);
    // Implement your room details view logic here
    // For example, you might want to open a modal or navigate to a details page
  }

  getBaseMealPlan(room: RoomType): MealPlanResult {
    try {
      const contract = this.activeContract();
      if (!contract) {
        return { value: "" as MealPlanType, error: "No active contract found" };
      }
      if (!contract.baseMealPlan) {
        return { value: "" as MealPlanType, error: "No meal plan configured" };
      }
      return { value: contract.baseMealPlan };
    } catch (error) {
      return { value: "" as MealPlanType, error: "Error loading meal plan" };
    }
  }

  getMealPlanDisplayName(mealPlanResult: MealPlanResult): string {
    if (!mealPlanResult.value) {
      return mealPlanResult.error || "No meal plan";
    }

    return (
      MEAL_PLAN_NAMES[mealPlanResult.value as MealPlanType] ||
      mealPlanResult.value
    );
  }

  async onHotelChange(): Promise<void> {
    if (this.searchForm.get("marketId")?.value) {
      await this.loadActiveContract();
    }
  }

  private async loadMarketsForHotel(hotelId: number) {
    try {
      const contracts = await firstValueFrom(
        this.contractService.getContractsByHotel(hotelId)
      );

      console.log("Found contracts for hotel:", contracts);

      const activeMarketIds = [
        ...new Set(
          contracts
            .filter(
              (contract) =>
                contract.isRatesConfigured && contract.hotelId === hotelId
            )
            .map((contract) => contract.marketId)
        ),
      ];

      console.log("Active market IDs:", activeMarketIds);

      if (activeMarketIds.length === 0) {
        console.log("No configured contracts found for hotel:", hotelId);
        this.availableMarkets.set([]);
        return;
      }

      const allMarkets = await firstValueFrom(this.marketService.markets$);
      const availableMarkets = allMarkets.filter(
        (market) => activeMarketIds.includes(market.id) && market.isActive
      );

      console.log("Available markets:", availableMarkets);
      this.availableMarkets.set(availableMarkets);

      // If there's only one market, automatically select it and load its contract
      if (availableMarkets.length === 1) {
        const singleMarket = availableMarkets[0];

        // Find the configured contract for this market
        const marketContract = contracts.find(
          (contract) =>
            contract.marketId === singleMarket.id && contract.isRatesConfigured
        );

        if (marketContract) {
          // Set the market ID in the form
          this.searchForm.patchValue({ marketId: singleMarket.id });

          // Set the active contract
          this.activeContract.set(marketContract);

          // Load contract rates
          const rates = await this.contractRateService.getContractRates(
            marketContract.id
          );
          this.contractRates.set(rates);

          // Load periods for the contract's season
          if (marketContract.seasonId) {
            try {
              const periods = await firstValueFrom(
                this.contractService.getPeriods(marketContract.seasonId)
              );
              this.periods.set(periods);

              // Log contract selection
              console.log("Automatically selected and loaded contract:", {
                marketId: singleMarket.id,
                marketName: singleMarket.name,
                contract: {
                  id: marketContract.id,
                  hotelId: marketContract.hotelId,
                  marketId: marketContract.marketId,
                  selectedRoomTypes: marketContract.selectedRoomTypes,
                },
              });

              // Add new logging for available booking dates
              console.log(
                "Available booking periods:",
                periods.map((period) => ({
                  periodId: period.id,
                  dateRange: `${new Date(
                    period.startDate
                  ).toLocaleDateString()} - ${new Date(
                    period.endDate
                  ).toLocaleDateString()}`,
                }))
              );

              console.log(
                "Tip: Try searching with 1 adult to see all available rooms. You can then adjust occupancy as needed."
              );
            } catch (error) {
              console.error("Error loading periods:", error);
              this.periods.set([]);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error loading markets for hotel:", error);
      this.availableMarkets.set([]);
    }
  }

  protected getCurrencySymbol = computed(() => {
    const currency = this.marketCurrency();
    if (!currency) {
      // Return a default currency symbol instead of throwing an error
      return "€";
    }

    try {
      const currencySetting = this.currencyService.getCurrencyByCode(currency);
      return currencySetting?.symbol || "€";
    } catch (error) {
      console.warn("Error getting currency symbol:", error);
      return "€";
    }
  });

  private async loadActiveContract(): Promise<void> {
    const { hotelId, marketId } = this.searchForm.value;
    if (!hotelId || !marketId) return;

    try {
      // Get active contract for hotel and market
      const contract = await this.contractService.getActiveContract(
        hotelId,
        marketId
      );
      if (contract) {
        this.activeContract.set(contract);
        // Load contract rates
        const rates = await this.contractRateService.getContractRates(
          contract.id
        );
        this.contractRates.set(rates);
      }
    } catch (error) {
      console.error("Error loading contract:", error);
    }
  }

  // Computed value for available rooms based on occupancy
  async loadRoomTypes(hotelId: number) {
    try {
      const rooms = await firstValueFrom(
        this.hotelService.getRoomTypes(hotelId)
      );
      this.roomTypes.set(rooms);
    } catch (error) {
      console.error("Error loading room types:", error);
      this.roomTypes.set([]);
    }
  }

  async searchRooms() {
    const { hotelId, marketId, checkIn, checkOut, adults, children, infants } =
      this.searchForm.value;

    // Validate market and currency first
    if (!marketId) {
      throw new Error("Market must be selected");
    }

    const market = await firstValueFrom(this.marketService.markets$).then(
      (markets) => markets.find((m) => m.id === marketId)
    );

    if (!market) {
      throw new Error("Selected market not found");
    }

    if (!market.currency) {
      throw new Error("Selected market has no currency configured");
    }

    // Validate against initial booking if cart has items
    if (this.cartItems().length > 0) {
      const initial = this.initialBooking();
      if (!initial) {
        throw new Error("Initial booking data not found");
      }

      if (hotelId !== initial.hotelId || marketId !== initial.marketId) {
        throw new Error("Cannot change hotel or market while cart has items");
      }

      if (initial.checkIn && initial.checkOut && checkIn && checkOut) {
        const newCheckIn = new Date(checkIn);
        const newCheckOut = new Date(checkOut);

        if (newCheckIn < initial.checkIn || newCheckOut > initial.checkOut) {
          throw new Error("New room dates must be within initial stay period");
        }
      }
    }

    // Continue with room search only if we have valid market and currency
    const contract = this.activeContract();
    if (!contract) {
      throw new Error("No active contract found");
    }

    try {
      // Temporarily skip date validation for testing
      /* Comment out date validation for now
      const checkInDate = new Date(checkIn);
      const validPeriods = this.periods().filter(period => {
        const periodStart = new Date(period.startDate);
        const periodEnd = new Date(period.endDate);
        return checkInDate >= periodStart && checkInDate <= periodEnd;
      });

      if (validPeriods.length === 0) {
        console.warn('No valid periods found for the selected check-in date');
        this.filteredRooms.set([]);
        return;
      }
      */

      // Get room types for the hotel
      await this.loadRoomTypes(hotelId);

      // Filter rooms based on contract and occupancy only
      const filtered = this.roomTypes().filter((room) => {
        // Check if room is in active contract
        const isInContract = this.activeContract()?.selectedRoomTypes.includes(
          room.id
        );

        // Check occupancy requirements
        const meetsOccupancy =
          room.maxOccupancy.adults >= (adults || 1) &&
          room.maxOccupancy.children >= (children || 0) &&
          room.maxOccupancy.infants >= (infants || 0);

        // Skip period validation for now
        const hasValidRates = this.getRoomRate(room) !== null;

        return isInContract && meetsOccupancy && hasValidRates;
      });

      console.log("Filtered rooms:", filtered);
      this.filteredRooms.set(filtered);
    } catch (error) {
      console.error("Error searching rooms:", error);
      this.filteredRooms.set([]);
    }
  }

  private getPeriodForDate(checkInDate: Date, periodId: number): Period | null {
    return (
      this.periods().find(
        (period) =>
          period.id === periodId &&
          new Date(checkInDate) >= new Date(period.startDate) &&
          new Date(checkInDate) <= new Date(period.endDate)
      ) || null
    );
  }

  protected getRoomRate(room: RoomType): number | null {
    try {
      const { checkIn, marketId } = this.searchForm.value;
      const contract = this.activeContract();

      if (!contract) {
        console.warn("No active contract found when getting room rate");
        return null;
      }

      if (!checkIn) {
        console.warn("Check-in date must be selected to get room rate");
        return null;
      }

      const rates = this.contractRates();
      if (!rates?.length) {
        console.warn("No rates configured for contract:", contract.id);
        return null;
      }

      // Find the applicable period rate based on check-in date
      const checkInDate = new Date(checkIn);
      const periodRate = rates.find((rate) => {
        const period = this.periods().find((p) => p.id === rate.periodId);
        if (!period) return false;

        const startDate = new Date(period.startDate);
        const endDate = new Date(period.endDate);
        return checkInDate >= startDate && checkInDate <= endDate;
      });

      if (!periodRate) {
        console.warn("No rate found for check-in date:", checkInDate);
        return null;
      }

      // Find the room rate within the period
      const roomRate = periodRate.roomRates.find(
        (r) => r.roomTypeId === room.id
      );
      if (!roomRate) {
        console.warn("No room rate found for room:", room.id);
        return null;
      }

      // Calculate total rate based on rate type and occupancy
      if (roomRate.rateType === "per_villa") {
        return roomRate.villaRate || null;
      } else {
        // Handle per_pax rate calculation
        const { adults = 1, children = 0, infants = 0 } = this.searchForm.value;

        let total = 0;
        const personTypeRates = roomRate.personTypeRates;

        // Calculate adult rates
        if (adults && personTypeRates?.["adult"]?.rates) {
          for (let i = 1; i <= adults; i++) {
            total += personTypeRates["adult"].rates[i] || 0;
          }
        }

        // Calculate child rates
        if (children && personTypeRates?.["child"]?.rates) {
          for (let i = 1; i <= children; i++) {
            total += personTypeRates["child"].rates[i] || 0;
          }
        }

        // Calculate infant rates
        if (infants && personTypeRates?.["infant"]?.rates) {
          for (let i = 1; i <= infants; i++) {
            total += personTypeRates["infant"].rates[i] || 0;
          }
        }

        return total || null;
      }
    } catch (error) {
      console.error("Error calculating room rate:", error);
      return null;
    }
  }

  async onMarketChange(): Promise<void> {
    try {
      const { hotelId, marketId } = this.searchForm.value;

      // Reset all related data first
      this.marketCurrency.set(null);
      this.activeContract.set(null);
      this.contractRates.set([]);
      this.periods.set([]);

      if (!marketId) {
        console.warn("Market must be selected");
        return;
      }

      // Load market data for currency
      const market = await firstValueFrom(this.marketService.markets$).then(
        (markets) => markets.find((m) => m.id === marketId)
      );

      if (!market) {
        console.warn("Selected market not found:", marketId);
        return;
      }

      if (!market.currency) {
        console.warn("Selected market has no currency configured:", marketId);
        this.marketCurrency.set(null); // Ensure marketCurrency is reset
        return;
      }

      // Set market currency
      this.marketCurrency.set(market.currency);

      if (!hotelId) {
        console.warn("Hotel must be selected");
        return;
      }

      // Get active contract for selected hotel and market
      const contract = await this.contractService.getActiveContract(
        hotelId,
        marketId
      );
      if (!contract) {
        console.warn("No active contract found for hotel and market:", {
          hotelId,
          marketId,
        });
        return;
      }

      // Set active contract
      this.activeContract.set(contract);
      console.log("Active contract set:", {
        id: contract.id,
        hotelId: contract.hotelId,
        marketId: contract.marketId,
        selectedRoomTypes: contract.selectedRoomTypes,
      });

      // Load contract rates
      const rates = await this.contractRateService.getContractRates(
        contract.id
      );
      this.contractRates.set(rates);
      console.log("Contract rates loaded:", rates);

      // Load periods if available
      if (contract.seasonId) {
        const periods = await firstValueFrom(
          this.contractService.getPeriods(contract.seasonId)
        );
        this.periods.set(periods);
        console.log("Contract periods loaded:", periods);
      }

      // Reset room selection since available rooms may have changed
      this.searchForm.patchValue({ roomTypeId: null });
    } catch (error) {
      console.error("Error in onMarketChange:", error);
      // Reset all related data on error
      this.marketCurrency.set(null);
      this.activeContract.set(null);
      this.contractRates.set([]);
      this.periods.set([]);
      throw error; // Re-throw for upper level handling
    }
  }

  // private getMealPlanName(mealPlanType: MealPlanType): string {
  //   return MEAL_PLAN_NAMES[mealPlanType] || mealPlanType;
  // }

  selectRoom(room: RoomType): void {
    const contract = this.activeContract();
    if (!contract) return;

    // Get base meal plan and rate
    const baseMealPlan = this.getBaseMealPlan(room);
    const baseRate = this.getRoomRate(room);

    // Early return if no valid rate is found
    if (baseRate === null) {
      console.warn("No valid rate found for room:", room);
      return;
    }

    // Get available supplements
    const supplements = this.getAvailableMealPlanSupplements(room, contract);

    this.getAvailableOffers(room);

    // Update current step with non-null baseRate
    this.currentStep.set({
      room,
      baseRate: baseRate,
      supplementRates: supplements,
      selectedMealPlans: [],
      total: baseRate,
    });

    // Move to next step
    this.stepper.next();
  }

  updateMealPlanSelection(options: MatListOption[]): void {
    const selectedPlans = options
      .filter((option) => option.selected)
      .map((option) => option.value as MealPlanType);

    const current = this.currentStep();
    if (!current.room) return;

    // Recalculate total with supplements
    const total = this.calculateTotal(
      current.baseRate!,
      selectedPlans,
      current.supplementRates!
    );

    this.currentStep.set({
      ...current,
      selectedMealPlans: selectedPlans,
      total,
    });
  }

  private getAvailableMealPlanSupplements(
    room: RoomType,
    contract: Contract
  ): {
    type: MealPlanType;
    name: string;
    rates: {
      adult: number;
      child: number;
      infant: number;
    };
  }[] {
    try {
      // Ensure selectedMealPlans is typed as MealPlanType[]
      const supplementPlans = (
        contract.selectedMealPlans as MealPlanType[]
      ).filter((planType) => planType !== contract.baseMealPlan);

      return supplementPlans.map((planType) => {
        const rates = this.getMealPlanRates(room, planType);
        return {
          type: planType,
          name: MEAL_PLAN_NAMES[planType],
          rates,
        };
      });
    } catch (error) {
      console.error("Error getting meal plan supplements:", error);
      return [];
    }
  }

  private getMealPlanRates(
    room: RoomType,
    mealPlanType: MealPlanType
  ): {
    adult: number;
    child: number;
    infant: number;
  } {
    const contract = this.activeContract();
    if (!contract) {
      throw new Error("No active contract found");
    }

    // Get the room's rate configuration from the contract
    const periodRate = this.contractRates()?.find((rate) =>
      rate.roomRates.some((roomRate) => roomRate.roomTypeId === room.id)
    );

    if (!periodRate) {
      throw new Error("No rate configuration found for room");
    }

    // Find the specific room rate
    const roomRate = periodRate.roomRates.find(
      (rate) => rate.roomTypeId === room.id
    );
    if (!roomRate) {
      throw new Error("Room rate configuration not found");
    }

    // Get the specific meal plan rates
    const mealPlanRates = roomRate.mealPlanRates?.[mealPlanType];
    if (!mealPlanRates) {
      throw new Error("Meal plan rates not configured");
    }

    return {
      adult: mealPlanRates.adult,
      child: mealPlanRates.child,
      infant: mealPlanRates.infant,
    };
  }

  private calculateTotal(
    baseRate: number,
    selectedPlans: MealPlanType[],
    supplementRates: {
      type: MealPlanType;
      name: string;
      rates: {
        adult: number;
        child: number;
        infant: number;
      };
    }[]
  ): number {
    const supplementTotal = selectedPlans.reduce((total, planType) => {
      const supplement = supplementRates.find((s) => s.type === planType);
      if (!supplement) return total;

      // Get occupancy from search form
      const adults = this.searchForm.get("adults")?.value || 0;
      const children = this.searchForm.get("children")?.value || 0;
      const infants = this.searchForm.get("infants")?.value || 0;

      // Calculate supplement total for all occupants
      const supplementTotal =
        adults * supplement.rates.adult +
        children * supplement.rates.child +
        infants * supplement.rates.infant;

      return total + supplementTotal;
    }, 0);

    return baseRate + supplementTotal;
  }

  public calculateCartTotal(): number {
    return this.cartItems().reduce(
      (total, item) => total + (item.total || 0),
      0
    );
  }

  addToCart(): void {
    const current = this.currentStep();
    if (!current.room) return;

    // If this is the first item being added to cart
    if (this.cartItems().length === 0) {
      // Store initial booking parameters
      const { hotelId, marketId, checkIn, checkOut } = this.searchForm.value;
      this.initialBooking.set({
        hotelId,
        marketId,
        checkIn: checkIn ? new Date(checkIn) : undefined,
        checkOut: checkOut ? new Date(checkOut) : undefined,
      });

      // Disable hotel and market selection in the form
      this.searchForm.get("hotelId")?.disable();
      this.searchForm.get("marketId")?.disable();
    }

    this.cartItems.update((items) => [...items, current]);
    this.currentStep.set({});
    this.stepper.reset();

    // Show success message
    this.snackBar.open("Room added to cart successfully", "Close", {
      duration: 3000,
    });
  }

  clearCart(): void {
    if (
      confirm(
        "Are you sure you want to clear your cart? This will reset all your selections."
      )
    ) {
      this.cartItems.set([]);
      this.initialBooking.set(null);
      this.searchForm.get("hotelId")?.enable();
      this.searchForm.get("marketId")?.enable();
      this.stepper.reset();
    }
  }

  proceedToCart(): void {
    if (this.cartItems().length === 0) {
      this.snackBar.open("Your cart is empty", "Close", { duration: 3000 });
      return;
    }

    // Save cart items to localStorage before navigation
    try {
      localStorage.setItem("bookingCart", JSON.stringify(this.cartItems()));

      // Update the navigation path to include the booking prefix
      this.router
        .navigate(["/booking/cart"])
        .then(() => {
          console.log("Navigation to cart successful");
        })
        .catch((error) => {
          console.error("Navigation error:", error);
          this.snackBar.open("Error navigating to cart", "Close", {
            duration: 3000,
          });
        });
    } catch (error) {
      console.error("Error saving cart data:", error);
      this.snackBar.open("Error saving cart data", "Close", { duration: 3000 });
    }
  }

  getRelatedOffers(room: RoomType): SpecialOffer[] {
    const { checkIn, checkOut } = this.searchForm.value;
    if (!checkIn || !checkOut) return [];

    return this.offersService.getApplicableOffers(
      new Date(checkIn),
      new Date(checkOut),
      room.id
    );
  }

  isOfferDisabled(offer: SpecialOffer): boolean {
    const selectedOffers = this.selectedOffers();
    
    // If no offers are selected, none should be disabled
    if (selectedOffers.length === 0) return false;
    
    // If combinable offers are selected, only disable cumulative offers
    if (selectedOffers.some(o => o.type === 'combinable')) {
        return offer.type === 'cumulative';
    }
    
    // If a cumulative offer is selected, only disable combinable offers
    if (selectedOffers.some(o => o.type === 'cumulative')) {
        return offer.type === 'combinable';
    }
    
    return false;
}


  getApplicableDiscount(offer: SpecialOffer): number {
    const { checkIn, checkOut } = this.searchForm.value;
    if (!checkIn || !checkOut) return 0;

    // Calculate nights
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Find applicable discount value based on dates and conditions
    const applicableValue = offer.discountValues.find((discount) => {
      // If no specific dates, use the first discount value
      if (!discount.startDate || !discount.endDate) return true;

      const discountStart = new Date(discount.startDate);
      const discountEnd = new Date(discount.endDate);

      return (
        start >= discountStart &&
        end <= discountEnd &&
        (!offer.minimumNights || nights >= offer.minimumNights)
      );
    });

    return applicableValue?.value || offer.discountValues[0].value;
  }

  getStayDuration(): number {
    const { checkIn, checkOut } = this.searchForm.value;
    if (!checkIn || !checkOut) return 0;

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  isOfferSelected(offer: SpecialOffer): boolean {
    return this.selectedOffers().some((o) => o.id === offer.id);
  }

  getAvailableOffers(room: RoomType): void {
    const { checkIn, checkOut } = this.searchForm.value;
    if (!checkIn || !checkOut) {
      this.availableOffers.set([]);
      return;
    }

    const offers = this.offersService.getApplicableOffers(
      new Date(checkIn),
      new Date(checkOut),
      room.id
    );
    this.availableOffers.set(offers);
  }

  toggleOffer(offer: SpecialOffer, checked: boolean): void {
    if (checked) {
      // If selecting a cumulative offer, clear all other offers
      if (offer.type === "cumulative") {
        this.selectedOffers.set([offer]);
      } else {
        // If selecting a combinable offer, add it to the selection
        this.selectedOffers.update((offers) => [...offers, offer]);
      }
    } else {
      // Remove the offer from selection and enable all offers
      this.selectedOffers.update((offers) =>
        offers.filter((o) => o.id !== offer.id)
      );
    }

    // Recalculate total with selected offers
    this.updateTotalWithOffers();
  }

  private updateTotalWithOffers(): void {
    const current = this.currentStep();
    if (!current.room || !current.baseRate) return;

    const totalBeforeOffers = this.calculateTotal(
      current.baseRate,
      current.selectedMealPlans || [],
      current.supplementRates || []
    );

    // Apply offers to total
    const finalTotal = this.applyOffers(totalBeforeOffers);

    this.currentStep.set({
      ...current,
      total: finalTotal,
    });
  }

  private applyOffers(total: number): number {
    const selectedOffers = this.selectedOffers();
    if (!selectedOffers.length) return total;

    // Check if offers are cumulative (they should all be of the same type due to our selection logic)
    const isCumulative = selectedOffers[0].type === 'cumulative';

    if (isCumulative) {
        // For cumulative offers, sum all percentages and apply once
        const totalDiscountPercentage = selectedOffers.reduce((sum, offer) => {
            const discountValue = this.getApplicableDiscount(offer);
            return sum + (offer.discountType === 'percentage' ? discountValue : 0);
        }, 0);

        // Apply total percentage discount
        const discountedTotal = total * (1 - totalDiscountPercentage / 100);

        // Apply any fixed amounts after percentage
        return selectedOffers.reduce((currentTotal, offer) => {
            const discountValue = this.getApplicableDiscount(offer);
            return offer.discountType === 'fixed' 
                ? currentTotal - discountValue 
                : currentTotal;
        }, discountedTotal);

    } else {
        // For combinable offers, apply each discount sequentially
        return selectedOffers.reduce((currentTotal, offer) => {
            const discountValue = this.getApplicableDiscount(offer);
            if (offer.discountType === 'percentage') {
                return currentTotal * (1 - discountValue / 100);
            }
            return currentTotal - discountValue;
        }, total);
    }
}


  // private handlePricingError(error: PricingError) {
  //   if (error.code === 'NO_CURRENCY_CONFIGURED') {
  //     this.snackBar.open(
  //       'Unable to display prices. Market currency not configured.',
  //       'Close',
  //       { duration: 5000 }
  //     );
  //   }
  //   // Handle other pricing-related errors
  // }

  // protected displayPrice(amount: number): string {
  //   try {
  //     const currency = this.getCurrencySymbol();
  //     return `${currency}${amount.toFixed(2)}`;
  //   } catch (error) {
  //     this.handlePricingError(error as PricingError);
  //     throw error; // Re-throw to prevent displaying invalid pricing
  //   }
  // }
}
