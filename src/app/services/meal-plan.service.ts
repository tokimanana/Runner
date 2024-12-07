import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { MealPlan, MealPlanType, MealTime, MealPlanInclusion } from '../models/types';
import { defaultMealPlans, hotelMealPlans } from '../../data';

@Injectable({
  providedIn: 'root'
})
export class MealPlanService {
  private defaultMealPlans: MealPlan[] = defaultMealPlans;
  private hotelMealPlans: { [key: number]: MealPlan[] } = hotelMealPlans;
  private mealPlansSubject = new BehaviorSubject<MealPlan[]>(this.defaultMealPlans);

  constructor() {}

  getMealPlanById(id: string): Observable<MealPlan | undefined> {
    const allMealPlans = [
      ...this.defaultMealPlans,
      ...Object.values(this.hotelMealPlans).flat()
    ];
    
    return of(allMealPlans.find(mp => mp.id === id));
  }

  getMealPlansByHotel(hotelId: number): Observable<MealPlan[]> {
    const hotelSpecificPlans = this.hotelMealPlans[hotelId] || [];
    const allMealPlans = [...this.defaultMealPlans, ...hotelSpecificPlans];
    
    return of(allMealPlans);
  }

  createMealPlan(mealPlan: Omit<MealPlan, 'id'>): Observable<MealPlan> {
    const newId = `default-${Date.now()}`;
    const newMealPlan: MealPlan = {
      id: newId,
      type: mealPlan.type,
      name: mealPlan.name,
      description: mealPlan.description,
      mealTimes: mealPlan.mealTimes || [],
      inclusions: mealPlan.inclusions || [],
      restrictions: mealPlan.restrictions || [],
      isActive: mealPlan.isActive ?? true
    };

    this.defaultMealPlans = [...this.defaultMealPlans, newMealPlan];
    this.mealPlansSubject.next(this.defaultMealPlans);
    return of(newMealPlan);
  }

  updateMealPlan(id: string, mealPlan: Partial<MealPlan>): Observable<MealPlan> {
    // First try to update in default meal plans
    const defaultIndex = this.defaultMealPlans.findIndex(mp => mp.id === id);
    if (defaultIndex !== -1) {
      return this.updateDefaultMealPlan(id, mealPlan);
    }

    // If not found in default plans, try to find in hotel plans
    for (const hotelId in this.hotelMealPlans) {
      const hotelPlans = this.hotelMealPlans[hotelId];
      const index = hotelPlans.findIndex(mp => mp.id === id);
      if (index !== -1) {
        return this.updateHotelMealPlan(Number(hotelId), id, mealPlan);
      }
    }

    throw new Error('Meal plan not found');
  }

  deleteMealPlan(id: string): Observable<boolean> {
    // First try to delete from default meal plans
    if (this.isDefaultMealPlan(id)) {
      return this.deleteDefaultMealPlan(id);
    }

    // If not a default plan, try to find and delete from hotel plans
    for (const hotelId in this.hotelMealPlans) {
      const hotelPlans = this.hotelMealPlans[hotelId];
      if (hotelPlans.some(mp => mp.id === id)) {
        return this.deleteHotelMealPlan(Number(hotelId), id);
      }
    }

    return of(false);
  }

  private updateDefaultMealPlan(id: string, mealPlan: Partial<MealPlan>): Observable<MealPlan> {
    const index = this.defaultMealPlans.findIndex(mp => mp.id === id);
    if (index === -1) {
      throw new Error('Default meal plan not found');
    }

    const updatedMealPlan: MealPlan = {
      ...this.defaultMealPlans[index],
      ...mealPlan,
      id: id, // Ensure ID doesn't change
      mealTimes: mealPlan.mealTimes || this.defaultMealPlans[index].mealTimes,
      inclusions: mealPlan.inclusions || this.defaultMealPlans[index].inclusions,
      restrictions: mealPlan.restrictions || this.defaultMealPlans[index].restrictions
    };

    this.defaultMealPlans = this.defaultMealPlans.map(mp =>
      mp.id === id ? updatedMealPlan : mp
    );
    this.mealPlansSubject.next(this.defaultMealPlans);
    return of(updatedMealPlan);
  }

  private deleteDefaultMealPlan(id: string): Observable<boolean> {
    const initialLength = this.defaultMealPlans.length;
    this.defaultMealPlans = this.defaultMealPlans.filter(mp => mp.id !== id);
    this.mealPlansSubject.next(this.defaultMealPlans);
    return of(this.defaultMealPlans.length < initialLength);
  }

  private updateHotelMealPlan(hotelId: number, id: string, mealPlan: Partial<MealPlan>): Observable<MealPlan> {
    const hotelPlans = this.hotelMealPlans[hotelId];
    if (!hotelPlans) {
      throw new Error('Hotel not found');
    }

    const index = hotelPlans.findIndex(mp => mp.id === id);
    if (index === -1) {
      throw new Error('Meal plan not found');
    }

    const updatedMealPlan: MealPlan = {
      ...hotelPlans[index],
      ...mealPlan,
      id: id, // Ensure ID doesn't change
      mealTimes: mealPlan.mealTimes || hotelPlans[index].mealTimes,
      inclusions: mealPlan.inclusions || hotelPlans[index].inclusions,
      restrictions: mealPlan.restrictions || hotelPlans[index].restrictions
    };

    this.hotelMealPlans[hotelId][index] = updatedMealPlan;
    return of(updatedMealPlan);
  }

  private deleteHotelMealPlan(hotelId: number, id: string): Observable<boolean> {
    const hotelPlans = this.hotelMealPlans[hotelId];
    if (hotelPlans) {
      const initialLength = hotelPlans.length;
      this.hotelMealPlans[hotelId] = hotelPlans.filter(mp => mp.id !== id);
      return of(hotelPlans.length < initialLength);
    }

    return of(false);
  }

  private isDefaultMealPlan(id: string): boolean {
    return id.startsWith('default-');
  }
}
