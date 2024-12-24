// src/app/components/reservation/reservation.component.ts
import { Component, Input, computed, signal } from "@angular/core";
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
import { MatDivider } from "@angular/material/divider";

// Add interface for type safety
interface RoomRateWithPeriod extends RoomTypeRate {
  periodStartDate: string;
  periodEndDate: string;
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
  rateType: 'per_villa' | 'per_person';
  villaRate?: number;
  personTypeRates?: {
    adult?: PersonTypeRates;
    child?: PersonTypeRates;
  };
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
    MatDivider
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

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private marketService: MarketService,
    private contractService : ContractService,
    private contractRateService: ContractRateService
    ) {
    this.initForm();
    }


  ngOnInit() {
    // Load hotels when component initializes
    this.hotelService.getHotels().subscribe(hotels => {
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
    this.searchForm.get('checkIn')?.valueChanges.subscribe(date => {
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

    const currentCheckOut = this.searchForm.get('checkOut')?.value;
    const currentCheckOutDate = currentCheckOut ? new Date(currentCheckOut) : null;

    // Only update if there's no check-out date or if it's before the check-in date
    if (!currentCheckOutDate || currentCheckOutDate <= checkInDate) {
      this.searchForm.patchValue({
        checkOut: defaultCheckOut.toISOString().split('T')[0]
      });
    }
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
  
      console.log('Found contracts for hotel:', contracts);
  
      const activeMarketIds = [...new Set(
        contracts
          .filter(contract => 
            contract.status === 'active' && 
            contract.isRatesConfigured && 
            contract.hotelId === hotelId
          )
          .map(contract => contract.marketId)
      )];
  
      console.log('Active market IDs:', activeMarketIds);
  
      if (activeMarketIds.length === 0) {
        console.log('No active contracts found for hotel:', hotelId);
        this.availableMarkets.set([]);
        return;
      }
  
      const allMarkets = await firstValueFrom(this.marketService.markets$);
      const availableMarkets = allMarkets.filter(market => 
        activeMarketIds.includes(market.id) && 
        market.isActive
      );
  
      console.log('Available markets:', availableMarkets);
      this.availableMarkets.set(availableMarkets);
  
      // If there's only one market, automatically select it and load its contract
      if (availableMarkets.length === 1) {
        const singleMarket = availableMarkets[0];
        
        // Find the active contract for this market
        const marketContract = contracts.find(contract => 
          contract.marketId === singleMarket.id && 
          contract.status === 'active' && 
          contract.isRatesConfigured
        );
        
        if (marketContract) {
          // Set the market ID in the form
          this.searchForm.patchValue({ marketId: singleMarket.id });
          
          // Set the active contract
          this.activeContract.set(marketContract);
          
          // Load contract rates
          const rates = await this.contractRateService.getContractRates(marketContract.id);
          this.contractRates.set(rates);
          
          // Load periods for the contract's season
          if (marketContract.seasonId) {
            try {
                const periods = await firstValueFrom(
                this.contractService.getPeriods(marketContract.seasonId)
                );
                this.periods.set(periods);
                
                // Log contract selection
                console.log('Automatically selected and loaded contract:', {
                marketId: singleMarket.id,
                marketName: singleMarket.name,
                contract: {
                  id: marketContract.id,
                  hotelId: marketContract.hotelId,
                  marketId: marketContract.marketId,
                  status: marketContract.status,
                  selectedRoomTypes: marketContract.selectedRoomTypes
                }
                });

                // Add new logging for available booking dates
                console.log('Available booking periods:', periods.map(period => ({
                periodId: period.id,
                dateRange: `${new Date(period.startDate).toLocaleDateString()} - ${new Date(period.endDate).toLocaleDateString()}`
                })));
                
                console.log('Tip: Try searching with 1 adult to see all available rooms. You can then adjust occupancy as needed.');
            } catch (error) {
              console.error('Error loading periods:', error);
              this.periods.set([]);
            }
          }
          
          console.log('Automatically selected and loaded contract:', {
            marketId: singleMarket.id,
            marketName: singleMarket.name,
            contract: {
              id: marketContract.id,
              hotelId: marketContract.hotelId,
              marketId: marketContract.marketId,
              status: marketContract.status,
              selectedRoomTypes: marketContract.selectedRoomTypes
            }
          });
        }
      }
    } catch (error) {
      console.error('Error loading markets for hotel:', error);
      this.availableMarkets.set([]);
    }
  }
  

  async onMarketChange() {
    const { hotelId, marketId } = this.searchForm.value;
    if (!hotelId || !marketId) return;
  
    try {
      // Get active contract for selected hotel and market
      const contract = await this.contractService.getActiveContract(hotelId, marketId);
      if (contract) {
        this.activeContract.set(contract);
        
        // Add detailed console logging about the selected contract
        console.log('Selected Market ID:', marketId);
        console.log('Selected Contract:', {
          id: contract.id,
          hotelId: contract.hotelId,
          marketId: contract.marketId,
          status: contract.status,
          selectedRoomTypes: contract.selectedRoomTypes
        });
        
        // Load contract rates
        const rates = await this.contractRateService.getContractRates(contract.id);
        this.contractRates.set(rates);

        // Load periods for the contract's season
        if (contract.seasonId) {
          try {
            const periods = await firstValueFrom(
              this.contractService.getPeriods(contract.seasonId)
            );
            this.periods.set(periods);
            console.log('Loaded periods:', periods);
          } catch (error) {
            console.error('Error loading periods:', error);
            this.periods.set([]);
          }
        }
  
        // Reset room selection since available rooms may have changed
        this.searchForm.patchValue({ roomTypeId: null });
      } else {
        console.warn('No active contract found for hotel and market');
        this.activeContract.set(null);
        this.contractRates.set([]);
        this.periods.set([]);
      }
    } catch (error) {
      console.error('Error loading contract data:', error);
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
    const { hotelId, marketId, checkIn, adults, children, infants } = this.searchForm.value;
    
    if (!this.activeContract()) {
      console.warn('No active contract found');
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
      const filtered = this.roomTypes().filter(room => {
        // Check if room is in active contract
        const isInContract = this.activeContract()?.selectedRoomTypes.includes(room.id);
        
        // Check occupancy requirements
        const meetsOccupancy = 
          room.maxOccupancy.adults >= (adults || 1) &&
          room.maxOccupancy.children >= (children || 0) &&
          room.maxOccupancy.infants >= (infants || 0);

        // Skip period validation for now
        const hasValidRates = this.contractRates().some(rate => 
          rate.roomRates.some(roomRate => roomRate.roomTypeId === room.id)
        );

        return isInContract && meetsOccupancy && hasValidRates;
      });


      console.log('Filtered rooms:', filtered);
      this.filteredRooms.set(filtered);
    } catch (error) {
      console.error('Error searching rooms:', error);
      this.filteredRooms.set([]);
    }
  }

  private getPeriodForDate(checkInDate: Date, periodId: number): Period | null {
    return this.periods().find(period => 
      period.id === periodId && 
      new Date(checkInDate) >= new Date(period.startDate) && 
      new Date(checkInDate) <= new Date(period.endDate)
    ) || null;
  }

  getRoomRate(room: RoomType): number {
    const { checkIn, marketId, adults, children } = this.searchForm.value;
    const contract = this.activeContract();
    
    if (!contract || !checkIn) return 0;

    // Get rates for the contract
    const rates = this.contractRates();
    if (!rates.length) return 0;

    // For now, we'll use the first available rate for the room
    const periodRate = rates[0];
    if (!periodRate) return 0;

    // Find the room rate within the period
    const roomRate = periodRate.roomRates.find(r => r.roomTypeId === room.id);
    if (!roomRate) return 0;

    // Calculate total rate based on rate type and occupancy
    if (roomRate.rateType === 'per_villa') {
      const totalOccupants = (adults || 0) + (children || 0);
      const maxOccupancy = room.maxOccupancy.adults + room.maxOccupancy.children;
      
      return totalOccupants <= maxOccupancy ? (roomRate.villaRate || 0) : 0;
    }

    // For per_person rates
    let total = 0;
    
    // Calculate adult rates
    if (adults > 0) {
      const adultRates = roomRate.personTypeRates?.['adult']?.rates as PersonTypeRates['rates'];
      if (adultRates) {
      if (adults === 1) {
        total += adultRates[1] || 0;
      } else if (adults === 2) {
        total += adultRates[2] || 0;
      } else if (adults > 2) {
        total += adultRates[2] || 0; // Base double rate
        // Apply extra adult rate for each additional adult
        total += (adultRates.extra || 0) * (adults - 2);
      }
      }
    }

    // Calculate child rates
    if (children > 0) {
      const childRates = roomRate.personTypeRates?.['child']?.rates as PersonTypeRates['rates'];
      if (childRates) {
      for (let i = 1; i <= children; i++) {
        const childRate = childRates[i] || childRates.extra || 0;
        total += childRate;
      }
      }
    }


    return total;
  }



  getMarketCurrency(): string {
    const marketId = this.searchForm.get('marketId')?.value;
    return this.marketService.getMarketById(marketId)?.currency || '';
  }

  getBaseMealPlan(room: RoomType): MealPlanResult {
    try {
      const contract = this.activeContract();
      if (!contract) {
        return { value: '', error: 'No active contract found' };
      }
      if (!contract.baseMealPlan) {
        return { value: '', error: 'No meal plan configured' };
      }
      return { value: contract.baseMealPlan };
    } catch (error) {
      return { value: '', error: 'Error loading meal plan' };
    }
  }




  private getActiveContractForRoom(roomId: number, marketId: number): Contract | null {
    return this.contracts().find(contract => 
      contract.marketId === marketId && 
      contract.selectedRoomTypes.includes(roomId) &&
      contract.status === 'active'
    ) || null;
  }

  private getMealPlanName(mealPlanType: MealPlanType): string {
    return MEAL_PLAN_NAMES[mealPlanType] || mealPlanType;
  }

  selectRoom(room: RoomType): void {
    console.log('Selected room:', {
      id: room.id,
      name: room.name,
      maxOccupancy: room.maxOccupancy,
      rate: this.getRoomRate(room),
      baseMealPlan: this.getBaseMealPlan(room)
    });
    
    // Get current form values for context
    const { checkIn, checkOut, adults, children, infants } = this.searchForm.value;
    
    console.log('Booking details:', {
      checkIn,
      checkOut,
      occupancy: {
        adults,
        children,
        infants
      },
    });
  }
}