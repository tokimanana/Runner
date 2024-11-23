import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule, MatChipSelectionChange } from '@angular/material/chips';
import { HotelService } from '../../services/hotel.service';
import { 
  AgeCategory,
  Hotel, 
  RateConfiguration, 
  Currency,
  MealPlanType,
  Season,
  Contract,
  MEAL_PLAN_TYPES,
  MarketTemplate,
  RoomType,
  CurrencySettings,
  Market,
  Rate
} from 'src/app/models/types';

@Component({
  selector: 'app-rates-config',
  templateUrl: './rates-config.component.html',
  styleUrls: ['./rates-config.component.css'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatChipsModule,
    MatListModule,
    MatTooltipModule
  ]
})
export class RatesConfigComponent implements OnInit {
  @Input() hotel: Hotel | null = null;
  
  marketTemplates: MarketTemplate[] = [];
  markets: Market[] = [];
  activeContracts: Contract[] = [];
  showRateEditor = false;
  selectedSeason: number | null = null;
  selectedRoomType: number | null = null;
  selectedCurrency: string | null = null;  // Changed from Currency | null
  selectedMealPlans: MealPlanType[] = [];  // Restored property
  
  showAgeCategoryEditor = false;
  showCategoryForm = false;
  editingCategory: AgeCategory | null = null;
  newCategory: AgeCategory = {
    id: 0,
    type: 'adult',
    label: '',
    minAge: 0,
    maxAge: 0,
    defaultRate: 0  // Added missing required property
  };
  
  currentRates: RateConfiguration[] = [];
  filteredRates: RateConfiguration[] = [];
  seasons: Season[] = [];
  rooms: RoomType[] = [];  // Changed from Room[] to RoomType[]
  currencies: string[] = [];
  currencySettings: CurrencySettings[] = [];
  isLoading = false;
  editingRate: RateConfiguration | null = null;
  mealPlanTypes = MEAL_PLAN_TYPES;
  ratesByCategory: { [key: string]: number } = {};
  mealPlanRates: Record<MealPlanType, Record<string, number>> = {} as Record<MealPlanType, Record<string, number>>;
  selectedMarket: number | null = null;
  specialOffers: { type: 'early_bird' | 'long_stay' | 'honeymoon'; discount: number }[] = [];
  categoryTypes = [
    { value: 'adult' as const, label: 'Adult', icon: 'person' },
    { value: 'child' as const, label: 'Child', icon: 'child_care' },
    { value: 'infant' as const, label: 'Infant', icon: 'baby_changing_station' }
  ] as const;

  constructor(
    private hotelService: HotelService
  ) {
    // Subscribe to hotel changes
    this.hotelService.getSelectedHotel().subscribe({
      next: (hotel) => {
        this.hotel = hotel;
        if (hotel) {
          this.loadInitialData();
        }
      },
      error: (error) => {
        console.error('Error loading hotel:', error);
      }
    });
  }

  ngOnInit() {
    // Get currencies from hotel service
    this.currencySettings = this.hotelService.getCurrencySettings();
    this.currencies = this.currencySettings
      .filter(c => c.isActive)  // Only get active currencies
      .map(c => c.code);  // Get currency codes

    // Subscribe to hotel changes
    this.hotelService.getSelectedHotel().subscribe({
      next: (hotel) => {
        this.hotel = hotel;
        if (hotel) {
          this.loadInitialData();
        }
      },
      error: (error) => {
        console.error('Error loading hotel:', error);
      }
    });
  }

  loadInitialData() {
    if (this.hotel) {
      // Load markets
      this.markets = this.hotelService.getMarketsForHotel(this.hotel.id);
      console.log('Loaded markets:', this.markets);
      
      // Reset previous data
      this.resetAllData();
      
      // Load all required data
      this.seasons = this.hotelService.getSeasons(this.hotel.id) || [];
      this.rooms = this.hotelService.getRooms(this.hotel.id) || [];
      this.activeContracts = this.hotelService.getContracts(this.hotel.id) || [];
      
      console.log('Loaded data:', {
        seasons: this.seasons.length,
        rooms: this.rooms.length,
        contracts: this.activeContracts.length,
        markets: this.markets.length
      });

      // Initialize rates if hotel has age categories
      if (this.hotel.ageCategories) {
        this.initializeRates(this.hotel.ageCategories);
      }
      
      // Apply initial filters
      this.applyFilters();
    }
  }

