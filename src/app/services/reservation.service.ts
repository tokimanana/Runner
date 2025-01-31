import { Injectable } from "@angular/core";
import {
  firstValueFrom,
  forkJoin,
  from,
  lastValueFrom,
  Observable,
  of,
} from "rxjs";
import { map, switchMap, tap, withLatestFrom } from "rxjs/operators";
import { ContractService } from "./contract.service";
import { SeasonService } from "./season.service";
import {
  Contract,
  ContractPeriodRate,
  CurrencySetting,
  Hotel,
  Market,
  Period,
  RoomRate,
  RoomType,
  RoomTypeRate,
  SpecialOffer,
} from "../models/types";
import { ContractRateService } from "./contract-rates.service";
import { MarketService } from "./market.service";
import { CurrencyService } from "./currency.service";
import { RoomConfigurationService } from "./room-configuration.service";
import { HotelService } from "./hotel.service";

interface PeriodBreakdown {
  periodName: string;
  startDate: Date;
  endDate: Date;
  rate: number;
  nights: number;
  subtotal: number;
}

@Injectable({
  providedIn: "root",
})
export class ReservationService {
  constructor(
    private hotelService: HotelService,
    private contractService: ContractService,
    private seasonService: SeasonService,
    private marketService: MarketService,
    private currencyService: CurrencyService,
    private roomConfigurationService: RoomConfigurationService,
    private contractRateService: ContractRateService
  ) {}

  getHotelsWithAvailability(): Observable<Hotel[]> {
    return this.hotelService
      .getHotels()
      .pipe(
        map((hotels) =>
          hotels.filter(
            (hotel) => hotel.roomTypes && hotel.roomTypes.length > 0
          )
        )
      );
  }

  getPeriodsFromBooking(
    checkInDate: Date,
    checkOutDate: Date,
    seasonId: number
  ): Observable<Period[]> {
    if (!seasonId) {
      return of([]);
    }

    return this.seasonService.getPeriodsBySeason(seasonId).pipe(
      map((periods) => {
        const overlappingPeriods = periods.filter((period) => {
          const periodStart = new Date(period.startDate);
          const periodEnd = new Date(period.endDate);

          // Check for overlap with the booking dates
          return checkInDate <= periodEnd && checkOutDate >= periodStart;
        });
        return overlappingPeriods;
      })
    );
  }

  getContractsForReservation(hotelId: number): Observable<Contract[]> {
    return this.contractService
      .getAllContracts()
      .pipe(map((contracts) => contracts.filter((c) => c.hotelId === hotelId)));
  }

  async loadMarketsForHotel(hotelId: number): Promise<Market[]> {
    const contracts = await firstValueFrom(
      this.getContractsForReservation(hotelId)
    );

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

    if (activeMarketIds.length === 0) {
      return [];
    }

    const allMarkets = await firstValueFrom(this.marketService.markets$);
    return allMarkets.filter(
      (market) => activeMarketIds.includes(market.id) && market.isActive
    );
  }

  async getContractIdByMarket(
    hotelId: number,
    marketId: number
  ): Promise<number | null> {
    const contracts = await firstValueFrom(
      this.contractService.getContractsByHotel(hotelId)
    ); // Convert Observable to Promise
    const contract = contracts.find(
      (c) => c.marketId === marketId && c.isRatesConfigured
    );
    return contract ? contract.id : null;
  }

  async searchRooms(
    hotelId: number,
    contract: Contract,
    adults: number,
    children: number,
    infants: number
  ): Promise<RoomType[]> {
    const totalGuests = adults + children + infants;
    const availableRooms = await lastValueFrom(
      this.roomConfigurationService.getRooms(hotelId).pipe(
        map((rooms) =>
          rooms.filter((room) => {
            const maxOccupancy =
              room.maxOccupancy.adults +
              room.maxOccupancy.children +
              room.maxOccupancy.infants;
            return (
              maxOccupancy >= totalGuests &&
              contract.selectedRoomTypes.includes(room.id)
            );
          })
        )
      )
    );

    return availableRooms || []; // Return empty array if availableRooms is undefined
  }

  async getCurrencyIdByMarket(marketId: number): Promise<number | null> {
    const market = await firstValueFrom(
      this.marketService.getMarketById(marketId)
    );
    if (!market) {
      return null; // Or handle the case where the market is not found
    }
    const currencySettings = await lastValueFrom(
      this.currencyService.getCurrencySettings()
    );
    if (currencySettings) {
      const currencySetting = currencySettings.find(
        (cs) => cs.code === market.currency
      );
      return currencySetting ? currencySetting.id : null;
    } else {
      // Handle the case where currencySettings is undefined
      console.error("Currency settings not found.");
      return null;
    }
  }

