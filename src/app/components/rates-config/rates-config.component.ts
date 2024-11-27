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
  RoomType,
  Season,
  Contract,
  Market,
  Currency,
  MealPlan,
  MealPlanType,
  MEAL_PLAN_TYPES,
  MarketTemplate,
  RateConfiguration,
  CurrencySetting,
  AgeCategory,
  MarketGroup
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
  @Input() hotel?: Hotel;
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

  // currentRates: RateConfiguration[] = [];
  filteredRates: RateConfiguration[] = [];
  seasons: Season[] = [];
  rooms: RoomType[] = [];
  currencies: string[] = [];
  currencySettings: CurrencySetting[] = [];
  selectedSeason: Season | null = null;
  selectedRoomType: RoomType | null = null;
  selectedCurrency: Currency | null = null;
  editingRate: RateConfiguration | null = null;
  mealPlanTypes = MEAL_PLAN_TYPES;
  ratesByCategory: { [key: string]: number } = {};
  mealPlanRates: Record<MealPlanType, Record<string, number>> = {} as Record<MealPlanType, Record<string, number>>;
  selectedMarket: number | null = null;
  specialOffersList: any[] = [];
  categoryTypes = [
    { value: 'adult' as const, label: 'Adult', icon: 'person' },
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
  mealPlans: MealPlanType[] = MEAL_PLAN_TYPES;
  selectedMealPlans: MealPlanType[] = [];

  private defaultCurrency = 'EUR';  // Default currency for the application

  public originalValues: any = null;

  modalMessage: string | null = null;
  modalError: boolean = false;

  rateConfigurations: RateConfiguration[] = [];
  currentRates: Rate[] = [];

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
    this.filterForm = this.formBuilder.group({
      seasonId: [null],
      roomTypeId: [null],
      currency: ['All']
    });

    // Update rate modal form to remove marketId validation
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
    this.initializeForms();
    this.subscribeToFormChanges();
    this.loadInitialData();
  }

  /**
   * Loads and initializes all required data for the component
   * Public method to allow reloading data from the template
   */
  public async loadInitialData(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null; // Clear any previous errors
      
      const hotel = await firstValueFrom(this.hotelService.selectedHotel$);
      if (!hotel) {
        throw new Error('No hotel selected');
      }

      this.hotel = hotel;
      
      // Load all required data
      await Promise.all([
        this.loadSeasons(),
        this.loadRooms(),
        this.loadCurrencies(),
        this.loadRates()
      ]);

      console.log('Initial data loaded:', {
        seasons: this.seasons,
        rooms: this.rooms,
        currencies: this.currencies,
        rates: this.currentRates
      });

      // Initialize filters with default values
      this.initializeFilters();
      
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.handleError(error, 'Error loading initial data');
    } finally {
      this.isLoading = false;
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

    const filters: RateFilters = {
      seasonId: this.filterForm.value.seasonId ? Number(this.filterForm.value.seasonId) : undefined,
      roomTypeId: this.filterForm.value.roomTypeId ? Number(this.filterForm.value.roomTypeId) : undefined,
      currency: this.filterForm.value.currency !== 'All' ? this.filterForm.value.currency : undefined
    };

    try {
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

    // Filter form
    this.filterForm = this.formBuilder.group({
      season: [''],
      roomType: [''],
      currency: ['']
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
              symbol: currencySetting.symbol
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
      const marketGroup = this.marketGroups.find(m => m.code === region);
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
    this.hotel?.ageCategories?.forEach(category => {
      const defaultRate = category.defaultRate || 0;
      this.categoryRatesForm.get(category.type)?.setValue(defaultRate);
    });
  }

  updateMealPlanRates() {
    this.selectedMealPlans.forEach(planType => {
      if (!this.mealPlanRates[planType]) {
        this.mealPlanRates[planType] = {};
      }
      
      this.hotel?.ageCategories?.forEach(category => {
        const baseRate = this.categoryRatesForm.get(category.type)?.value || 0;
        this.mealPlanRates[planType][category.type] = baseRate;
      });
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
    if (!this.hotel?.id) {
      this.error = 'Hotel ID is required for loading rooms';
      return;
    }
    try {
      this.rooms = this.hotelService.getRooms(this.hotel.id);
      console.log('Loaded rooms:', this.rooms); // Debug log
    } catch (error) {
      console.error('Error loading rooms:', error);
      this.handleError(error, 'Failed to load rooms');
    }
  }

  private async loadCurrencies(): Promise<void> {
    try {
      // Load market groups first if not already loaded
      this.marketGroups = this.hotelService.getMarketGroups();

      // Get unique currencies from market groups
      const uniqueCurrencies = new Set<string>();
      this.marketGroups.forEach(group => {
        group.markets.forEach(market => {
          if (market.currency) {
            uniqueCurrencies.add(market.currency);
          }
        });
      });

      // Update currencies array
      this.currencies = Array.from(uniqueCurrencies);
    } catch (error) {
      console.error('Error loading currencies:', error);
      this.handleError(error, 'Failed to load currencies');
    }
  }

  async loadRates(): Promise<void> {
    try {
      if (!this.hotel?.id) {
        if (this.showRateModal) {
          this.showModalMessage('Hotel ID is required for loading rates', true);
        } else {
          this.error = 'Hotel ID is required for loading rates';
        }
        return;
      }
      
      // Get all rates for the hotel
      const rates = await firstValueFrom(this.hotelService.currentRates$);
      
      // Store raw rates
      this.currentRates = rates || [];
      
      // Convert rates to rate configurations
      this.rateConfigurations = this.currentRates.map(rate => ({
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
        isActive: rate.isActive ?? true,
        createdAt: rate.createdAt,
        updatedAt: rate.updatedAt
      }));

      // Apply any active filters
      this.applyFilters();
      
    } catch (error) {
      console.error('Error loading rates:', error);
      this.handleError(error, 'Failed to load rates');
    }
  }

  private findRegionForMarket(marketId: number): string {
    const marketGroup = this.marketGroups.find(group => 
      group.markets.some(market => market.id === marketId)
    );
    return marketGroup?.code || '';
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

  formatDateRange(start: string | Date, end: string | Date): string {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const dd = (date: Date) => date.getDate().toString().padStart(2, '0');
    const mm = (date: Date) => (date.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = (date: Date) => date.getFullYear();
    
    return `${dd(startDate)}-${mm(startDate)}-${yyyy(startDate)} - ${dd(endDate)}-${mm(endDate)}-${yyyy(endDate)}`;
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

  private resetNewCategory() {
    this.newCategory = {
      id: 0,
      type: '',
      label: '',
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
    const category = this.categoryTypes.find(c => c.value === type);
    return category?.icon || 'person';
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
      createdAt: rate.createdAt,
      updatedAt: rate.updatedAt
    };
  }

  /**
   * Update an existing rate
   */
  updateRate(rateConfig: RateConfiguration) {
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
    const rateIndex = contract.rates.findIndex(r => r.id === rateConfig.id);
    if (rateIndex === -1) {
      this.handleError(new Error('Rate not found in contract'), 'Failed to update rate');
      return;
    }

    // Convert RateConfiguration to Rate before merging
    const updatedRate = this.rateConfigToRate(rateConfig);
    contract.rates[rateIndex] = {
      ...contract.rates[rateIndex],
      ...updatedRate
    };

    // Update contract in service
    this.hotelService.updateContract(contract).subscribe({
      next: (updatedContract) => {
        if (updatedContract) {
          // Find the index of the old contract and replace it
          const contractIndex = this.activeContracts.findIndex(c => c.id === updatedContract.id);
          if (contractIndex !== -1) {
            this.activeContracts[contractIndex] = updatedContract;
          }
          this.showModalMessage('Rate updated successfully');
          this.closeRateModal();
          this.loadRates(); // Refresh rates
        }
      },
      error: (error) => this.handleError(error, 'Failed to update rate')
    });
  }

  private findContractForRate(rateConfig: RateConfiguration): Contract | undefined {
    return this.activeContracts.find(contract => 
      contract.rates.some(r => r.id === rateConfig.id)
    );
  }

  private getNextRateId(): number {
    return Math.floor(Math.random() * 1000000) + 1;
  }

  public getRoomName(roomId: number): string {
    const room = this.rooms.find(r => r.id === roomId);
    return room ? room.type : 'Unknown Room';
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

  getEmptyCategoryTemplate(): AgeCategory {
    return {
      id: 0,
      type: '',
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
          const index = this.hotel.ageCategories.findIndex(c => c.id === category.id);
          if (index !== -1) {
            // Store current filter state
            const currentFilters = {
              seasonId: this.filterForm.get('seasonId')?.value,
              roomTypeId: this.filterForm.get('roomTypeId')?.value,
              currency: this.filterForm.get('currency')?.value
            };

            this.hotel.ageCategories.splice(index, 1);
            await this.hotelService.updateHotel(this.hotel).toPromise();
            
            // Remove category from local array
            this.ageCategories = this.ageCategories.filter(c => c.id !== category.id);
            
            // Reload all data while preserving filter state
            await this.loadSeasons();
            await this.loadRooms();
            await this.loadCurrencies();

            // Restore filter state
            this.filterForm.patchValue(currentFilters, { emitEvent: false });
            
            // Set selected values from filters
            if (currentFilters.seasonId) {
              this.selectedSeason = this.seasons.find(s => s.id === Number(currentFilters.seasonId)) || null;
            }
            if (currentFilters.roomTypeId) {
              this.selectedRoomType = this.rooms.find(r => r.id === Number(currentFilters.roomTypeId)) || null;
            }
            if (currentFilters.currency && currentFilters.currency !== 'All') {
              // Find currency settings to get both code and symbol
              const currencySetting = this.currencySettings.find(cs => cs.code === currentFilters.currency);
              this.selectedCurrency = currencySetting ? 
                { code: currencySetting.code, symbol: currencySetting.symbol } : 
                null;
            }
            
            // Load rates with current filters
            await this.loadRates();
            
            // Update rates that might reference this category
            this.rateConfigurations.forEach(rateConfig => {
              if (rateConfig.ageCategoryRates) {
                delete rateConfig.ageCategoryRates[category.id];
              }
            });

            // Apply filters to update filteredRates
            this.applyFilters();
            
            this.showModalMessage('Age category deleted successfully');
          }
        }
      } catch (error) {
        this.handleError(error, 'Failed to delete age category');
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
    this.loadAgeCategories();
  }

  closeAgeCategoryModal(event?: MouseEvent) {
    if (event && event.target !== event.currentTarget) return;
    this.showAgeCategoryModal = false;
    this.showCategoryForm = false;
    this.editingCategory = null;
    this.categoryForm.reset();
  }

  loadAgeCategories() {
    // TODO: Replace with actual API call
    this.ageCategories = [
      { id: 1, type: 'Adult', label: 'Adult', minAge: 18, maxAge: 100, defaultRate: 0 },
      { id: 2, type: 'Teen', label: 'Teen', minAge: 12, maxAge: 17, defaultRate: 0 },
      { id: 3, type: 'Child', label: 'Child', minAge: 2, maxAge: 11, defaultRate: 0 },
      { id: 4, type: 'Infant', label: 'Infant', minAge: 0, maxAge: 1, defaultRate: 0 }
    ];
  }

  addNewCategory() {
    this.editingCategory = null;
    this.categoryForm.reset();
    this.showCategoryForm = true;
  }

  async deleteCategory(category: AgeCategory) {
    if (confirm(`Are you sure you want to delete the ${category.type} category?`)) {
      try {
        // TODO: Replace with actual API call
        this.ageCategories = this.ageCategories.filter(c => c.id !== category.id);
        this.success = 'Age category deleted successfully';
        this.clearMessages();
      } catch (error) {
        this.error = 'Failed to delete age category';
        this.clearMessages();
      }
    }
  }

  cancelCategoryEdit() {
    this.showCategoryForm = false;
    this.editingCategory = null;
    this.categoryForm.reset();
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

  rateConfigToRate(rateConfig: RateConfiguration): Rate {
    return {
      id: rateConfig.id ? parseInt(rateConfig.id) : 0,
      marketId: parseInt(this.markets.find(m => m.region === rateConfig.region)?.id.toString() || '0'),
      seasonId: parseInt(rateConfig.seasonId.toString()),
      roomTypeId: parseInt(rateConfig.roomTypeId.toString()),
      baseRate: rateConfig.baseRate,
      extraAdult: rateConfig.extraAdult,
      extraChild: rateConfig.extraChild,
      singleOccupancy: rateConfig.singleOccupancy,
      currency: rateConfig.currency || this.defaultCurrency,
      isActive: rateConfig.isActive,
      createdAt: rateConfig.createdAt,
      updatedAt: rateConfig.updatedAt
    };
  }

  /**
   * Open the rate modal for creating or editing a rate
   */
  public openRateModal(rate?: RateConfiguration): void {
    this.showRateModal = true;
    
    // Initialize a fresh form
    this.initializeRateModalForm();
    
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
    }
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
    const marketGroup = this.marketGroups.find(g => g.code === this.selectedRegion);
    this.filteredMarkets = marketGroup ? marketGroup.markets : [];
    
    // Update the form controls
    this.rateModalForm.patchValue({
      region: this.selectedRegion,
      marketId: null  // Reset market when region changes
    });
    
    // Mark form controls as touched to trigger validation
    this.rateModalForm.get('region')?.markAsTouched();
    this.rateModalForm.get('marketId')?.markAsTouched();
    
    // Also update the rate form if it exists
    if (this.rateForm) {
      this.rateForm.patchValue({
        region: this.selectedRegion
      });
    }
  }

  processContractRates(contracts: Contract[]): RateConfiguration[] {
    const rateConfigurations: RateConfiguration[] = [];

    contracts.forEach(contract => {
      if (!contract.rates) return;

      contract.rates.forEach(rate => {
        const season = this.seasons.find(s => s.id === rate.seasonId);
        const roomType = this.rooms.find(r => r.id === rate.roomTypeId);
        
        if (season && roomType) {
          const rateConfig: RateConfiguration = {
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
            createdAt: rate.createdAt,
            updatedAt: rate.updatedAt
          };
          rateConfigurations.push(rateConfig);
        }
      });
    });

    return rateConfigurations;
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
      minAge: [category?.minAge || 0, [Validators.required, Validators.min(0)]],
      maxAge: [category?.maxAge || 0, [Validators.required, Validators.min(0)]],
      defaultRate: [category?.defaultRate || 0, [Validators.required, Validators.min(0)]]
    });
  }

  async saveCategory() {
    if (this.categoryForm.valid) {
      try {
        const formValue = this.categoryForm.value;
        const category: Partial<AgeCategory> = {
          type: formValue.type,
          label: formValue.label,
          minAge: formValue.minAge,
          maxAge: formValue.maxAge,
          defaultRate: formValue.defaultRate
        };

        // Validate age ranges before saving
        if (!this.validateAgeRanges(category)) {
          this.clearMessages();
          return;
        }

        if (this.editingCategory) {
          // TODO: Replace with actual API call
          const index = this.ageCategories.findIndex(c => c.id === this.editingCategory!.id);
          if (index !== -1) {
            this.ageCategories[index] = { ...this.editingCategory, ...category };
            // Create a new array reference to trigger change detection
            this.ageCategories = [...this.ageCategories];
          }
          this.success = 'Age category updated successfully';
        } else {
          // TODO: Replace with actual API call
          const newCategory = {
            id: Math.max(...this.ageCategories.map(c => c.id), 0) + 1,
            ...category
          } as AgeCategory;
          // Create a new array reference to trigger change detection
          this.ageCategories = [...this.ageCategories, newCategory];
          this.success = 'Age category added successfully';
        }

        this.clearMessages();
        this.showCategoryForm = false;
        this.editingCategory = null;
        this.categoryForm.reset();
      } catch (error) {
        this.error = 'Failed to save age category';
        this.clearMessages();
      }
    }
  }

  private clearMessages() {
    setTimeout(() => {
      this.success = '';
      this.error = '';
    }, 3000); // Messages will clear after 3 seconds
  }

  public onSeasonChange(event: MatSelectChange): void {
    const seasonId = event.value;  // MatSelectChange.value contains the selected value
    
    // Clear any existing period controls
    const existingControls = Object.keys(this.rateModalForm.controls)
      .filter(key => key.startsWith('period_'));
    existingControls.forEach(controlName => {
      this.rateModalForm.removeControl(controlName);
    });

    // Find selected season - event.value is already a number, no need for toString()
    this.selectedSeason = this.seasons.find(season => season.id === seasonId) || null;
    
    // Add new period controls if season selected
    if (this.selectedSeason) {
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
    this.modalMessage = message;
    this.modalError = isError;
    
    // Wait for the next tick to ensure the message is rendered
    setTimeout(() => {
      const modalContent = document.querySelector('.modal-content');
      if (modalContent) {
        modalContent.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });
  }

  private clearModalMessage() {
    this.modalMessage = null;
    this.modalError = false;
  }

  private handleContractUpdate(updatedContract: any) {
    // Handle contract update logic
    this.loadInitialData();
  }

  private generateRateName(roomType: RoomType | undefined, season: Season | undefined): string {
    const roomName = roomType?.type || 'Unknown Room';
    const seasonName = season?.name || 'Unknown Season';
    return `${roomName} - ${seasonName}`;
  }

  async deleteRate(rate: RateConfiguration) {
    if (confirm('Are you sure you want to delete this rate?')) {
      try {
        // Find the contract containing this rate
        const contract = this.findContractForRate(rate);
        if (!contract) {
          throw new Error('Contract not found for rate');
        }

        // Remove rate from contract
        if (contract.rates) {
          const rateId = rate.id ? parseInt(rate.id, 10) : undefined;
          contract.rates = contract.rates.filter(r => r.id !== rateId);
        }

        // Update contract
        await this.hotelService.updateContract(contract).toPromise();
        
        // Remove from local arrays
        this.currentRates = this.currentRates.filter(r => r.id !== rate.id);
        this.rateConfigurations = this.rateConfigurations.filter(r => r.id !== rate.id);
        
        this.showModalMessage('Rate deleted successfully');
      } catch (error) {
        this.handleError(error, 'Failed to delete rate');
      }
    }
  }

  async saveRateModal(formValue: any) {
    try {
      if (!this.hotel) {
        throw new Error('No hotel selected');
      }

      // Create rate configuration from form values
      const rateConfig: RateConfiguration = {
        id: this.editingRate?.id || this.getNextRateId().toString(),
        seasonId: formValue.seasonId,
        roomTypeId: formValue.roomTypeId,
        region: formValue.region,
        baseRate: formValue.baseRate,
        extraAdult: formValue.extraAdult,
        extraChild: formValue.extraChild,
        singleOccupancy: formValue.singleOccupancy,
        currency: this.defaultCurrency,
        periods: [],
        isActive: true,
        createdAt: this.editingRate?.createdAt || new Date(),
        updatedAt: new Date()
      };

      // Convert to Rate for API
      const rate = this.rateConfigToRate(rateConfig);

      // Find or create contract
      let contract = this.findContractForRate(rateConfig);
      
      if (!contract) {
        // Create a new contract with a temporary ID
        const newContract: Contract = {
          id: -Date.now(), // Temporary negative ID to ensure uniqueness
          hotelId: this.hotel.id,
          marketId: rate.marketId,
          seasonId: rate.seasonId,
          roomTypeId: rate.roomTypeId,
          name: this.generateRateName(
            this.rooms.find(r => r.id === rate.roomTypeId),
            this.seasons.find(s => s.id === rate.seasonId)
          ),
          startDate: new Date().toISOString(),
          endDate: new Date(new Date().getFullYear() + 1, 11, 31).toISOString(),
          status: 'active' as const,
          rateType: 'public' as const,
          terms: {
            cancellationPolicy: [],
            paymentTerms: '',
            commission: 0
          },
          validFrom: new Date(),
          validTo: new Date(new Date().getFullYear() + 1, 11, 31),
          rates: [{ ...rate, contractId: -Date.now() }] // Set the contractId to match the contract
        };

        // Add the new contract
        contract = await firstValueFrom(this.hotelService.addContract(this.hotel.id, newContract));
      } else {
        // Update existing contract
        if (!contract.rates) {
          contract.rates = [];
        }

        if (this.editingRate) {
          // Update existing rate
          const index = contract.rates.findIndex(r => r.id === rate.id);
          if (index !== -1) {
            contract.rates[index] = { ...rate, contractId: contract.id };
          } else {
            contract.rates.push({ ...rate, contractId: contract.id });
          }
        } else {
          // Add new rate to existing contract
          contract.rates.push({ ...rate, contractId: contract.id });
        }

        // Update the contract
        contract = await firstValueFrom(this.hotelService.updateContract(contract));
      }

      // Show success message and close modal
      this.showModalMessage('Rate saved successfully', false);
      setTimeout(() => {
        this.closeRateModal();
        this.loadRates(); // Refresh rates list
      }, 1500);

    } catch (error: unknown) {
      this.handleError(error, 'Failed to save rate');
    }
  }
}