  private resetAllData() {
    // Reset all data structures
    this.seasons = [];
    this.rooms = [];
    this.activeContracts = [];
    this.currentRates = [];
    this.filteredRates = [];
    this.ratesByCategory = {};
    this.mealPlanRates = {} as Record<MealPlanType, Record<string, number>>;
    this.selectedSeason = null;
    this.selectedRoomType = null;
    this.selectedCurrency = null;
    this.selectedMealPlans = [];
    this.specialOffers = [];
    this.markets = [];
  }

  initializeRates(categories: AgeCategory[]) {
    try {
      // Initialize rates array from active contracts
      this.currentRates = this.activeContracts.reduce<RateConfiguration[]>((acc, contract) => {
        if (contract?.rates?.length) {
          return [...acc, ...contract.rates.map(rate => ({
            roomType: this.rooms.find(r => r.id === rate.roomTypeId) || this.rooms[0],
            season: this.seasons.find(s => s.id === rate.seasonId) || this.seasons[0],
            rates: [rate]
          }))];
        }
        return acc;
      }, []);

      // Initialize rate by category mapping
      this.ratesByCategory = categories.reduce((acc, category) => {
        acc[category.type] = 0;
        return acc;
      }, {} as { [key: string]: number });

      // Initialize meal plan rates
      this.mealPlanTypes.forEach(plan => {
        if (!this.mealPlanRates[plan]) {
          this.mealPlanRates[plan] = {};
        }
        categories.forEach(category => {
          this.mealPlanRates[plan][category.type] = 0;
        });
      });

      this.applyFilters();
    } catch (error) {
      console.error('Error initializing rates:', error);
      this.currentRates = [];
      this.ratesByCategory = {};
      this.mealPlanRates = {} as Record<MealPlanType, Record<string, number>>;
    }
  }

  applyFilters() {
    if (!this.hotel) return;

    this.isLoading = true;
    
    // Filter current rates based on selected criteria
    this.filteredRates = this.currentRates.filter(rate => {
      if (this.selectedSeason !== null && rate.season.id !== this.selectedSeason) return false;
      if (this.selectedRoomType !== null && rate.roomType.id !== this.selectedRoomType) return false;
      if (this.selectedCurrency !== null && rate.rates[0]?.currency !== this.selectedCurrency) return false;
      return true;
    });

    this.isLoading = false;
  }

  clearFilters() {
    this.selectedSeason = null;
    this.selectedRoomType = null;
    this.selectedCurrency = null;  // Don't preselect any currency
    this.applyFilters();  // Apply filters to show all rates
  }

  resetFilters() {
    this.selectedSeason = null;
    this.selectedRoomType = null;
    this.selectedCurrency = null;  // Don't preselect any currency
    this.applyFilters();  // Apply filters to show all rates
  }

  onCurrencySelect(currency: string | null) {
    this.selectedCurrency = currency;
    this.applyFilters();
  }

  openRateEditor(rate?: RateConfiguration) {
    this.editingRate = rate || null;
    this.showRateEditor = true;
    if (rate?.rates[0]) {
      this.selectedSeason = rate.season.id;
      this.selectedRoomType = rate.roomType.id;
      this.selectedCurrency = rate.rates[0].currency;
      this.selectedMealPlans = rate.rates[0].mealPlanId ? [rate.rates[0].mealPlanId] : [];
      this.ratesByCategory = { ...rate.rates[0].ageCategoryRates };
      this.specialOffers = [...(rate.rates[0].specialOffers || [])];
    }
  }

  openAgeCategoryEditor(): void {
    this.showAgeCategoryEditor = true;
    this.showCategoryForm = false;
    this.editingCategory = null;
    this.newCategory = this.getEmptyCategoryTemplate();
  }

  editCategory(category: AgeCategory): void {
    this.editingCategory = { ...category };
    this.newCategory = { ...category };
    this.showCategoryForm = true;
  }

