import { buildPaginationParams } from '@/app/shared/utils/http-params.util';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  MealPlan,
  MealPlanDto,
  PaginatedResult,
  PaginationParams,
} from '@runner/shared/types';
import { BehaviorSubject, Observable, take, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MealPlansService {
  private readonly apiUrl = `${environment.apiUrl}/meal-plans`;
  private readonly http = inject(HttpClient);

  private readonly _mealPlans$ = new BehaviorSubject<MealPlan[]>([]);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  private loaded = false;

  readonly mealPlans$ = this._mealPlans$.asObservable();
  readonly loading$ = this._loading$.asObservable();

  private load(params?: PaginationParams): void {
    this._loading$.next(true);
    this.http
      .get<PaginatedResult<MealPlan>>(this.apiUrl, {
        params: buildPaginationParams(params),
      })
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this._mealPlans$.next(result.data);
          this.loaded = true;
          this._loading$.next(false);
        },
        error: (err) => {
          console.error('Failed to load meal plans', err);
          this._loading$.next(false);
        },
      });
  }

  getAll(params?: PaginationParams): Observable<MealPlan[]> {
    if (!this.loaded) {
      this.load(params);
    }
    return this.mealPlans$;
  }

  create(dto: MealPlanDto): Observable<MealPlan> {
    return this.http
      .post<MealPlan>(this.apiUrl, dto)
      .pipe(tap(() => this.reload()));
  }

  update(id: string, dto: Partial<MealPlanDto>): Observable<MealPlan> {
    return this.http
      .patch<MealPlan>(`${this.apiUrl}/${id}`, dto)
      .pipe(tap(() => this.reload()));
  }

  remove(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/${id}`)
      .pipe(tap(() => this.reload()));
  }

  reload(): void {
    this.loaded = false;
    this.load();
  }
}
