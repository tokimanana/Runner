import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
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
    DecimalPipe,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
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
  error: string | null = null;
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
      extraChild: [null, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    // Initialize filter form subscription
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300), // Add small delay to prevent rapid filtering
        distinctUntilChanged((prev, curr) => 
          prev.seasonId === curr.seasonId && 
          prev.roomTypeId === curr.roomTypeId && 
          prev.currency === curr.currency
        )
      )
      .subscribe(() => this.applyFilters());

    // Load initial data
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
      await Promise.all([
        this.loadSeasons(),
        this.loadRooms(),
        this.loadCurrencies(),
        this.loadRates()
      ]);

      // Initialize filters with default values
      this.initializeFilters();
      
      // Apply initial filtering
      this.applyFilters();
      
    } catch (error) {
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

  initializeForms() {
    // Basic info form
    this.basicInfoForm = this.formBuilder.group({
      season: ['', Validators.required],
      roomType: ['', Validators.required],
      currency: ['', Validators.required],
      region: ['', Validators.required]
    });

    // Subscribe to form changes
    this.basicInfoForm.get('season')?.valueChanges.subscribe(value => {
      this.selectedSeason = value;
      this.applyFilters();
    });

    this.basicInfoForm.get('roomType')?.valueChanges.subscribe(value => {
      this.selectedRoomType = value;
      this.applyFilters();
    });

    this.basicInfoForm.get('currency')?.valueChanges.subscribe(value => {
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

    this.basicInfoForm.get('region')?.valueChanges.subscribe(value => {
      this.selectedRegion = value;
      this.loadMarketSpecificData(value);
    });

    // Category rates form
    this.categoryRatesForm = this.formBuilder.group({});
    if (this.hotel?.ageCategories) {
      this.hotel.ageCategories.forEach(category => {
        this.categoryRatesForm.addControl(
          category.type,
          this.formBuilder.control(this.ratesByCategory[category.type] || 0, [
            Validators.required,
            Validators.min(0)
          ])
        );
      });
    }

    // Meal plans form
    this.mealPlansForm = this.formBuilder.group({
      selectedPlans: [[]]
    });

    // Special offers form
    this.specialOffersForm = this.formBuilder.group({
      offers: this.formBuilder.array([])
    });

    // Rate form
    this.rateForm = this.formBuilder.group({
      seasonId: ['', Validators.required],
      roomTypeId: ['', Validators.required],
      region: ['', Validators.required],
      baseRate: ['', [Validators.required, Validators.min(0)]],
      extraAdult: [0, Validators.min(0)],
      extraChild: [0, Validators.min(0)],
      singleOccupancy: [0, Validators.min(0)]
    });

  }

  private subscribeToFormChanges() {
    // Basic Info Form changes
    this.basicInfoForm.get('season')?.valueChanges.subscribe(value => {
      this.selectedSeason = value;
      this.applyFilters();
    });

    this.basicInfoForm.get('roomType')?.valueChanges.subscribe(value => {
      this.selectedRoomType = value;
      this.applyFilters();
    });

    this.basicInfoForm.get('currency')?.valueChanges.subscribe(value => {
      const currencySetting = this.currencySettings.find(c => c.code === value);
      this.selectedCurrency = currencySetting ? {
        code: currencySetting.code,
        symbol: currencySetting.symbol
      } : null;
      this.applyFilters();
    });

    this.basicInfoForm.get('region')?.valueChanges.subscribe(value => {
      this.selectedRegion = value;
      this.loadMarketSpecificData(value);
    });

    // Meal Plans Form changes
    this.mealPlansForm.get('selectedPlans')?.valueChanges.subscribe(plans => {
      this.selectedMealPlans = plans;
      this.updateMealPlanRates();
    });
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

  private loadSeasons(): void {
    if (!this.hotel?.id) {
      this.error = 'Hotel ID is required for loading seasons';
      return;
    }
    this.seasons = this.hotelService.getSeasons(this.hotel.id);
  }

  private loadRooms(): void {
    if (!this.hotel?.id) {
      this.error = 'Hotel ID is required for loading rooms';
      return;
    }
    this.rooms = this.hotelService.getRooms(this.hotel.id);
  }

  private loadCurrencies(): void {
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
    
    // Set default currency if available
    if (this.currencies.includes(this.defaultCurrency)) {
      this.filterForm.patchValue({ currency: this.defaultCurrency });
    } else if (this.currencies.length > 0) {
      this.filterForm.patchValue({ currency: this.currencies[0] });
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
      this.error = 'Failed to load rates';
      throw error;
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
    const rateData = this.convertToRate(rate);
    this.editingRate = rateData;
    this.rateForm.patchValue({
      seasonId: rateData.seasonId,
      roomTypeId: rateData.roomTypeId,
      region: rateData.marketId,
      baseRate: rateData.baseRate,
      extraAdult: rateData.extraAdult,
      extraChild: rateData.extraChild
    });
    this.openRateModal();
  }

  updateRate(rateConfig: RateConfiguration) {
    if (!rateConfig.rates[0]) return;
    
    const currentRate = rateConfig.rates[0];
    const contract = this.activeContracts.find(c => c.id === currentRate.contractId);
    
    if (!contract) return;

    const updatedRate: Rate = {
      ...currentRate,
      seasonId: rateConfig.season.id,
      roomTypeId: rateConfig.roomType.id,
      ageCategoryRates: this.ratesByCategory,
      specialOffers: this.specialOffersList,
      mealPlanId: this.selectedMealPlans[0]
    };

    const index = contract.rates.findIndex(r => r.id === currentRate.id);
    if (index !== -1) {
      contract.rates[index] = updatedRate;
    }

    this.hotelService.updateContract(contract).subscribe({
      next: (updatedContract) => {
        if (updatedContract) {
          this.loadInitialData();
        } else {
          this.handleError(new Error('Failed to update contract'), 'Failed to update rate');
        }
      },
      error: (error) => this.handleError(error, 'Failed to update rate')
    });
  }

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

    this.hotelService.updateContract(contract).subscribe({
      next: (updatedContract) => {
        if (updatedContract) {
          this.loadInitialData();
        } else {
          this.handleError(new Error('Failed to update contract'), 'Failed to add rate');
        }
      },
      error: (error) => this.handleError(error, 'Failed to add rate')
    });
  }

  private findContractForRate(rateConfig: RateConfiguration): Contract | undefined {
    return this.activeContracts.find(contract => 
      contract.rates.some(r => r.id === rateConfig.rates[0]?.id)
    );
  }

  private getNextRateId(): number {
    return Math.max(0, ...this.currentRates.map(r => r.rates[0]?.id || 0)) + 1;
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


  private processContractRates(contracts: Contract[]): RateConfiguration[] {
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
  
  public saveRateModal(formData: any) {
    if (!this.hotel || !formData || this.rateModalForm.invalid) return;

    const season = this.seasons.find(s => s.id === formData.seasonId);
    const roomType = this.rooms.find(r => r.id === formData.roomTypeId);
    
    if (!season || !roomType) {
      this.handleError(new Error('Invalid season or room type'), 'Failed to save rate');
      return;
    }

    const newRate: Rate = {
      id: this.editingRate?.id || this.generateUniqueId(),
      name: formData.name || this.generateRateName(roomType, season),
      marketId: formData.marketId,
      seasonId: formData.seasonId,
      roomTypeId: formData.roomTypeId,
      amount: formData.baseRate,
      baseRate: formData.baseRate,
      contractId: this.activeContracts[0]?.id,
      currency: formData.currency || this.getCurrencyForMarket(formData.marketId),
      extraAdult: formData.extraAdult || 0,
      extraChild: formData.extraChild || 0,
      supplements: {
        extraAdult: formData.extraAdult || 0,
        extraChild: formData.extraChild || 0,
        singleOccupancy: formData.singleOccupancy || 0
      },
      singleOccupancy: formData.singleOccupancy || 0,
      ageCategoryRates: {},
      mealPlanId: this.selectedMealPlans[0]
    };

    const rateConfig: RateConfiguration = {
      id: newRate.id.toString(),
      name: newRate.name,
      description: '',
      roomType,
      season,
      rates: [newRate],
      seasonId: newRate.seasonId,
      roomTypeId: newRate.roomTypeId,
      marketId: newRate.marketId,
      baseRate: newRate.baseRate,
      extraAdult: newRate.extraAdult,
      extraChild: newRate.extraChild,
      singleOccupancy: newRate.singleOccupancy,
      currency: newRate.currency,
      contractId: newRate.contractId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const existingRateIndex = this.currentRates.findIndex(rate => rate.id === rateConfig.id);

    if (existingRateIndex >= 0) {
      // Update existing rate
      this.currentRates[existingRateIndex] = {
        ...this.currentRates[existingRateIndex],
        ...rateConfig
      };
    } else {
      // Create new rate
      this.currentRates.push(rateConfig);
    }

    this.applyFilters();
    this.saveRatesToContract(rateConfig);
    this.closeRateModal();
  }

  private saveRatesToContract(rateConfig: RateConfiguration) {
    if (!this.hotel) return;
    
    const contract = this.activeContracts.find(c => c.id === rateConfig.contractId);
    if (contract) {
      if (!contract.rates) {
        contract.rates = [];
      }
      
      const rate: Rate = rateConfig.rates[0];
      const existingRateIndex = contract.rates.findIndex(r => r.id === Number(rateConfig.id));
      
      if (existingRateIndex >= 0) {
        contract.rates[existingRateIndex] = rate;
      } else {
        contract.rates.push(rate);
      }
      
      // Update contract in service
      this.hotelService.updateContract(contract).subscribe({
        next: () => {
          // Optionally refresh rates
          this.loadRates();
        },
        error: (error) => this.handleError(error, 'Failed to save rate')
      });
    }
  }

  private generateUniqueId(): number {
    return Math.floor(Math.random() * 1000000) + 1;
  }

  private generateRateName(roomType: RoomType, season: Season): string {
    return `${roomType.type} - ${season.name} Rate`;
  }

  openRateModal(rate?: RateConfiguration) {
    this.showRateModal = true;
    
    if (rate) {
      // Editing existing rate
      const marketGroup = this.marketGroups.find(g => g.markets.some(m => m.id === rate.marketId));
      if (marketGroup) {
        this.selectedRegion = marketGroup.code;
        this.filteredMarkets = marketGroup.markets;
      }
      
      this.rateModalForm.patchValue({
        seasonId: rate.seasonId,
        roomTypeId: rate.roomTypeId,
        region: this.selectedRegion,
        marketId: rate.marketId,
        baseRate: rate.baseRate,
        extraAdult: rate.extraAdult,
        extraChild: rate.extraChild
      });
    } else {
      // Creating new rate
      this.rateModalForm.reset();
      this.selectedRegion = null;
      this.filteredMarkets = [];
    }
  }

  closeRateModal(event?: MouseEvent) {
    // Only close if clicking backdrop or cancel button
    if (!event || event.target === event.currentTarget) {
      this.showRateModal = false;
      this.editingRate = null;
      this.rateModalForm.reset();
    }
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

  private handleError(error: any, customMessage?: string) {
    this.error = customMessage || error?.message || 'An error occurred';
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

  private convertToRate(rateConfig: RateConfiguration): Rate {
    const rate = rateConfig.rates[0];
    if (!rate) throw new Error('Invalid rate configuration');

    return {
      id: rate.id,
      name: this.generateRateName(rateConfig.roomType, rateConfig.season),
      marketId: rate.marketId,
      seasonId: rateConfig.season.id,
      roomTypeId: rateConfig.roomType.id,
      amount: rate.baseRate,
      baseRate: rate.baseRate,
      contractId: rate.contractId || this.activeContracts[0]?.id || 0,
      currency: rate.currency,
      extraAdult: rate.supplements?.extraAdult || 0,
      extraChild: rate.supplements?.extraChild || 0,
      singleOccupancy: rate.supplements?.singleOccupancy || 0,
      supplements: {
        extraAdult: rate.supplements?.extraAdult || 0,
        extraChild: rate.supplements?.extraChild || 0,
        singleOccupancy: rate.supplements?.singleOccupancy || 0
      },
      ageCategoryRates: rate.ageCategoryRates || {},
      mealPlanId: rate.mealPlanId,
      specialOffers: rate.specialOffers || []
    };
  }

  duplicateRate(rate: RateConfiguration) {
    const newRate = { ...rate };
    newRate.rates = newRate.rates.map(r => ({
      ...r,
      id: this.getNextRateId()
    }));
    this.openRateEditor(newRate);
  }

  deleteRate(rate: RateConfiguration) {
    if (!rate.rates[0]) {
      this.handleError(new Error('Invalid rate configuration'), 'Failed to delete rate');
      return;
    }

    const contract = this.findContractForRate(rate);
    if (contract) {
      contract.rates = contract.rates.filter(r => r.id !== rate.rates[0].id);
      
      this.hotelService.updateContract(contract).subscribe({
        next: (updatedContract) => {
          if (updatedContract) {
            // Remove rate from currentRates
            const index = this.currentRates.findIndex(r => 
              r.seasonId === rate.seasonId && 
              r.roomTypeId === rate.roomTypeId &&
              r.marketId === rate.marketId
            );
            if (index !== -1) {
              this.currentRates.splice(index, 1);
            }
            this.applyFilters();
          } else {
            this.handleError(new Error('Failed to update contract'), 'Failed to delete rate');
          }
        },
        error: (error) => this.handleError(error, 'Failed to delete rate')
      });
    }
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
          this.handleError(error, 'Failed to delete category');
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
}