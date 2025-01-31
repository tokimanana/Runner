import { Component, OnInit, signal } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatStepperModule } from "@angular/material/stepper";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
} from "@angular/material/core";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatListModule } from "@angular/material/list";
import { ReactiveFormsModule } from "@angular/forms";
import { ReservationService } from "../services/reservation.service";
import {
  Contract,
  Hotel,
  Market,
  Period,
  Rate,
  RoomType,
  RoomWithPeriods,
  SpecialOffer,
} from "../models/types";
import { firstValueFrom, from, Observable, of } from "rxjs";
import { CommonModule, DatePipe } from "@angular/common";
import { HotelService } from "../services/hotel.service";
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from "@angular/material-moment-adapter";
import { MAT_DATE_FORMATS } from "@angular/material/core";

const MY_FORMATS = {
  parse: {
    dateInput: "DD/MM/YYYY",
  },
  display: {
    dateInput: "DD/MM/YYYY",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY",
  },
};

@Component({
  selector: "app-booking",
  templateUrl: "./booking.component.html",
  styleUrls: ["./booking.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatListModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: MY_FORMATS,
    },
  ],
})
export class BookingComponent implements OnInit {
  periods: Period[] = [];
  contracts: Contract[] = [];
  hotels = signal<Hotel[]>([]);
  markets = signal<Market[]>([]);
  availableMarkets = signal<Market[]>([]);
  availableRooms = signal<RoomType[]>([]);
  roomRates = signal<Map<number, any[]>>(new Map());
  availableRoomsWithPeriods = signal<RoomWithPeriods[]>([]);

  currencyId: number | null = null;
  overlappingPeriods: Period[] = [];
  totalRate: number = 0;
  nightlyRates: { date: Date; rate: number }[] = [];
  searchForm!: FormGroup;
  filteredRooms: RoomType[] = [];

  currencySymbol: string = "";
  selectedRoom: RoomType | null = null;
  selectedOffers: SpecialOffer[] = [];
  periodRates: Map<number, any[]> = new Map();
  totalBeforeDiscounts: number = 0;
  finalTotal: number = 0;
  christmasDinnerAdultPrice: number = 0;
  christmasDinnerChildPrice: number = 0;
  newYearsEveDinnerAdultPrice: number = 0;
  newYearsEveDinnerChildPrice: number = 0;

  roomRatesMap = new Map<
    number,
    { startDate: Date; endDate: Date; rate: number }[]
  >();

