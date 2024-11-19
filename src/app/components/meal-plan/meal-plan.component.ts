import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../services/hotel.service';
import { Hotel, MealPlan, MealPlanRate, MEAL_PLAN_TYPES, AGE_CATEGORIES } from '../../models/types';

@Component({
  selector: 'app-meal-plan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="meal-plans-container">
    <div class="dashboard-header">
      <div class="title-section">
        <h2>Meal Plans</h2>
        <p class="subtitle">Manage your hotel's dining packages and rates</p>
      </div>
      <button (click)="addNewMealPlan()" class="primary-button">
        <i class="material-icons">add_circle</i>
        New Meal Plan
      </button>
    </div>

    <div class="meal-plans-grid">
      <div *ngFor="let plan of mealPlans" class="meal-plan-card">
        <div class="card-header">
          <div class="title-group">
            <h3>{{ getPlanTypeLabel(plan.type) }}</h3>
            <span class="card-badge">{{ plan.type }}</span>
          </div>
          <div class="action-buttons">
            <button (click)="editMealPlan(plan)" class="icon-button edit">
              <i class="material-icons">edit</i>
            </button>
            <button (click)="deleteMealPlan(plan)" class="icon-button delete">
              <i class="material-icons">delete</i>
            </button>
          </div>
        </div>

        <div class="plan-details">
          <div class="plan-features">
            <i class="material-icons">restaurant</i>
            <p>{{ plan.description }}</p>
          </div>

          <div class="rates-section">
            <div class="rates-header">
              <i class="material-icons">payments</i>
              <h4>Daily Rates</h4>
            </div>
            
            <div class="rates-table">
              <div *ngFor="let rate of plan.rates" class="rate-row">
                <div class="rate-info">
                  <span class="rate-category">{{ rate.type | titlecase }}</span>
                  <span class="age-range">{{ rate.ageRange }}</span>
                </div>
                <div class="rate-price">
                  <span class="currency">€</span>
                  <span class="amount">{{ rate.rate }}</span>
                </div>
              </div>
            </div>

          </div>

          <div *ngIf="plan.inclusions?.length" class="inclusions-section">
            <div class="inclusions-header">
              <i class="material-icons">check_circle</i>
              <h4>What's Included</h4>
            </div>
            <div class="inclusion-tags">
              <span *ngFor="let inclusion of plan.inclusions" class="inclusion-tag">
                <i class="material-icons">done</i>
                {{ inclusion }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Meal Plan Form Modal -->
<div *ngIf="showMealPlanForm" class="modal-overlay">
  <div class="modal-container">
    <div class="modal-header">
      <h2>{{ editingPlan ? 'Edit Meal Plan' : 'Create New Meal Plan' }}</h2>
      <button class="close-button" (click)="cancelEdit()">
        <i class="material-icons">close</i>
      </button>
    </div>

    <div class="modal-content">
      <div class="form-section">
        <div class="plan-type-selector">
          <h3>Select Plan Type</h3>
          <div class="type-options">
            <div *ngFor="let type of mealPlanTypes" 
                 [class.selected]="mealPlanForm.type === type"
                 (click)="selectPlanType(type)" 
                 class="type-option">
              <span class="type-code">{{type}}</span>
              <span class="type-name">{{getPlanTypeLabel(type)}}</span>
            </div>
          </div>
        </div>

        <div class="description-section">
          <h3>Description</h3>
          <textarea 
            [(ngModel)]="mealPlanForm.description" 
            rows="3" 
            placeholder="Describe what's included in this meal plan..."
          ></textarea>
        </div>

        <div class="rates-section">
          <h3>Age Categories & Rates</h3>
          <div class="age-rates-grid">
            <div *ngFor="let category of customAgeCategories; let i = index" class="age-rate-card">
              <div class="age-range-inputs">
                <input 
                  [(ngModel)]="category.label" 
                  placeholder="Category Name"
                  class="category-input"
                >
                <div class="age-inputs">
                  <input 
                    type="number" 
                    [(ngModel)]="category.minAge" 
                    placeholder="Min Age"
                    class="age-input"
                  >
                  <span>to</span>
                  <input 
                    type="number" 
                    [(ngModel)]="category.maxAge" 
                    placeholder="Max Age"
                    class="age-input"
                  >
                </div>
              </div>
              <div class="rate-input">
                <span class="currency">€</span>
                <input 
                  type="number" 
                  [(ngModel)]="rateInputs[category.type]"
                  [min]="0"
                  [step]="0.5"
                  placeholder="Rate"
                >
              </div>
              <button class="remove-category" (click)="removeAgeCategory(i)" *ngIf="customAgeCategories.length > 1">
                <i class="material-icons">remove_circle</i>
              </button>
            </div>
          </div>
          <button class="add-category" (click)="addAgeCategory()">
            <i class="material-icons">add_circle</i>
            Add Age Category
          </button>
        </div>

        <div class="inclusions-section">
          <h3>Inclusions</h3>
          <div class="inclusions-grid">
            <div *ngFor="let inclusion of availableInclusions" 
                 [class.selected]="isInclusionSelected(inclusion)"
                 (click)="toggleInclusion(inclusion)" 
                 class="inclusion-item">
              <i class="material-icons">{{ isInclusionSelected(inclusion) ? 'check_circle' : 'radio_button_unchecked' }}</i>
              <span>{{inclusion}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button class="secondary-button" (click)="cancelEdit()">Cancel</button>
      <button class="primary-button" (click)="saveMealPlan()">
        <i class="material-icons">save</i>
        Save Plan
      </button>
    </div>
  </div>
</div>

  `,
  styles: [`
    .meal-plans-container {
      padding: 24px;
      background: #f8f9fa;
      min-height: 100vh;
    }
  
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
  
    .title-section h2 {
      font-size: 28px;
      color: #2c3e50;
      margin: 0;
    }
  
    .subtitle {
      color: #6c757d;
      margin-top: 4px;
    }
  
    .primary-button {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #0d6efd;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
  
    .primary-button:hover {
      background: #0b5ed7;
      transform: translateY(-1px);
    }
  
    .meal-plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }
  
    .meal-plan-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      transition: transform 0.2s ease;
    }
  
    .meal-plan-card:hover {
      transform: translateY(-4px);
    }
  
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }
  
    .title-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  
    .card-header h3 {
      color: #2c3e50;
      margin: 0;
      font-size: 20px;
    }
  
    .card-badge {
      background: #e3f2fd;
      color: #0d6efd;
      padding: 4px 12px;
      border-radius: 16px;
      font-weight: 600;
      font-size: 14px;
    }
  
    .action-buttons {
      display: flex;
      gap: 8px;
    }
  
    .icon-button {
      background: none;
      border: none;
      padding: 8px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
  
    .icon-button.edit:hover {
      background: #e3f2fd;
      color: #0d6efd;
    }
  
    .icon-button.delete:hover {
      background: #fee2e2;
      color: #dc3545;
    }
  
    .plan-details {
      margin-top: 20px;
    }
  
    .plan-features {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 20px;
    }
  
    .plan-features i {
      color: #0d6efd;
      font-size: 24px;
    }
  
    .plan-features p {
      margin: 0;
      color: #495057;
      line-height: 1.5;
    }
  
    .rates-section {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 20px;
    }
  
    .rates-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
    }
  
    .rates-header i {
      color: #198754;
    }
  
    .rates-header h4 {
      margin: 0;
      color: #2c3e50;
      font-size: 16px;
    }
  
    .rates-table {
      padding: 8px;
    }
  
    .rate-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border-bottom: 1px solid #e9ecef;
    }
  
    .rate-row:last-child {
      border-bottom: none;
    }
  
    .rate-info {
      display: flex;
      flex-direction: column;
    }
  
    .rate-category {
      color: #2c3e50;
      font-weight: 500;
    }
  
    .age-range {
      color: #6c757d;
      font-size: 14px;
      margin-top: 2px;
    }
  
    .rate-price {
      display: flex;
      align-items: baseline;
      gap: 2px;
    }
  
    .currency {
      color: #198754;
      font-size: 14px;
    }
  
    .amount {
      color: #198754;
      font-size: 18px;
      font-weight: 600;
    }
  
    .inclusions-section {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 16px;
    }
  
    .inclusions-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
  
    .inclusions-header i {
      color: #0d6efd;
    }
  
    .inclusions-header h4 {
      margin: 0;
      color: #2c3e50;
      font-size: 16px;
    }
  
    .inclusion-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  
    .inclusion-tag {
      display: flex;
      align-items: center;
      gap: 4px;
      background: white;
      color: #495057;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 14px;
    }
  
    .inclusion-tag i {
      color: #198754;
      font-size: 16px;
    }

    /* Modal Overlay */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-container {
      background: white;
      border-radius: 16px;
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      padding: 24px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-content {
      padding: 24px;
      overflow-y: auto;
    }

    .modal-footer {
      padding: 24px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    /* Form Sections */
    .form-section > div {
      margin-bottom: 32px;
    }

    .type-options {
      display: flex;
      gap: 12px;
      margin: 16px 0;
    }

    .type-option {
      flex: 1;
      padding: 16px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s ease;
    }

    .type-option.selected {
      border-color: #0d6efd;
      background: #e3f2fd;
    }

    .type-code {
      display: block;
      font-size: 18px;
      font-weight: 600;
      color: #0d6efd;
      margin-bottom: 4px;
    }

    .type-name {
      display: block;
      font-size: 14px;
      color: #6c757d;
    }

    /* Age Categories Section */
    .age-rates-grid {
      display: grid;
      gap: 16px;
      margin-bottom: 16px;
    }

    .age-rate-card {
      display: flex;
      gap: 16px;
      align-items: center;
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
    }

    .age-range-inputs {
      flex: 1;
    }

    .category-input {
      width: 100%;
      padding: 8px;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      margin-bottom: 8px;
    }

    .age-inputs {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .age-input {
      width: 80px;
      padding: 8px;
      border: 1px solid #dee2e6;
      border-radius: 6px;
    }

    .rate-input {
      position: relative;
      width: 120px;
    }

    .rate-input input {
      width: 100%;
      padding: 8px 8px 8px 24px;
      border: 1px solid #dee2e6;
      border-radius: 6px;
    }

    /* Inclusion Section */
    .inclusions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }

    .inclusion-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .inclusion-item:hover {
      background: #f8f9fa;
    }

    .inclusion-item.selected {
      background: #e3f2fd;
      color: #0d6efd;
    }

    /* Buttons */
    .close-button {
      background: none;
      border: none;
      color: #6c757d;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .close-button:hover {
      background: #f8f9fa;
    }

    .add-category {
      display: flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: 2px dashed #0d6efd;
      color: #0d6efd;
      padding: 12px;
      border-radius: 8px;
      cursor: pointer;
      width: 100%;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .add-category:hover {
      background: #e3f2fd;
    }

    .remove-category {
      background: none;
      border: none;
      color: #dc3545;
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .remove-category:hover {
      background: #fee2e2;
    }
    
    .secondary-button {
      background: #e9ecef;
      color: #495057;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .secondary-button:hover {
      background: #dee2e6;
      transform: translateY(-1px);
    }
  `]
})

export class MealPlanComponent implements OnInit {
  @Input() hotel!: Hotel;
  mealPlans: MealPlan[] = [];
  showMealPlanForm = false;
  editingPlan: MealPlan | null = null;
  mealPlanTypes = MEAL_PLAN_TYPES;
  ageCategories = AGE_CATEGORIES;
  selectedInclusions: string[] = [];
  
  customAgeCategories = [
    { type: 'adult', label: 'Adult', minAge: 12, maxAge: 99 },
    { type: 'child', label: 'Child', minAge: 2, maxAge: 11 },
    { type: 'infant', label: 'Infant', minAge: 0, maxAge: 1 }
  ];

  addAgeCategory() {
    this.customAgeCategories.push({
      type: `category_${this.customAgeCategories.length}`,
      label: 'New Category',
      minAge: 0,
      maxAge: 0
    });
  }

  removeAgeCategory(index: number) {
    this.customAgeCategories.splice(index, 1);
  }

  rateInputs: { [key: string]: number } = {
    adult: 0,
    child: 0,
    infant: 0
  };

  selectPlanType(type: string) {
    this.mealPlanForm.type = type;
    this.mealPlanForm.name = this.planTypeLabels[type];
  }
  
  isInclusionSelected(inclusion: string): boolean {
    return this.selectedInclusions.includes(inclusion);
  }
  
  toggleInclusion(inclusion: string) {
    if (this.isInclusionSelected(inclusion)) {
      this.selectedInclusions = this.selectedInclusions.filter(i => i !== inclusion);
    } else {
      this.selectedInclusions.push(inclusion);
    }
  }

  private planTypeLabels: { [key: string]: string } = {
    'BB': 'Bed & Breakfast',
    'HB': 'Half Board',
    'FB': 'Full Board',
    'AI': 'All Inclusive'
  };

  availableInclusions = [
    'Breakfast Buffet',
    'Lunch Buffet',
    'Dinner Buffet',
    'Non-alcoholic Drinks',
    'Selected Alcoholic Drinks',
    'Room Service',
    'Pool Bar Access',
    'Theme Restaurant Access'
  ];

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    if (this.hotel) {
      this.mealPlans = this.hotelService.getMealPlans(this.hotel.id);
    }
  }

  getPlanTypeLabel(type: string): string {
    return this.planTypeLabels[type] || type;
  }

  getCategoryLabel(rate: MealPlanRate): string {
    const category = this.ageCategories.find(cat => cat.type === rate.type);
    return category ? `${category.label} (${category.ageRange})` : rate.type;
  }

  addNewMealPlan() {
    this.editingPlan = null;
    this.mealPlanForm = {
      type: 'BB',
      name: this.planTypeLabels['BB'],
      description: ''
    };
    this.resetRateInputs();
    this.showMealPlanForm = true;
  }
  

  editMealPlan(plan: MealPlan) {
    this.editingPlan = plan;
    this.mealPlanForm = {
      type: plan.type,
      name: plan.name,
      description: plan.description
    };
    this.selectedInclusions = plan.inclusions || [];
    this.resetRateInputs();
    plan.rates.forEach(rate => {
      this.rateInputs[rate.type] = rate.rate;
    });
    this.showMealPlanForm = true;
  }
  

  mealPlanForm: Omit<MealPlan, 'rates'> = {
    type: 'BB',
    name: this.planTypeLabels['BB'],
    description: ''
  };

  deleteMealPlan(plan: MealPlan) {
    if (confirm('Are you sure you want to delete this meal plan?')) {
      this.hotelService.deleteMealPlan(this.hotel.id, plan.type);
      this.mealPlans = this.hotelService.getMealPlans(this.hotel.id);
    }
  }

  saveMealPlan() {
    const rates: MealPlanRate[] = Object.entries(this.rateInputs).map(([type, rate]) => ({
      type: type as 'adult' | 'child' | 'infant',
      ageRange: this.ageCategories.find(cat => cat.type === type)?.ageRange,
      rate
    }));

    const mealPlan: MealPlan = {
      ...this.mealPlanForm,
      rates
    };

    if (this.editingPlan) {
      this.hotelService.updateMealPlan(this.hotel.id, mealPlan);
    } else {
      this.hotelService.addMealPlan(this.hotel.id, mealPlan);
    }
    
    this.mealPlans = this.hotelService.getMealPlans(this.hotel.id);
    this.showMealPlanForm = false;
    this.editingPlan = null;
  }

  cancelEdit() {
    this.showMealPlanForm = false;
    this.editingPlan = null;
  }

  private resetRateInputs() {
    this.rateInputs = {
      adult: 0,
      child: 0,
      infant: 0
    };
  }
}