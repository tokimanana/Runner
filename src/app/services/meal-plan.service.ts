import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MealPlan } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class MealPlanService {
  private apiUrl = '/api/meal-plans';

  constructor(private http: HttpClient) {}

  getMealPlans(): Observable<MealPlan[]> {
    return this.http.get<MealPlan[]>(this.apiUrl);
  }

  getMealPlan(id: string): Observable<MealPlan> {
    return this.http.get<MealPlan>(`${this.apiUrl}/${id}`);
  }

  createMealPlan(mealPlan: Partial<MealPlan>): Observable<MealPlan> {
    return this.http.post<MealPlan>(this.apiUrl, mealPlan);
  }

  updateMealPlan(id: string, mealPlan: Partial<MealPlan>): Observable<MealPlan> {
    return this.http.put<MealPlan>(`${this.apiUrl}/${id}`, mealPlan);
  }

  deleteMealPlan(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getMealPlansByHotel(hotelId: string): Observable<MealPlan[]> {
    return this.http.get<MealPlan[]>(`${this.apiUrl}/hotel/${hotelId}`);
  }
}
