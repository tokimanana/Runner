import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  MealPlan,
  MealPlanDto,
  PaginatedResult,
  PaginationParams,
} from '@runner/shared/types';
import { BehaviorSubject, Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MealPlansService {
  private readonly apiUrl = `${environment.apiUrl}/meal-plans`;

  private readonly _mealPlans$ = new BehaviorSubject<MealPlan[]>([]);
  private loaded = false;

  readonly mealPlans$ = this._mealPlans$.asObservable();

  constructor(private readonly http: HttpClient) {}

  load(): void {
    if (this.loaded) return;
    this.http
      .get<PaginatedResult<MealPlan>>(this.apiUrl)
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this._mealPlans$.next(result.data);
          this.loaded = true;
        },
      });
  }

  getAll(params?: PaginationParams): Observable<PaginatedResult<MealPlan>> {
    return this.http.get<PaginatedResult<MealPlan>>(this.apiUrl, {
      params: params as any,
    });
  }

  create(dto: MealPlanDto): Observable<MealPlan> {
    return this.http
      .post<MealPlan>(this.apiUrl, dto)
      .pipe(
        tap((created) =>
          this._mealPlans$.next([...this._mealPlans$.value, created])
        )
      );
  }

  update(id: string, dto: Partial<MealPlanDto>): Observable<MealPlan> {
    return this.http
      .patch<MealPlan>(`${this.apiUrl}/${id}`, dto)
      .pipe(
        tap((updated) =>
          this._mealPlans$.next(
            this._mealPlans$.value.map((m) => (m.id === id ? updated : m))
          )
        )
      );
  }

  remove(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() =>
          this._mealPlans$.next(
            this._mealPlans$.value.filter((m) => m.id !== id)
          )
        )
      );
  }
}
