import { ReservationService } from "./../../services/reservation.service";
import { SeasonService } from "src/app/services/season.service";
import { CurrencyService } from "./../../services/currency.service";
// src/app/components/reservation/reservation.component.ts
import { Component, Input, ViewChild, computed, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
  FormsModule,
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
  ReservationStep,
  PeriodRateInfo,
  PeriodBreakdown,
  PeriodCalculation,
  PeriodCalculationDetail,
} from "../../models/types";
import { ContractService } from "src/app/services/contract.service";
import { ContractRateService } from "src/app/services/contract-rates.service";
import {
  firstValueFrom,
  from,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from "rxjs";
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
import { MAT_DATE_FORMATS } from "@angular/material/core";

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

interface PeriodRateBreakdown {
  periodName: string;
  startDate: Date;
  endDate: Date;
  rate: number;
  nights: number;
  subtotal: number;
}

interface OfferApplicationBreakdown {
  dateRange: string;
  startDate: Date;
  endDate: Date;
  baseRate: number;
  nights: number;
  baseAmount: number;
  appliedOffers: {
    name: string;
    type: "combinable" | "cumulative";
    discount: number;
  }[];
  finalAmount: number;
}

interface DetailedPeriodBreakdown {
  periodName: string;
  dateRange: string;
  baseRate: number;
  nights: number;
  baseSubtotal: number;
  offerBreakdowns: OfferApplicationBreakdown[];
  finalTotal: number;
}

interface PersonTypeRates {
  rates: {
    [key: number]: number;
    extra: number;
  };
}

interface PeriodDetail {
  periodName: string;
  dateRange: string;
  baseRate: number;
  nights: number;
  subtotal: number;
  offerBreakdowns: Array<{
    dateRange: string;
    nights: number;
    baseAmount: number;
    appliedOffers: Array<{
      name: string;
      type: string;
      discount: number;
    }>;
    finalAmount: number;
  }>;
  periodTotal: number;
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

interface RoomWithRate extends RoomType {
  periodRates: PeriodRateInfo[];
}

interface MarketConfig {
  currency: string;
  // other market-specific configurations
}

interface PricingError extends Error {
  code: string;
  context?: any;
}

const MY_DATE_FORMATS = {
  parse: {
    dateInput: "dd/MM/yyyy",
  },
  display: {
    dateInput: "dd/MM/yyyy",
    monthYearLabel: "MMM yyyy",
    dateA11yLabel: "dd/MM/yyyy",
    monthYearA11yLabel: "MMMM yyyy",
  },
};

@Component({
  selector: "app-reservation",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
  providers: [{ provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }],
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

  isCartView = signal(false);

  searchPerformed = signal(false);

  @ViewChild("stepper") stepper!: MatStepper;

  checkInDate = signal<Date | null>(null);
  checkOutDate = signal<Date | null>(null);
  adults = signal<number>(1);
  children = signal<number>(0);
  infants = signal<number>(0);
  selectedHotel = signal<Hotel | null>(null);
  periodRates = signal<PeriodRateInfo[]>([]);

  roomRates = signal<Map<number, PeriodRateInfo[]>>(new Map());

  christmasDinnerAdultPrice: number = 0;
  christmasDinnerChildPrice: number = 0;
  newYearsEveDinnerAdultPrice: number = 0;
  newYearsEveDinnerChildPrice: number = 0;

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

  private getHolidayDates(year: number): {
    christmasEve: Date;
    newYearsEve: Date;
  } {
    const christmasEve = new Date(year, 11, 24); // Month is 0-indexed (December = 11)
    const newYearsEve = new Date(year, 11, 31);
    return { christmasEve, newYearsEve };
  }

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private marketService: MarketService,
    private contractService: ContractService,
    private contractRateService: ContractRateService,
    private router: Router,
    private snackBar: MatSnackBar,
    private currencyService: CurrencyService,
    private offersService: OffersService,
    private seasonService: SeasonService,
    private reservationService: ReservationService
  ) {
    this.initForm();
  }

  ngOnInit() {
    // Load hotels when component initializes
    this.hotelService.getHotels().subscribe((hotels) => {
      this.hotels.set(hotels);
    });

    this.searchForm.get("checkIn")?.valueChanges.subscribe((date) => {
      if (date) {
        this.checkInDate.set(new Date(date));
        this.updateCheckOutDate(new Date(date));
      }
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
    // Définir les dates par défaut
    const today = new Date();
    const checkIn = new Date(today);
    checkIn.setDate(today.getDate() + 1); // Par défaut commence demain

    const checkOut = new Date(checkIn);
    checkOut.setDate(checkIn.getDate() + 2); // Séjour de 2 nuits par défaut

    this.searchForm = this.fb.group(
      {
        hotelId: ["", Validators.required],
        marketId: ["", Validators.required],
        checkIn: [checkIn, Validators.required], // Pre-fill with tomorrow
        checkOut: [checkOut, Validators.required], // Pre-fill with day after tomorrow
        adults: [0, [Validators.min(0), Validators.max(4)]], // Allow 0 adults
        children: [0, [Validators.min(0), Validators.max(3)]],
        infants: [0, [Validators.min(0), Validators.max(2)]],
      },
      {
        validators: [
          this.validateDates(),
          this.validateOccupancy(), // New occupancy validator
        ],
      }
    );

    // Subscribe to check-in date changes
    this.searchForm.get("checkIn")?.valueChanges.subscribe((date) => {
      if (date) {
        this.updateCheckOutDate(new Date(date));
      }
    });
  }

  private validateOccupancy(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const adults = formGroup.get("adults")?.value || 0;
      const children = formGroup.get("children")?.value || 0;
      const infants = formGroup.get("infants")?.value || 0;

      // Au moins un enfant ou un adulte est requis
      if (adults === 0 && children === 0) {
        return { noOccupants: true };
      }

      // Si il y a des bébés, vérifier qu'il y a au moins un enfant
      if (infants > 0 && children === 0) {
        return { infantRequiresChild: true };
      }

      return null;
    };
  }

  private validateDates(): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const checkIn = formGroup.get("checkIn")?.value;
      const checkOut = formGroup.get("checkOut")?.value;

      if (!checkIn || !checkOut) return null;

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (checkOutDate <= checkInDate) {
        return { invalidDateRange: true };
      }

      return null;
    };
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
    const hotelId = this.searchForm.get("hotelId")?.value;
    if (hotelId) {
      const hotel = this.hotels().find((h) => h.id === hotelId);
      this.selectedHotel.set(hotel || null);
      await this.loadMarketsForHotel(hotelId);
    }
  }

  private async loadMarketsForHotel(hotelId: number) {
    try {
      const contracts = await firstValueFrom(
        this.reservationService.getContractsForReservation(hotelId)
      );

      console.log("Found contracts for hotel:", contracts);

      const activeMarketIds = [
        ...new Set(
          contracts
            .filter((contract) => {
              console.log("Checking contract:", {
                id: contract.id,
                hotelId: contract.hotelId,
                marketId: contract.marketId,
                isRatesConfigured: contract.isRatesConfigured,
                expectedHotelId: hotelId,
              });
              return contract.isRatesConfigured && contract.hotelId === hotelId;
            })
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
      this.markets.set(availableMarkets);

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

  private calculateExactRateForPeriod(
    room: RoomType,
    period: Period,
    occupancy: { adults: number; children: number; infants: number }
  ): number {
    const contractRate = this.contractRates().find(
      (rate) => rate.periodId === period.id
    );
    const roomRate = contractRate?.roomRates.find(
      (rate) => rate.roomTypeId === room.id
    );

    if (!roomRate?.personTypeRates) return 0;

    let totalRate = 0;
    const { adult, child, infant } = roomRate.personTypeRates;

    // Calculate adult rates using progressive pricing
    for (let i = 1; i <= occupancy.adults; i++) {
      totalRate = adult?.rates[i] || 0;
    }

    // Calculate child rates using progressive pricing
    for (let i = 1; i <= occupancy.children; i++) {
      totalRate += child?.rates[i] || 0;
    }

    // Calculate infant rates using progressive pricing
    for (let i = 1; i <= occupancy.infants; i++) {
      totalRate += infant?.rates[i] || 0;
    }

    return totalRate;
  }

  async searchRooms() {
    const { hotelId, marketId, checkIn, checkOut, adults, children, infants } =
      this.searchForm.value;
    const occupancy = { adults, children, infants };

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const seasonId = this.activeContract()?.seasonId;

    if (seasonId) {
      const overlappingPeriods = await firstValueFrom(
        this.reservationService.getPeriodsFromBooking(
          checkInDate,
          checkOutDate,
          seasonId
        )
      );

      await this.loadRoomTypes(hotelId);

      // Create a new Map to store rates for each room
      const ratesMap = new Map<number, PeriodRateInfo[]>();

      const filteredRooms = this.roomTypes().filter((room) => {
        const meetsOccupancy =
          room.maxOccupancy.adults >= occupancy.adults &&
          room.maxOccupancy.children >= occupancy.children &&
          room.maxOccupancy.infants >= occupancy.infants;

        const isInContract = this.activeContract()?.selectedRoomTypes.includes(
          room.id
        );

        const roomPeriodRates = overlappingPeriods.map((period) => ({
          name: period.name,
          startDate: period.startDate,
          endDate: period.endDate,
          rate: this.calculateExactRateForPeriod(room, period, occupancy),
        }));

        // Store rates for this room
        ratesMap.set(room.id, roomPeriodRates);

        return (
          meetsOccupancy &&
          isInContract &&
          roomPeriodRates.some((rate) => rate.rate > 0)
        );
      });

      this.roomRates.set(ratesMap);
      this.filteredRooms.set(filteredRooms);
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
      const { checkIn } = this.searchForm.value;
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
            total = personTypeRates["adult"].rates[i] || 0;
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

      const hotel = this.hotels().find((h) => h.id === hotelId);
      this.selectedHotel.set(hotel || null);

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
      } else {
        this.markets.set([market]);
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

  selectRoom(room: RoomType): void {
    const contract = this.activeContract();
    if (!contract) {
      console.warn("No active contract found");
      return;
    }

    // Get base meal plan
    const baseMealPlan = this.getBaseMealPlan(room);

    // Calculate total from period breakdown
    const periodBreakdown = this.calculatePeriodBreakdown(room);
    const totalRate = periodBreakdown.reduce((sum, b) => sum + b.subtotal, 0);

    if (totalRate === 0) {
      console.warn("No valid rate found for room:", room);
      return;
    }

    // Store the previous search values
    const previousSearch = {
      checkIn: this.searchForm.get("checkIn")?.value,
      checkOut: this.searchForm.get("checkOut")?.value,
      adults: this.searchForm.get("adults")?.value,
      children: this.searchForm.get("children")?.value,
      infants: this.searchForm.get("infants")?.value,
      hotelId: this.searchForm.get("hotelId")?.value,
      marketId: this.searchForm.get("marketId")?.value,
    };

    // Reset the form but keep it pristine
    this.searchForm.reset(previousSearch, { emitEvent: false });

    // Reset form status without marking fields as touched
    Object.keys(this.searchForm.controls).forEach((key) => {
      const control = this.searchForm.get(key);
      control?.setErrors(null);
      control?.markAsUntouched();
    });

    // Hide available rooms
    this.filteredRooms.set([]);

    // Get available supplements
    const supplements = this.getAvailableMealPlanSupplements(room, contract);

    // Load available offers for the room
    this.getAvailableOffers(room);

    // Update current step with period-based total
    this.currentStep.set({
      room,
      baseRate: totalRate,
      supplementRates: supplements,
      selectedMealPlans: [],
      total: totalRate,
      periodBreakdown,
    });

    // Move to next step
    this.stepper.next();
  }

  updateMealPlanSelection(plans: MatListOption[]): void {
    const current = this.currentStep();
    if (!current) return;

    console.log("Plans avant sélection:", current.selectedMealPlans);

    const selectedPlans = plans
      .filter((option) => option.selected)
      .map((option) => option.value as MealPlanType);

    console.log("Nouveaux plans sélectionnés:", selectedPlans);

    this.currentStep.set({
      ...current,
      selectedMealPlans: selectedPlans,
    });

    // Log l'état après mise à jour
    console.log("État après mise à jour:", this.currentStep());

    this.updateTotalWithOffers();

    // Log le total final
    console.log("Nouveau total:", this.currentStep().total);
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

  public calculateCartTotal(): number {
    return this.cartItems().reduce(
      (total, item) => total + (item.total || 0),
      0
    );
  }

  addToCart(): void {
    // First validate all required data
    if (!this.validateCartData()) {
      this.snackBar.open("Please complete all required selections", "Close", {
        duration: 3000,
        panelClass: ["warning-snackbar"],
      });
      return;
    }

    const current = this.currentStep();

    try {
      // If this is the first item being added to cart
      if (this.cartItems().length === 0) {
        const { hotelId, marketId, checkIn, checkOut } = this.searchForm.value;
        this.initialBooking.set({
          hotelId,
          marketId,
          checkIn: checkIn ? new Date(checkIn) : undefined,
          checkOut: checkOut ? new Date(checkOut) : undefined,
        });
      }

      // Get the current occupancy from the search form
      const { adults, children, infants } = this.searchForm.value;

      // Create cart item with correct typing and occupancy
      const cartItem: ReservationStep = {
        room: current.room,
        selectedMealPlans: current.selectedMealPlans || [],
        selectedOffers: this.selectedOffers(),
        baseRate: current.baseRate,
        supplementRates: current.supplementRates,
        total: current.total,
        applyOffersToMealPlans: current.applyOffersToMealPlans,
        appliedDiscounts: this.selectedOffers().map((offer) => ({
          offerName: offer.name,
          discountType:
            offer.discountType === "percentage" ? "percentage" : "fixed",
          discountValue: this.getApplicableDiscount(offer),
          savedAmount: current.totalBeforeDiscounts
            ? current.totalBeforeDiscounts - (current.total || 0)
            : 0,
        })),
        totalBeforeDiscounts: current.totalBeforeDiscounts,
        // Add occupancy information
        occupancy: {
          adults: adults || 0,
          children: children || 0,
          infants: infants || 0,
        },
      };

      // Add to cart
      this.cartItems.update((items) => [...items, cartItem]);
      // Show success message with options
      this.snackBar.open(
        "Room added successfully! What would you like to do next?",
        undefined,
        {
          duration: 5000,
          panelClass: ["action-snackbar"],
          horizontalPosition: "center",
          verticalPosition: "bottom",
        }
      );

      // Add action buttons
      const actions = [
        {
          label: "Add Another Room",
          callback: () => {
            this.resetForNewRoom();
            this.snackBar.dismiss();
          },
        },
        {
          label: "View Cart",
          callback: () => {
            this.proceedToCart();
            this.snackBar.dismiss();
          },
        },
      ];

      // Show actions in a new snackbar
      actions.forEach((action) => {
        this.snackBar
          .open("", action.label, {
            duration: 0,
            panelClass: ["action-snackbar"],
            horizontalPosition: "center",
            verticalPosition: "bottom",
          })
          .onAction()
          .subscribe(action.callback);
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      this.snackBar.open("Error adding room to cart", "Close", {
        duration: 3000,
        panelClass: ["error-snackbar"],
      });
    }
  }

  private resetForNewRoom(): void {
    // Garder les critères de recherche actuels, y compris le market
    const currentSearch = {
      hotelId: this.initialBooking()?.hotelId,
      marketId: this.initialBooking()?.marketId,
      checkIn: this.searchForm.get("checkIn")?.value,
      checkOut: this.searchForm.get("checkOut")?.value,
      adults: this.searchForm.get("adults")?.value,
      children: this.searchForm.get("children")?.value,
      infants: this.searchForm.get("infants")?.value,
    };

    // Réinitialiser le stepper
    this.stepper.reset();

    // Réinitialiser l'étape courante
    this.currentStep.set({});

    // Effacer les offres sélectionnées
    this.selectedOffers.set([]);

    // Important: Réinitialiser le formulaire avec les valeurs actuelles
    this.searchForm.patchValue(currentSearch, { emitEvent: false });

    // S'assurer que les contrôles hotelId et marketId restent désactivés
    if (this.cartItems().length > 0) {
      this.searchForm.get("hotelId")?.disable();
      this.searchForm.get("marketId")?.disable();
    }

    // Réinitialiser le statut du formulaire sans marquer les champs comme touchés
    Object.keys(this.searchForm.controls).forEach((key) => {
      const control = this.searchForm.get(key);
      if (control) {
        control.markAsUntouched();
        control.updateValueAndValidity();
      }
    });
  }

  // Add method to clear booking and enable form
  clearBooking(): void {
    if (
      confirm(
        "Are you sure you want to cancel your booking? This will clear your cart."
      )
    ) {
      // Clear cart
      this.cartItems.set([]);

      // Clear initial booking
      this.initialBooking.set(null);

      // Enable hotel and market selection
      this.searchForm.get("hotelId")?.enable();
      this.searchForm.get("marketId")?.enable();

      // Reset form completely
      this.searchForm.reset();
      this.currentStep.set({});
      this.selectedOffers.set([]);
      this.stepper.reset();

      this.snackBar.open("Booking cancelled", "Close", {
        duration: 3000,
      });
    }
  }

  private validateCartData(): boolean {
    const current = this.currentStep();
    const formValues = this.searchForm.value;

    // Vérifier qu'il y a au moins un enfant si pas d'adultes
    const hasValidOccupancy = formValues.adults > 0 || formValues.children > 0;

    const isValid = !!(
      (
        current &&
        current.room &&
        current.baseRate &&
        current.total &&
        hasValidOccupancy
      ) // Nouvelle condition
    );

    if (!isValid) {
      console.error("Invalid cart data:", {
        hasRoom: !!current?.room,
        hasBaseRate: !!current?.baseRate,
        hasTotal: !!current?.total,
        hasValidOccupancy: hasValidOccupancy,
      });
    }

    return isValid;
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

    // Set cart view to true
    this.isCartView.set(true);

    // Save cart items to localStorage before navigation
    try {
      localStorage.setItem("bookingCart", JSON.stringify(this.cartItems()));
      // Navigate to cart
      this.router.navigate(["/booking/cart"]);
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
      this.snackBar.open("Error saving cart", "Close", { duration: 3000 });
    }
  }

  returnToRoomSelection(): void {
    this.isCartView.set(false);
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
    const currentOffers = this.selectedOffers();

    // If no offers selected, none should be disabled
    if (!currentOffers.length) return false;

    // If this offer is already selected, it shouldn't be disabled
    if (currentOffers.some((o) => o.id === offer.id)) return false;

    // If there are combinable offers selected, disable cumulative offers
    if (currentOffers.some((o) => o.type === "combinable")) {
      return offer.type === "cumulative";
    }

    // If there are cumulative offers selected, disable combinable offers
    if (currentOffers.some((o) => o.type === "cumulative")) {
      return offer.type === "combinable";
    }

    return false;
  }

  // Update isOfferSelected method to be more precise
  isOfferSelected(offer: SpecialOffer): boolean {
    return this.selectedOffers().some((o) => o.id === offer.id);
  }

  getApplicableDiscount(offer: SpecialOffer): number {
    const stayDate = new Date(this.searchForm.value.checkIn);

    // Find applicable discount based on stay date
    const applicableDiscount = offer.discountValues.find((discount) => {
      const discountStart = new Date(discount.bookingDateRange.start);
      const discountEnd = new Date(discount.bookingDateRange.end);
      return stayDate >= discountStart && stayDate <= discountEnd;
    });

    // If no specific discount found, return 0
    return applicableDiscount?.value ?? 0;
  }

  getStayDuration(): number {
    const { checkIn, checkOut } = this.searchForm.value;
    if (!checkIn || !checkOut) return 0;

    const start = new Date(checkIn);
    const end = new Date(checkOut);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
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
    const currentOffers = [...this.selectedOffers()]; // Create a copy of the array

    if (checked) {
      // If adding a combinable offer
      if (offer.type === "combinable") {
        // Remove all cumulative offers
        const nonCumulativeOffers = currentOffers.filter(
          (o) => o.type === "combinable"
        );
        // Add the new offer if it's not already there
        if (!nonCumulativeOffers.some((o) => o.id === offer.id)) {
          nonCumulativeOffers.push(offer);
        }
        this.selectedOffers.set(nonCumulativeOffers);
      }
      // If adding a cumulative offer
      else if (offer.type === "cumulative") {
        // Remove all combinable offers
        const nonCombinableOffers = currentOffers.filter(
          (o) => o.type === "cumulative"
        );
        // Add the new offer if it's not already there
        if (!nonCombinableOffers.some((o) => o.id === offer.id)) {
          nonCombinableOffers.push(offer);
        }
        this.selectedOffers.set(nonCombinableOffers);
      }
    } else {
      // Remove the offer
      this.selectedOffers.set(currentOffers.filter((o) => o.id !== offer.id));
    }

    // Update totals after changing offers
    this.updateTotalWithOffers();
  }

  private updateCurrentStepWithOffers(): void {
    const current = this.currentStep();
    if (!current) return;

    this.currentStep.set({
      ...current,
      selectedOffers: this.selectedOffers(),
    });

    // Recalculate totals with the new offers
    this.updateTotalWithOffers();
  }

  isSupplementSelected(supplementType: MealPlanType): boolean {
    const current = this.currentStep();
    if (!current?.selectedMealPlans) return false;

    return current.selectedMealPlans.includes(supplementType);
  }

  private updateTotalWithOffers(): void {
    const current = this.currentStep();
    if (!current || !current.baseRate || !current.room) return;

    // 1. Calculate base rate and supplements separately
    const baseRateBeforeOffers = current.baseRate;
    const supplementsTotal = this.calculateSupplementsTotal(
      current.selectedMealPlans || [],
      current.supplementRates || []
    );

    // 2. Calculate compulsory supplements total
    const christmasDinnerTotal =
      this.christmasDinnerAdultPrice * (this.searchForm.value.adults || 0) +
      this.christmasDinnerChildPrice * (this.searchForm.value.children || 0);

    const newYearsEveDinnerTotal =
      this.newYearsEveDinnerAdultPrice * (this.searchForm.value.adults || 0) +
      this.newYearsEveDinnerChildPrice * (this.searchForm.value.children || 0);

    const compulsorySupplementsTotal =
      christmasDinnerTotal + newYearsEveDinnerTotal;

    // 3. Apply offers based on periods
    const selectedOffers = this.selectedOffers();
    let finalTotal: number;

    if (!selectedOffers.length) {
      // No offers - add base + supplements + compulsory supplements
      finalTotal =
        baseRateBeforeOffers + supplementsTotal + compulsorySupplementsTotal;
    } else {
      // Split the stay into periods and apply offers accordingly
      const periodBreakdown = this.calculatePeriodBreakdown(current.room);
      let discountedTotal = 0;

      periodBreakdown.forEach((period) => {
        const periodTotal = period.rate * period.nights;
        const applicableOffers = this.getApplicableOffersForPeriod(
          selectedOffers,
          period.startDate,
          period.endDate
        );

        if (current.applyOffersToMealPlans) {
          // Apply discounts to period total including supplements
          const periodWithSupplements =
            periodTotal +
            supplementsTotal / periodBreakdown.length +
            compulsorySupplementsTotal / periodBreakdown.length;

          discountedTotal += this.applyOffersToAmount(
            periodWithSupplements,
            applicableOffers
          );
        } else {
          // Apply discounts only to room rate
          const discountedPeriod = this.applyOffersToAmount(
            periodTotal,
            applicableOffers
          );
          discountedTotal += discountedPeriod;
        }
      });

      // If not applying offers to supplements, add them after discount calculation
      if (!current.applyOffersToMealPlans) {
        discountedTotal += supplementsTotal + compulsorySupplementsTotal;
      }

      finalTotal = discountedTotal;
    }

    // 4. Update state with new totals
    this.currentStep.set({
      ...current,
      total: finalTotal,
      totalBeforeDiscounts:
        baseRateBeforeOffers + supplementsTotal + compulsorySupplementsTotal,
      selectedMealPlans: current.selectedMealPlans || [], // Keep current selection
    });
  }

  private applyOffersToAmount(amount: number, offers: SpecialOffer[]): number {
    // Separate combinable and cumulative offers
    const combinableOffers = offers.filter((o) => o.type === "combinable");
    const cumulativeOffers = offers.filter((o) => o.type === "cumulative");

    let finalAmount = amount;

    // Apply combinable offers first (sum all discounts, then apply once)
    if (combinableOffers.length > 0) {
      const totalCombinableDiscount = combinableOffers.reduce((sum, offer) => {
        const discount = this.getApplicableDiscount(offer);
        return sum + discount;
      }, 0);
      finalAmount = finalAmount * (1 - totalCombinableDiscount / 100);
    }

    // Apply cumulative offers sequentially
    cumulativeOffers.forEach((offer) => {
      const discount = this.getApplicableDiscount(offer);
      finalAmount = finalAmount * (1 - discount / 100);
    });

    return finalAmount;
  }

  private calculateSupplementsTotal(
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
    // Si aucun plan ou taux n'est sélectionné, retourner 0
    if (!selectedPlans?.length || !supplementRates?.length) return 0;

    const { adults = 0, children = 0, infants = 0 } = this.searchForm.value;

    return selectedPlans.reduce((total, planType) => {
      const supplement = supplementRates.find((s) => s.type === planType);
      if (!supplement) return total;

      // Calculer le total pour ce supplément
      const supplementTotal =
        supplement.rates.adult * adults +
        supplement.rates.child * children +
        supplement.rates.infant * infants;

      return total + supplementTotal;
    }, 0);
  }

  private applyOffers(amount: number): number {
    const selectedOffers = this.selectedOffers();
    console.log("Selected offers:", selectedOffers);

    // Separate combinable and cumulative offers
    const combinableOffers = selectedOffers.filter(
      (offer) => offer.type === "combinable"
    );
    const cumulativeOffers = selectedOffers.filter(
      (offer) => offer.type === "cumulative"
    );

    let finalAmount = amount;

    // For combinable offers: sum all discounts first, then apply once
    if (combinableOffers.length > 0) {
      const totalCombinableDiscount = combinableOffers.reduce((sum, offer) => {
        const discount = this.getApplicableDiscount(offer);
        console.log(`Adding combinable discount: ${discount}%`);
        return sum + discount;
      }, 0);
      console.log("Total combinable discount:", totalCombinableDiscount);
      finalAmount = finalAmount * (1 - totalCombinableDiscount / 100);
    }

    // For cumulative offers: apply each discount sequentially
    if (cumulativeOffers.length > 0) {
      finalAmount = cumulativeOffers.reduce((total, offer) => {
        const discount = this.getApplicableDiscount(offer);
        console.log(`Applying cumulative discount: ${discount}%`);
        return total * (1 - discount / 100);
      }, finalAmount);
    }

    console.log("Final amount:", finalAmount);
    return finalAmount;
  }

  toggleOfferApplicationPreference(checked: boolean): void {
    const current = this.currentStep();
    if (!current) return;

    this.currentStep.set({
      ...current,
      applyOffersToMealPlans: checked,
    });

    // Recalculate total with new preference
    this.updateTotalWithOffers();
  }

  addAnotherRoom(): void {
    // Store current search criteria
    const currentSearch = {
      checkIn: this.searchForm.get("checkIn")?.value,
      checkOut: this.searchForm.get("checkOut")?.value,
      adults: this.searchForm.get("adults")?.value || 1, // Default to 1 adult
      children: this.searchForm.get("children")?.value || 0,
      infants: this.searchForm.get("infants")?.value || 0,
      hotelId: this.searchForm.get("hotelId")?.value,
      marketId: this.searchForm.get("marketId")?.value,
    };

    // Reset the stepper to first step
    this.stepper.reset();

    // Reset form with current values but keep it pristine
    this.searchForm.reset(currentSearch, { emitEvent: false });

    // Reset form status without marking fields as touched
    Object.keys(this.searchForm.controls).forEach((key) => {
      const control = this.searchForm.get(key);
      control?.setErrors(null);
      control?.markAsUntouched();
    });

    // Clear current room selection
    this.currentStep.set({});

    // Clear selected offers
    this.selectedOffers.set([]);

    // Reset available offers
    this.availableOffers.set([]);

    // Hide available rooms
    this.filteredRooms.set([]);
  }

  private updateSelectedOffers(offers: SpecialOffer[]): void {
    const current = this.currentStep();
    if (!current) return;

    this.currentStep.set({
      ...current,
      selectedOffers: offers,
    });

    // Update totals after changing offers
    this.updateTotalWithOffers();
  }

  getRoomPeriodRates(room: RoomType): Observable<PeriodRateInfo[]> {
    console.log("Getting period rates for room:", room);

    return this.seasonService.seasons$.pipe(
      tap((seasonMap) => console.log("Season map:", seasonMap)),
      switchMap((seasonMap) => {
        const hotel = this.selectedHotel();
        const currentMarket = this.markets()[0];
        console.log("Current context:", { hotel, currentMarket });

        if (!hotel || !currentMarket) return of([]);

        const hotelSeasons = seasonMap.get(hotel.id) || [];
        const relevantPeriods: Period[] = [];
        console.log("Hotel seasons:", hotelSeasons);

        hotelSeasons.forEach((season) => {
          season.periods?.forEach((period) => {
            const periodStart = new Date(period.startDate);
            const periodEnd = new Date(period.endDate);
            const checkIn = this.checkInDate();
            const checkOut = this.checkOutDate();
            console.log("Date comparison:", {
              periodStart,
              periodEnd,
              checkIn,
              checkOut,
            });

            if (
              checkIn &&
              checkOut &&
              ((checkIn >= periodStart && checkIn <= periodEnd) ||
                (checkOut >= periodStart && checkOut <= periodEnd))
            ) {
              relevantPeriods.push(period);
            }
          });
        });

        console.log("Relevant periods found:", relevantPeriods);

        return from(
          this.contractService.getActiveContract(hotel.id, currentMarket.id)
        ).pipe(
          tap((contract) => console.log("Active contract:", contract)),
          switchMap((contract: Contract | null) => {
            if (!contract) return of([]);

            return from(
              this.contractRateService.getContractRates(contract.id)
            ).pipe(
              tap((rates) => console.log("Contract rates:", rates)),
              map((contractRates) =>
                this.mapPeriodRates(relevantPeriods, contractRates, room)
              )
            );
          })
        );
      })
    );
  }

  private mapPeriodRates(
    periods: Period[],
    contractRates: ContractPeriodRate[],
    room: RoomType
  ): PeriodRateInfo[] {
    return periods.map((period) => {
      const periodRate = contractRates.find(
        (rate) => rate.periodId === period.id
      );
      const roomRate = periodRate?.roomRates.find(
        (rate) => rate.roomTypeId === room.id
      );

      let rate = 0;
      if (roomRate?.rateType === "per_pax") {
        for (let i = 1; i <= this.adults(); i++) {
          rate += roomRate.personTypeRates?.["adult"]?.rates[i] || 0;
        }
      } else {
        rate = roomRate?.villaRate || 0;
      }

      return {
        name: period.name,
        startDate: period.startDate,
        endDate: period.endDate,
        rate,
      };
    });
  }

  async calculateRoomPeriodRates(room: RoomType): Promise<void> {
    const checkInDate = this.checkInDate();
    const checkOutDate = this.checkOutDate();
    const seasonId = this.activeContract()?.seasonId || 0;

    if (checkInDate && checkOutDate) {
      const relevantPeriods = await firstValueFrom(
        this.reservationService.getPeriodsFromBooking(
          checkInDate,
          checkOutDate,
          seasonId
        )
      );

      const rates = this.mapPeriodRates(
        relevantPeriods,
        this.contractRates() || [],
        room
      );
      this.periodRates.set(rates);
    } else {
      console.warn(
        "Check-in date and check-out date must be selected to calculate room period rates."
      );
      // Handle the case where dates are not selected, e.g., set periodRates to an empty array
      this.periodRates.set([]);
    }
  }

  calculatePeriodBreakdown(room: RoomType): PeriodBreakdown[] {
    const checkIn = new Date(this.searchForm.get("checkIn")?.value);
    const checkOut = new Date(this.searchForm.get("checkOut")?.value);

    // Set checkout time to end of day (23:59:59)
    checkOut.setHours(23, 59, 59);

    const roomRates = this.roomRates().get(room.id) || [];

    return roomRates
      .map((periodRate) => {
        const periodStart = new Date(periodRate.startDate);
        const periodEnd = new Date(periodRate.endDate);

        const overlapStart = new Date(
          Math.max(checkIn.getTime(), periodStart.getTime())
        );
        const overlapEnd = new Date(
          Math.min(checkOut.getTime(), periodEnd.getTime())
        );

        const nights = Math.max(
          0,
          Math.ceil(
            (overlapEnd.getTime() - overlapStart.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        );

        return {
          periodName: periodRate.name,
          rate: periodRate.rate,
          nights,
          subtotal: periodRate.rate * nights,
          startDate: overlapStart,
          endDate: overlapEnd,
        };
      })
      .filter((breakdown) => breakdown.nights > 0);
  }

  private checkOfferValidity(
    offer: SpecialOffer,
    startDate: Date,
    endDate: Date
  ): boolean {
    const offerStart = new Date(offer.travelDateRange.start);
    const offerEnd = new Date(offer.travelDateRange.end);
    return startDate <= offerEnd && endDate >= offerStart;
  }

  totalRate = computed(() => {
    const current = this.currentStep();
    if (!current?.room) return 0;

    const periodBreakdowns = this.calculatePeriodBreakdown(current.room);
    const baseTotal = periodBreakdowns.reduce((sum, breakdown) => {
      const details = this.calculatePeriodWithOffers(breakdown);
      return (
        sum +
        details.reduce(
          (periodSum, detail) => periodSum + detail.discountedRate,
          0
        )
      );
    }, 0);

    return baseTotal;
  });

  // Computed property to check if Christmas Eve falls within the stay period
  showChristmasDinner = computed(() => {
    const checkIn = new Date(this.searchForm.value.checkIn);
    const checkOut = new Date(this.searchForm.value.checkOut);
    const { christmasEve } = this.getHolidayDates(checkIn.getFullYear());
    return christmasEve >= checkIn && christmasEve < checkOut;
  });

  // Computed property to check if New Year's Eve falls within the stay period
  showNewYearsEveDinner = computed(() => {
    const checkIn = new Date(this.searchForm.value.checkIn);
    const checkOut = new Date(this.searchForm.value.checkOut);
    const { newYearsEve } = this.getHolidayDates(checkIn.getFullYear());
    return newYearsEve >= checkIn && newYearsEve < checkOut;
  });

  onChristmasDinnerRateChange() {
    this.updateTotalWithOffers();
  }

  onNewYearsDinnerRateChange() {
    this.updateTotalWithOffers();
  }

  hasCompulsorySupplement(): boolean {
    return this.showChristmasDinner() || this.showNewYearsEveDinner();
  }

  readonly offersWithAvailability = computed(() => {
    const checkIn = new Date(this.searchForm.get("checkIn")?.value);
    const checkOut = new Date(this.searchForm.get("checkOut")?.value);

    console.log("Checking offers availability for:", {
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
    });

    const offers = this.availableOffers().map((offer) => ({
      ...offer,
      validRanges: this.getValidDateRanges(offer, checkIn, checkOut),
      discount: this.getApplicableDiscount(offer),
      isPartiallyValid: this.hasValidDatesOutsideBlackout(
        checkIn,
        checkOut,
        offer.blackoutDates
      ),
    }));

    console.log("Processed offers:", offers);

    return offers.filter((offer) => offer.isPartiallyValid);
  });

  // Add this method to the ReservationComponent class
  private hasValidDatesOutsideBlackout(
    checkIn: Date,
    checkOut: Date,
    blackoutDates?: Array<{ start: string; end: string }>
  ): boolean {
    if (!blackoutDates || blackoutDates.length === 0) return true;

    // Check if there's at least one day outside blackout periods
    const currentDate = new Date(checkIn);
    while (currentDate <= checkOut) {
      let isBlackoutDay = false;

      for (const blackout of blackoutDates) {
        const blackoutStart = new Date(blackout.start);
        const blackoutEnd = new Date(blackout.end);

        if (currentDate >= blackoutStart && currentDate <= blackoutEnd) {
          isBlackoutDay = true;
          break;
        }
      }

      if (!isBlackoutDay) {
        // Found at least one valid date
        console.log("Found valid date outside blackout:", currentDate);
        return true;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log("No valid dates found outside blackout periods");
    return false;
  }

  // Update the offersWithAvailability computed property

  private getValidDateRanges(
    offer: SpecialOffer,
    checkIn: Date,
    checkOut: Date
  ): Array<{ start: Date; end: Date }> {
    const ranges: Array<{ start: Date; end: Date }> = [];
    let currentDate = new Date(checkIn);

    while (currentDate < checkOut) {
      // Skip if date is in blackout period
      if (!this.isDateInBlackoutPeriod(currentDate, offer.blackoutDates)) {
        const rangeStart = new Date(currentDate);

        // Find end of valid period
        while (
          currentDate < checkOut &&
          !this.isDateInBlackoutPeriod(currentDate, offer.blackoutDates)
        ) {
          currentDate.setDate(currentDate.getDate() + 1);
        }

        ranges.push({
          start: rangeStart,
          end: new Date(currentDate),
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log("Valid date ranges for offer:", offer.name, ranges);
    return ranges;
  }

  private isDateInBlackoutPeriod(
    date: Date,
    blackoutDates?: Array<{ start: string; end: string }>
  ): boolean {
    if (!blackoutDates) return false;

    return blackoutDates.some((blackout) => {
      const blackoutStart = new Date(blackout.start);
      const blackoutEnd = new Date(blackout.end);
      return date >= blackoutStart && date <= blackoutEnd;
    });
  }

  private isDateInRange(date: Date, start: string, end: string): boolean {
    return date >= new Date(start) && date <= new Date(end);
  }

  calculatePeriodWithOffers(
    breakdown: PeriodBreakdown
  ): PeriodCalculationDetail[] {
    const selectedOffers = this.selectedOffers();
    const details: PeriodCalculationDetail[] = [];

    // If no offers selected, return single period with original rate
    if (!selectedOffers.length) {
      return [
        {
          startDate: breakdown.startDate,
          endDate: breakdown.endDate,
          nights: breakdown.nights,
          baseRate: breakdown.rate,
          appliedOffers: [],
          subtotal: breakdown.subtotal,
          discountedRate: breakdown.subtotal,
        },
      ];
    }

    // Get date ranges where different combinations of offers apply
    const ranges = this.getDateRangesWithOffers(
      breakdown.startDate,
      breakdown.endDate,
      selectedOffers
    );

    // Calculate details for each range
    ranges.forEach((range) => {
      const nights = range.nights;
      const subtotal = breakdown.rate * nights;
      let finalRate = subtotal;

      // Split offers by type
      const combinableOffers = range.offers.filter(
        (o) => o.type === "combinable"
      );
      const cumulativeOffers = range.offers.filter(
        (o) => o.type === "cumulative"
      );

      // Apply combinable offers first (sum all discounts, then apply once)
      if (combinableOffers.length > 0) {
        const totalCombinableDiscount = combinableOffers.reduce(
          (sum, offer) => {
            return sum + this.getApplicableDiscount(offer);
          },
          0
        );
        finalRate = finalRate * (1 - totalCombinableDiscount / 100);
      }

      // Then apply cumulative offers sequentially
      cumulativeOffers.forEach((offer) => {
        const discount = this.getApplicableDiscount(offer);
        finalRate = finalRate * (1 - discount / 100);
      });

      details.push({
        startDate: range.start,
        endDate: range.end,
        nights,
        baseRate: breakdown.rate,
        appliedOffers: [
          ...combinableOffers.map((offer) => ({
            name: offer.name,
            type: "combinable",
            discount: this.getApplicableDiscount(offer),
            applicableDates: {
              start: range.start,
              end: range.end,
            },
          })),
          ...cumulativeOffers.map((offer) => ({
            name: offer.name,
            type: "cumulative",
            discount: this.getApplicableDiscount(offer),
            applicableDates: {
              start: range.start,
              end: range.end,
            },
          })),
        ],
        subtotal,
        discountedRate: finalRate,
      });
    });

    return details;
  }

  isOfferTypeDisabled(offer: SpecialOffer): boolean {
    const selectedOffers = this.selectedOffers();
    if (selectedOffers.length === 0) return false;

    // If we have any combinable offers selected, disable cumulative offers
    if (selectedOffers.some((o) => o.type === "combinable")) {
      return offer.type === "cumulative";
    }

    // If we have any cumulative offers selected, disable combinable offers
    if (selectedOffers.some((o) => o.type === "cumulative")) {
      return offer.type === "combinable";
    }

    return false;
  }

  private splitPeriodByOfferRanges(
    periodStart: Date,
    periodEnd: Date,
    offerRanges: Array<{
      offer: SpecialOffer;
      validRanges: Array<{ start: Date; end: Date }>;
    }>
  ): Array<{ start: Date; end: Date }> {
    const dates = new Set<number>();
    dates.add(periodStart.getTime());
    dates.add(periodEnd.getTime());

    // Add all offer range boundaries
    offerRanges.forEach(({ validRanges }) => {
      validRanges.forEach((range) => {
        dates.add(range.start.getTime());
        dates.add(range.end.getTime());
      });
    });

    // Convert to array and sort
    const sortedDates = Array.from(dates).sort((a, b) => a - b);

    // Create sub-periods
    const subPeriods: Array<{ start: Date; end: Date }> = [];
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const start = new Date(sortedDates[i]);
      const end = new Date(sortedDates[i + 1]);

      if (start >= periodStart && end <= periodEnd) {
        subPeriods.push({ start, end });
      }
    }

    return subPeriods;
  }

  private getApplicableOffersForPeriod(
    offers: SpecialOffer[],
    start: Date,
    end: Date
  ): SpecialOffer[] {
    return offers.filter((offer) => {
      // Check if the period is within offer validity
      const isWithinValidity = this.checkOfferValidity(offer, start, end);
      // Check if the period is not in blackout dates
      const isNotBlackedOut =
        !this.isDateInBlackoutPeriod(start, offer.blackoutDates) &&
        !this.isDateInBlackoutPeriod(end, offer.blackoutDates);

      return isWithinValidity && isNotBlackedOut;
    });
  }

  getTotalDiscount(offers: SpecialOffer[]): number {
    if (!offers || offers.length === 0) return 0;

    // For combinable offers, sum up all discounts
    return offers.reduce((total, offer) => {
      const discount = this.getApplicableDiscount(offer);
      return total + discount;
    }, 0);
  }

  private getDateRangesWithOffers(
    start: Date,
    end: Date,
    offers: SpecialOffer[]
  ): Array<{ start: Date; end: Date; nights: number; offers: SpecialOffer[] }> {
    const ranges: Array<{
      start: Date;
      end: Date;
      nights: number;
      offers: SpecialOffer[];
    }> = [];

    // Create array of all significant dates
    const dates = new Set<number>();
    dates.add(start.getTime());
    dates.add(end.getTime());

    // Add offer boundary dates
    offers.forEach((offer) => {
      dates.add(new Date(offer.travelDateRange.start).getTime());
      dates.add(new Date(offer.travelDateRange.end).getTime());
      offer.blackoutDates?.forEach((blackout) => {
        dates.add(new Date(blackout.start).getTime());
        dates.add(new Date(blackout.end).getTime());
      });
    });

    // Sort dates
    const sortedDates = Array.from(dates).sort((a, b) => a - b);

    // Create ranges between consecutive dates
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const rangeStart = new Date(sortedDates[i]);
      const rangeEnd = new Date(sortedDates[i + 1]);

      // Skip if range is outside the period
      if (rangeEnd <= start || rangeStart >= end) continue;

      // Find applicable offers for this range
      const applicableOffers = offers.filter((offer) =>
        this.isOfferValidForPeriod(offer, rangeStart, rangeEnd)
      );

      const nights = Math.ceil(
        (rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (nights > 0) {
        ranges.push({
          start: rangeStart,
          end: rangeEnd,
          nights,
          offers: applicableOffers,
        });
      }
    }

    return ranges;
  }

  private isOfferValidForPeriod(
    offer: SpecialOffer,
    periodStart: Date,
    periodEnd: Date
  ): boolean {
    // Check if period overlaps with offer validity period
    const isInValidRange = this.datesOverlap(
      periodStart,
      periodEnd,
      new Date(offer.travelDateRange.start),
      new Date(offer.travelDateRange.end)
    );

    // Check if period overlaps with any blackout dates
    const isInBlackoutPeriod =
      offer.blackoutDates?.some((blackout) =>
        this.datesOverlap(
          periodStart,
          periodEnd,
          new Date(blackout.start),
          new Date(blackout.end)
        )
      ) ?? false;

    return isInValidRange && !isInBlackoutPeriod;
  }

  private datesOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
  ): boolean {
    return start1 <= end2 && start2 <= end1;
  }

  private calculateSegment(
    startDate: Date,
    endDate: Date,
    baseRate: number,
    offers: SpecialOffer[]
  ): PeriodCalculationDetail {
    const nights = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const subtotal = baseRate * nights;

    const appliedOffers = offers.map((offer) => ({
      name: offer.name,
      discount: (this.getApplicableDiscount(offer) * subtotal) / 100,
      applicableDates: {
        start: startDate,
        end: endDate,
      },
    }));

    const totalDiscount = appliedOffers.reduce(
      (sum, offer) => sum + offer.discount,
      0
    );

    return {
      startDate,
      endDate,
      nights,
      baseRate,
      appliedOffers,
      subtotal,
      discountedRate: subtotal - totalDiscount,
    };
  }

  private calculatePeriodDetails(breakdown: PeriodBreakdown): PeriodDetail[] {
    const details: PeriodDetail[] = [];
    const selectedOffers = this.selectedOffers();

    // Create period detail from the breakdown
    const periodDetail: PeriodDetail = {
      periodName: breakdown.periodName,
      dateRange: `${breakdown.startDate.toLocaleDateString()} - ${breakdown.endDate.toLocaleDateString()}`,
      baseRate: breakdown.rate,
      nights: breakdown.nights,
      subtotal: breakdown.subtotal,
      offerBreakdowns: [],
      periodTotal: breakdown.subtotal,
    };

    if (selectedOffers.length > 0) {
      // Split period into sub-periods based on offer validity
      const subPeriods = this.splitPeriodByOfferValidity(
        breakdown.startDate,
        breakdown.endDate,
        selectedOffers
      );

      subPeriods.forEach((subPeriod) => {
        const applicableOffers = selectedOffers.filter((offer) =>
          this.isDateRangeValidForOffer(offer, subPeriod.start, subPeriod.end)
        );

        const nights = this.calculateNights(subPeriod.start, subPeriod.end);
        const baseAmount = breakdown.rate * nights;
        let finalAmount = baseAmount;

        // Calculate discounted amount
        if (applicableOffers.length > 0) {
          const combinableOffers = applicableOffers.filter(
            (o) => o.type === "combinable"
          );
          const cumulativeOffers = applicableOffers.filter(
            (o) => o.type === "cumulative"
          );

          if (combinableOffers.length > 0) {
            const totalDiscount = combinableOffers.reduce(
              (sum, offer) => sum + this.getApplicableDiscount(offer),
              0
            );
            finalAmount *= 1 - totalDiscount / 100;
          }

          cumulativeOffers.forEach((offer) => {
            const discount = this.getApplicableDiscount(offer);
            finalAmount *= 1 - discount / 100;
          });
        }

        periodDetail.offerBreakdowns.push({
          dateRange: `${subPeriod.start.toLocaleDateString()} - ${subPeriod.end.toLocaleDateString()}`,
          nights,
          baseAmount,
          appliedOffers: applicableOffers.map((offer) => ({
            name: offer.name,
            type: offer.type,
            discount: this.getApplicableDiscount(offer),
          })),
          finalAmount,
        });
      });

      // Update period total
      periodDetail.periodTotal = periodDetail.offerBreakdowns.reduce(
        (sum, breakdown) => sum + breakdown.finalAmount,
        0
      );
    }

    details.push(periodDetail);
    return details;
  }

  periodDetails = computed(() => {
    const current = this.currentStep();
    if (!current?.baseRate || !current?.nights) return [];

    const breakdown: PeriodBreakdown = {
      periodName: current.periodName ?? "Stay Period",
      rate: current.baseRate,
      nights: current.nights,
      subtotal: current.baseRate * current.nights,
      startDate: current.startDate ?? new Date(),
      endDate: current.endDate ?? new Date(),
    };

    return this.calculatePeriodDetails(breakdown);
  });

  totalBeforeDiscounts = computed(() => {
    return this.calculateDetailedBreakdown().reduce(
      (total, period) => total + period.baseSubtotal,
      0
    );
  });

  finalTotal = computed(() => {
    return this.calculateDetailedBreakdown().reduce(
      (total, period) => total + period.finalTotal,
      0
    );
  });

  private splitPeriodByOfferValidity(
    startDate: Date,
    endDate: Date,
    offers: SpecialOffer[]
  ): Array<{ start: Date; end: Date; isOfferValid: boolean }> {
    const dates = new Set<number>();
    dates.add(startDate.getTime());
    dates.add(endDate.getTime());

    // Add offer boundary dates
    offers.forEach((offer) => {
      // Add offer period boundaries
      if (offer.travelDateRange.start) {
        dates.add(new Date(offer.travelDateRange.start).getTime());
      }
      if (offer.travelDateRange.end) {
        dates.add(new Date(offer.travelDateRange.end).getTime());
      }

      // Add blackout dates boundaries
      offer.blackoutDates?.forEach((blackout) => {
        dates.add(new Date(blackout.start).getTime());
        dates.add(new Date(blackout.end).getTime());
      });

      // Add booking window boundaries if they exist
      if (offer.bookingWindow) {
        dates.add(new Date(offer.bookingWindow.start).getTime());
        dates.add(new Date(offer.bookingWindow.end).getTime());
      }
    });

    // Sort dates and create sub-periods
    const sortedDates = Array.from(dates).sort((a, b) => a - b);
    const subPeriods: Array<{ start: Date; end: Date; isOfferValid: boolean }> =
      [];

    for (let i = 0; i < sortedDates.length - 1; i++) {
      const periodStart = new Date(sortedDates[i]);
      const periodEnd = new Date(sortedDates[i + 1]);

      if (periodStart >= startDate && periodEnd <= endDate) {
        // Check if this sub-period is valid for any offer
        const isOfferValid = offers.some((offer) =>
          this.isDateRangeValidForOffer(offer, periodStart, periodEnd)
        );

        subPeriods.push({
          start: periodStart,
          end: periodEnd,
          isOfferValid,
        });
      }
    }

    return subPeriods;
  }

  private isDateRangeValidForOffer(
    offer: SpecialOffer,
    startDate: Date,
    endDate: Date
  ): boolean {
    const offerStart = new Date(offer.travelDateRange.start);
    const offerEnd = new Date(offer.travelDateRange.end);

    // Check if within overall offer period
    const isWithinOfferPeriod = startDate >= offerStart && endDate <= offerEnd;

    // Check if the date range overlaps with any blackout period
    const isInBlackoutPeriod =
      offer.blackoutDates?.some((blackout) => {
        const blackoutStart = new Date(blackout.start);
        const blackoutEnd = new Date(blackout.end);

        // Check if there's any overlap with blackout period
        return !(endDate <= blackoutStart || startDate >= blackoutEnd);
      }) ?? false;

    // Check minimum nights if applicable
    const meetsMinimumNights =
      !offer.minimumNights ||
      this.calculateNights(startDate, endDate) >= offer.minimumNights;

    // The offer is valid if it's within the period, not in blackout dates, and meets minimum nights
    return isWithinOfferPeriod && !isInBlackoutPeriod && meetsMinimumNights;
  }

  hasAnyDiscounts(): boolean {
    const selectedOffers = this.selectedOffers();
    return selectedOffers.length > 0;
  }

  calculateDetailedBreakdown(): DetailedPeriodBreakdown[] {
    const baseBreakdowns = this.calculateBasePeriodBreakdowns();
    const selectedOffers = this.selectedOffers();

    return baseBreakdowns.map((period) => {
      const offerBreakdowns: OfferApplicationBreakdown[] = [];

      if (selectedOffers.length > 0) {
        const subPeriods = this.splitPeriodByOfferValidity(
          period.startDate,
          period.endDate,
          selectedOffers
        );

        subPeriods.forEach((subPeriod) => {
          const calculation = this.calculateSubPeriodAmount(
            subPeriod.start,
            subPeriod.end,
            period.rate,
            selectedOffers
          );

          offerBreakdowns.push({
            dateRange: `${subPeriod.start.toLocaleDateString()} - ${subPeriod.end.toLocaleDateString()}`,
            startDate: subPeriod.start,
            endDate: subPeriod.end,
            baseRate: period.rate,
            nights: this.calculateNights(subPeriod.start, subPeriod.end),
            baseAmount: calculation.baseAmount,
            appliedOffers: calculation.appliedOffers,
            finalAmount: calculation.finalAmount,
          });
        });
      } else {
        // If no offers, create a single breakdown for the whole period
        offerBreakdowns.push({
          dateRange: `${period.startDate.toLocaleDateString()} - ${period.endDate.toLocaleDateString()}`,
          startDate: period.startDate,
          endDate: period.endDate,
          baseRate: period.rate,
          nights: period.nights,
          baseAmount: period.subtotal,
          appliedOffers: [],
          finalAmount: period.subtotal,
        });
      }

      const periodTotal = offerBreakdowns.reduce(
        (sum, breakdown) => sum + breakdown.finalAmount,
        0
      );

      return {
        periodName: period.periodName,
        dateRange: `${period.startDate.toLocaleDateString()} - ${period.endDate.toLocaleDateString()}`,
        baseRate: period.rate,
        nights: period.nights,
        baseSubtotal: period.subtotal,
        offerBreakdowns,
        finalTotal: periodTotal,
      };
    });
  }

  private getApplicableOffersForDate(
    date: Date,
    offers: SpecialOffer[]
  ): SpecialOffer[] {
    return offers.filter((offer) => {
      const offerStart = new Date(offer.travelDateRange.start);
      const offerEnd = new Date(offer.travelDateRange.end);

      // Check if date is within overall offer period
      const isWithinPeriod = date >= offerStart && date <= offerEnd;

      // Check if date is not in blackout period
      const isNotBlackedOut = !offer.blackoutDates?.some((blackout) => {
        const blackoutStart = new Date(blackout.start);
        const blackoutEnd = new Date(blackout.end);
        return date >= blackoutStart && date <= blackoutEnd;
      });

      return isWithinPeriod && isNotBlackedOut;
    });
  }

  private calculateSubPeriodAmount(
    startDate: Date,
    endDate: Date,
    baseRate: number,
    selectedOffers: SpecialOffer[]
  ): {
    baseAmount: number;
    finalAmount: number;
    appliedOffers: Array<{
      name: string;
      type: "combinable" | "cumulative";
      discount: number;
    }>;
  } {
    const nights = this.calculateNights(startDate, endDate);
    const baseAmount = baseRate * nights;
    let finalAmount = baseAmount;
    const appliedOffers: Array<{
      name: string;
      type: "combinable" | "cumulative";
      discount: number;
    }> = [];

    // Get all dates in this sub-period
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    while (currentDate < endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate applicable offers for each night
    const nightlyAmounts = dates.map((date) => {
      const applicableOffers = this.getApplicableOffersForDate(
        date,
        selectedOffers
      );
      let nightAmount = baseRate;

      // Apply combinable offers first
      const combinableOffers = applicableOffers.filter(
        (o) => o.type === "combinable"
      );
      if (combinableOffers.length > 0) {
        nightAmount = combinableOffers.reduce((amount, offer) => {
          const discount = this.getApplicableDiscount(offer);
          return amount * (1 - discount / 100);
        }, nightAmount);

        // Add offers to applied offers list if not already present
        combinableOffers.forEach((offer) => {
          if (!appliedOffers.some((ao) => ao.name === offer.name)) {
            appliedOffers.push({
              name: offer.name,
              type: "combinable", // explicitly typed
              discount: this.getApplicableDiscount(offer),
            });
          }
        });
      }

      // Then apply cumulative offers
      const cumulativeOffers = applicableOffers.filter(
        (o) => o.type === "cumulative"
      );
      cumulativeOffers.forEach((offer) => {
        const discount = this.getApplicableDiscount(offer);
        nightAmount *= 1 - discount / 100;

        if (!appliedOffers.some((ao) => ao.name === offer.name)) {
          appliedOffers.push({
            name: offer.name,
            type: "cumulative", // explicitly typed
            discount: discount,
          });
        }
      });

      return nightAmount;
    });

    // Sum up all nightly amounts
    finalAmount = nightlyAmounts.reduce((sum, amount) => sum + amount, 0);

    return {
      baseAmount,
      finalAmount,
      appliedOffers,
    };
  }

  private calculateNights(start: Date, end: Date): number {
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  hasOfferType(offers: Array<{ type: string }>, type: string): boolean {
    return offers.some((offer) => offer.type === type);
  }

  getOffersByType(
    offers: Array<{ type: string; name: string; discount: number }>,
    type: string
  ) {
    return offers.filter((offer) => offer.type === type);
  }

  calculateBasePeriodBreakdowns() {
    const current = this.currentStep();
    if (!current?.room || !current.periodBreakdown) return [];

    return current.periodBreakdown.map((period) => ({
      periodName: period.periodName,
      startDate: new Date(period.startDate),
      endDate: new Date(period.endDate),
      rate: period.rate,
      nights: this.calculateNights(
        new Date(period.startDate),
        new Date(period.endDate)
      ),
      subtotal:
        period.rate *
        this.calculateNights(
          new Date(period.startDate),
          new Date(period.endDate)
        ),
    }));
  }
}