  constructor(
    private reservationService: ReservationService,
    private hotelService: HotelService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  private initForm(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    this.searchForm = this.fb.group({
      hotelId: ["", Validators.required],
      marketId: ["", Validators.required],
      checkIn: [today, Validators.required],
      checkOut: [tomorrow, Validators.required],
      adults: [1, [Validators.required, Validators.min(1)]],
      children: [0, [Validators.required, Validators.min(0)]],
      infants: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.hotelService.getHotels().subscribe((hotels) => {
      this.hotels.set(hotels);
    });
  }

  onDateChange(): void {
    const checkIn = this.searchForm.get("checkIn")?.value;
    const checkOut = this.searchForm.get("checkOut")?.value;

    if (checkIn && checkOut && checkOut <= checkIn) {
      const newCheckOut = new Date(checkIn);
      newCheckOut.setDate(newCheckOut.getDate() + 1);
      this.searchForm.patchValue({ checkOut: newCheckOut });
    }
  }

  searchRooms(): void {
    if (this.searchForm.valid) {
      const {
        hotelId,
        marketId,
        checkIn,
        checkOut,
        adults,
        children,
        infants,
      } = this.searchForm.value;
      console.log("Starting room search with params:", {
        hotelId,
        marketId,
        checkIn,
        checkOut,
        adults,
        children,
        infants,
      });

      this.reservationService
        .getContractsForReservation(hotelId)
        .subscribe((contracts) => {
          console.log("Found contracts:", contracts);
          const activeContract = contracts.find(
            (c) => c.marketId === marketId && c.isRatesConfigured
          );
          console.log("Active contract:", activeContract);

          if (activeContract) {
            this.reservationService
              .getOverlappingPeriods(
                activeContract.seasonId,
                new Date(checkIn),
                new Date(checkOut)
              )
              .subscribe((periods) => {
                this.overlappingPeriods = periods;
                console.log("Overlapping periods:", periods);

                this.reservationService
                  .searchRooms(
                    hotelId,
                    activeContract,
                    adults,
                    children,
                    infants
                  )
                  .then(async (rooms) => {
                    console.log("Found rooms:", rooms);

                    // Filter rooms by occupancy
                    const filteredRooms = rooms.filter((room) => {
                      return (
                        room.maxOccupancy.adults >= adults &&
                        room.maxOccupancy.children >= children &&
                        room.maxOccupancy.infants >= infants
                      );
                    });
                    console.log("Filtered rooms by occupancy:", filteredRooms);

                    for (const room of filteredRooms) {
                      try {
                        console.log("Calculating rates for room:", room.name);
                        const periodRates = await firstValueFrom(
                          this.reservationService.calculateRoomRates(
                            room,
                            activeContract,
                            new Date(checkIn),
                            new Date(checkOut),
                            { adults, children, infants }
                          )
                        );

                        this.roomRatesMap.set(room.id, periodRates);

                        console.log(
                          `${room.name} - Rate calculation completed:`,
                          periodRates
                        );
                        console.log(`${room.name} - Rate Details:`, {
                          periodRates: periodRates.map((rate) => ({
                            period: `${new Date(
                              rate.startDate
                            ).toLocaleDateString()} - ${new Date(
                              rate.endDate
                            ).toLocaleDateString()}`,
                            nightlyRate: rate.rate,
                          })),
                          occupancy: `${adults} Adult(s), ${children} Child(ren), ${infants} Infant(s)`,
                        });
                      } catch (error) {
                        console.log(
                          `Rate calculation error for ${room.name}:`,
                          error
                        );
                      }
                    }

                    const roomsWithPeriods = filteredRooms.map((room) => ({
                      room,
                      periods: this.overlappingPeriods,
                    }));
                    this.availableRoomsWithPeriods.set(roomsWithPeriods);
                  });
              });
          }
        });
    }
  }

  getRoomRates(
    room: RoomType
  ): { startDate: Date; endDate: Date; rate: number }[] {
    return this.roomRatesMap.get(room.id) || [];
  }

  getRoomNightlyRate(room: RoomType): string {
    const rates = this.roomRates().get(room.id);
    const firstRate = rates?.[0];

    if (firstRate) {
      // Access the rate based on rate type
      if (firstRate.rateType === "per_pax") {
        return firstRate.rateDetails.perPerson.adult.toString();
      } else {
        return firstRate.rateDetails.perVilla.toString();
      }
    }
    return "0";
  }

  calculateTotalRateWithOffers(
    checkInDate: Date,
    checkOutDate: Date,
    baseRate: number
  ): void {
    const offers: SpecialOffer[] = [];
    this.reservationService
      .calculatePeriodRatesWithOffers(
        this.periods,
        offers,
        checkInDate,
        checkOutDate,
        baseRate
      )
      .subscribe((periodRates) => {
        this.totalRate = this.reservationService.calculateTotalRate(
          this.periods,
          offers,
          baseRate
        );
      });
  }

  calculateNightlyRatesWithOffers(
    checkInDate: Date,
    checkOutDate: Date,
    baseRate: number
  ): void {
    const offers: SpecialOffer[] = []; // Example offers
    this.nightlyRates = this.reservationService.calculateNightlyRatesWithOffers(
      checkInDate,
      checkOutDate,
      offers,
      baseRate
    );
  }

  onHotelChange(): void {
    const hotelId = this.searchForm.get("hotelId")?.value;
    if (hotelId) {
      this.reservationService.loadMarketsForHotel(hotelId).then((markets) => {
        this.availableMarkets.set(markets);
        this.markets.set(markets);
      });
    }
  }

  onMarketChange(): void {
    const marketId = this.searchForm.get("marketId")?.value;
    if (marketId) {
      // Get currency ID
      this.reservationService
        .getCurrencyIdByMarket(marketId)
        .then((currencyId) => (this.currencyId = currencyId));

      // Get currency symbol
      this.getCurrencySymbol().subscribe((symbol) => {
        this.currencySymbol = symbol;
      });
    }
  }

  // getRoomRate(room: RoomType): Observable<number | null> {
  //   const { checkIn, adults, children, infants } = this.searchForm.value;
  //   const contract = this.contracts.find(
  //     (c) => c.id === this.searchForm.value.contractId
  //   );
  //   if (!contract || !checkIn) {
  //     return of(null);
  //   }
  //   return this.reservationService.getRoomRate(
  //     room,
  //     contract.id,
  //     new Date(checkIn),
  //     { adults, children, infants },
  //     room.id
  //   );
  // }

  getCurrencySymbol(): Observable<string> {
    const marketId = this.searchForm.value.marketId;
    return this.reservationService.getCurrencySymbol(marketId);
  }

  selectRoom(room: RoomType): void {
    this.selectedRoom = room;
    // Additional selection logic here
  }

  getMealPlanDisplayName(mealPlan: string): string {
    // Implement logic to get meal plan display name
    return mealPlan; // Placeholder
  }

  getBaseMealPlan(room: RoomType): string {
    // Implement logic to get base meal plan
    return "Room Only"; // Placeholder
  }

  fetchHotels(): void {}

  fetchAvailableMarkets(hotelId: number): void {}

  fetchRoomRates(rooms: RoomType[]): void {}
}