  getOverlappingPeriods(
    seasonId: number,
    checkInDate: Date,
    checkOutDate: Date
  ): Observable<Period[]> {
    return this.seasonService.getPeriodsBySeason(seasonId).pipe(
      map((periods: Period[]) => {
        // Specify type of periods argument
        return periods.filter((period) => {
          const periodStart = new Date(period.startDate);
          const periodEnd = new Date(period.endDate);

          // Check for overlap with the booking dates
          return checkInDate <= periodEnd && checkOutDate >= periodStart;
        });
      })
    );
  }

  calculateRoomRates(
    room: RoomType,
    contract: Contract,
    checkInDate: Date,
    checkOutDate: Date,
    occupancy: { adults: number; children: number; infants: number }
  ): Observable<{ startDate: Date; endDate: Date; rate: number }[]> {
    console.log("Starting rate calculation:", {
      room: room.name,
      contractId: contract.id,
      dates: { checkIn: checkInDate, checkOut: checkOutDate },
      occupancy,
    });

    return this.seasonService.getPeriodsBySeason(contract.seasonId).pipe(
      tap((allPeriods) => console.log("All season periods:", allPeriods)),
      map((periods) => {
        const overlappingPeriods = periods.filter((period) => {
          const periodStart = new Date(period.startDate);
          const periodEnd = new Date(period.endDate);
          const overlaps =
            checkInDate <= periodEnd && checkOutDate >= periodStart;
          console.log(`Period ${period.name} overlaps:`, overlaps);
          return overlaps;
        });
        console.log(
          "Overlapping periods for rate calculation:",
          overlappingPeriods
        );
        return overlappingPeriods;
      }),
      switchMap((periods) => {
        console.log("Calculating rates for periods:", periods);
        return forkJoin(
          periods.map((period) => {
            console.log(`Getting rate for period:`, period);
            return this.getRoomRate(
              room,
              contract.id,
              new Date(period.startDate),
              occupancy,
              period.id
            ).pipe(
              tap((rate) =>
                console.log(`Rate received for ${period.name}:`, rate)
              ),
              map((rate) => ({
                startDate: new Date(period.startDate),
                endDate: new Date(period.endDate),
                rate: rate || 0,
              }))
            );
          })
        );
      })
    );
  }

  calculatePeriodRatesWithOffers(
    periods: Period[],
    offers: SpecialOffer[],
    checkInDate: Date,
    checkOutDate: Date,
    baseRate: number
  ): Observable<{ period: Period; rate: number }[]> {
    return of(
      periods.map((period) => {
        const periodStart = new Date(period.startDate);
        const periodEnd = new Date(period.endDate);

        const applicableOffers = offers.filter((offer) => {
          const offerStart = new Date(offer.travelDateRange.start);
          const offerEnd = new Date(offer.travelDateRange.end);
          return periodStart <= offerEnd && periodEnd >= offerStart;
        });

        let rate = baseRate; // Assuming baseRate is passed as a parameter
        applicableOffers.forEach((offer) => {
          const discount = this.getApplicableDiscount(offer, checkInDate);
          rate *= 1 - discount / 100;
        });

        return { period, rate };
      })
    );
  }

  getApplicableOffersForPeriod(
    offers: SpecialOffer[],
    startDate: Date,
    endDate: Date
  ): SpecialOffer[] {
    return offers.filter((offer) => {
      const offerStart = new Date(offer.travelDateRange.start);
      const offerEnd = new Date(offer.travelDateRange.end);
      return startDate <= offerEnd && endDate >= offerStart;
    });
  }

  applyOffersToPeriod(
    period: Period,
    offers: SpecialOffer[],
    baseRate: number
  ): { period: Period; rate: number } {
    let rate = baseRate; // Assuming baseRate is passed as a parameter

    // Separate combinable and cumulative offers
    const combinableOffers = offers.filter(
      (offer) => offer.type === "combinable"
    );
    const cumulativeOffers = offers.filter(
      (offer) => offer.type === "cumulative"
    );

    // Apply combinable offers sequentially
    combinableOffers.forEach((offer) => {
      const discount = this.getApplicableDiscount(
        offer,
        new Date(period.startDate)
      );
      rate *= 1 - discount / 100;
    });

    // Apply cumulative offers simultaneously
    if (cumulativeOffers.length > 0) {
      const totalCumulativeDiscount = cumulativeOffers.reduce((sum, offer) => {
        const discount = this.getApplicableDiscount(
          offer,
          new Date(period.startDate)
        );
        return sum + discount;
      }, 0);
      rate *= 1 - totalCumulativeDiscount / 100;
    }

    return { period, rate };
  }

  calculateTotalRate(
    periods: Period[],
    offers: SpecialOffer[],
    baseRate: number
  ): number {
    let totalRate = 0;
    periods.forEach((period) => {
      const { rate } = this.applyOffersToPeriod(period, offers, baseRate);
      totalRate += rate;
    });
    return totalRate;
  }