  cancelEdit() {
    this.editingCategory = null;
    this.resetNewCategory();
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
    if (!this.hotel?.ageCategories) return;
    
    const errors = this.validateAgeCategory(this.newCategory);
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    if (this.editingCategory) {
      // Update existing category
      this.hotel.ageCategories = this.hotel.ageCategories.map(c => 
        c.id === this.editingCategory?.id ? this.newCategory : c
      );
      this.editingCategory = null;
    } else {
      // Add new category
      this.hotel.ageCategories = [...this.hotel.ageCategories, this.newCategory];
    }

    this.sortCategories();
    this.resetNewCategory();
  }

  getCategoryIcon(type: string): string {
    const category = this.categoryTypes.find(c => c.value === type);
    return category?.icon || 'person';
  }

  isAgeCategoryValid(): boolean {
    return !!(this.newCategory.label && 
              this.newCategory.type &&
              this.newCategory.minAge >= 0 &&
              this.newCategory.maxAge > this.newCategory.minAge);
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
    this.selectedSeason = rate.season.id;
    this.selectedRoomType = rate.roomType.id;
    this.selectedCurrency = rate.rates[0]?.currency || null;

    const currentRate = rate.rates[0];
    if (!currentRate) return;

    this.ratesByCategory = currentRate.ageCategoryRates || {};

    // Check for meal plan in the current rate
    const mealPlanId = currentRate.mealPlanId as MealPlanType;
    if (mealPlanId && this.mealPlanTypes.includes(mealPlanId)) {
      this.selectedMealPlans = [mealPlanId];
      this.mealPlanRates[mealPlanId] = currentRate.ageCategoryRates || {};
    }

    this.specialOffers = currentRate.specialOffers || [];
    this.showRateEditor = true;
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
      specialOffers: this.specialOffers,
      mealPlanId: this.selectedMealPlans[0]
    };

    const index = contract.rates.findIndex(r => r.id === currentRate.id);
    if (index !== -1) {
      contract.rates[index] = updatedRate;
    }

