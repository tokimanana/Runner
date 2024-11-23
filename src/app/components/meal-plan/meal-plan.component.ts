import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HotelService } from '../../services/hotel.service';
import { Hotel, MealPlan, MealPlanType } from '../../models/types';

@Component({
  selector: 'app-meal-plan',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <div class="meal-plans-container">
      <div class="dashboard-header">
        <div class="title-section">
          <h2>Meal Plans</h2>
          <p class="subtitle">Configure and manage meal plans for your hotel</p>
        </div>
        <button class="add-button" (click)="addNewMealPlan()">
          <i class="material-icons">add</i>
          Add Meal Plan
        </button>
      </div>

      <div class="meal-plans-grid">
        <div *ngFor="let plan of mealPlans" class="meal-plan-card" [attr.data-plan-type]="plan.type">
          <div class="plan-header">
            <span class="plan-type" [attr.data-plan-type]="plan.type">{{ plan.type }}</span>
            <h3>{{ plan.name }}</h3>
          </div>
          <p class="description">{{ plan.description }}</p>
          
          <div class="included-meals">
            <h4>Included Meals</h4>
            <ul class="inclusions-list">
              <li *ngFor="let meal of plan.includedMeals" 
                  class="inclusion-item"
                  [class.included]="true">
                {{ meal }}
              </li>
            </ul>
          </div>

          <div class="default-inclusions" *ngIf="plan.defaultInclusions?.length">
            <h4>Default Inclusions</h4>
            <ul class="inclusions-list">
              <li *ngFor="let inclusion of plan.defaultInclusions" 
                  class="inclusion-item"
                  [class.included]="true">
                {{ inclusion }}
              </li>
            </ul>
          </div>

          <div class="restrictions" *ngIf="plan.restrictions?.length">
            <h4>Restrictions</h4>
            <div class="restrictions-list">
              <span *ngFor="let restriction of plan.restrictions" 
                    class="restriction-item">
                {{ restriction }}
              </span>
            </div>
          </div>

          <div class="action-buttons">
            <button class="icon-button edit" (click)="editMealPlan(plan)">
              <i class="material-icons">edit</i>
            </button>
            <button class="icon-button delete" (click)="deleteMealPlan(plan.id)">
              <i class="material-icons">delete</i>
            </button>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div class="modal-overlay" *ngIf="showModal">
        <div class="modal-container">
          <div class="modal-header">
            <h2>{{ selectedPlan ? 'Edit' : 'Add' }} Meal Plan</h2>
            <button class="close-button" (click)="closeModal()">×</button>
          </div>

          <div class="modal-content">
            <div class="form-section">
              <div class="type-section">
                <h3>Plan Type</h3>
                <select [(ngModel)]="mealPlanForm.type" class="form-control">
                  <option value="BB">Bed & Breakfast (BB)</option>
                  <option value="BB+">Bed & Breakfast Plus (BB+)</option>
                  <option value="HB">Half Board (HB)</option>
                  <option value="HB+">Half Board Plus (HB+)</option>
                  <option value="FB">Full Board (FB)</option>
                  <option value="FB+">Full Board Plus (FB+)</option>
                  <option value="AI">All Inclusive (AI)</option>
                  <option value="AI+">All Inclusive Plus (AI+)</option>
                </select>
              </div>

              <div class="name-section">
                <h3>Name & Description</h3>
                <input 
                  type="text" 
                  [(ngModel)]="mealPlanForm.name" 
                  placeholder="Plan Name"
                  class="form-control"
                >
                <textarea 
                  [(ngModel)]="mealPlanForm.description" 
                  placeholder="Plan Description"
                  class="form-control"
                  rows="3"
                ></textarea>
              </div>

              <div class="meals-section">
                <h3>Included Meals</h3>
                <div class="meal-toggles">
                  <label class="meal-toggle">
                    <input 
                      type="checkbox" 
                      [checked]="mealPlanForm.includedMeals.includes('Breakfast')"
                      (change)="toggleMeal('Breakfast')"
                    >
                    Breakfast
                  </label>
                  <label class="meal-toggle">
                    <input 
                      type="checkbox" 
                      [checked]="mealPlanForm.includedMeals.includes('Lunch')"
                      (change)="toggleMeal('Lunch')"
                    >
                    Lunch
                  </label>
                  <label class="meal-toggle">
                    <input 
                      type="checkbox" 
                      [checked]="mealPlanForm.includedMeals.includes('Dinner')"
                      (change)="toggleMeal('Dinner')"
                    >
                    Dinner
                  </label>
                </div>
              </div>

              <div class="inclusions-section">
                <h3>Default Inclusions</h3>
                <div class="inclusion-toggles">
                  <label class="inclusion-toggle" *ngFor="let inclusion of availableInclusions">
                    <input 
                      type="checkbox" 
                      [checked]="mealPlanForm.defaultInclusions.includes(inclusion)"
                      (change)="toggleInclusion(inclusion)"
                    >
                    {{ inclusion }}
                  </label>
                </div>
              </div>

              <div class="restrictions-section">
                <h3>Restrictions</h3>
                <div class="restrictions-input">
                  <input 
                    type="text" 
                    [(ngModel)]="newRestriction" 
                    placeholder="Add restriction..."
                    class="form-control"
                    (keyup.enter)="addRestriction(newRestriction)"
                  >
                  <button 
                    class="add-button" 
                    (click)="addRestriction(newRestriction)"
                  >
                    Add
                  </button>
                </div>
                <div class="restrictions-list">
                  <span 
                    *ngFor="let restriction of mealPlanForm.restrictions" 
                    class="restriction-item"
                  >
                    {{ restriction }}
                    <button 
                      class="remove-btn" 
                      (click)="removeRestriction(restriction)"
                    >×</button>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="cancel-button" (click)="closeModal()">Cancel</button>
            <button class="save-button" (click)="saveMealPlan()">Save</button>
          </div>
        </div>
      </div>

      <style>
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-container {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: 16px 24px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          color: #2c3e50;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #7f8c8d;
        }

        .modal-content {
          padding: 24px;
          overflow-y: auto;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-section h3 {
          margin: 0 0 12px;
          color: #2c3e50;
          font-size: 1.1rem;
        }

        .form-control {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .meal-toggles,
        .inclusion-toggles {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .meal-toggle,
        .inclusion-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .restrictions-input {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .restrictions-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .restriction-item {
          background: #f0f2f5;
          padding: 4px 8px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .remove-btn {
          background: none;
          border: none;
          color: #7f8c8d;
          cursor: pointer;
          padding: 0 4px;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #eee;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .cancel-button,
        .save-button {
          padding: 8px 16px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-weight: 500;
        }

        .cancel-button {
          background: #f0f2f5;
          color: #2c3e50;
        }

        .save-button {
          background: #3498db;
          color: white;
        }

        .save-button:hover {
          background: #2980b9;
        }
      </style>
    </div>
  `,
  styles: [`
    .meal-plans-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
      background-color: #f5f8fa;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .title-section h2 {
      font-size: 24px;
      margin: 0;
      color: #2c3e50;
    }

    .title-section .subtitle {
      color: #7f8c8d;
      margin: 4px 0 0;
    }

    .add-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .add-button:hover {
      background: #2980b9;
    }

    .meal-plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }

    .meal-plan-card {
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 20px;
      position: relative;
      border: 1px solid #e1e8ed;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .meal-plan-card[data-plan-type="BB"] {
      background: linear-gradient(to bottom right, #ffffff, #f0f9ff);
      border-left: 4px solid #3498db;
    }

    .meal-plan-card[data-plan-type="BB+"] {
      background: linear-gradient(to bottom right, #ffffff, #e3f2fd);
      border-left: 4px solid #2196f3;
    }

    .meal-plan-card[data-plan-type="HB"] {
      background: linear-gradient(to bottom right, #ffffff, #f0fff4);
      border-left: 4px solid #2ecc71;
    }

    .meal-plan-card[data-plan-type="HB+"] {
      background: linear-gradient(to bottom right, #ffffff, #e8f5e9);
      border-left: 4px solid #4caf50;
    }

    .meal-plan-card[data-plan-type="FB"] {
      background: linear-gradient(to bottom right, #ffffff, #fff5f0);
      border-left: 4px solid #e67e22;
    }

    .meal-plan-card[data-plan-type="FB+"] {
      background: linear-gradient(to bottom right, #ffffff, #fff3e0);
      border-left: 4px solid #ff9800;
    }

    .meal-plan-card[data-plan-type="AI"] {
      background: linear-gradient(to bottom right, #ffffff, #fdf0ff);
      border-left: 4px solid #9b59b6;
    }

    .meal-plan-card[data-plan-type="AI+"] {
      background: linear-gradient(to bottom right, #ffffff, #f3e5f5);
      border-left: 4px solid #9c27b0;
    }

    .plan-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      padding-right: 90px; 
      position: relative; 
    }

    .plan-header h3 {
      margin: 0;
      color: #2c3e50;
      font-size: 18px;
      flex: 1; 
      white-space: nowrap; 
      overflow: hidden; 
      text-overflow: ellipsis; 
    }

    .action-buttons {
      position: absolute;
      top: 0;
      right: 0;
      display: flex;
      gap: 8px;
      z-index: 1;
    }

    .plan-type {
      background: #e1e8ed;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      color: #2c3e50;
      margin-right: 12px; 
      flex-shrink: 0; 
      position: relative;
    }

    .plan-type[data-plan-type$="+"]::after {
      content: "+";
      position: relative;
      top: -4px;
      margin-left: 1px;
      font-size: 10px;
      font-weight: bold;
      color: #e74c3c;
    }

    .description {
      color: #7f8c8d;
      margin-bottom: 16px;
      font-size: 14px;
      line-height: 1.5;
    }

    .inclusions-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .inclusion-item {
      padding: 8px 0;
      display: flex;
      align-items: center;
      color: #34495e;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .inclusion-item::before {
      content: "";
      width: 18px;
      height: 18px;
      margin-right: 12px;
      border-radius: 50%;
      border: 2px solid #e1e8ed;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .inclusion-item.included {
      color: #2c3e50;
    }

    .inclusion-item.included::before {
      content: "✓";
      border-color: #27ae60;
      background-color: #27ae60;
      color: white;
      font-size: 12px;
      font-weight: bold;
    }

    .inclusion-item:hover {
      background-color: rgba(0, 0, 0, 0.02);
      border-radius: 4px;
      padding-left: 8px;
      padding-right: 8px;
    }

    h4 {
      color: #2c3e50;
      margin: 16px 0 8px;
      font-size: 14px;
      font-weight: 600;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    li {
      font-size: 14px;
      color: #34495e;
      padding: 4px 0;
      display: flex;
      align-items: center;
    }

    .icon-button {
      background: #ffffff;
      border: 1px solid #e1e8ed;
      padding: 8px;
      border-radius: 4px;
      cursor: pointer;
      color: #7f8c8d;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-button:hover {
      background: #f8f9fa;
      color: #2c3e50;
    }

    .icon-button.edit:hover {
      color: #3498db;
      border-color: #3498db;
    }

    .icon-button.delete:hover {
      color: #e74c3c;
      border-color: #e74c3c;
    }
  `]
})
export class MealPlanComponent implements OnInit {
  @Input() hotel!: Hotel;
  
  mealPlans: MealPlan[] = [];
  selectedPlan: MealPlan | null = null;
  showModal = false;
  
  readonly mealPlanTypes: MealPlanType[] = ['BB', 'BB+', 'HB', 'HB+', 'FB', 'FB+', 'AI', 'AI+'];
  
  mealPlanForm: MealPlan = {
    id: '',
    type: 'BB' as MealPlanType,
    name: '',
    description: '',
    includedMeals: [],
    defaultInclusions: [],
    restrictions: []
  };

  readonly planTypeLabels: Record<MealPlanType, string> = {
    'BB': 'Bed & Breakfast',
    'BB+': 'Bed & Breakfast Plus',
    'HB': 'Half Board',
    'HB+': 'Half Board Plus',
    'FB': 'Full Board',
    'FB+': 'Full Board Plus',
    'AI': 'All Inclusive',
    'AI+': 'All Inclusive Plus'
  };

  readonly availableMeals = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const;
  readonly availableInclusions = [
    'Welcome Drink',
    'Afternoon Tea',
    'Mini Bar',
    'Soft Drinks',
    'House Wine',
    'Local Spirits',
    'Premium Drinks'
  ] as const;

  newRestriction = '';

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    if (this.hotel?.id) {
      this.loadMealPlans();
    }
  }

  private getEmptyMealPlan(): MealPlan {
    return {
      id: '',
      type: 'BB' as MealPlanType,
      name: '',
      description: '',
      includedMeals: [],
      defaultInclusions: [],
      restrictions: []
    };
  }

  loadMealPlans(): void {
    this.mealPlans = this.hotel.mealPlans || [];
  }

  getPlanTypeLabel(type: MealPlanType): string {
    return this.planTypeLabels[type];
  }

  addNewMealPlan(): void {
    this.selectedPlan = null;
    this.mealPlanForm = this.getEmptyMealPlan();
    this.showModal = true;
  }

  editMealPlan(plan: MealPlan): void {
    this.selectedPlan = plan;
    this.mealPlanForm = { ...plan };
    this.showModal = true;
  }

  saveMealPlan(): void {
    if (!this.validateForm()) {
      return;
    }

    const updatedPlans = this.selectedPlan
      ? this.mealPlans.map(p => p.id === this.selectedPlan?.id ? this.mealPlanForm : p)
      : [...this.mealPlans, { ...this.mealPlanForm, id: crypto.randomUUID() }];

    this.hotel.mealPlans = updatedPlans;
    this.mealPlans = updatedPlans;
    this.closeModal();
  }

  private validateForm(): boolean {
    const errors: string[] = [];

    if (!this.mealPlanForm.name.trim()) {
      errors.push('Please enter a plan name');
    }
    if (!this.mealPlanForm.description.trim()) {
      errors.push('Please enter a plan description');
    }
    if (this.mealPlanForm.includedMeals.length === 0) {
      errors.push('Please select at least one meal');
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return false;
    }

    return true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedPlan = null;
    this.mealPlanForm = this.getEmptyMealPlan();
    this.newRestriction = '';
  }

  addRestriction(restriction: string): void {
    const trimmed = restriction.trim();
    if (!trimmed) return;
    
    if (!this.mealPlanForm.restrictions.includes(trimmed)) {
      this.mealPlanForm.restrictions = [...this.mealPlanForm.restrictions, trimmed];
    }
    this.newRestriction = '';
  }

  removeRestriction(restriction: string): void {
    this.mealPlanForm.restrictions = this.mealPlanForm.restrictions.filter(
      r => r !== restriction
    );
  }

  deleteMealPlan(planId: string): void {
    if (!confirm('Are you sure you want to delete this meal plan?')) {
      return;
    }
    
    this.mealPlans = this.mealPlans.filter(p => p.id !== planId);
    this.hotel.mealPlans = this.mealPlans;
  }

  toggleMeal(meal: string): void {
    const index = this.mealPlanForm.includedMeals.indexOf(meal);
    if (index === -1) {
      this.mealPlanForm.includedMeals = [...this.mealPlanForm.includedMeals, meal];
    } else {
      this.mealPlanForm.includedMeals = this.mealPlanForm.includedMeals.filter(m => m !== meal);
    }
  }

  toggleInclusion(inclusion: string): void {
    const index = this.mealPlanForm.defaultInclusions.indexOf(inclusion);
    if (index === -1) {
      this.mealPlanForm.defaultInclusions = [...this.mealPlanForm.defaultInclusions, inclusion];
    } else {
      this.mealPlanForm.defaultInclusions = this.mealPlanForm.defaultInclusions.filter(i => i !== inclusion);
    }
  }
}