  private getApplicableDiscount(offer: SpecialOffer, stayDate: Date): number {
    const applicableDiscount = offer.discountValues.find((discount) => {
      const discountStart = new Date(discount.bookingDateRange.start);
      const discountEnd = new Date(discount.bookingDateRange.end);
      return stayDate >= discountStart && stayDate <= discountEnd;
    });

    return applicableDiscount?.value ?? 0;
  }

  calculateNightlyRatesWithOffers(
    checkInDate: Date,
    checkOutDate: Date,
    offers: SpecialOffer[],
    baseRate: number
  ): { date: Date; rate: number }[] {
    const nightlyRates: { date: Date; rate: number }[] = [];
    let currentDate = new Date(checkInDate);

    while (currentDate <= checkOutDate) {
      let nightlyRate = baseRate;
      const applicableOffers = this.getApplicableOffersForDate(
        currentDate,
        offers
      );

      // Separate combinable and cumulative offers
      const combinableOffers = applicableOffers.filter(
        (offer) => offer.type === "combinable"
      );
      const cumulativeOffers = applicableOffers.filter(
        (offer) => offer.type === "cumulative"
      );

      // Apply combinable offers sequentially
      combinableOffers.forEach((offer) => {
        const discount = this.getApplicableDiscount(offer, currentDate);
        nightlyRate *= 1 - discount / 100;
      });

      // Apply cumulative offers simultaneously
      if (cumulativeOffers.length > 0) {
        const totalCumulativeDiscount = cumulativeOffers.reduce(
          (sum, offer) => {
            const discount = this.getApplicableDiscount(offer, currentDate);
            return sum + discount;
          },
          0
        );
        nightlyRate *= 1 - totalCumulativeDiscount / 100;
      }

      nightlyRates.push({ date: new Date(currentDate), rate: nightlyRate });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return nightlyRates;
  }

  private getApplicableOffersForDate(
    date: Date,
    offers: SpecialOffer[]
  ): SpecialOffer[] {
    return offers.filter((offer) => {
      const offerStart = new Date(offer.travelDateRange.start);
      const offerEnd = new Date(offer.travelDateRange.end);
      return date >= offerStart && date <= offerEnd;
    });
  }

  getRoomRate(
    room: RoomType,
    contractId: number,
    checkInDate: Date,
    occupancy: { adults: number; children: number; infants: number },
    periodId: number // Add periodId parameter
  ): Observable<number | null> {
    console.log("Getting room rate:", {
      room,
      contractId,
      checkInDate,
      occupancy,
      periodId,
    });

    return from(this.contractRateService.getContractRates(contractId)).pipe(
      tap((rates) => console.log("Contract rates:", rates)),
      map((rates) => {
        const periodRate = rates.find((rate) => rate.periodId === periodId);
        console.log("Found period rate:", periodRate);

        const roomRate = periodRate?.roomRates.find(
          (r) => r.roomTypeId === room.id
        );
        console.log("Found room rate:", roomRate);

        return this.calculateRoomRate(periodRate, room, occupancy);
      })
    );
  }

  private calculateRoomRate(
    periodRate: ContractPeriodRate | undefined,
    room: RoomType,
    occupancy: { adults: number; children: number; infants: number }
  ): number {
    if (!periodRate) return 0;

    const roomRate = periodRate.roomRates.find(
      (r: RoomTypeRate) => r.roomTypeId === room.id
    );
    console.log("Found room rate:", roomRate);

    if (!roomRate) return 0;

    let total = 0;
    const { adults = 0, children = 0 } = occupancy;

    if (roomRate.rateType === "per_villa") {
      return roomRate.villaRate || 0;
    }

    const personRates = roomRate.personTypeRates;

    if (personRates && personRates["adult"]?.rates) {
      // Use the rate corresponding to the total number of adults
      total = personRates["adult"].rates[adults] || 0;
    }

    if (personRates && personRates["child"]?.rates) {
      for (let i = 1; i <= children; i++) {
        total += personRates["child"].rates[i] || 0;
      }
    }

    console.log("Calculated total:", total);
    return total;
  }

  getCurrencySymbol(marketId: number): Observable<string> {
    return this.marketService.getMarketById(marketId).pipe(
      switchMap((market: Market | undefined) => {
        if (!market) return of(""); // Return empty string if market not found
        return this.currencyService.getCurrencySettings().pipe(
          map((currencySettings: CurrencySetting[]) => {
            const currencySetting = currencySettings.find(
              (cs) => cs.code === market.currency
            );
            return currencySetting ? currencySetting.symbol : "";
          })
        );
      })
    );
  }
}
