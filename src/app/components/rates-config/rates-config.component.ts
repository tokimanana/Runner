import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatProgressSpinnerModule
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

  currentRates: RateConfiguration[] = [];
  filteredRates: RateConfiguration[] = [];
  seasons: Season[] = [];
  rooms: RoomType[] = [];
  currencies: string[] = [];
  currencySettings: CurrencySetting[] = [];
  selectedSeason: number | null = null;
  selectedRoomType: number | null = null;
  selectedCurrency: Currency | null = null;
  editingRate: Rate | null = null;
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
  showRateModal = false;

  // Category management
  showCategoryForm = false;
  editingCategory: AgeCategory | null = null;
  newCategory: Partial<AgeCategory> = {};
  categories: AgeCategory[] = [];

  // Meal Plans
  mealPlans: MealPlanType[] = MEAL_PLAN_TYPES;
  selectedMealPlans: MealPlanType[] = [];

  private defaultCurrency = 'EUR';  // Default currency for the application

  public originalValues: any = null;

  modalMessage: string | null = null;
  modalError: boolean = false;

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
    private hotelService: HotelService,
    private formBuilder: FormBuilder
  ) {
    this.filterForm = this.formBuilder.group({
      seasonId: [null],
      roomTypeId: [null],
      currency: ['All']  // Set default currency to "All"
    });
    this.rateForm = this.formBuilder.group({
      name: ['', Validators.required],
      seasonId: [null, Validators.required],
      roomTypeId: [null, Validators.required],
      region: [null, Validators.required],
      baseRate: [null, [Validators.required, Validators.min(0)]],
      extraAdult: [null, [Validators.required, Validators.min(0)]],
      extraChild: [null, [Validators.required, Validators.min(0)]]
    });
    this.rateModalForm = this.formBuilder.group({
      seasonId: [null, Validators.required],
      roomTypeId: [null, Validators.required],
      region: [null, Validators.required],
      marketId: [null, Validators.required],
      baseRate: [null, [Validators.required, Validators.min(0)]],
      extraAdult: [null, [Validators.required, Validators.min(0)]],
      extraChild: [null, [Validators.required, Validators.min(0)]],
      singleOccupancy: [0, Validators.min(0)]
    });
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
      
      const hotel = await firstValueFrom(this.hotelService.getSelectedHotel());
      if (!hotel) {
        throw new Error('No hotel selected');
      }

      this.hotel = hotel;
      
      // Load all required data
      await this.loadSeasons();
      await this.loadRooms();
      await this.loadCurrencies();
      await this.loadRates();

      console.log('Initial data loaded:', {
        seasons: this.seasons,
        rooms: this.rooms,
        currencies: this.currencies,
        rates: this.currentRates
      });

      // Initialize filters with default values
      this.initializeFilters();
      
      // Apply initial filtering
      this.applyFilters();
      
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
    if (!this.currentRates?.length) {
      this.filteredRates = [];
      return;
    }

    try {
      const filters = this.filterForm.value;
      
      let result = [...this.currentRates];

      result = this.applySeasonFilter(result, filters.seasonId);
      result = this.applyRoomFilter(result, filters.roomTypeId);
      result = this.applyCurrencyFilter(result, filters.currency);

      this.filteredRates = result;
      
    } catch (error) {
      this.filteredRates = [...this.currentRates];
    }
  }

  /**
   * Filter rates by season
   */
  private applySeasonFilter(rates: RateConfiguration[], seasonId: string | null): RateConfiguration[] {
    if (!seasonId || seasonId === 'null' || seasonId === '') return rates;
    
    const seasonIdNum = Number(seasonId);
    if (isNaN(seasonIdNum)) return rates;
    
    return rates.filter(rate => {
      if (!rate || !rate.season || !rate.season.id) return false;
      const rateSeasonId = Number(rate.season.id);
      return rateSeasonId === seasonIdNum;
    });
  }

  /**
   * Filter rates by room type
   */
  private applyRoomFilter(rates: RateConfiguration[], roomTypeId: string | null): RateConfiguration[] {
    if (!roomTypeId || roomTypeId === 'null' || roomTypeId === '') return rates;
    
    const roomTypeIdNum = Number(roomTypeId);
    if (isNaN(roomTypeIdNum)) return rates;
    
    return rates.filter(rate => {
      if (!rate || !rate.roomType || !rate.roomType.id) return false;
      const rateRoomTypeId = Number(rate.roomType.id);
      return rateRoomTypeId === roomTypeIdNum;
    });
  }

  /**
   * Filter rates by currency
   */
  private applyCurrencyFilter(rates: RateConfiguration[], currency: string | null): RateConfiguration[] {
    if (!currency || currency === 'All' || currency === '') return rates;
    
    return rates.filter(rate => 
      rate.rates?.some(r => r.currency === currency)
    );
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
      singleOccupancy: [0, Validators.min(0)]
    });

    // Rate modal form
    this.initializeRateModalForm();
  }

  /**
   * Initialize the rate modal form
   */
  private initializeRateModalForm(): void {
    this.rateModalForm = this.formBuilder.group({
      seasonId: ['', [Validators.required]],
      roomTypeId: ['', [Validators.required]],
      region: ['', [Validators.required]],
      marketId: ['', [Validators.required]],
      baseRate: ['', [Validators.required, Validators.min(0)]],
      extraAdult: ['', [Validators.required, Validators.min(0)]],
      extraChild: ['', [Validators.required, Validators.min(0)]],
      singleOccupancy: [null, (control: AbstractControl) => {
        const value = control.value;
        if (value === null || value === undefined || value === '') {
          return null; // Champ optionnel
        }
        return value >= 0 ? null : { min: { min: 0, actual: value } };
      }]
    });
  
    // Debug form state changes
    this.rateModalForm.statusChanges.subscribe(status => {
      console.log('Form Status:', status);
      console.log('Form Values:', this.rateModalForm.value);
      console.log('Form Valid:', this.rateModalForm.valid);
      console.log('Form Errors:', this.rateModalForm.errors);
      
      // Log des erreurs spécifiques par champ
      Object.keys(this.rateModalForm.controls).forEach(key => {
        const control = this.rateModalForm.get(key);
        if (control?.errors) {
          console.log(`${key} errors:`, control.errors);
        }
      });
    });
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

  private updateMealPlanRates() {
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

  getRatesGroupedByCurrency(): Array<{currency: string, rates: RateConfiguration[]}> {
    const groupedRates = new Map<string, RateConfiguration[]>();
    
    this.filteredRates.forEach(rate => {
      const currency = rate.rates[0]?.currency || this.defaultCurrency;
      if (!groupedRates.has(currency)) {
        groupedRates.set(currency, []);
      }
      groupedRates.get(currency)?.push(rate);
    });
    
    return Array.from(groupedRates.entries()).map(([currency, rates]) => ({
      currency,
      rates
    }));
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

  private async loadRates(): Promise<void> {
    if (!this.hotel?.id) {
      this.error = 'Hotel ID is required for loading rates';
      return;
    }

    try {
      const [rates, contracts] = await Promise.all([
        firstValueFrom(this.hotelService.getRates(this.hotel.id, {
          seasonId: null,
          roomTypeId: null,
          currency: null
        })),
        firstValueFrom(this.hotelService.getContracts(this.hotel.id))
      ]);

      this.currentRates = rates;
      this.activeContracts = contracts;
      this.filteredRates = [...this.currentRates];

      // Initialize market groups data if available
      if (this.marketGroups.length > 0) {
        this.selectedRegion = this.marketGroups[0].code;
        this.filteredMarkets = this.marketGroups[0].markets;
      }
    } catch (error) {
      console.error('Error loading rates:', error);
      this.handleError(error, 'Failed to load rates');
    }
  }

  openRateEditor(rate?: RateConfiguration) {
    try {
      this.editingRate = rate ? rate.rates[0] : null;
      this.showRateModal = true;
      
      if (rate) {
        this.rateForm.patchValue({
          name: rate.rates[0].name,
          roomType: rate.roomTypeId,
          season: rate.seasonId,
          region: rate.marketId,
          baseRate: rate.baseRate,
          extraAdult: rate.extraAdult,
          extraChild: rate.extraChild,
          singleOccupancy: rate.singleOccupancy,
          currency: rate.currency
        });
      } else {
        this.rateForm.reset();
      }
    } catch (error) {
      this.error = 'Failed to open rate editor. Please try again.';
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
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  }

  closeAgeCategoryEditor() {
    this.showAgeCategoryEditor = false;
    this.showCategoryForm = false;
    this.editingCategory = null;
    this.newCategory = this.getEmptyCategoryTemplate();
  }

  // Category Management Methods
  editCategory(category: AgeCategory) {
    this.showCategoryForm = true;
    this.editingCategory = { ...category };
    this.newCategory = { ...category };
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

  editRate(rate: RateConfiguration) {
    if (!rate.rates?.[0]) {
      this.handleError(new Error('Invalid rate configuration'), 'Failed to edit rate');
      return;
    }
  
    const rateData = rate.rates[0];
    this.editingRate = rateData;
  
    // Find the region for the market
    const region = this.findRegionForMarket(rateData.marketId);
    if (!region) {
      this.handleError(new Error('Could not find region for market'), 'Failed to edit rate');
      return;
    }
      
    // Ensure all values are properly typed before setting
    const formValues = {
      seasonId: Number(rateData.seasonId),
      roomTypeId: Number(rateData.roomTypeId),
      region: region,
      marketId: Number(rateData.marketId),
      baseRate: Number(rateData.baseRate),
      extraAdult: Number(rateData.extraAdult || 0),
      extraChild: Number(rateData.extraChild || 0),
      singleOccupancy: rateData.singleOccupancy !== undefined ? Number(rateData.singleOccupancy) : null
    };
  
    // Set form values
    this.rateModalForm.patchValue(formValues);
    this.originalValues = {...formValues}; // Store original values for comparison
  
    // Log form state for debugging
    console.log('Form Values:', formValues);
    console.log('Form Valid:', this.rateModalForm.valid);
    console.log('Form Errors:', this.rateModalForm.errors);
    
    this.showRateModal = true;
  }
  

  /**
   * Update an existing rate
   */
  updateRate(rateConfig: RateConfiguration) {
    if (!rateConfig.rates[0]) {
      this.handleError(new Error('Invalid rate configuration'), 'Failed to update rate');
      return;
    }

    const contract = this.findContractForRate(rateConfig);
    if (!contract) {
      this.handleError(new Error('Contract not found'), 'Failed to update rate');
      return;
    }

    // Update rate in contract
    const rateIndex = contract.rates.findIndex(r => r.id === rateConfig.rates[0].id);
    if (rateIndex === -1) {
      this.handleError(new Error('Rate not found in contract'), 'Failed to update rate');
      return;
    }

    contract.rates[rateIndex] = {
      ...contract.rates[rateIndex],
      ...rateConfig.rates[0]
    };

    // Update contract in service
    this.hotelService.updateContract(contract).subscribe({
      next: (updatedContract) => {
        if (updatedContract) {
          this.loadInitialData();
          // Show success message
          this.success = 'Rate updated successfully';
          setTimeout(() => this.success = '', 3000);
        } else {
          this.handleError(new Error('Failed to update contract'), 'Failed to update rate');
        }
      },
      error: (error) => this.handleError(error, 'Failed to update rate')
    });
  }

  private findContractForRate(rateConfig: RateConfiguration): Contract | undefined {
    return this.activeContracts.find(contract => 
      contract.rates.some(r => r.id === rateConfig.rates[0]?.id)
    );
  }

  /**
   * Get the next available rate ID
   */
  private getNextRateId(): number {
    const maxId = Math.max(...this.currentRates.map(r => Number(r.rates[0]?.id) || 0), 0);
    return maxId + 1;
  }

  public getRoomName(roomId: number): string {
    const room = this.rooms.find(r => r.id === roomId);
    return room ? room.type : 'Unknown Room';
  }

  public getSeasonName(seasonId: number): string {
    const season = this.seasons.find(s => s.id === seasonId);
    return season ? season.name : 'Unknown Season';
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

  saveCategory() {
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
    this.showCategoryForm = true;
    this.editingCategory = null;
    this.newCategory = this.getEmptyCategoryTemplate();
  }

  cancelCategoryEdit(): void {
    this.showCategoryForm = false;
    this.editingCategory = null;
    this.newCategory = this.getEmptyCategoryTemplate();
  }

  removeCategory(category: AgeCategory) {
    if (!this.hotel?.ageCategories) return;
    
    const index = this.hotel.ageCategories.findIndex(c => c.id === category.id);
    if (index !== -1) {
      this.hotel.ageCategories.splice(index, 1);
      this.hotelService.updateHotel(this.hotel).subscribe({
        next: () => {
          // Remove category from local array
          this.categories = this.categories.filter(c => c.id !== category.id);
          // Update rates that might reference this category
          this.currentRates.forEach(rateConfig => {
            rateConfig.rates.forEach(rate => {
              if (rate.ageCategoryRates) {
                delete rate.ageCategoryRates[category.id];
              }
            });
          });
        },
        error: (error) => {
          this.error = 'Failed to delete category';
        }
      });
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
    return rate.rates[0]?.id || index;
  }

  private initializeRateForm() {
    this.rateModalForm = this.formBuilder.group({
      seasonId: [null, Validators.required],
      roomTypeId: [null, Validators.required],
      region: [null, Validators.required],
      baseRate: [null, [Validators.required, Validators.min(0)]],
      extraAdult: [0, Validators.min(0)],
      extraChild: [0, Validators.min(0)],
      singleOccupancy: [0, Validators.min(0)]
    });
  }

  public duplicateRate(rate: RateConfiguration) {
    if (!rate.rates?.[0]) {
      this.handleError(new Error('Invalid rate configuration'), 'Failed to duplicate rate');
      return;
    }
  
    const rateData = rate.rates[0];
    this.editingRate = null; // Set to null since we're creating a new rate
  
    // Find the region for the market
    const region = this.findRegionForMarket(rateData.marketId);
    if (!region) {
      this.handleError(new Error('Could not find region for market'), 'Failed to duplicate rate');
      return;
    }
  
    // Pre-fill form with existing rate data
    const formValues = {
      seasonId: Number(rateData.seasonId),
      roomTypeId: Number(rateData.roomTypeId),
      region: region,
      marketId: Number(rateData.marketId),
      baseRate: Number(rateData.baseRate),
      extraAdult: Number(rateData.extraAdult || 0),
      extraChild: Number(rateData.extraChild || 0),
      singleOccupancy: Number(rateData.singleOccupancy || 0)
    };
  
    this.rateModalForm.patchValue(formValues);
    this.originalValues = {...formValues}; // Store original values for comparison
  
    this.showRateModal = true;
  }

  private hasFormChanges(): boolean {
    if (!this.originalValues) return true;
    
    const currentValues = this.rateModalForm.value;
    return Object.keys(this.originalValues).some(key => {
      // Ignorer la comparaison si singleOccupancy est null ou undefined
      if (key === 'singleOccupancy' && 
          (this.originalValues[key] === null || this.originalValues[key] === undefined) && 
          (currentValues[key] === null || currentValues[key] === undefined)) {
        return false;
      }
      return this.originalValues[key] !== currentValues[key];
    });
  }

  deleteRate(rate: RateConfiguration) {
    if (!rate.rates?.[0]) {
      this.handleError(new Error('Invalid rate configuration'), 'Failed to delete rate');
      return;
    }

    const contract = this.findContractForRate(rate);
    if (!contract) {
      this.handleError(new Error('Contract not found'), 'Failed to delete rate');
      return;
    }

    // Remove rate from contract
    contract.rates = contract.rates.filter(r => r.id !== rate.rates[0].id);

    // Update contract in service
    this.hotelService.updateContract(contract).subscribe({
      next: (updatedContract) => {
        if (updatedContract) {
          this.loadInitialData();
          // Show success message
          this.success = 'Rate deleted successfully';
          setTimeout(() => this.success = '', 3000);
        } else {
          this.handleError(new Error('Failed to update contract'), 'Failed to delete rate');
        }
      },
      error: (error) => this.handleError(error, 'Failed to delete rate')
    });
  }

  deleteCategory(category: AgeCategory) {
    if (this.hotel && this.hotel.ageCategories) {
      this.hotel.ageCategories = this.hotel.ageCategories.filter(c => c.id !== category.id);
      this.hotelService.updateHotel(this.hotel).subscribe({
        next: () => {
          // Remove category from local array
          this.categories = this.categories.filter(c => c.id !== category.id);
          // Update rates that might reference this category
          this.currentRates.forEach(rateConfig => {
            rateConfig.rates.forEach(rate => {
              if (rate.ageCategoryRates) {
                delete rate.ageCategoryRates[category.id];
              }
            });
          });
        },
        error: (error) => {
          this.error = 'Failed to delete category';
        }
      });
    }
  }

  private getCurrencyForMarket(marketId: number): string {
    const market = this.marketGroups
      .flatMap(group => group.markets)
      .find(m => m.id === marketId);
    return market?.currency || this.defaultCurrency;
  }

  private initializeCurrencies() {
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
    
    // Set default currency if available
    if (this.currencies.includes(this.defaultCurrency)) {
      this.filterForm.patchValue({ currency: this.defaultCurrency });
    } else if (this.currencies.length > 0) {
      this.filterForm.patchValue({ currency: this.currencies[0] });
    }
  }
  
  private handleError(error: any, customMessage?: string) {
    this.error = customMessage || error?.message || 'An error occurred';
  }

  private generateUniqueId(): number {
    return Math.floor(Math.random() * 1000000) + 1;
  }

  private showModalMessage(message: string, isError: boolean = false) {
    this.modalMessage = message;
    this.modalError = isError;
  }

  private clearModalMessage() {
    this.modalMessage = null;
    this.modalError = false;
  }

  public saveRateModal(formData: any) {
    this.clearModalMessage();
  
    if (!this.rateModalForm.valid) {
      const invalidControls = Object.keys(this.rateModalForm.controls)
        .filter(key => this.rateModalForm.get(key)?.errors)
        .map(key => `${key}: ${JSON.stringify(this.rateModalForm.get(key)?.errors)}`);
      
      console.log('Invalid controls:', invalidControls);
      this.showModalMessage('Please fill in all required fields correctly', true);
      return;
    }
  
    // Vérifier les modifications pour la duplication
    if (!this.editingRate && !this.hasFormChanges()) {
      this.showModalMessage('You must modify at least one field when duplicating a rate', true);
      return;
    }
  
    // Pour l'édition, vérifier si des modifications ont été apportées
    if (this.editingRate && !this.hasFormChanges()) {
      this.showModalMessage('Please modify at least one field to save changes', true);
      return;
    }
  
    // Traiter singleOccupancy : garder null si non défini, sinon convertir en nombre
    formData.singleOccupancy = formData.singleOccupancy !== null && formData.singleOccupancy !== undefined && formData.singleOccupancy !== '' 
      ? Number(formData.singleOccupancy) 
      : null;
  
    if (!this.hotel?.id) {
      this.showModalMessage('Hotel ID is required', true);
      return;
    }
  
    try {
      const selectedRegion = formData.region;
      const marketGroup = this.marketGroups.find(group => group.code === selectedRegion);
      
      if (!marketGroup) {
        this.showModalMessage('Selected region not found', true);
        return;
      }
  
      if (this.editingRate) {
        const roomType = this.rooms.find(r => r.id === Number(formData.roomTypeId))!;
        const season = this.seasons.find(s => s.id === Number(formData.seasonId))!;
        
        const rateConfig: RateConfiguration = {
          id: this.editingRate.id.toString(),
          seasonId: Number(formData.seasonId),
          roomTypeId: Number(formData.roomTypeId),
          marketId: this.editingRate.marketId,
          baseRate: Number(formData.baseRate),
          extraAdult: Number(formData.extraAdult),
          extraChild: Number(formData.extraChild),
          singleOccupancy: formData.singleOccupancy,
          roomType,
          season,
          name: this.generateRateName(roomType, season),
          currency: this.editingRate.currency,
          rates: [{
            ...this.editingRate,
            name: this.generateRateName(roomType, season),
            seasonId: Number(formData.seasonId),
            roomTypeId: Number(formData.roomTypeId),
            baseRate: Number(formData.baseRate),
            extraAdult: Number(formData.extraAdult),
            extraChild: Number(formData.extraChild),
            singleOccupancy: formData.singleOccupancy,
            supplements: {
              extraAdult: Number(formData.extraAdult),
              extraChild: Number(formData.extraChild),
              singleOccupancy: formData.singleOccupancy
            }
          }]
        };
        
        this.updateRate(rateConfig);
      } else {
        // Pour l'ajout ou la duplication, on crée un nouveau rate pour chaque marché
        marketGroup.markets.forEach(market => {
          const roomType = this.rooms.find(r => r.id === Number(formData.roomTypeId))!;
          const season = this.seasons.find(s => s.id === Number(formData.seasonId))!;
          
          const rateConfig: RateConfiguration = {
            id: this.generateUniqueId().toString(),
            seasonId: Number(formData.seasonId),
            roomTypeId: Number(formData.roomTypeId),
            marketId: market.id,
            baseRate: Number(formData.baseRate),
            extraAdult: Number(formData.extraAdult),
            extraChild: Number(formData.extraChild),
            singleOccupancy: formData.singleOccupancy,
            roomType,
            season,
            name: this.generateRateName(roomType, season),
            currency: market.currency,
            rates: [{
              id: this.getNextRateId(),
              name: this.generateRateName(roomType, season),
              marketId: market.id,
              seasonId: Number(formData.seasonId),
              roomTypeId: Number(formData.roomTypeId),
              contractId: this.activeContracts[0]?.id || 0,
              currency: market.currency,
              amount: Number(formData.baseRate),
              baseRate: Number(formData.baseRate),
              extraAdult: Number(formData.extraAdult),
              extraChild: Number(formData.extraChild),
              singleOccupancy: formData.singleOccupancy,
              supplements: {
                extraAdult: Number(formData.extraAdult),
                extraChild: Number(formData.extraChild),
                singleOccupancy: formData.singleOccupancy
              },
              ageCategoryRates: {},
              mealPlanId: this.selectedMealPlans[0],
              specialOffers: []
            }]
          };
          
          this.addRate(rateConfig);
        });
  
        // Refresh the rates list after adding
        this.loadRates();
      }
  
      this.closeRateModal();
      this.success = this.editingRate ? 'Rate updated successfully' : 'Rate created successfully';
      setTimeout(() => this.success = '', 3000);
      
    } catch (error) {
      console.error('Error saving rate:', error);
      this.showModalMessage('Failed to save rate', true);
    }
  }


  /**
   * Generate a descriptive name for the rate
   */
  private generateRateName(roomType: RoomType, season: Season): string {
    return `${roomType.type} - ${season.name}`;
  }

  /**
   * Add a new rate to a contract
   */
  addRate(rateConfig: RateConfiguration) {
    if (!this.activeContracts.length) {
      this.handleError(new Error('No active contracts found'), 'Failed to add rate');
      return;
    }

    const contract = this.activeContracts[0];
    const newRate = this.rateConfigToRate(rateConfig);
    
    // Ensure the rate has a valid contract ID
    newRate.contractId = contract.id;
    
    contract.rates.push(newRate);

    // Update contract in service
    this.hotelService.updateContract(contract).subscribe({
      next: (updatedContract) => {
        if (updatedContract) {
          this.loadInitialData();
          // Show success message
          this.success = 'Rate added successfully';
          setTimeout(() => this.success = '', 3000);
        } else {
          this.handleError(new Error('Failed to update contract'), 'Failed to add rate');
        }
      },
      error: (error) => this.handleError(error, 'Failed to add rate')
    });
  }

  private rateConfigToRate(rateConfig: RateConfiguration): Rate {
    const rate = rateConfig.rates[0] || {};
    
    return {
      id: rate.id || this.getNextRateId(),
      name: this.generateRateName(rateConfig.roomType, rateConfig.season),
      marketId: rate.marketId,
      amount: rateConfig.baseRate || 0,
      baseRate: rateConfig.baseRate || 0,
      seasonId: rateConfig.seasonId,
      roomTypeId: rateConfig.roomTypeId,
      contractId: rate.contractId || this.activeContracts[0]?.id || 0,
      currency: rate.currency,
      supplements: {
        extraAdult: rate.supplements?.extraAdult || 0,
        extraChild: rate.supplements?.extraChild || 0,
        singleOccupancy: rate.supplements?.singleOccupancy || 0
      },
      extraAdult: rateConfig.extraAdult || 0,
      extraChild: rateConfig.extraChild || 0,
      singleOccupancy: rateConfig.singleOccupancy || 0,
      ageCategoryRates: {},
      mealPlanId: rate.mealPlanId,
      specialOffers: rate.specialOffers || []
    };
  }

  /**
   * Open the rate modal for creating or editing a rate
   */
  openRateModal(rate?: RateConfiguration): void {
    this.showRateModal = true;
    this.editingRate = rate ? rate.rates[0] : null;

    if (rate) {
      // Find the region code for this rate's market
      const region = this.findRegionForMarket(rate.marketId);
      
      this.rateModalForm.patchValue({
        seasonId: rate.seasonId,
        roomTypeId: rate.roomTypeId,
        region: region,
        baseRate: rate.baseRate,
        extraAdult: rate.extraAdult,
        extraChild: rate.extraChild,
        singleOccupancy: rate.singleOccupancy
      });
    } else {
      this.rateModalForm.reset();
      // Set default region if available
      if (this.marketGroups.length > 0) {
        this.rateModalForm.patchValue({
          region: this.marketGroups[0].code
        });
      }
    }
  }

  /**
   * Find the region code for a given market ID
   */
  private findRegionForMarket(marketId: number): string | null {
    for (const group of this.marketGroups) {
      if (group.markets.some(m => m.id === marketId)) {
        return group.code;
      }
    }
    return null;
  }

  /**
   * Close the rate modal
   */
  public closeRateModal(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.showRateModal = false;
    this.editingRate = null;
    this.originalValues = null;
    this.clearModalMessage();
    this.initializeRateForm(); // Reset form when closing
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

  private initializeRates(categories: AgeCategory[] | undefined) {
    if (!categories) return;
    categories.forEach(category => {
      if (!this.ratesByCategory[category.id]) {
        this.ratesByCategory[category.id] = category.defaultRate || 0;
      }
    });
  }

  processContractRates(contracts: Contract[]): RateConfiguration[] {
    if (!contracts || contracts.length === 0) return [];

    const rateConfigurations: RateConfiguration[] = [];
    
    contracts.forEach(contract => {
      if (contract.rates) {
        contract.rates.forEach(rate => {
          const season = this.seasons.find(s => s.id === rate.seasonId);
          const roomType = this.rooms.find(r => r.id === rate.roomTypeId);
          
          if (season && roomType) {
            const rateConfig: RateConfiguration = {
              id: rate.id.toString(),
              name: rate.name,
              description: '',
              startDate: new Date(contract.startDate),
              endDate: new Date(contract.endDate),
              roomType,
              season,
              rates: [rate],
              seasonId: rate.seasonId,
              roomTypeId: rate.roomTypeId,
              marketId: rate.marketId,
              baseRate: rate.baseRate,
              extraAdult: rate.extraAdult || 0,
              extraChild: rate.extraChild || 0,
              singleOccupancy: rate.supplements?.singleOccupancy || 0,
              currency: rate.currency,
              markets: [],
              regions: [],
              contractId: contract.id,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            rateConfigurations.push(rateConfig);
          }
        });
      }
    });

    return rateConfigurations;
  }
}