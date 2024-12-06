import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Hotel, MealPlan, MealPlanType } from '../../models/types';
import { ModalComponent } from '../modal/modal.component';
import { MealPlanService } from '../../services/meal-plan.service';

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
  
  readonly mealPlanTypes: MealPlanType[] = [
    MealPlanType.RO,
    MealPlanType.BB,
    MealPlanType.BB_PLUS,
    MealPlanType.HB,
    MealPlanType.HB_PLUS,
    MealPlanType.FB,
    MealPlanType.FB_PLUS,
    MealPlanType.AI,
    MealPlanType.AI_PLUS,
    MealPlanType.UAI
  ];
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
    [MealPlanType.RO]: 'Room Only',
    [MealPlanType.BB]: 'Bed & Breakfast',
    [MealPlanType.BB_PLUS]: 'Bed & Breakfast Plus',
    [MealPlanType.HB]: 'Half Board',
    [MealPlanType.HB_PLUS]: 'Half Board Plus',
    [MealPlanType.FB]: 'Full Board',
    [MealPlanType.FB_PLUS]: 'Full Board Plus',
    [MealPlanType.AI]: 'All Inclusive',
    [MealPlanType.AI_PLUS]: 'All Inclusive Plus',
    [MealPlanType.UAI]: 'Ultra All Inclusive'
  };

  constructor(private mealPlanService: MealPlanService) {}

  ngOnInit(): void {
    this.loadMealPlans();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hotel'] && !changes['hotel'].firstChange) {
      this.loadMealPlans();
    }
  }

  private getEmptyMealPlan(): MealPlan {
    return {
      id: '',
      type: MealPlanType.BB,
      name: '',
      description: '',
      mealTimes: [],
      inclusions: [],
      restrictions: [],
      isActive: true
    };
  }

  private loadMealPlans(): void {
    if (this.hotel?.id) {
      this.mealPlanService.getMealPlansByHotel(this.hotel.id.toString())
        .subscribe(plans => {
          this.mealPlans = plans;
        });
    }
  }

  openModal(plan?: MealPlan): void {
    this.isEditing = !!plan;
    this.selectedMealPlan = plan || null;
    this.mealPlanForm = plan ? { ...plan } : this.getEmptyMealPlan();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedMealPlan = null;
    this.isEditing = false;
    this.mealPlanForm = this.getEmptyMealPlan();
    this.newRestriction = '';
  }

  saveMealPlan(): void {
    if (!this.validateForm()) {
      return;
    }

    if (this.hotel?.id) {
      if (this.isEditing && this.mealPlanForm.id) {
        this.mealPlanService.updateMealPlan(this.mealPlanForm.id, this.mealPlanForm)
          .subscribe(() => {
            this.loadMealPlans();
            this.closeModal();
          });
      } else {
        this.mealPlanService.createMealPlan(this.mealPlanForm)
          .subscribe(() => {
            this.loadMealPlans();
            this.closeModal();
          });
      }
    }
  }

  deleteMealPlan(plan: MealPlan): void {
    if (plan.id && confirm('Are you sure you want to delete this meal plan?')) {
      this.mealPlanService.deleteMealPlan(plan.id)
        .subscribe(() => {
          this.loadMealPlans();
        });
    }
  }

  getPlanTypeLabel(type: MealPlanType): string {
    return this.planTypeLabels[type] || type;
  }

  isMealIncluded(meal: string): boolean {
    return this.mealPlanForm.mealTimes.some(mt => mt.name === meal);
  }

  isInclusionSelected(inclusion: string): boolean {
    return this.mealPlanForm.inclusions.some(inc => inc.name === inclusion);
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

  toggleMeal(meal: string): void {
    const index = this.mealPlanForm.mealTimes.findIndex(mt => mt.name === meal);
    if (index === -1) {
      this.mealPlanForm.mealTimes.push({
        name: meal,
        startTime: '',
        endTime: '',
      });
    } else {
      this.mealPlanForm.mealTimes.splice(index, 1);
    }
  }

  toggleInclusion(inclusion: string): void {
    const index = this.mealPlanForm.inclusions.findIndex(inc => inc.name === inclusion);
    if (index === -1) {
      this.mealPlanForm.inclusions.push({
        name: inclusion,
        description: '',
        isIncluded: true
      });
    } else {
      this.mealPlanForm.inclusions.splice(index, 1);
    }
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

  addMeal(meal: string): void {
    if (meal.trim()) {
      this.mealPlanForm.mealTimes.push({
        name: meal,
        startTime: '',
        endTime: '',
      });
    }
  }

  removeMeal(index: number): void {
    this.mealPlanForm.mealTimes.splice(index, 1);
  }

  addInclusion(inclusion: string): void {
    if (inclusion.trim()) {
      this.mealPlanForm.inclusions.push({
        name: inclusion,
        description: '',
        isIncluded: true
      });
    }
  }

  removeInclusion(index: number): void {
    this.mealPlanForm.inclusions.splice(index, 1);
  }
}