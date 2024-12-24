import { CurrencyService } from './../../services/currency.service';
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
    private currencyService: CurrencyService
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
                contract.status === "active" &&
                contract.isRatesConfigured &&
                contract.hotelId === hotelId
            )
            .map((contract) => contract.marketId)
        ),
      ];

      console.log("Active market IDs:", activeMarketIds);

      if (activeMarketIds.length === 0) {
        console.log("No active contracts found for hotel:", hotelId);
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

        // Find the active contract for this market
        const marketContract = contracts.find(
          (contract) =>
            contract.marketId === singleMarket.id &&
            contract.status === "active" &&
            contract.isRatesConfigured
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
                  status: marketContract.status,
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

          console.log("Automatically selected and loaded contract:", {
            marketId: singleMarket.id,
            marketName: singleMarket.name,
            contract: {
              id: marketContract.id,
              hotelId: marketContract.hotelId,
              marketId: marketContract.marketId,
              status: marketContract.status,
              selectedRoomTypes: marketContract.selectedRoomTypes,
            },
          });
        }
      }
    } catch (error) {
      console.error("Error loading markets for hotel:", error);
      this.availableMarkets.set([]);
    }
  }

  async onMarketChange() {
    const { hotelId, marketId } = this.searchForm.value;
    if (!hotelId || !marketId) return;

    try {
      // Get active contract for selected hotel and market
      const contract = await this.contractService.getActiveContract(
        hotelId,
        marketId
      );
      if (contract) {
        this.activeContract.set(contract);

        // Add detailed console logging about the selected contract
        console.log("Selected Market ID:", marketId);
        console.log("Selected Contract:", {
          id: contract.id,
          hotelId: contract.hotelId,
          marketId: contract.marketId,
          status: contract.status,
          selectedRoomTypes: contract.selectedRoomTypes,
        });

        // Load contract rates
        const rates = await this.contractRateService.getContractRates(
          contract.id
        );
        this.contractRates.set(rates);

        // Load periods for the contract's season
        if (contract.seasonId) {
          try {
            const periods = await firstValueFrom(
              this.contractService.getPeriods(contract.seasonId)
            );
            this.periods.set(periods);
            console.log("Loaded periods:", periods);
          } catch (error) {
            console.error("Error loading periods:", error);
            this.periods.set([]);
          }
        }

        // Reset room selection since available rooms may have changed
        this.searchForm.patchValue({ roomTypeId: null });
      } else {
        console.warn("No active contract found for hotel and market");
        this.activeContract.set(null);
        this.contractRates.set([]);
        this.periods.set([]);
      }
    } catch (error) {
      console.error("Error loading contract data:", error);
    }
  }

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

    // Validate against initial booking if cart has items
    if (this.cartItems().length > 0) {
      const initial = this.initialBooking();
      if (!initial) return;

      // Validate hotel and market haven't changed
      if (hotelId !== initial.hotelId || marketId !== initial.marketId) {
        this.snackBar.open(
          "You cannot change hotel or market while you have items in your cart",
          "Close",
          { duration: 5000 }
        );
        return;
      }

      // Validate dates are within the same stay period
      if (initial.checkIn && initial.checkOut) {
        const newCheckIn = new Date(checkIn);
        const newCheckOut = new Date(checkOut);

        if (newCheckIn < initial.checkIn || newCheckOut > initial.checkOut) {
          this.snackBar.open(
            "New room dates must be within your initial stay period",
            "Close",
            { duration: 5000 }
          );
          return;
        }
      }
    }

    if (!this.activeContract()) {
      console.warn("No active contract found");
      this.filteredRooms.set([]);
      return;
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

  getRoomRate(room: RoomType): number | null {
    // Changed return type to include null
    const { checkIn, marketId, adults, children } = this.searchForm.value;
    const contract = this.activeContract();

    if (!contract || !checkIn) return null; // Return null instead of 0

    // Get rates for the contract
    const rates = this.contractRates();
    if (!rates.length) return null; // Return null instead of 0

    // For now, we'll use the first available rate for the room
    const periodRate = rates[0];
    if (!periodRate) return null; // Return null instead of 0

    // Find the room rate within the period
    const roomRate = periodRate.roomRates.find((r) => r.roomTypeId === room.id);
    if (!roomRate) return null; // Return null instead of 0

    // Calculate total rate based on rate type and occupancy
    if (roomRate.rateType === "per_villa") {
      return roomRate.villaRate || null; // Return null if villaRate is 0
    } else {
      // Handle per_pax rate calculation
      const adultRates = Object.values(
        roomRate.personTypeRates?.['adult']?.rates || {}
      );
      if (!adultRates.length) return null;

      return adultRates[0] || null; // Return null if first adult rate is 0
    }
  }

  getMarketCurrency(): string {
    const marketId = this.searchForm.get('marketId')?.value;
    if (!marketId) return '€'; // Default currency if no market selected
    
    const market = this.marketService.getMarketById(marketId);
    const currencySetting = this.currencyService.getCurrencyByCode(market?.currency || 'EUR');
    
    return currencySetting?.symbol || '€'; // Return the currency symbol or default to € if not found
  }
  
  private getActiveContractForRoom(
    roomId: number,
    marketId: number
  ): Contract | null {
    return (
      this.contracts().find(
        (contract) =>
          contract.marketId === marketId &&
          contract.selectedRoomTypes.includes(roomId) &&
          contract.status === "active"
      ) || null
    );
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
      console.warn('No valid rate found for room:', room);
      return;
    }
    
    // Get available supplements
    const supplements = this.getAvailableMealPlanSupplements(room, contract);
  
    // Update current step with non-null baseRate
    this.currentStep.set({
      room,
      baseRate: baseRate, // Now we know baseRate is not null
      supplementRates: supplements,
      selectedMealPlans: [],
      total: baseRate, // Now we know baseRate is not null
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
      return { adult: 0, child: 0, infant: 0 };
    }

    // Get the room's rate configuration from the contract
    const periodRate = this.contractRates()?.find((rate) =>
      rate.roomRates.some((roomRate) => roomRate.roomTypeId === room.id)
    );

    if (!periodRate) {
      return { adult: 0, child: 0, infant: 0 };
    }

    // Find the specific room rate
    const roomRate = periodRate.roomRates.find(
      (rate) => rate.roomTypeId === room.id
    );

    // Get the specific meal plan rates
    const mealPlanRates = roomRate?.mealPlanRates?.[mealPlanType];

    return {
      adult: mealPlanRates?.adult || 0,
      child: mealPlanRates?.child || 0,
      infant: mealPlanRates?.infant || 0,
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

    // Navigate to cart page
    this.router.navigate(["/cart"]);
  }
}
