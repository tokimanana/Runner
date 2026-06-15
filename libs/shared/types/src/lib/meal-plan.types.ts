export interface MealPlan {
  id: string;
  code: string;
  name: string;
  description?: string;
  tourOperatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MealPlanDto {
  code: string;
  name: string;
  description?: string;
}