    this.hotelService.updateContract(contract).subscribe({
      next: (updatedContract) => this.handleContractUpdate(
        updatedContract, 
        'Rate updated successfully', 
        'Failed to update rate.'
      ),
      error: (error) => this.handleError(error, 'Failed to update rate.')
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
      next: (updatedContract) => this.handleContractUpdate(
        updatedContract, 
        'Rate added successfully', 
        'Failed to add rate'
      ),
      error: (error) => this.handleError(error, 'Failed to add rate')
    });
  }

  private findContractForRate(rateConfig: RateConfiguration): Contract | undefined {
    if (!rateConfig.rates[0]) return undefined;
    return this.activeContracts.find(c => 
      c.rates.some(r => r.id === rateConfig.rates[0]?.id)
    );
  }

  private rateConfigToRate(rateConfig: RateConfiguration, baseRate?: Rate): Rate {
    const defaultRate: Partial<Rate> = {
      marketId: this.selectedMarket || 0,
      amount: 0,
      baseRate: 0,
      currency: this.selectedCurrency || 'USD',
      supplements: {
        extraAdult: 0,
        extraChild: 0,
        singleOccupancy: 0
      },
      extraAdult: 0,
      extraChild: 0,
      singleOccupancy: 0,
      ageCategoryRates: this.ratesByCategory,
      specialOffers: this.specialOffers
    };

    const rate = baseRate || defaultRate;

    return {
      ...rate,
      id: baseRate ? this.getNextRateId() : rate.id,
      name: baseRate ? `${rateConfig.roomType.type} - ${rateConfig.season.name} (Copy)` : rate.name,
      seasonId: rateConfig.season.id,
      roomTypeId: rateConfig.roomType.id,
      contractId: baseRate?.contractId || (this.findContractForRate(rateConfig)?.id || 0),
      ageCategoryRates: this.ratesByCategory,
      specialOffers: this.specialOffers,
      mealPlanId: this.selectedMealPlans[0]
    } as Rate;
  }

  deleteRate(rateConfig: RateConfiguration) {
    if (!rateConfig.rates[0] || !confirm('Are you sure you want to delete this rate?')) {
      return;
    }

    const contract = this.findContractForRate(rateConfig);
    if (!contract) {
      this.handleError(new Error('Contract not found'), 'Failed to delete rate');
      return;
    }

    contract.rates = contract.rates.filter(r => r.id !== rateConfig.rates[0]?.id);
    
    this.hotelService.updateContract(contract).subscribe({
      next: (updatedContract) => this.handleContractUpdate(
        updatedContract, 
        'Rate deleted successfully', 
        'Failed to delete rate'
      ),
      error: (error) => this.handleError(error, 'Failed to delete rate')
    });
  }

  duplicateRate(rateConfig: RateConfiguration) {
    if (!rateConfig.rates[0]) {
      this.handleError(new Error('No rate to duplicate'), 'Failed to duplicate rate');
      return;
    }

    const contract = this.findContractForRate(rateConfig);
    if (!contract) {
      this.handleError(new Error('Contract not found'), 'Failed to duplicate rate');
      return;
    }

    // Create a new rate based on the existing one
    const newRate = this.rateConfigToRate(rateConfig, rateConfig.rates[0]);
    
    contract.rates.push(newRate);

    this.hotelService.updateContract(contract).subscribe({
      next: (updatedContract) => this.handleContractUpdate(
        updatedContract, 
        'Rate duplicated successfully', 
        'Failed to duplicate rate'
      ),
      error: (error) => this.handleError(error, 'Failed to duplicate rate')
    });
  }

  private handleContractUpdate(updatedContract: Contract, successMessage: string, errorMessage: string) {
    const index = this.activeContracts.findIndex(c => c.id === updatedContract.id);
    if (index !== -1) {
      this.activeContracts[index] = updatedContract;
      // Reinitialize rates with updated contract
      if (this.hotel?.ageCategories) {
        this.initializeRates(this.hotel.ageCategories);
      }
      console.log(successMessage);
    } else {
      console.error(errorMessage);
    }
  }

  private handleError(error: any, message: string) {
    console.error(message, error);
    alert(`${message}. Please try again.`);
  }

  getNextRateId(): number {
    let maxId = 0;
    this.activeContracts.forEach(contract => {
      contract.rates.forEach(rate => {
        if (rate.id > maxId) maxId = rate.id;
      });
    });
    return maxId + 1;
  }

  updateCategoryRate(category: string, amount: number) {
    this.ratesByCategory[category] = amount;
  }

  getRateForCategory(category: string): number {
    return this.ratesByCategory[category] || 0;
  }

  getMealPlanRate(plan: MealPlanType, category: string): number {
    return this.mealPlanRates[plan]?.[category] || 0;
  }

  setMealPlanRate(plan: MealPlanType, category: string, amount: number) {
    if (!this.mealPlanRates[plan]) {
      this.mealPlanRates[plan] = {};
    }
    this.mealPlanRates[plan][category] = amount;
  }

  toggleMealPlan(event: MatChipSelectionChange): void {
    const plan = event.source.value as MealPlanType;
    if (event.selected) {
      this.selectedMealPlans.push(plan);
    } else {
      this.selectedMealPlans = this.selectedMealPlans.filter(p => p !== plan);
    }
    this.updateMealPlanRates();
  }

  private updateMealPlanRates(): void {
    // Initialize rates for newly selected meal plans
    for (const plan of this.selectedMealPlans) {
      if (!this.mealPlanRates[plan]) {
        this.mealPlanRates[plan] = {};
      }
    }

    // Remove rates for unselected meal plans
    for (const plan of Object.keys(this.mealPlanRates) as MealPlanType[]) {
      if (!this.selectedMealPlans.includes(plan)) {
        delete this.mealPlanRates[plan];
      }
    }
  }

  addSpecialOffer(): void {
    this.specialOffers.push({
      type: 'early_bird',
      discount: 0
    });
  }

  removeOffer(index: number): void {
    this.specialOffers.splice(index, 1);
  }

  saveRate(): void {
    if (!this.selectedSeason || !this.selectedRoomType || !this.selectedCurrency) {
      this.handleError(new Error('Missing required fields'), 'Failed to save rate');
      return;
    }

    // First create the Rate object
    const rate: Rate = {
      id: this.editingRate?.rates[0]?.id || this.getNextRateId(),
      name: `${this.selectedRoomType} - ${this.selectedSeason}`,
      marketId: this.selectedMarket || 1,
      amount: this.getRateForCategory('adult'),
      seasonId: this.selectedSeason,
      roomTypeId: this.selectedRoomType,
      contractId: this.editingRate?.rates[0]?.contractId || this.activeContracts[0].id,
      baseRate: this.getRateForCategory('adult'),
      currency: this.selectedCurrency,
      mealPlanId: this.selectedMealPlans[0],
      supplements: {
        extraAdult: this.getRateForCategory('adult'),
        extraChild: this.getRateForCategory('child'),
        singleOccupancy: this.getRateForCategory('adult') * 0.75
      },
      extraAdult: this.getRateForCategory('adult'),
      extraChild: this.getRateForCategory('child'),
      singleOccupancy: this.getRateForCategory('adult') * 0.75,
      ageCategoryRates: { ...this.ratesByCategory },
      specialOffers: this.specialOffers || []
    };

    // Then create the RateConfiguration object
    const rateConfig: RateConfiguration = {
      roomType: this.rooms.find(r => r.id === this.selectedRoomType) || this.rooms[0],
      season: this.seasons.find(s => s.id === this.selectedSeason) || this.seasons[0],
      rates: [rate]
    };

    if (this.editingRate) {
      const index = this.currentRates.findIndex(r => r.rates[0]?.id === rate.id);
      if (index !== -1) {
        this.currentRates[index] = rateConfig;
      }
    } else {
      this.currentRates.push(rateConfig);
    }

    this.showRateEditor = false;
    this.resetRateForm();
    this.applyFilters();
  }

  closeRateEditor() {
    this.showRateEditor = false;
    this.editingRate = null;
    this.resetForm();
  }

  resetForm() {
    this.ratesByCategory = {};
    this.selectedMealPlans = [];
    this.mealPlanRates = {} as Record<MealPlanType, Record<string, number>>;
    this.specialOffers = [];
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
    this.specialOffers = [];
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

  cancelCategoryEdit(): void {
    this.showCategoryForm = false;
    this.editingCategory = null;
    this.newCategory = this.getEmptyCategoryTemplate();
  }

  saveCategory(): void {
    if (!this.hotel || !this.hotel.ageCategories) {
      this.handleError(new Error('Hotel or age categories not found'), 'Failed to save category');
      return;
    }

    if (!this.newCategory.label || this.newCategory.minAge < 0 || this.newCategory.maxAge < this.newCategory.minAge) {
      this.handleError(new Error('Invalid category data'), 'Failed to save category');
      return;
    }

    if (this.editingCategory) {
      const index = this.hotel.ageCategories.findIndex(c => c.type === this.editingCategory?.type);
      if (index !== -1) {
        this.hotel.ageCategories[index] = { 
          ...this.newCategory,
          id: this.editingCategory.id 
        };
      }
    } else {
      this.hotel.ageCategories.push({ 
        ...this.newCategory,
        id: Math.max(0, ...this.hotel.ageCategories.map(c => c.id)) + 1
      });
    }
    
    this.cancelCategoryEdit();
  }

  getEmptyCategoryTemplate(): AgeCategory {
    return {
      id: 0,
      type: 'adult',
      label: '',
      minAge: 0,
      maxAge: 0,
      defaultRate: 0  // Added missing required property
    };
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
    this.newCategory = {
      id: 0,
      type: 'adult',
      label: '',
      minAge: 0,
      maxAge: 0,
      defaultRate: 0  // Added missing required property
    };
  }

  deleteCategory(category: AgeCategory) {
    if (this.hotel?.ageCategories) {
      const index = this.hotel.ageCategories.findIndex(c => c.id === category.id);
      if (index !== -1) {
        this.hotel.ageCategories.splice(index, 1);
      }
    }
  }

  getRoomName(roomTypeId: number): string {
    const room = this.rooms.find(r => r.id === roomTypeId);
    return room ? room.type : 'Unknown Room';
  }

  getSeasonName(seasonId: number): string {
    const season = this.seasons.find(s => s.id === seasonId);
    return season ? season.name : 'Unknown Season';
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

  getRatesGroupedByCurrency(): Array<{currency: string, rates: RateConfiguration[]}> {
    const groupedRates = this.filteredRates.reduce((acc, rate) => {
      const currency = rate.rates[0]?.currency || 'Unknown';
      if (!acc[currency]) {
        acc[currency] = [];
      }
      acc[currency].push(rate);
      return acc;
    }, {} as Record<string, RateConfiguration[]>);

    return Object.entries(groupedRates).map(([currency, rates]) => ({
      currency,
      rates
    }));
  }
}