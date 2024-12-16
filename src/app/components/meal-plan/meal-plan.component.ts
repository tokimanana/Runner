// src/app/components/meal-plan/meal-plan.component.ts
import {
  Component,
  Input,
  computed,
  signal,
  effect,
  inject,
  NgZone,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import {
  Hotel,
  MealPlan,
  MealPlanType,
  MealTime,
  MealPlanInclusion,
  MEAL_PLAN_NAMES,
} from "../../models/types";
import { ModalComponent } from "../modal/modal.component";
import { MealPlanService } from "../../services/meal-plan.service";
import { toSignal } from "@angular/core/rxjs-interop";

@Component({
  selector: "app-meal-plan",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    ModalComponent,
  ],
  templateUrl: "./meal-plan.component.html",
  styleUrls: ["./meal-plan.component.scss"],
})
export class MealPlanComponent {
  @Input() set hotel(value: Hotel) {
    this.hotelId.set(value?.id || 0);
  }

  // Signals
  private hotelId = signal<number>(0);
  private mealPlans = signal<MealPlan[]>([]);
  showModal = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  selectedMealPlan = signal<MealPlan | null>(null);
  newRestriction = signal<string>("");
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  newRestrictionText: string = "";
  restrictions: string[] = [];

  // Form data signal
  mealPlanForm = signal<MealPlan>(this.getEmptyMealPlan());

  // Computed values
  readonly filteredMealPlans = computed(() => {
    return this.mealPlans().filter((plan) => plan.isActive);
  });

  readonly displayMealPlans = computed(() => this.mealPlans());

  // Constants
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
    MealPlanType.UAI,
  ];

  readonly availableMeals = ["Breakfast", "Lunch", "Dinner", "Snacks"] as const;
  readonly availableInclusions = [
    "Welcome Drink",
    "Mini Bar",
    "Room Service",
    "Pool Access",
    "Spa Access",
    "Gym Access",
  ];

  constructor(
    private mealPlanService: MealPlanService,
    private ngZone: NgZone
  ) {
    // Effect to load meal plans when hotelId changes
    effect(() => {
      const currentHotelId = this.hotelId();
      if (currentHotelId) {
        this.mealPlanService.getMealPlansByHotel(currentHotelId).subscribe({
          next: (plans) => {
            this.ngZone.run(() => {
              this.loading.set(false);
              this.error.set(null);
              this.mealPlans.set(plans || []);
            });
          },
          error: (err) => {
            this.ngZone.run(() => {
              this.loading.set(false);
              this.error.set("Failed to load meal plans");
            });
            console.error("Error loading meal plans:", err);
          },
        });
      }
    });
  }

  ngOnInit() {
    console.log("Meal Plan component initialized");
  }

  private async loadMealPlans(hotelId: number): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);

      const plans = await this.mealPlanService
        .getMealPlansByHotel(hotelId)
        .toPromise();

      this.ngZone.run(() => {
        this.mealPlans.set(plans || []);
      });
    } catch (err) {
      this.error.set("Failed to load meal plans");
      console.error("Error loading meal plans:", err);
    } finally {
      this.loading.set(false);
    }
  }

  openModal(plan?: MealPlan): void {
    this.isEditing.set(!!plan);
    this.selectedMealPlan.set(plan || null);
    this.mealPlanForm.set(plan ? { ...plan } : this.getEmptyMealPlan());
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedMealPlan.set(null);
    this.isEditing.set(false);
    this.mealPlanForm.set(this.getEmptyMealPlan());
    this.newRestriction.set("");
  }

  async saveMealPlan(): Promise<void> {
    if (!this.validateForm()) return;

    const hotelId = this.hotelId();
    if (!hotelId) return;

    try {
      this.loading.set(true);
      const formData = this.mealPlanForm();

      if (this.isEditing() && formData.id) {
        await this.mealPlanService.updateMealPlan(formData.id, formData);
      } else {
        await this.mealPlanService.createMealPlan(formData);
      }

      await this.loadMealPlans(hotelId);
      this.closeModal();
    } catch (err) {
      this.error.set("Failed to save meal plan");
      console.error("Error saving meal plan:", err);
    } finally {
      this.loading.set(false);
    }
  }

  getPlanTypeLabel(type: MealPlanType): string {
    return MEAL_PLAN_NAMES[type] || type;
  }

  isMealIncluded(mealName: string): boolean {
    return this.mealPlanForm().mealTimes.some(
      (mealTime) => mealTime.name === mealName
    );
  }

  isInclusionSelected(inclusionName: string): boolean {
    return this.mealPlanForm().inclusions.some(
      (inclusion) => inclusion.name === inclusionName
    );
  }

  async deleteMealPlan(plan: MealPlan): Promise<void> {
    if (!plan.id || !confirm("Are you sure you want to delete this meal plan?"))
      return;

    try {
      this.loading.set(true);
      await this.mealPlanService.deleteMealPlan(plan.id);
      await this.loadMealPlans(this.hotelId());
    } catch (err) {
      this.error.set("Failed to delete meal plan");
      console.error("Error deleting meal plan:", err);
    } finally {
      this.loading.set(false);
    }
  }

  // Helper methods
  private getEmptyMealPlan(): MealPlan {
    return {
      id: "",
      type: MealPlanType.BB,
      name: "",
      description: "",
      mealTimes: [],
      inclusions: [],
      restrictions: [],
      isActive: true,
    };
  }

  private validateForm(): boolean {
    const form = this.mealPlanForm();
    if (!form.name.trim()) {
      this.error.set("Please enter a meal plan name");
      return false;
    }
    if (!form.type) {
      this.error.set("Please select a meal plan type");
      return false;
    }
    return true;
  }

  // Form manipulation methods
  updateFormField(field: keyof MealPlan, value: any): void {
    this.mealPlanForm.update((form) => ({
      ...form,
      [field]: value,
    }));
  }

  toggleMeal(meal: string): void {
    this.mealPlanForm.update((form) => {
      const mealTimes = [...form.mealTimes];
      const index = mealTimes.findIndex((mt) => mt.name === meal);

      if (index === -1) {
        mealTimes.push({ name: meal, startTime: "", endTime: "" });
      } else {
        mealTimes.splice(index, 1);
      }

      return { ...form, mealTimes };
    });
  }

  addRestriction() {
    if (this.newRestrictionText.trim()) {
      this.handleNewRestriction(this.newRestrictionText.trim());
      this.newRestrictionText = "";
    }
  }

  private handleNewRestriction(restriction: string) {
    this.restrictions.push(restriction);
    // Any additional handling
  }

  removeRestriction(index: number): void {
    this.mealPlanForm.update((form) => ({
      ...form,
      restrictions: form.restrictions.filter((_, i) => i !== index),
    }));
  }

  toggleInclusion(inclusion: string): void {
    this.mealPlanForm.update((form) => {
      const inclusions = [...form.inclusions];
      const index = inclusions.findIndex((inc) => inc.name === inclusion);

      if (index === -1) {
        inclusions.push({
          name: inclusion,
          description: "",
          isIncluded: true,
        });
      } else {
        inclusions.splice(index, 1);
      }

      return { ...form, inclusions };
    });
  }

  isFormValid(): boolean {
    const form = this.mealPlanForm();
    return (
      form.name.trim() !== "" && // Check if name is not empty
      form.type !== null && // Check if type is selected
      form.mealTimes.length > 0 // Ensure at least one meal time is selected
    );
  }
}
