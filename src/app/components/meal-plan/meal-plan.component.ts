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
    <!-- Previous header section remains the same -->

    <div class="meal-plan-list">
      <div *ngFor="let plan of mealPlans" class="meal-plan-card">
        <div class="meal-plan-header">
          <div class="title-section">
            <h4>{{ plan.type }} - {{ getPlanTypeLabel(plan.type) }}</h4>
            <div class="actions">
              <button (click)="editMealPlan(plan)" class="edit-btn">
                <i class="material-icons">edit</i>
              </button>
              <button (click)="deleteMealPlan(plan)" class="delete-btn">
                <i class="material-icons">delete</i>
              </button>
            </div>
          </div>
          <p class="description">{{ plan.description }}</p>
        </div>

        <div class="rates-section">
          <h5>Rates:</h5>
          <div class="rates-grid">
            <div class="rate-item" *ngFor="let rate of plan.rates">
              <span class="rate-label">{{ getCategoryLabel(rate) }}</span>
              <span class="rate-value">€{{ rate.rate }}</span>
            </div>
          </div>
        </div>

        <div class="inclusions-section" *ngIf="plan.inclusions?.length">
          <h5>Inclusions:</h5>
          <ul class="inclusions-list">
            <li *ngFor="let inclusion of plan.inclusions">{{ inclusion }}</li>
          </ul>
        </div>
      </div>
    

      <!-- Meal Plan Form Modal -->
      <div *ngIf="showMealPlanForm" class="modal">
        <div class="modal-content">
          <h3>{{ editingPlan ? 'Edit Meal Plan' : 'Add New Meal Plan' }}</h3>
          
          <div class="form-group">
            <label>Plan Type:</label>
            <select [(ngModel)]="mealPlanForm.type" class="form-input">
              <option *ngFor="let type of mealPlanTypes" [value]="type">
                {{ type }} - {{ getPlanTypeLabel(type) }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Description:</label>
            <textarea 
              [(ngModel)]="mealPlanForm.description" 
              rows="3" 
              class="form-input"
              placeholder="Describe the meal plan details..."
            ></textarea>
          </div>

          <div class="form-group">
            <label>Rates:</label>
            <div class="rates-form">
              <div *ngFor="let category of ageCategories" class="rate-input">
                <label>{{ category.label }} ({{ category.ageRange }}):</label>
                <input 
                  type="number" 
                  [(ngModel)]="rateInputs[category.type]"
                  class="form-input"
                  min="0"
                  step="0.01"
                >
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button (click)="saveMealPlan()" class="save-btn">Save</button>
            <button (click)="cancelEdit()" class="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .meal-plans-container {
      padding: 1rem;
    }

    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .meal-plan-card {
      background: gainsboro;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 1.5rem;
      margin-bottom: 1rem;
    }

    .meal-plan-header {
      margin-bottom: 1rem;
    }

    .title-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .description {
      color: #666;
      margin-bottom: 1rem;
    }

    .rates-section {
      margin: 1rem 0;
    }

    .rates-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .rate-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .rate-label {
      font-weight: 500;
    }

    .rate-value {
      color: #198754;
      font-weight: 600;
    }

    .inclusions-section {
      margin-top: 1rem;
    }

    .inclusions-list {
      list-style-type: none;
      padding-left: 0;
      margin-top: 0.5rem;
    }

    .inclusions-list li {
      padding: 0.25rem 0;
      color: #666;
    }

    .actions button {
      margin-left: 0.5rem;
    }

    .add-btn {
      background: #0d6efd;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.5rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .edit-btn, .delete-btn {
      padding: 0.25rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .edit-btn {
      background: #6c757d;
      color: white;
    }

    .delete-btn {
      background: #dc3545;
      color: white;
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
  
  

  rateInputs: { [key: string]: number } = {
    adult: 0,
    child: 0,
    infant: 0
  };

  private planTypeLabels: { [key: string]: string } = {
    'BB': 'Bed & Breakfast',
    'HB': 'Half Board',
    'FB': 'Full Board',
    'AI': 'All Inclusive'
  };

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