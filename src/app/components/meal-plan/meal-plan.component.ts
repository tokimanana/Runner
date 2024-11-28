import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HotelService } from '../../services/hotel.service';
import { Hotel, MealPlan, MealPlanType } from '../../models/types';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-meal-plan',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    ModalComponent
  ],
  templateUrl: './meal-plan.component.html',
  styleUrls: ['./meal-plan.component.scss']
})
export class MealPlanComponent implements OnInit, OnChanges {
  @Input() hotel!: Hotel;
  
  mealPlans: MealPlan[] = [];
  showModal = false;
  isEditing = false;
  selectedMealPlan: MealPlan | null = null;
  newRestriction = '';
  
  readonly mealPlanTypes: MealPlanType[] = ['BB', 'BB+', 'HB', 'HB+', 'FB', 'FB+', 'AI', 'AI+'];
  readonly availableMeals = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'] as const;
  readonly availableInclusions = [
    'Welcome Drink',
    'Mini Bar',
    'Room Service',
    'Pool Access',
    'Spa Access',
    'Gym Access'
  ];
  
  mealPlanForm: MealPlan = this.getEmptyMealPlan();

  readonly planTypeLabels: Record<MealPlanType, string> = {
    'RO': 'Room Only',
    'BB': 'Bed & Breakfast',
    'BB+': 'Bed & Breakfast Plus',
    'HB': 'Half Board',
    'HB+': 'Half Board Plus',
    'FB': 'Full Board',
    'FB+': 'Full Board Plus',
    'AI': 'All Inclusive',
    'AI+': 'All Inclusive Plus',
    'UAI': 'Ultra All Inclusive'
  };

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    if (this.hotel) {
      this.loadMealPlans();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hotel']) {
      this.loadMealPlans();
    }
  }

  private getEmptyMealPlan(): MealPlan {
    return {
      id: '',
      type: 'BB',
      name: '',
      description: '',
      includedMeals: [],
      defaultInclusions: [],
      restrictions: []
    };
  }

  private loadMealPlans(): void {
    if (this.hotel) {
      this.hotelService.getMealPlans(this.hotel.id.toString()).subscribe({
        next: (mealPlans) => {
          this.mealPlans = mealPlans.map(plan => ({
            id: plan.id.toString(),
            type: plan.code as MealPlanType,
            name: plan.name,
            description: plan.description,
            includedMeals: this.getIncludedMeals(plan.code),
            defaultInclusions: [],
            restrictions: []
          }));
        },
        error: (error) => {
          console.error('Error loading meal plans:', error);
          this.mealPlans = [];
        }
      });
    } else {
      this.mealPlans = [];
    }
  }

  private getIncludedMeals(code: string): string[] {
    switch(code) {
      case 'RO': return [];
      case 'BB': return ['Breakfast'];
      case 'HB': return ['Breakfast', 'Dinner'];
      case 'FB': return ['Breakfast', 'Lunch', 'Dinner'];
      case 'AI':
      case 'PAI': return ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
      default: return [];
    }
  }

  getPlanTypeLabel(type: MealPlanType): string {
    return this.planTypeLabels[type] || type;
  }

  editMealPlan(plan: MealPlan): void {
    this.isEditing = true;
    this.selectedMealPlan = plan;
    this.mealPlanForm = { ...plan };
    this.showModal = true;
  }

  saveMealPlan(): void {
    if (!this.validateForm()) {
      return;
    }

    const updatedPlans = this.isEditing
      ? this.mealPlans.map(p => p.id === this.selectedMealPlan?.id ? this.mealPlanForm : p)
      : [...this.mealPlans, { ...this.mealPlanForm, id: crypto.randomUUID() }];

    this.mealPlans = updatedPlans;
    this.hotel.mealPlans = updatedPlans;
    // TODO: Update through service when backend is ready
    this.closeModal();
  }

  deleteMealPlan(plan: MealPlan): void {
    if (confirm('Are you sure you want to delete this meal plan?')) {
      this.mealPlans = this.mealPlans.filter(p => p.id !== plan.id);
      this.hotel.mealPlans = this.mealPlans;
      // TODO: Update through service when backend is ready
    }
  }

  private validateForm(): boolean {
    if (!this.mealPlanForm.name.trim()) {
      alert('Please enter a meal plan name');
      return false;
    }
    if (!this.mealPlanForm.type) {
      alert('Please select a meal plan type');
      return false;
    }
    return true;
  }

  addRestriction(restriction: string): void {
    if (restriction.trim()) {
      this.mealPlanForm.restrictions.push(restriction.trim());
      this.newRestriction = '';
    }
  }

  removeRestriction(index: number): void {
    this.mealPlanForm.restrictions.splice(index, 1);
  }

  toggleMeal(meal: string): void {
    const index = this.mealPlanForm.includedMeals.indexOf(meal);
    if (index === -1) {
      this.mealPlanForm.includedMeals.push(meal);
    } else {
      this.mealPlanForm.includedMeals.splice(index, 1);
    }
  }

  toggleInclusion(inclusion: string): void {
    const index = this.mealPlanForm.defaultInclusions.indexOf(inclusion);
    if (index === -1) {
      this.mealPlanForm.defaultInclusions.push(inclusion);
    } else {
      this.mealPlanForm.defaultInclusions.splice(index, 1);
    }
  }

  openModal(mealPlan?: MealPlan): void {
    if (mealPlan) {
      this.editMealPlan(mealPlan);
    } else {
      this.isEditing = false;
      this.selectedMealPlan = null;
      this.mealPlanForm = this.getEmptyMealPlan();
      this.showModal = true;
    }
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.selectedMealPlan = null;
    this.mealPlanForm = this.getEmptyMealPlan();
    this.newRestriction = '';
  }
}