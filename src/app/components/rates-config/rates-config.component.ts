import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { 
  AgeCategory,
  Hotel, 
  RateConfiguration, 
  Season,
  Contract,
  RoomType,
  CurrencySetting,
  Market,
  Rate,
  Currency,
  MealPlanType,
  MEAL_PLAN_TYPES,
  MarketTemplate
} from 'src/app/models/types';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { HotelService } from '../../services/hotel.service';

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
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatToolbarModule
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
  

  // Forms with definite assignment
  basicInfoForm!: FormGroup;
  categoryRatesForm!: FormGroup;
  mealPlansForm!: FormGroup;
  specialOffersForm!: FormGroup;
  rateForm!: FormGroup;

  // Category management
  showCategoryForm = false;
  editingCategory: AgeCategory | null = null;
  newCategory: Partial<AgeCategory> = {};
  categories: AgeCategory[] = [];

  // Meal Plans
  mealPlans: MealPlanType[] = MEAL_PLAN_TYPES;
  selectedMealPlans: MealPlanType[] = [];

  constructor(
    private hotelService: HotelService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      seasonId: [null],
      roomTypeId: [null],
      currency: [null]
    });
  }

  ngOnInit() {
    // Initialize currencies from settings
    this.currencies = this.currencySettings
      .filter(c => c.isActive)
      .map(c => c.code);

    // Subscribe to hotel changes
    this.hotelService.getSelectedHotel().subscribe({
      next: (hotel) => {
        if (hotel) {
          this.hotel = hotel;
          this.loadInitialData();
        }
      },
      error: (error) => {
        console.error('Error loading hotel:', error);
      }
    });
  }

  initializeForms() {
    // Basic info form
    this.basicInfoForm = this.fb.group({
      season: ['', Validators.required],
      roomType: ['', Validators.required],
      currency: ['', Validators.required],
      market: ['', Validators.required]
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

    this.basicInfoForm.get('market')?.valueChanges.subscribe(value => {
      this.selectedMarket = value;
      this.loadMarketRates();
    });

    // Category rates form
    this.categoryRatesForm = this.fb.group({});
    if (this.hotel?.ageCategories) {
      this.hotel.ageCategories.forEach(category => {
        this.categoryRatesForm.addControl(
          category.type,
          this.fb.control(this.ratesByCategory[category.type] || 0, [
            Validators.required,
            Validators.min(0)
          ])
        );
      });
    }

    // Meal plans form
    this.mealPlansForm = this.fb.group({
      selectedPlans: [[]]
    });

    // Special offers form
    this.specialOffersForm = this.fb.group({
      offers: this.fb.array([])
    });

    // Rate form
    this.rateForm = this.fb.group({
      seasonId: ['', Validators.required],
      roomTypeId: ['', Validators.required],
      currency: ['', Validators.required],
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

    this.basicInfoForm.get('market')?.valueChanges.subscribe(value => {
      this.selectedMarket = value;
      this.loadMarketSpecificData(value);
    });

    // Meal Plans Form changes
    this.mealPlansForm.get('selectedPlans')?.valueChanges.subscribe(plans => {
      this.selectedMealPlans = plans;
      this.updateMealPlanRates();
    });
  }

  private loadMarketSpecificData(marketId: number) {
    if (!this.hotel || !marketId) return;

    try {
      // Load market-specific rates and templates
      const market = this.markets.find(m => m.id === marketId);
      if (market) {
        // Initialize market-specific data
        this.initializeMarketRates(market);
      }
    } catch (error) {
      console.error('Error loading market data:', error);
      this.error = 'Failed to load market-specific data';
    }
  }

  private initializeMarketRates(market: Market) {
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

  public async loadInitialData() {
    if (!this.hotel) return;
    
    try {
      this.isLoading = true;
      this.error = null;
      
      // Reset all data before loading new data
      this.resetAllData();
      
      // Load markets first
      this.markets = this.hotelService.getMarketsForHotel(this.hotel.id);
      
      // Load all required data
      const [seasons, rooms, currencySettings, contracts] = await Promise.all([
        this.hotelService.getSeasons(this.hotel.id),
        this.hotelService.getRooms(this.hotel.id),
        this.hotelService.getCurrencySettings(),
        this.hotelService.getContracts(this.hotel.id)
      ]);

      // Update component state
      this.seasons = seasons;
      this.rooms = rooms;
      this.currencySettings = currencySettings;
      this.activeContracts = contracts;

      // Process contracts into rate configurations
      this.currentRates = contracts.flatMap(contract => {
        const season = this.seasons.find(s => s.id === contract.seasonId);
        const roomType = this.rooms.find(r => r.id === contract.roomTypeId);
        
        if (!season || !roomType) {
          console.warn('Missing season or room type for contract:', contract.id);
          return [];
        }

        return {
          roomType,
          season,
          rates: contract.rates || []
        };
      });

      // Initialize currencies from settings
      this.currencies = currencySettings
        .filter(c => c.isActive)
        .map(c => c.code);

      // Initialize rates if hotel has age categories
      if (this.hotel.ageCategories) {
        this.initializeRates(this.hotel.ageCategories);
      }

      // Reset forms with new data
      this.initializeForms();
      
      // Apply initial filters
      this.applyFilters();

      console.log('Loaded data:', {
        seasons: this.seasons.length,
        rooms: this.rooms.length,
        contracts: this.activeContracts.length,
        markets: this.markets.length,
        currentRates: this.currentRates.length,
        filteredRates: this.filteredRates.length
      });

    } catch (error) {
      console.error('Error loading initial data:', error);
      this.error = 'Failed to load initial data. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  getRatesGroupedByCurrency(): Array<{currency: string, rates: RateConfiguration[]}> {
    if (!this.filteredRates) return [];

    // Group rates by currency
    const groupedRates = this.filteredRates.reduce((groups, rateConfig) => {
      // Get the currency from the first rate in the configuration
      const currency = rateConfig.rates[0]?.currency;
      if (!currency) return groups;

      if (!groups[currency]) {
        groups[currency] = [];
      }
      groups[currency].push(rateConfig);
      return groups;
    }, {} as { [key: string]: RateConfiguration[] });

    // Convert to array format
    return Object.entries(groupedRates).map(([currency, rates]) => ({
      currency,
      rates: rates.sort((a, b) => {
        // Sort by season first, then room type
        const seasonCompare = a.season.name.localeCompare(b.season.name);
        if (seasonCompare !== 0) return seasonCompare;
        return a.roomType.type.localeCompare(b.roomType.type);
      })
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

  applyFilters(): void {
    const filters = this.filterForm.value;
    
    // Filter your rates based on the form values
    this.filteredRates = this.currentRates.filter(rate => {
      let matches = true;
      
      if (filters.seasonId) {
        matches = matches && rate.season.id === filters.seasonId;
      }
      
      if (filters.roomTypeId) {
        matches = matches && rate.roomType.id === filters.roomTypeId;
      }
      
      if (filters.currency) {
        matches = matches && rate.rates[0]?.currency === filters.currency;
      }
      
      return matches;
    });
  }

  resetFilters(): void {
    this.filterForm.reset({
      seasonId: null,
      roomTypeId: null,
      currency: null
    });
    this.selectedCurrency = null;
    this.filteredRates = [...this.currentRates];
  }

  clearFilters() {
    this.selectedSeason = null;
    this.selectedRoomType = null;
    this.selectedCurrency = null;  // Don't preselect any currency
    this.applyFilters();  // Apply filters to show all rates
  }

  openRateEditor(rate?: RateConfiguration) {
    this.editingRate = rate || null;
    this.showRateEditor = true;
    this.rateForm.patchValue({
      seasonId: rate?.season.id,
      roomTypeId: rate?.roomType.id,
      currency: rate?.rates[0]?.currency,
      baseRate: rate?.rates[0]?.baseRate,
      extraAdult: rate?.rates[0]?.supplements?.extraAdult,
      extraChild: rate?.rates[0]?.supplements?.extraChild,
      singleOccupancy: rate?.rates[0]?.supplements?.singleOccupancy
    });
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
      type: 'adult',
      label: '',
      minAge: 0,
      maxAge: 0,
      defaultRate: 0  // Added missing required property
    };
  }

  public saveAgeCategory() {
    if (!this.isAgeCategoryValid()) {
      return;
    }

    if (!this.hotel) {
      console.error('No hotel selected');
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
      defaultRate: 0  // Added missing required property
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
    this.editingRate = rate;
    this.showRateEditor = true;
    this.rateForm.patchValue({
      seasonId: rate.season.id,
      roomTypeId: rate.roomType.id,
      currency: rate.rates[0]?.currency,
      baseRate: rate.rates[0]?.baseRate,
      extraAdult: rate.rates[0]?.supplements?.extraAdult,
      extraChild: rate.rates[0]?.supplements?.extraChild,
      singleOccupancy: rate.rates[0]?.supplements?.singleOccupancy
    });
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
          console.log('Rate updated successfully');
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
          console.log('Rate added successfully');
        } else {
          this.handleError(new Error('Failed to update contract'), 'Failed to add rate');
        }
      },
      error: (error) => this.handleError(error, 'Failed to add rate')
    });
  }

  private findContractForRate(rateConfig: RateConfiguration): Contract | undefined {
    if (!rateConfig.rates[0]) return undefined;
    return this.activeContracts.find(c => 
      c.rates.some(r => r.id === rateConfig.rates[0]?.id)
    );
  }

  private getNextRateId(): number {
    return Math.max(0, ...this.currentRates.map(r => r.rates[0]?.id || 0)) + 1;
  }

  public getRoomName(roomTypeId: number): string {
    const room = this.rooms.find(r => r.id === roomTypeId);
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
      console.error('No hotel selected');
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
      this.initializeRates(this.hotel.ageCategories);
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

  async saveRate() {
    if (this.rateForm.valid) {
      const formValue = this.rateForm.value;
      // Your save logic here
      this.cancelEdit();
    }
    
    if (!this.isFormValid() || !this.hotel) {
      console.error('Form validation failed');
      return;
    }

    try {
      const formData = {
        ...this.basicInfoForm.value,
        categoryRates: this.categoryRatesForm.value,
        mealPlans: this.mealPlansForm.value.selectedPlans,
        specialOffers: this.specialOffersForm.value.offers
      };

      // Get currency from settings
      const currencySetting = this.currencySettings.find(c => c.code === formData.currency);
      if (!currencySetting) {
        throw new Error('Invalid currency selected');
      }

      // Calculate rates
      const adultRate = this.getCategoryRate('adult', formData.categoryRates);
      const childRate = this.getCategoryRate('child', formData.categoryRates);
      const singleOccupancy = this.calculateSingleOccupancy(formData.categoryRates);

      // Create base rate
      const baseRate: Rate = {
        id: this.editingRate?.rates[0]?.id || this.getNextRateId(),
        name: this.generateRateName(
          this.rooms.find(r => r.id === formData.roomType) || this.rooms[0],
          this.seasons.find(s => s.id === formData.season) || this.seasons[0]
        ),
        marketId: this.selectedMarket || 1,
        amount: adultRate,
        seasonId: formData.season,
        roomTypeId: formData.roomType,
        contractId: this.editingRate?.rates[0]?.contractId || this.activeContracts[0]?.id,
        baseRate: adultRate,
        currency: currencySetting.code,
        mealPlanId: formData.mealPlans[0],
        supplements: {
          extraAdult: adultRate,
          extraChild: childRate,
          singleOccupancy: singleOccupancy
        },
        extraAdult: adultRate,
        extraChild: childRate,
        singleOccupancy: singleOccupancy,
        ageCategoryRates: formData.categoryRates,
        specialOffers: this.processSpecialOffers(formData.specialOffers)
      };

      // Create rate configuration
      const rateConfig: RateConfiguration = {
        roomType: this.rooms.find(r => r.id === formData.roomType) || this.rooms[0],
        season: this.seasons.find(s => s.id === formData.season) || this.seasons[0],
        rates: [baseRate]
      };

      // Update or add the rate
      if (this.editingRate) {
        const index = this.currentRates.findIndex(r => r.rates[0]?.id === baseRate.id);
        if (index !== -1) {
          this.currentRates[index] = rateConfig;
        }
      } else {
        this.currentRates.push(rateConfig);
      }

      // Reset UI state
      this.showRateEditor = false;
      this.resetForm();
      this.applyFilters();

    } catch (error) {
      console.error('Error saving rate:', error);
      this.error = 'Failed to save rate. Please try again.';
    }
  }

  private getCategoryRate(categoryId: string, baseRate: number): number {
    const category = this.hotel?.ageCategories?.find(c => c.id.toString() === categoryId);
    return category ? (category.defaultRate / 100) * baseRate : 0;
  }

  private calculateSingleOccupancy(baseRate: number): number {
    return baseRate * 0.75; // 75% of base rate for single occupancy
  }

  private generateRateName(roomType: RoomType, season: Season): string {
    return `${roomType.type} - ${season.name}`;
  }

  private processSpecialOffers(offers: any[]): any[] {
    return offers.map(offer => ({
      ...offer,
      startDate: new Date(offer.startDate).toISOString(),
      endDate: new Date(offer.endDate).toISOString()
    }));
  }

  // Safe navigation for undefined objects
  private initializeRates(categories: AgeCategory[] | undefined) {
    if (!categories) return;
    
    // Initialize rates safely
    categories.forEach(category => {
      if (!this.ratesByCategory[category.id]) {
        this.ratesByCategory[category.id] = category.defaultRate || 0;
      }
    });
  }

  // Fix Rate type issue
  private rateConfigToRate(rateConfig: RateConfiguration, baseRate?: Rate): Rate {
    const rate: Rate = {
      id: this.getNextRateId(),
      name: baseRate?.name || '',
      marketId: baseRate?.marketId || 0,
      amount: baseRate?.amount || 0,
      seasonId: baseRate?.seasonId || 0,
      roomTypeId: baseRate?.roomTypeId || 0,
      contractId: baseRate?.contractId || 0,
      baseRate: baseRate?.baseRate || 0,
      currency: baseRate?.currency || '',
      mealPlanId: baseRate?.mealPlanId,
      supplements: baseRate?.supplements || {
        extraAdult: 0,
        extraChild: 0,
        singleOccupancy: 0
      },
      extraAdult: baseRate?.extraAdult || 0,
      extraChild: baseRate?.extraChild || 0,
      singleOccupancy: baseRate?.singleOccupancy || 0,
      ageCategoryRates: baseRate?.ageCategoryRates || {},
      specialOffers: baseRate?.specialOffers || []
    };
    return rate;
  }

  // Fix market rates loading
  loadMarketRates() {
    if (!this.selectedMarket || !this.hotel) return;
    
    try {
      const markets = this.hotelService.getMarkets(this.hotel.id);
      const market = markets.find(m => m.id === this.selectedMarket);
      if (market) {
        this.initializeMarketRates(market);
      }
    } catch (error: any) {
      this.handleError(error);
    }
  }

  // Error handling methods
  private handleError(error: any, customMessage?: string) {
    console.error('Error:', error);
    this.error = customMessage || error?.message || 'An error occurred';
  }

  duplicateRate(rate: RateConfiguration) {
    const newRate = { ...rate, id: this.getNextRateId() };
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
            this.loadInitialData();
            console.log('Rate deleted successfully');
          } else {
            this.handleError(new Error('Failed to update contract'), 'Failed to delete rate');
          }
        },
        error: (error) => this.handleError(error, 'Failed to delete rate')
      });
    }
  }

  // Special offers management
  removeOfferFromList(index: number) {
    this.specialOffersList.splice(index, 1);
  }

  addSpecialOfferToList(offer: any) {
    this.specialOffersList.push(offer);
  }

  removeOffer(index: number) {
    const offers = this.specialOffersForm.get('offers') as FormArray;
    offers.removeAt(index);
  }

  addSpecialOffer() {
    const offers = this.specialOffersForm.get('offers') as FormArray;
    offers.push(this.fb.group({
      name: ['', Validators.required],
      description: [''],
      discount: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    }));
  }

  deleteCategory(category: AgeCategory) {
    if (this.hotel && this.hotel.ageCategories) {
      this.hotel.ageCategories = this.hotel.ageCategories.filter(c => c.id !== category.id);
      this.hotelService.updateHotel(this.hotel).subscribe({
        next: () => {
          this.loadInitialData();
        },
        error: (error) => {
          console.error('Error deleting category:', error);
        }
      });
    }
  }

  editRateForm(rate: RateConfiguration) {
    this.editingRate = rate;
    this.showRateEditor = true;
    this.rateForm.patchValue({
      seasonId: rate.season.id,
      roomTypeId: rate.roomType.id,
      currency: rate.rates[0]?.currency,
      baseRate: rate.rates[0]?.baseRate,
      extraAdult: rate.rates[0]?.supplements?.extraAdult,
      extraChild: rate.rates[0]?.supplements?.extraChild,
      singleOccupancy: rate.rates[0]?.supplements?.singleOccupancy
    });
  }

  cancelEditRate() {
    this.showRateEditor = false;
    this.editingRate = null;
    this.rateForm.reset();
  }

  saveEditedRate() {
    if (this.rateForm.valid) {
      const formValue = this.rateForm.value;
      // Your save logic here
      this.cancelEditRate();
    }
  }

  selectMarket(marketId: number): void {
    this.selectedMarket = marketId;
  }

  viewMarketDetails(market: Market): void {
    // You can implement a dialog or detailed view here
    console.log('Viewing details for market:', market);
  }

  onCurrencySelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const currencyCode = select.value;
    
    if (!currencyCode || currencyCode === 'null') {
      this.selectedCurrency = null;
    } else {
      const currencySetting = this.currencySettings.find(c => c.code === currencyCode);
      if (currencySetting) {
        this.selectedCurrency = {
          code: currencySetting.code,
          symbol: currencySetting.symbol
        };
      }
    }
    
    this.applyFilters();
  }
}