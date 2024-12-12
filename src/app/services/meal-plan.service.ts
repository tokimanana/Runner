// src/app/services/meal-plan.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MealPlan } from '../models/types';
import { MockApiService } from './mock/mock-api.service';
import { BaseDataService } from './base-data.service';

@Injectable({
  providedIn: 'root'
})
export class MealPlanService extends BaseDataService<MealPlan> {
  private mealPlansSubject = new BehaviorSubject<MealPlan[]>([]);
  mealPlans$ = this.mealPlansSubject.asObservable();

  constructor() {
    super();
  }

  protected override async loadData(): Promise<void> {
    const mealPlans = await MockApiService.getMealPlans();
    this.mealPlansSubject.next(mealPlans);
  }

  getMealPlansByHotel(hotelId: number): Observable<MealPlan[]> {
    return from(MockApiService.getHotelMealPlans(hotelId)).pipe(
      catchError(error => {
        console.error('Error getting meal plans:', error);
        return [];
      })
    );
  }

  getMealPlanById(id: string): Observable<MealPlan | undefined> {
    return from(MockApiService.getMealPlanById(id)).pipe(
      catchError(error => {
        console.error('Error getting meal plan:', error);
        return [];
      })
    );
  }

  async createMealPlan(mealPlan: Omit<MealPlan, 'id'>): Promise<MealPlan> {
    try {
      const newMealPlan = await MockApiService.createMealPlan({
        id: `mp-${Date.now()}`,
        ...mealPlan
      });
      
      const currentPlans = this.mealPlansSubject.value;
      this.mealPlansSubject.next([...currentPlans, newMealPlan]);
      
      return newMealPlan;
    } catch (error) {
      console.error('Error creating meal plan:', error);
      throw error;
    }
  }

  async updateMealPlan(id: string, updates: Partial<MealPlan>): Promise<MealPlan> {
    try {
      const updatedPlan = await MockApiService.updateMealPlan(id, updates);
      
      const currentPlans = this.mealPlansSubject.value;
      const index = currentPlans.findIndex(p => p.id === id);
      
      if (index !== -1) {
        currentPlans[index] = updatedPlan;
        this.mealPlansSubject.next([...currentPlans]);
      }
      
      return updatedPlan;
    } catch (error) {
      console.error('Error updating meal plan:', error);
      throw error;
    }
  }

  async deleteMealPlan(id: string): Promise<void> {
    try {
      await MockApiService.deleteMealPlan(id);
      
      const currentPlans = this.mealPlansSubject.value;
      const filteredPlans = currentPlans.filter(p => p.id !== id);
      this.mealPlansSubject.next(filteredPlans);
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      throw error;
    }
  }

  getActiveMealPlans(hotelId: number): Observable<MealPlan[]> {
    return this.getMealPlansByHotel(hotelId).pipe(
      map(plans => plans.filter(plan => plan.isActive))
    );
  }
}
