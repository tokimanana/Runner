import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  Hotel,
  Rate,
  RateConfiguration,
  Contract,
  Season,
  RoomType,
  Currency,
  AgeCategory,
  Market,
  MarketGroup,
  MarketTemplate,
  CurrencySetting,
  MEAL_PLAN_TYPE_VALUES,
  MealPlanType
} from 'src/app/models/types';
import { HotelService } from '../../services/hotel.service';
import { firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { ModalComponent } from "../modal/modal.component";

// Types
interface RateFilters {
  seasonId?: number;
  roomTypeId?: number;
  currency?: string;
}

@Component({
  selector: 'app-rates-config',
  templateUrl: './rates-config.component.html',
  styleUrls: ['./rates-config.component.css'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatSelectModule,
    MatSelectModule,
    MatFormFieldModule,
    ModalComponent
]
})
export class RatesConfigComponent implements OnInit {
  @Input() hotel: Hotel | null = null;
  filterForm: FormGroup;
  
  marketTemplates: MarketTemplate[] = [];
  markets: Market[] = [];
  activeContracts: Contract[] = [];
  showRateEditor = false;
  showAgeCategoryEditor = false;
  isLoading = false;
  /**
   * Success message handling
   */
  public success = '';

  /**
   * Error message handling
   */
  public error: string | null = null;

  currentRates: Rate[] = [];
  filteredRates: RateConfiguration[] = [];
  seasons: Season[] = [];
  rooms: RoomType[] = [];
  currencies: string[] = [];
  currencySettings: CurrencySetting[] = [];
  selectedSeason: Season | null = null;
  selectedRoomType: RoomType | null = null;
  selectedCurrency: Currency | null = null;
  editingRate: RateConfiguration | null = null;
  mealPlanTypes = MEAL_PLAN_TYPE_VALUES;
  ratesByCategory: { [key: string]: number } = {};
  mealPlanRates: Record<MealPlanType, Record<string, number>> = {} as Record<MealPlanType, Record<string, number>>;
  selectedMarket: number | null = null;
  specialOffersList: any[] = [];
  categoryTypes = [
    { value: 'adult' as const, label: 'Adult', icon: 'person' },
    { value: 'teen' as const, label: 'Teen', icon: 'face' },
    { value: 'child' as const, label: 'Child', icon: 'child_care' },
    { value: 'infant' as const, label: 'Infant', icon: 'baby_changing_station' }
  ] as const;
  marketGroups: MarketGroup[] = [];
  selectedRegion: string | null = null;
  filteredMarkets: Market[] = [];

  // Forms with definite assignment
  basicInfoForm!: FormGroup;
  categoryRatesForm!: FormGroup;
  mealPlansForm!: FormGroup;
  specialOffersForm!: FormGroup;
  rateForm!: FormGroup;
  rateModalForm!: FormGroup;
  categoryForm!: FormGroup;
  showRateModal = false;

  // Age Categories Modal
  showAgeCategoryModal = false;
  showCategoryForm = false;
  editingCategory: AgeCategory | null = null;
  ageCategories: AgeCategory[] = [];

  // Category management
  newCategory: Partial<AgeCategory> = {};
  categories: AgeCategory[] = [];

  // Meal Plans
  mealPlans: MealPlanType[] = MEAL_PLAN_TYPE_VALUES;
  selectedMealPlans: MealPlanType[] = [];

  private defaultCurrency = 'EUR';  // Default currency for the application

  public originalValues: any = null;

  modalMessage: string | null = null;
  modalError: boolean = false;

  rateConfigurations: RateConfiguration[] = [];

  get modalTitle(): string {
    if (this.editingRate) {
      return 'Edit Rate';
    }
    if (this.originalValues) {
      return 'Duplicate Rate';
    }
    return 'Add Rate';
  }

  constructor(
    private formBuilder: FormBuilder,
    private hotelService: HotelService
  ) {
    // Initialize filter form with correct control names
    this.filterForm = this.formBuilder.group({
      seasonId: [null],
      roomTypeId: [null],
      currency: ['All']
    });

    // Rate modal form initialization
    this.rateModalForm = this.formBuilder.group({
      seasonId: [null, Validators.required],
      roomTypeId: [null, Validators.required],
      region: [null, Validators.required],
      baseRate: [null, [Validators.required, Validators.min(0)]],
      extraAdult: [null, [Validators.required, Validators.min(0)]],
      extraChild: [null, [Validators.required, Validators.min(0)]],
      singleOccupancy: [null]
    });

    this.initializeCategoryForm();
  }

  ngOnInit() {
    // Subscribe to selected hotel changes with debounce to prevent rapid re-renders
    this.hotelService.selectedHotel$
      .pipe(
        distinctUntilChanged((prev, curr) => prev?.id === curr?.id),
        debounceTime(100) // Add debounce to prevent multiple rapid calls
      )
      .subscribe(hotel => {
        console.log('Selected hotel in rates config:', hotel);
        this.hotel = hotel;
        if (hotel) {
          this.isLoading = true;
          this.initializeForms();
          this.subscribeToFormChanges();
          this.loadInitialData().finally(() => {
            this.isLoading = false;
          });
        }
      });
  }

  /**
   * Loads and initializes all required data for the component
   */
  public async loadInitialData(): Promise<void> {
    try {
      this.error = null; // Clear any previous errors
      
      if (!this.hotel?.id) {
        console.warn('No hotel available in component');
        return;
      }
      
      console.log('Loading initial data for hotel:', this.hotel.id);
      
      // Load data sequentially to ensure proper dependencies
      await this.loadMarketGroups();
      await this.loadSeasons();
      await this.loadRooms();
      await this.loadCurrencies();
      await this.loadRates();

      console.log('Initial data loaded:', {
        hotel: this.hotel.id,
        marketGroups: this.marketGroups?.length || 0,
        seasons: this.seasons?.length || 0,
        rooms: this.rooms?.length || 0,
        currencies: this.currencies?.length || 0,
        rates: this.currentRates?.length || 0
      });
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.error = 'Failed to load hotel configuration data';
    }
  }

  private async loadMarketGroups(): Promise<void> {
    try {
      // Load market groups
      this.marketGroups = await firstValueFrom(this.hotelService.getMarketGroups());
      if (!this.marketGroups?.length) {
        console.warn('No market groups loaded');
        return;
      }

      // Get markets for the current hotel
      this.markets = this.hotelService.getMarkets(this.hotel!.id);
      if (!this.markets?.length) {
        console.warn('No markets loaded');
      }
    } catch (error) {
      console.error('Error loading market groups:', error);
      this.handleError(error, 'Failed to load market groups');
      this.marketGroups = []; // Initialize to empty array on error
      this.markets = []; // Initialize to empty array on error
    }
  }

  /**
   * Initialize filters with default values
   */
  private initializeFilters(): void {
    this.filterForm = this.formBuilder.group({
      seasonId: [null],
      roomTypeId: [null],
      currency: ['All']
    });

    // Subscribe to all form control changes
    const controls = ['seasonId', 'roomTypeId', 'currency'];
    
    controls.forEach(controlName => {
      this.filterForm.get(controlName)?.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe(() => {
          this.applyFilters();
        });
    });
  }

  /**
   * Apply all active filters to the current rates
   * Public method to allow manual filter application from the template
   */
  public applyFilters(): void {
    if (!this.rateConfigurations?.length) {
      this.filteredRates = [];
      return;
    }

    try {
      const filters: RateFilters = {
        seasonId: this.filterForm.value.seasonId ? Number(this.filterForm.value.seasonId) : undefined,
        roomTypeId: this.filterForm.value.roomTypeId ? Number(this.filterForm.value.roomTypeId) : undefined,
        currency: this.filterForm.value.currency !== 'All' ? this.filterForm.value.currency : undefined
      };

      let result = [...this.rateConfigurations];

      result = this.applySeasonFilter(result, filters.seasonId);
      result = this.applyRoomFilter(result, filters.roomTypeId);
      result = this.applyCurrencyFilter(result, filters.currency);

      this.filteredRates = result;
    } catch (error) {
      this.filteredRates = [...this.rateConfigurations];
    }
  }

  /**
   * Filter rates by season
   */
  private applySeasonFilter(rates: RateConfiguration[], seasonId?: number): RateConfiguration[] {
    if (!seasonId) return rates;
    return rates.filter(rate => rate.seasonId === seasonId);
  }

  /**
   * Filter rates by room type
   */
  private applyRoomFilter(rates: RateConfiguration[], roomTypeId?: number): RateConfiguration[] {
    if (!roomTypeId) return rates;
    return rates.filter(rate => rate.roomTypeId === roomTypeId);
  }

  /**
   * Filter rates by currency
   */
  private applyCurrencyFilter(rates: RateConfiguration[], currency?: string): RateConfiguration[] {
    if (!currency) return rates;
    return rates.filter(rate => rate.currency === currency);
  }

  /**
   * Reset filters to default values
   */
  public resetFilters(): void {
    this.filterForm.patchValue({
      seasonId: null,
      roomTypeId: null,
      currency: 'All'
    }, { emitEvent: true });
  }

  /**
   * Clear all filters and show all rates
   */
  clearFilters(): void {
    this.resetFilters();
  }

  /**
   * Handle currency selection changes
   */
  public onCurrencySelect(event: any): void {
    const currency = event.target.value;
    this.filterForm.patchValue({ currency }, { emitEvent: true });
  }

  private initializeForms() {
    // Basic info form
    this.basicInfoForm = this.formBuilder.group({
      season: ['', Validators.required],
      roomType: ['', Validators.required],
      currency: ['', Validators.required]
    });

    // Rate form
    this.rateForm = this.formBuilder.group({
      seasonId: ['', Validators.required],
      roomTypeId: ['', Validators.required],
      marketId: ['', Validators.required],
      baseRate: ['', [Validators.required, Validators.min(0)]],
      extraAdult: [0, Validators.min(0)],
      extraChild: [0, Validators.min(0)],
      singleOccupancy: [null]
    });

    // Rate modal form
    this.initializeRateModalForm();

    // Subscribe to filter form changes
    this.subscribeToFilterFormChanges();
  }

  private subscribeToFilterFormChanges() {
    // Subscribe to individual control changes for more precise filtering
    const controls = ['seasonId', 'roomTypeId', 'currency'];
    
    controls.forEach(controlName => {
      this.filterForm.get(controlName)?.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe(() => {
          this.applyFilters();
        });
    });
  }

  /**
   * Initialize the rate modal form
   */
  private initializeRateModalForm(): void {
    // Create the form without marketId
    const formGroup = {
      seasonId: [null, Validators.required],
      roomTypeId: [null, Validators.required],
      region: [null, Validators.required],
      baseRate: [null, [Validators.required, Validators.min(0)]],
      extraAdult: [null, [Validators.required, Validators.min(0)]],
      extraChild: [null, [Validators.required, Validators.min(0)]],
      singleOccupancy: [null]
    };

    this.rateModalForm = this.formBuilder.group(formGroup);
  }

  private subscribeToFormChanges() {
    // Filter form changes
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => 
          prev.season === curr.season && 
          prev.roomType === curr.roomType && 
          prev.currency === curr.currency
        )
      )
      .subscribe(() => this.applyFilters());

    // Basic Info Form changes
    if (this.basicInfoForm) {
      const seasonControl = this.basicInfoForm.get('season');
      const roomTypeControl = this.basicInfoForm.get('roomType');
      const currencyControl = this.basicInfoForm.get('currency');

      if (seasonControl) {
        seasonControl.valueChanges.subscribe(value => {
          this.selectedSeason = value;
          this.applyFilters();
        });
      }

      if (roomTypeControl) {
        roomTypeControl.valueChanges.subscribe(value => {
          this.selectedRoomType = value;
          this.applyFilters();
        });
      }

      if (currencyControl) {
        currencyControl.valueChanges.subscribe(value => {
          const currencySetting = this.currencySettings.find(c => c.code === value);
          if (currencySetting) {
            this.selectedCurrency = {
              code: currencySetting.code,
              symbol: currencySetting.symbol,
              name: currencySetting.name || currencySetting.code // Provide a fallback for name
            };
          } else {
            this.selectedCurrency = null;
          }
          this.applyFilters();
        });
      }
    }
  }

  private loadMarketSpecificData(region: string) {
    if (!this.hotel || !region) return;

    try {
      // Load market-specific rates and templates
      const marketGroup = this.marketGroups.find(m => m.region === region);
      if (marketGroup) {
        // Initialize market-specific data
        this.initializeMarketRates(marketGroup);
      }
    } catch (error) {
      this.error = 'Failed to load market-specific data';
    }
  }

  private initializeMarketRates(marketGroup: MarketGroup) {
    // Initialize rates based on market currency and settings
    this.categoryRatesForm.reset();
    if (this.hotel?.ageCategories) {
      this.hotel.ageCategories.forEach(category => {
        const defaultRate = category.defaultRate || 0;
        this.categoryRatesForm.get(category.type)?.setValue(defaultRate);
      });
    }
  }

  updateMealPlanRates() {
    this.selectedMealPlans.forEach(planType => {
      if (!this.mealPlanRates[planType]) {
        this.mealPlanRates[planType] = {};
      }
      
      if (this.hotel?.ageCategories) {
        this.hotel.ageCategories.forEach(category => {
          const baseRate = this.categoryRatesForm.get(category.type)?.value || 0;
          this.mealPlanRates[planType][category.type] = baseRate;
        });
      }
    });
  }

  getRatesGroupedByCurrency(rates: RateConfiguration[]): { [currency: string]: RateConfiguration[] } {
    return rates.reduce((acc, rate) => {
      const currency = rate.currency || this.defaultCurrency;
      if (!acc[currency]) {
        acc[currency] = [];
      }
      acc[currency].push(rate);
      return acc;
    }, {} as { [currency: string]: RateConfiguration[] });
  }

  private resetAllData() {
    this.currentRates = [];
    this.filteredRates = [];
    this.selectedSeason = null;
    this.selectedRoomType = null;
    this.selectedCurrency = null;
    this.selectedMealPlans = [];
    this.editingRate = null;
    this.ratesByCategory = {};
    this.mealPlanRates = {} as Record<MealPlanType, Record<string, number>>;
    this.selectedMarket = null;
    this.specialOffersList = [];
    this.error = null;
  }

  public isFormValid(): boolean {
    return (
      this.basicInfoForm.valid &&
      this.categoryRatesForm.valid &&
      this.mealPlansForm.valid &&
      this.specialOffersForm.valid &&
      this.rateForm.valid
    );
  }

  private async loadSeasons(): Promise<void> {
    if (!this.hotel?.id) {
      this.error = 'Hotel ID is required for loading seasons';
      return;
    }
    try {
      this.seasons = this.hotelService.getSeasons(this.hotel.id);
      console.log('Loaded seasons:', this.seasons); // Debug log
    } catch (error) {
      console.error('Error loading seasons:', error);
      this.handleError(error, 'Failed to load seasons');
    }
  }

  private async loadRooms(): Promise<void> {
    if (!this.hotel) {
      console.warn('No hotel available for loading rooms');
      return Promise.resolve();
    }
    
    try {
      // Get rooms from the hotel object first
      let loadedRooms = this.hotel.rooms || [];
      
      // If no rooms in hotel object, try to get from service
      if (loadedRooms.length === 0) {
        console.log('No rooms in hotel object, fetching from service for hotel:', this.hotel.id);
        loadedRooms = this.hotelService.getRooms(this.hotel.id);
      }

      // Validate and deduplicate rooms
      const roomMap = new Map<number, RoomType>();
      loadedRooms.forEach(room => {
        if (room && room.id && room.type) {
          // If we already have this room ID, only override if the current one has more complete data
          const existing = roomMap.get(room.id);
          if (!existing || (room.name && !existing.name)) {
            roomMap.set(room.id, room);
          }
        } else {
          console.warn('Invalid room data:', room);
        }
      });

      // Convert map back to array
      this.rooms = Array.from(roomMap.values());
      
      console.log('Room loading results:', {
        hotelId: this.hotel.id,
        originalCount: loadedRooms.length,
        validRooms: this.rooms.length,
        rooms: this.rooms.map(r => ({ id: r.id, type: r.type }))
      });

    } catch (error) {
      console.error('Error loading rooms:', error);
      this.handleError(error, 'Failed to load room data');
      this.rooms = [];
    }

    return Promise.resolve();
  }

  private async loadCurrencies(): Promise<void> {
    try {
      if (!this.marketGroups?.length || !this.markets?.length) {
        console.warn('Market groups or markets not loaded');
        return;
      }

      // Get unique currencies from markets in market groups
      const uniqueCurrencies = new Set<string>();
      
      // Get all market IDs from market groups
      const marketIds = this.marketGroups.flatMap(group => group.markets);
      
      // Get currencies from markets that are in market groups
      this.markets
        .filter(market => marketIds.includes(market.id) && market.isActive)
        .forEach(market => {
          if (market.currency) {
            uniqueCurrencies.add(market.currency);
          }
        });

      // Update currencies array
      this.currencies = Array.from(uniqueCurrencies);
      
      if (!this.currencies.length) {
        console.warn('No currencies found in market groups');
        // Add default currency if no currencies found
        this.currencies = [this.defaultCurrency];
      }
    } catch (error) {
      console.error('Error loading currencies:', error);
      this.handleError(error, 'Failed to load currencies');
      this.currencies = [this.defaultCurrency]; // Initialize with default currency on error
    }
  }

  async loadRates(): Promise<void> {
    if (!this.hotel?.id) {
      console.warn('No hotel ID available for loading rates');
      return;
    }
  
    try {
      // Get active contracts first
      this.activeContracts = await firstValueFrom(this.hotelService.getContracts(this.hotel.id));
      
      // Process rates from contracts and store them
      this.currentRates = this.processContractRates(this.activeContracts);
      
      // Map rates to configurations with room information
      this.rateConfigurations = this.currentRates.map(rate => this.mapToRateConfiguration(rate));
      
      // Log any rates with missing room information
      const missingRooms = this.rateConfigurations.filter(rate => !this.rooms.some(room => room.id === rate.roomTypeId));
      if (missingRooms.length > 0) {
        console.warn('Rates with missing room information:', missingRooms);
      }
  
      // Apply initial filters
      this.applyFilters();
      
      console.log('Rates loaded:', {
        totalRates: this.currentRates.length,
        validRates: this.rateConfigurations.length,
        missingRooms: missingRooms.length,
        rates: this.rateConfigurations.map(r => ({
          id: r.id,
          baseRate: r.baseRate,
          roomTypeId: r.roomTypeId
        }))
      });
    } catch (error) {
      console.error('Error loading rates:', error);
      this.handleError(error, 'Failed to load rates');
      this.currentRates = [];
      this.rateConfigurations = [];
      this.filteredRates = [];
    }
  }

  private findRegionForMarket(marketId: number): string {
    const marketGroup = this.marketGroups.find(m => m.markets.includes(marketId));
    return marketGroup?.region || '';
  }

  openRateEditor(rate: RateConfiguration | null = null): void {
    this.editingRate = rate;
    this.showRateModal = true;

    if (rate) {
      // Patch values for editing
      this.rateModalForm.patchValue({
        seasonId: rate.seasonId,
        roomTypeId: rate.roomTypeId,
        region: rate.region,
        baseRate: rate.baseRate,
        extraAdult: rate.extraAdult,
        extraChild: rate.extraChild,
        singleOccupancy: rate.singleOccupancy
      });
    } else {
      this.rateModalForm.reset();
    }
  }

  openAgeCategoryEditor(): void {
    this.showAgeCategoryEditor = true;
    this.showCategoryForm = false;
    this.editingCategory = null;
    this.newCategory = this.getEmptyCategoryTemplate();
  }

  getAgeRange(category: AgeCategory): string {
    return `${category.minAge} - ${category.maxAge} years`;
  }

  formatDateRange(start: string | Date | undefined, end: string | Date | undefined): string {
    if (!start || !end) return '';
    
    const startDate = typeof start === 'string' ? new Date(start) : start;
    const endDate = typeof end === 'string' ? new Date(end) : end;
    
    return `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;
  }

  private formatDate(date: Date): string {
    return [
      date.getDate().toString().padStart(2, '0'),
      (date.getMonth() + 1).toString().padStart(2, '0'),
      date.getFullYear()
    ].join('/');
  }

  closeAgeCategoryEditor() {
    this.showAgeCategoryEditor = false;
    this.showCategoryForm = false;
    this.editingCategory = null;
    this.newCategory = this.getEmptyCategoryTemplate();
  }

  cancelEdit() {
    this.showRateEditor = false;
    this.editingRate = null;
    this.rateForm.reset();
  }

  resetNewCategory() {
    this.newCategory = {
      type: 'adult',
      minAge: 0,
      maxAge: 0,
      defaultRate: 0
    };
  }

  public saveAgeCategory() {
    if (!this.isAgeCategoryValid()) {
      return;
    }

    if (!this.hotel) {
      this.error = 'No hotel selected';
      return;
    }

    const categoryData = this.editingCategory ? 
      { ...this.editingCategory, ...this.newCategory } : 
      { ...this.newCategory, id: this.getNextCategoryId() } as AgeCategory;

    // Ensure hotel.ageCategories is initialized
    if (!this.hotel.ageCategories) {
      this.hotel.ageCategories = [];
    }

    // Update or add category
    if (this.editingCategory) {
      const index = this.hotel.ageCategories.findIndex(c => c.id === this.editingCategory?.id);
      if (index !== -1) {
        this.hotel.ageCategories[index] = categoryData;
      }
    } else {
      this.hotel.ageCategories.push(categoryData);
    }

    this.sortCategories();
    this.cancelCategoryEdit();
    this.initializeRates(this.hotel.ageCategories);
  }

  getCategoryIcon(type: string): string {
    const categoryType = this.categoryTypes.find(t => t.value === type);
    return categoryType?.icon || 'person';
  }


  isAgeCategoryValid(): boolean {
    const { label, type, minAge, maxAge } = this.newCategory;
    if (!label || !type || typeof minAge !== 'number' || typeof maxAge !== 'number') {
      return false;
    }
    return minAge >= 0 && maxAge > minAge;
  }

  addAgeCategory() {
    if (!this.hotel?.ageCategories) return;

    const maxId = Math.max(0, ...this.hotel.ageCategories.map(c => c.id));
    const newCategory: AgeCategory = {
      id: maxId + 1,
      type: 'child',
      label: 'New Category',
      minAge: 0,
      maxAge: 12,
      defaultRate: 0
    };
    this.hotel.ageCategories = [...this.hotel.ageCategories, newCategory];
  }

  removeAgeCategory(category: AgeCategory) {
    if (!this.hotel?.ageCategories || this.hotel.ageCategories.length <= 1) return;
    
    this.hotel.ageCategories = this.hotel.ageCategories.filter(c => c.id !== category.id);
  }

  validateAgeCategory(category: AgeCategory): string[] {
    // Check for overlapping age ranges
    const otherCategories = this.ageCategories.filter(c => 
      !this.editingCategory || c.id !== this.editingCategory.id
    );

    const errors: string[] = [];
    
    if (!category.label.trim()) {
      errors.push('Label is required');
    }
    
    if (category.minAge < 0) {
      errors.push('Minimum age cannot be negative');
    }
    
    if (category.maxAge < category.minAge) {
      errors.push('Maximum age must be greater than minimum age');
    }
    
    // Check for overlapping age ranges
    if (this.hotel?.ageCategories) {
      const otherCategories = this.hotel.ageCategories.filter(c => 
        c.id !== category.id && c.type === category.type
      );
      
      for (const other of otherCategories) {
        if (this.ageRangesOverlap(category, other)) {
          errors.push(`Age range overlaps with ${other.label}`);
        }
      }
    }
    
    return errors;
  }

  ageRangesOverlap(cat1: AgeCategory, cat2: AgeCategory): boolean {
    return !(cat1.maxAge < cat2.minAge || cat1.minAge > cat2.maxAge);
  }

  sortCategories(): void {
    if (this.hotel?.ageCategories) {
      this.hotel.ageCategories.sort((a, b) => a.minAge - b.minAge);
    }
  }

  editRate(rate: RateConfiguration): void {
    this.editingRate = rate;
    
    // Patch values for editing
    this.rateModalForm.patchValue({
      seasonId: rate.seasonId,
      roomTypeId: rate.roomTypeId,
      region: rate.region,
      baseRate: rate.baseRate,
      extraAdult: rate.extraAdult,
      extraChild: rate.extraChild,
      singleOccupancy: rate.singleOccupancy
    });

    this.showRateModal = true;
  }

  generateRateId(rate: RateConfiguration, index: number): string {
    return rate.id?.toString() || index.toString();
  }

  mapToRateConfiguration(rate: Rate): RateConfiguration {
    // Get room details first
    const room = this.rooms.find(r => r.id === rate.roomTypeId);
    if (!room) {
      console.warn(`Room not found for rate ${rate.id}, roomTypeId: ${rate.roomTypeId}`);
    }
  
    return {
      id: rate.id?.toString(),
      seasonId: rate.seasonId,
      roomTypeId: rate.roomTypeId,
      region: this.findRegionForMarket(rate.marketId),
      baseRate: rate.baseRate,
      extraAdult: rate.extraAdult,
      extraChild: rate.extraChild,
      singleOccupancy: rate.singleOccupancy,
      currency: rate.currency,
      periods: [],
      isActive: rate.isActive,
      createdAt: rate.createdAt ? new Date(rate.createdAt) : new Date(),
      updatedAt: new Date() // Now returns a Date object instead of string
    };
  }

  private findContractForRate(rateConfig: RateConfiguration): Contract | undefined {
    if (!rateConfig.id) return undefined;
    
    return this.activeContracts.find(contract => 
      contract.rates.some(r => r.id === Number(rateConfig.id))
    );
  }

  private getNextRateId(): number {
    return Math.floor(Math.random() * 1000000) + 1;
  }

  public getRoomName(roomId: number): string {
    if (!roomId) {
      console.warn('Invalid room ID provided');
      return 'Unknown Room';
    }

    const room = this.rooms.find(r => r.id === roomId);
    if (!room) {
      console.warn(`Room not found for ID: ${roomId}, Available rooms:`, 
        this.rooms.map(r => ({ id: r.id, type: r.type })));
      return 'Unknown Room';
    }

    return room.type || 'Unknown Room';
  }

  public getSeasonName(seasonId: number): string {
    const season = this.seasons.find(s => s.id === seasonId);
    return season ? season.name : 'Unknown Season';
  }

  isRateInSeason(rate: RateConfiguration, seasonId: number): boolean {
    if (!rate || !seasonId) return false;
    return rate.seasonId === seasonId;
  }

  isRateForRoomType(rate: RateConfiguration, roomTypeId: number): boolean {
    if (!rate || !roomTypeId) return false;
    return rate.roomTypeId === roomTypeId;
  }

  hasRateForCurrency(rate: RateConfiguration, currency: string): boolean {
    if (!rate || !currency) return false;
    return rate.currency === currency;
  }

  closeRateEditor() {
    this.showRateEditor = false;
    this.editingRate = null;
    this.resetForm();
  }

  resetForm() {
    this.resetAllData();
    this.basicInfoForm?.reset();
    this.categoryRatesForm?.reset();
    this.mealPlansForm?.reset({ selectedPlans: [] });
    
    // Clear special offers form array
    while (this.specialOffers.length !== 0) {
      this.specialOffers.removeAt(0);
    }
  }

  cancelRateEdit(): void {
    this.showRateEditor = false;
    this.resetRateForm();
  }

  resetRateForm(): void {
    this.selectedSeason = null;
    this.selectedRoomType = null;
    this.selectedCurrency = null;  // Don't preselect any currency
    this.selectedMealPlans = [];
    this.specialOffersList = [];
    this.applyFilters();  // Apply filters to show all rates
  }

  getMealPlanLabel(plan: MealPlanType): string {
    const labels: Record<string, string> = {
      'RO': 'Room Only',
      'BB': 'Bed & Breakfast',
      'BB+': 'Bed & Breakfast Plus',
      'HB': 'Half Board',
      'HB+': 'Half Board Plus',
      'FB': 'Full Board',
      'FB+': 'Full Board Plus',
      'AI': 'All Inclusive',
      'AI+': 'All Inclusive Plus'
    };
    return labels[plan] || plan;
  }

  private getEmptyCategoryTemplate(): AgeCategory {
    return {
      id: this.getNextCategoryId(),
      type: 'adult',
      label: '',
      minAge: 0,
      maxAge: 0,
      defaultRate: 0
    };
  }

  addCategory() {
    this.editingCategory = null;
    this.categoryForm.reset();
    this.showCategoryForm = true;
  }

  async removeCategory(category: AgeCategory) {
    if (confirm(`Are you sure you want to delete the ${category.type} category?`)) {
      try {
        if (this.hotel?.ageCategories) {
          const updatedHotel = { 
            ...this.hotel,
            ageCategories: [...this.hotel.ageCategories] // Ensure we have a new array
          };
          const index = updatedHotel.ageCategories.findIndex(c => c.id === category.id);
          if (index !== -1) {
            updatedHotel.ageCategories.splice(index, 1);
          }
          await firstValueFrom(this.hotelService.updateHotel(updatedHotel));

          // Reload data with stored filters
          this.hotel = updatedHotel;
          this.initializeRates(updatedHotel.ageCategories);
          this.showModalMessage('Category deleted successfully');
        }
      } catch (error) {
        this.handleError(error, 'Failed to delete category');
      }
    }
  }

  private getNextCategoryId(): number {
    return !this.hotel?.ageCategories?.length ? 1 : 
      Math.max(...this.hotel.ageCategories.map(c => c.id)) + 1;
  }

  get specialOffers(): FormArray {
    return this.specialOffersForm.get('offers') as FormArray;
  }

  private updateRatesFromMarket(marketRates: any) {
    // Update category rates
    if (marketRates.categoryRates) {
      Object.keys(marketRates.categoryRates).forEach(category => {
        if (this.categoryRatesForm.contains(category)) {
          this.categoryRatesForm.get(category)?.setValue(marketRates.categoryRates[category]);
        }
      });
    }

    // Update meal plan rates
    if (marketRates.mealPlanRates) {
      this.mealPlanRates = marketRates.mealPlanRates;
    }
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  trackByValue(index: number, item: string): string {
    return item;
  }

  trackByCurrency(index: number, group: {currency: string}): string {
    return group.currency;
  }

  trackByRate(index: number, rate: RateConfiguration): number {
    if (typeof rate.id === 'number') return rate.id;
    if (typeof rate.id === 'string') return parseInt(rate.id, 10) || index;
    return index;
  }

  private initializeRates(categories: AgeCategory[] | undefined) {
    if (!categories) return;
    categories.forEach(category => {
      if (!this.ratesByCategory[category.id]) {
        this.ratesByCategory[category.id] = category.defaultRate || 0;
      }
    });
  }

  // Age Categories Modal
  openAgeCategoryModal() {
    this.showAgeCategoryModal = true;
    this.showCategoryForm = false;
    this.editingCategory = null;
    this.categoryForm.reset();
    this.clearModalMessage();
    
    // Load age categories from hotel
    if (this.hotel?.ageCategories) {
      this.ageCategories = [...this.hotel.ageCategories];
    }
  }

  closeAgeCategoryModal(event?: MouseEvent) {
    if (event && event.target !== event.currentTarget) return;
    
    this.showAgeCategoryModal = false;
    this.showCategoryForm = false;
    this.editingCategory = null;
    this.categoryForm.reset();
    this.clearModalMessage();
  }

  loadAgeCategories() {
    // TODO: Replace with actual API call
    this.ageCategories = [
      { id: 1, type: 'adult', label: 'Adult', minAge: 18, maxAge: 100, defaultRate: 0 },
      { id: 2, type: 'teen', label: 'Teen', minAge: 12, maxAge: 17, defaultRate: 0 },
      { id: 3, type: 'child', label: 'Child', minAge: 2, maxAge: 11, defaultRate: 0 },
      { id: 4, type: 'infant', label: 'Infant', minAge: 0, maxAge: 1, defaultRate: 0 }
    ];
  }

  addNewCategory() {
    this.editingCategory = null;
    this.initializeCategoryForm();
    this.showCategoryForm = true;
  }

  async deleteCategory(category: AgeCategory) {
    if (!this.hotel?.ageCategories) return;
    
    try {
      // Create a copy of the hotel for updating
      const updatedHotel = { 
        ...this.hotel,
        ageCategories: [...(this.hotel.ageCategories || [])]
      };
      
      // Remove the category
      updatedHotel.ageCategories = updatedHotel.ageCategories.filter(c => c.id !== category.id);
      
      // Save hotel changes
      await this.hotelService.updateHotel(updatedHotel).toPromise();
      
      // Update local hotel reference after successful save
      this.hotel = updatedHotel;
      
      // Update rates initialization
      this.initializeRates(this.hotel.ageCategories);
      
      this.showModalMessage('Age category deleted successfully');
    } catch (error) {
      this.handleError(error, 'Failed to delete age category');
    }
  }

  cancelCategoryEdit() {
    this.showCategoryForm = false;
    this.editingCategory = null;
    this.categoryForm.reset();
    this.clearModalMessage();
  }

  private validateAgeRanges(category: Partial<AgeCategory>): boolean {
    // Check for overlapping age ranges
    const otherCategories = this.ageCategories.filter(c => 
      !this.editingCategory || c.id !== this.editingCategory!.id
    );

    const hasOverlap = otherCategories.some(existing => {
      const newMin = category.minAge!;
      const newMax = category.maxAge!;
      const existingMin = existing.minAge;
      const existingMax = existing.maxAge;

      return (
        (newMin >= existingMin && newMin <= existingMax) ||
        (newMax >= existingMin && newMax <= existingMax) ||
        (newMin <= existingMin && newMax >= existingMax)
      );
    });

    if (hasOverlap) {
      this.error = 'Age ranges cannot overlap with existing categories';
      return false;
    }

    // Validate age range values
    if (category.minAge! < 0 || category.maxAge! > 100) {
      this.error = 'Age must be between 0 and 100';
      return false;
    }

    if (category.minAge! >= category.maxAge!) {
      this.error = 'Maximum age must be greater than minimum age';
      return false;
    }

    return true;
  }

  private ageRangeValidator(group: AbstractControl): ValidationErrors | null {
    const minAge = group.get('minAge')?.value;
    const maxAge = group.get('maxAge')?.value;
    
    if (minAge === null || maxAge === null) {
      return null;
    }

    if (minAge >= maxAge) {
      return { invalidAgeRange: true };
    }

    return null;
  }

  private rateConfigToRate(rateConfig: RateConfiguration): Rate {
    const market = this.markets.find(m => m.region === rateConfig.region);
    const contract = this.findContractForRate(rateConfig);
    const roomType = this.rooms.find(r => r.id === rateConfig.roomTypeId);
    const season = this.seasons.find(s => s.id === rateConfig.seasonId);
    
    if (!season?.periods || season.periods.length === 0) {
      throw new Error('Season has no defined periods');
    }
  
    return {
      id: rateConfig.id ? parseInt(rateConfig.id) : 0,
      name: this.generateRateName(roomType, season),
      marketId: parseInt(market?.id.toString() || '0'),
      seasonId: parseInt(rateConfig.seasonId.toString()),
      roomTypeId: parseInt(rateConfig.roomTypeId.toString()),
      contractId: contract?.id || 0,
      currency: rateConfig.currency || this.defaultCurrency,
      amount: rateConfig.baseRate,
      baseRate: rateConfig.baseRate,
      extraAdult: rateConfig.extraAdult,
      extraChild: rateConfig.extraChild,
      singleOccupancy: rateConfig.singleOccupancy,
      supplements: {
        extraAdult: rateConfig.extraAdult,
        extraChild: rateConfig.extraChild,
        singleOccupancy: rateConfig.singleOccupancy
      },
      ageCategoryRates: rateConfig.ageCategoryRates || {},
      specialOffers: [], // Initialize with empty array if not provided
      isActive: rateConfig.isActive,
      createdAt: rateConfig.createdAt ? new Date(rateConfig.createdAt) : new Date(),
      updatedAt: new Date() // Now returns a Date object instead of string
    };
  }

  /**
   * Open the rate modal for creating or editing a rate
   */
  public openRateModal(rate?: RateConfiguration): void {
    this.editingRate = rate || null;
    this.showRateModal = true;
    
    // Initialize form with default values or existing rate values
    this.rateModalForm.patchValue({
      seasonId: rate?.seasonId || null,
      roomTypeId: rate?.roomTypeId || null,
      region: rate?.region || null,
      baseRate: rate?.baseRate || 0,
      extraAdult: rate?.extraAdult || 0,
      extraChild: rate?.extraChild || 0,
      singleOccupancy: rate?.singleOccupancy || 0
    });

    // Mark all fields as untouched to reset validation visuals
    Object.keys(this.rateModalForm.controls).forEach(key => {
      const control = this.rateModalForm.get(key);
      control?.markAsUntouched();
    });
  }

  /**
   * Close the rate modal
   */
  public closeRateModal(event?: Event) {
    if (event && event.target !== event.currentTarget) return;
    
    // Clean up period controls
    const form = this.rateModalForm;
    Object.keys(form.controls).forEach(key => {
      if (key.startsWith('period_')) {
        form.removeControl(key);
      }
    });

    this.showRateModal = false;
    this.selectedSeason = null;
    this.rateModalForm.reset();
    this.clearModalMessage();
  }

  selectMarket(region: string): void {
    this.selectedRegion = region;
  }

  viewMarketDetails(market: Market): void {
    // You can implement a dialog or detailed view here
  }

  onRegionChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedRegion = select.value;
    const marketGroup = this.marketGroups.find(g => g.region === this.selectedRegion);
    
    // Convert market IDs to Market objects
    this.filteredMarkets = marketGroup 
      ? this.markets.filter(market => marketGroup.markets.includes(market.id))
      : [];
    
    // Update the form controls
    this.rateModalForm.patchValue({
      region: this.selectedRegion,
      marketId: null  // Reset market when region changes
    });
    
    // Mark form controls as touched to trigger validation
    this.rateModalForm.get('region')?.markAsTouched();
    this.rateModalForm.get('marketId')?.markAsTouched();
  }

  processContractRates(contracts: Contract[]): Rate[] {
    // Extract and flatten all rates from contracts
    return contracts.reduce((allRates: Rate[], contract) => {
      if (contract.rates) {
        return [...allRates, ...contract.rates];
      }
      return allRates;
    }, []);
  }

  /**
   * Update an existing rate
   */
  updateRate(rateConfig: RateConfiguration) {
    // Validate periods
    const season = this.seasons.find(s => s.id === rateConfig.seasonId);
    if (!season?.periods || season.periods.length === 0) {
      this.handleError(new Error('Season has no defined periods'), 'Cannot update rate: The selected season has no defined periods');
      return;
    }

    if (!rateConfig) {
      this.handleError(new Error('Invalid rate configuration'), 'Failed to update rate');
      return;
    }

    const contract = this.findContractForRate(rateConfig);
    if (!contract) {
      this.handleError(new Error('Contract not found'), 'Failed to update rate');
      return;
    }

    // Update rate in contract
    const rateIndex = contract.rates.findIndex(r => r.id === Number(rateConfig.id));
    if (rateIndex === -1) {
      this.handleError(new Error('Rate not found in contract'), 'Failed to update rate');
      return;
    }

    // Convert RateConfiguration to Rate before merging
    const updatedRate = this.rateConfigToRate(rateConfig);
  
    // Create a new contract object to trigger change detection
    const updatedContract = {
      ...contract,
      rates: [...contract.rates]
    };
  
    // Update the rate in the new contract
    updatedContract.rates[rateIndex] = updatedRate;

    console.log('Updating rate:', {
      originalRate: contract.rates[rateIndex],
      updatedRate: updatedRate,
      changes: {
        baseRate: contract.rates[rateIndex].baseRate !== updatedRate.baseRate,
        extraAdult: contract.rates[rateIndex].extraAdult !== updatedRate.extraAdult,
        extraChild: contract.rates[rateIndex].extraChild !== updatedRate.extraChild,
        singleOccupancy: contract.rates[rateIndex].singleOccupancy !== updatedRate.singleOccupancy
      }
    });

    // Close modal before making the update
    this.closeRateModal();

    // Update contract in service
    this.hotelService.updateContract(updatedContract).subscribe({
      next: async (returnedContract) => {
        if (returnedContract) {
          try {
            // Find the index of the old contract and replace it with a new object
            const contractIndex = this.activeContracts.findIndex(c => c.id === returnedContract.id);
            if (contractIndex !== -1) {
              this.activeContracts = [
                ...this.activeContracts.slice(0, contractIndex),
                returnedContract,
                ...this.activeContracts.slice(contractIndex + 1)
              ];
            }
            
            // Ensure rates are reloaded and filtered before showing success message
            await this.loadRates();
            await this.applyFilters();
            
            console.log('Rate update complete:', {
              contractId: returnedContract.id,
              rateId: updatedRate.id,
              updatedFields: {
                baseRate: updatedRate.baseRate,
                extraAdult: updatedRate.extraAdult,
                extraChild: updatedRate.extraChild,
                singleOccupancy: updatedRate.singleOccupancy
              }
            });
            
            // Show success message after everything is updated
            this.showModalMessage('Rate updated successfully');
          } catch (error) {
            console.error('Error refreshing rates after update:', error);
            this.handleError(error, 'Rate was saved but there was an error refreshing the display');
          }
        }
      },
      error: (error) => {
        console.error('Failed to update rate:', error);
        this.handleError(error, 'Failed to update rate');
        // Reopen the modal if update failed
        this.openRateModal(rateConfig);
      }
    });
  }

  editCategory(category: AgeCategory) {
    this.editingCategory = category;
    this.initializeCategoryForm(category);
    this.showCategoryForm = true;
  }

  initializeCategoryForm(category?: AgeCategory) {
    this.categoryForm = this.formBuilder.group({
      type: [category?.type || '', Validators.required],
      label: [category?.label || '', Validators.required],
      minAge: [category?.minAge || 0, [Validators.required, Validators.min(0), Validators.max(100)]],
      maxAge: [category?.maxAge || 0, [Validators.required, Validators.min(0), Validators.max(100)]]
    }, { validators: this.ageRangeValidator });
  }

  async saveCategory() {
    if (!this.categoryForm?.valid || !this.hotel) {
      if (this.categoryForm) {
        Object.keys(this.categoryForm.controls).forEach(key => {
          const control = this.categoryForm.get(key);
          control?.markAsTouched();
        });
      }
      return;
    }

    try {
      const formValue = this.categoryForm.value;
      const category: Partial<AgeCategory> = {
        type: formValue.type,
        label: formValue.label,
        minAge: formValue.minAge,
        maxAge: formValue.maxAge
      };

      if (!this.validateAgeRanges(category)) {
        return;
      }

      const updatedHotel = { 
        ...this.hotel,
        ageCategories: [...(this.hotel.ageCategories || [])]
      };

      if (this.editingCategory) {
        const index = updatedHotel.ageCategories.findIndex(c => c.id === this.editingCategory!.id);
        if (index !== -1) {
          updatedHotel.ageCategories[index] = { 
            ...this.editingCategory, 
            ...category 
          } as AgeCategory;
        }
        this.showModalMessage('Age category updated successfully');
      } else {
        const newCategory = {
          id: this.getNextCategoryId(),
          ...category
        } as AgeCategory;
        updatedHotel.ageCategories.push(newCategory);
        this.showModalMessage('Age category added successfully');
      }

      // Sort categories by min age
      updatedHotel.ageCategories.sort((a, b) => (a.minAge || 0) - (b.minAge || 0));
      
      // Save hotel changes first
      await this.hotelService.updateHotel(updatedHotel).toPromise();
      
      // Update local references
      this.hotel = updatedHotel;
      this.ageCategories = [...updatedHotel.ageCategories];
      
      // Close form and reset
      this.showCategoryForm = false;
      this.editingCategory = null;
      this.categoryForm.reset();
    } catch (error) {
      this.handleError(error, 'Failed to save age category');
    }
  }

  /**
   * Open the rate modal for creating or editing a rate
   */
  public onSeasonChange(event: MatSelectChange): void {
    const seasonId = event.value;
    
    // Clear any existing period controls
    const existingControls = Object.keys(this.rateModalForm.controls)
      .filter(key => key.startsWith('period_'));
    existingControls.forEach(controlName => {
      this.rateModalForm.removeControl(controlName);
    });

    // Find selected season - event.value is already a number, no need for toString()
    this.selectedSeason = this.seasons.find(season => season.id === seasonId) || null;
    
    // Add new period controls if season selected and has periods
    if (this.selectedSeason?.periods?.length) {
      this.selectedSeason.periods.forEach(period => {
        this.rateModalForm.addControl(`period_${period.id}`, this.formBuilder.control(false));
      });
    }
  }

  private handleError(error: any, customMessage?: string): void {
    console.error('Error:', error);
    const errorMessage = customMessage || error?.message || 'An unexpected error occurred';
    
    // If the rate modal is open, show the error in the modal
    if (this.showRateModal) {
      this.showModalMessage(errorMessage, true);
    } else {
      this.error = errorMessage;
    }
  }

  private showModalMessage(message: string, isError: boolean = false) {
    // Add the message to the queue
    setTimeout(() => {
      this.modalMessage = message;
      // Clear the message after 3 seconds
      setTimeout(() => {
        this.modalMessage = null;
      }, 3000);
    }, 100); // Small delay to ensure UI is ready
  }

  private clearModalMessage() {
    this.modalMessage = null;
    this.modalError = false;
  }

  private handleContractUpdate(updatedContract: any) {
    // Handle contract update logic
    this.loadInitialData();
  }

  public generateRateName(roomType: RoomType | undefined, season: Season | undefined): string {
    const roomTypeName = roomType?.type || 'Unknown Room';
    const seasonName = season?.name || 'Unknown Season';
    return `${roomTypeName} - ${seasonName}`;
  }

  async deleteRate(rate: RateConfiguration) {
    if (!rate.id) return;
    
    // Update both arrays
    this.currentRates = this.currentRates.filter(r => r.id !== Number(rate.id));
    this.rateConfigurations = this.rateConfigurations.filter(r => r.id !== rate.id);
    
    const contract = this.findContractForRate(rate);
    if (!contract) return;

    try {
      contract.rates = contract.rates.filter(r => r.id !== Number(rate.id));
      await firstValueFrom(this.hotelService.updateContract(contract));
      this.showModalMessage('Rate deleted successfully');
    } catch (error) {
      this.handleError(error, 'Failed to delete rate');
      // Revert the local change if the server update fails
      await this.loadRates();
    }
  }

  // Save the rate modal form
  saveRateModal(formValue: any): void {
    if (this.rateModalForm.valid) {
      const rateConfig: RateConfiguration = {
        id: this.editingRate?.id || this.getNextRateId().toString(),
        seasonId: formValue.seasonId,
        roomTypeId: formValue.roomTypeId,
        region: formValue.region,
        baseRate: formValue.baseRate,
        extraAdult: formValue.extraAdult,
        extraChild: formValue.extraChild,
        singleOccupancy: formValue.singleOccupancy,
        currency: this.defaultCurrency // Using default currency for now
      };

      if (this.editingRate) {
        // Update existing rate
        const index = this.rateConfigurations.findIndex(r => r.id === this.editingRate!.id);
        if (index !== -1) {
          this.rateConfigurations[index] = rateConfig;
        }
      } else {
        // Add new rate
        this.rateConfigurations.push(rateConfig);
      }

      // Close modal and reset form
      this.showRateModal = false;
      this.editingRate = null;
      this.rateModalForm.reset();
      this.showModalMessage('Rate saved successfully');
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.rateModalForm.controls).forEach(key => {
        const control = this.rateModalForm.get(key);
        control?.markAsTouched();
      });
      this.showModalMessage('Please fill in all required fields correctly', true);
    }
  }
}