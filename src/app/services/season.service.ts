import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap, catchError } from 'rxjs';
import { Season, Period } from '../models/types';
import { initialSeasonData } from '../data/season.data';

@Injectable({
  providedIn: 'root'
})
export class SeasonService {
  private seasonsSubject = new BehaviorSubject<Map<number, Season[]>>(new Map());
  private periodsSubject = new BehaviorSubject<Map<number, Period[]>>(new Map());

  // Observable streams
  seasons$ = this.seasonsSubject.asObservable();
  periods$ = this.periodsSubject.asObservable();

  constructor() {
    this.initializeData();
  }

  private initializeData(): void {
    this.seasonsSubject.next(initialSeasonData);
    this.updatePeriodsFromSeasons(initialSeasonData);
  }

  // Season CRUD Operations
  getSeasonsByHotel(hotelId: number): Observable<Season[]> {
    return this.seasons$.pipe(
      map(seasons => seasons.get(hotelId) || []),
      tap(seasons => {
        if (!seasons.length) {
          console.warn(`No seasons found for hotel ${hotelId}`);
        }
      })
    );
  }

  getSeason(hotelId: number, seasonId: number): Observable<Season | undefined> {
    return this.getSeasonsByHotel(hotelId).pipe(
      map(seasons => seasons.find(s => s.id === seasonId))
    );
  }

  createSeason(hotelId: number, season: Omit<Season, 'id'>): Observable<Season> {
    return new Observable(subscriber => {
      try {
        const currentSeasons = this.seasonsSubject.value;
        const hotelSeasons = currentSeasons.get(hotelId) || [];
        
        const newSeason: Season = {
          ...season,
          id: this.generateSeasonId(hotelSeasons),
          periods: season.periods || []
        };

        hotelSeasons.push(newSeason);
        currentSeasons.set(hotelId, hotelSeasons);
        this.seasonsSubject.next(currentSeasons);
        
        // Update periods if the season has any
        if (newSeason.periods?.length) {
          this.updatePeriodsFromSeasons(currentSeasons);
        }

        subscriber.next(newSeason);
        subscriber.complete();
      } catch (error) {
        subscriber.error(error);
      }
    });
  }

  updateSeason(hotelId: number, seasonId: number, updates: Partial<Season>): Observable<Season> {
    return new Observable(subscriber => {
      try {
        const currentSeasons = this.seasonsSubject.value;
        const hotelSeasons = currentSeasons.get(hotelId) || [];
        
        const seasonIndex = hotelSeasons.findIndex(s => s.id === seasonId);
        if (seasonIndex === -1) {
          throw new Error(`Season ${seasonId} not found for hotel ${hotelId}`);
        }

        const updatedSeason = {
          ...hotelSeasons[seasonIndex],
          ...updates,
          id: seasonId // Ensure ID doesn't change
        };

        hotelSeasons[seasonIndex] = updatedSeason;
        currentSeasons.set(hotelId, hotelSeasons);
        this.seasonsSubject.next(currentSeasons);
        
        // Update periods if they were modified
        if (updates.periods) {
          this.updatePeriodsFromSeasons(currentSeasons);
        }

        subscriber.next(updatedSeason);
        subscriber.complete();
      } catch (error) {
        subscriber.error(error);
      }
    });
  }

  deleteSeason(hotelId: number, seasonId: number): Observable<void> {
    return new Observable(subscriber => {
      try {
        const currentSeasons = this.seasonsSubject.value;
        const hotelSeasons = currentSeasons.get(hotelId) || [];
        
        const filteredSeasons = hotelSeasons.filter(season => season.id !== seasonId);
        
        if (filteredSeasons.length === hotelSeasons.length) {
          throw new Error(`Season ${seasonId} not found for hotel ${hotelId}`);
        }

        currentSeasons.set(hotelId, filteredSeasons);
        this.seasonsSubject.next(currentSeasons);
        
        // Delete associated periods
        this.deletePeriodsForSeason(seasonId);

        subscriber.next();
        subscriber.complete();
      } catch (error) {
        subscriber.error(error);
      }
    });
  }

  // Period CRUD Operations
  getPeriodsBySeason(seasonId: number): Observable<Period[]> {
    return this.periods$.pipe(
      map(periods => periods.get(seasonId) || []),
      tap(periods => {
        if (!periods.length) {
          console.warn(`No periods found for season ${seasonId}`);
        }
      })
    );
  }

  createPeriod(seasonId: number, period: Omit<Period, 'id'>): Observable<Period> {
    return new Observable(subscriber => {
      try {
        if (!this.validatePeriodDates(seasonId, period)) {
          throw new Error('Invalid period dates or overlap detected');
        }

        const currentPeriods = this.periodsSubject.value;
        const seasonPeriods = currentPeriods.get(seasonId) || [];
        
        const newPeriod: Period = {
          ...period,
          id: this.generatePeriodId(seasonPeriods),
          seasonId
        };

        seasonPeriods.push(newPeriod);
        currentPeriods.set(seasonId, seasonPeriods);
        this.periodsSubject.next(currentPeriods);
        
        // Update the season's periods array
        this.updateSeasonPeriods(seasonId, seasonPeriods);

        subscriber.next(newPeriod);
        subscriber.complete();
      } catch (error) {
        subscriber.error(error);
      }
    });
  }

  updatePeriod(seasonId: number, periodId: number, updates: Partial<Period>): Observable<Period> {
    return new Observable(subscriber => {
      try {
        const currentPeriods = this.periodsSubject.value;
        const seasonPeriods = currentPeriods.get(seasonId) || [];
        
        const periodIndex = seasonPeriods.findIndex(p => p.id === periodId);
        if (periodIndex === -1) {
          throw new Error(`Period ${periodId} not found for season ${seasonId}`);
        }

        const updatedPeriod = {
          ...seasonPeriods[periodIndex],
          ...updates,
          id: periodId, // Ensure ID doesn't change
          seasonId // Ensure seasonId doesn't change
        };

        if (!this.validatePeriodDates(seasonId, updatedPeriod)) {
          throw new Error('Invalid period dates or overlap detected');
        }

        seasonPeriods[periodIndex] = updatedPeriod;
        currentPeriods.set(seasonId, seasonPeriods);
        this.periodsSubject.next(currentPeriods);
        
        // Update the season's periods array
        this.updateSeasonPeriods(seasonId, seasonPeriods);

        subscriber.next(updatedPeriod);
        subscriber.complete();
      } catch (error) {
        subscriber.error(error);
      }
    });
  }

  deletePeriod(seasonId: number, periodId: number): Observable<void> {
    return new Observable(subscriber => {
      try {
        const currentPeriods = this.periodsSubject.value;
        const seasonPeriods = currentPeriods.get(seasonId) || [];
        
        const filteredPeriods = seasonPeriods.filter(period => period.id !== periodId);
        
        if (filteredPeriods.length === seasonPeriods.length) {
          throw new Error(`Period ${periodId} not found for season ${seasonId}`);
        }

        currentPeriods.set(seasonId, filteredPeriods);
        this.periodsSubject.next(currentPeriods);
        
        // Update the season's periods array
        this.updateSeasonPeriods(seasonId, filteredPeriods);

        subscriber.next();
        subscriber.complete();
      } catch (error) {
        subscriber.error(error);
      }
    });
  }

  // Private helper methods
  private updatePeriodsFromSeasons(seasons: Map<number, Season[]>): void {
    const periodMap = new Map<number, Period[]>();
    
    seasons.forEach(hotelSeasons => {
      hotelSeasons.forEach(season => {
        if (season.periods?.length) {
          periodMap.set(season.id, season.periods);
        }
      });
    });

    this.periodsSubject.next(periodMap);
  }

  private updateSeasonPeriods(seasonId: number, periods: Period[]): void {
    const currentSeasons = this.seasonsSubject.value;
    
    currentSeasons.forEach((hotelSeasons, hotelId) => {
      const seasonIndex = hotelSeasons.findIndex(s => s.id === seasonId);
      if (seasonIndex !== -1) {
        hotelSeasons[seasonIndex].periods = periods;
        currentSeasons.set(hotelId, hotelSeasons);
      }
    });

    this.seasonsSubject.next(currentSeasons);
  }

  private validatePeriodDates(seasonId: number, period: Partial<Period>): boolean {
    if (!period.startDate || !period.endDate) return false;

    const seasonPeriods = this.periodsSubject.value.get(seasonId) || [];
    const periodStart = new Date(period.startDate);
    const periodEnd = new Date(period.endDate);

    // Check if dates are valid
    if (periodEnd <= periodStart) return false;

    // Check for overlaps with existing periods
    const hasOverlap = seasonPeriods.some(existingPeriod => {
      if (period.id === existingPeriod.id) return false; // Skip current period when updating
      
      const existingStart = new Date(existingPeriod.startDate);
      const existingEnd = new Date(existingPeriod.endDate);

      return (
        (periodStart >= existingStart && periodStart <= existingEnd) ||
        (periodEnd >= existingStart && periodEnd <= existingEnd) ||
        (periodStart <= existingStart && periodEnd >= existingEnd)
      );
    });

    return !hasOverlap;
  }

  private deletePeriodsForSeason(seasonId: number): void {
    const currentPeriods = this.periodsSubject.value;
    currentPeriods.delete(seasonId);
    this.periodsSubject.next(currentPeriods);
  }

  private generateSeasonId(seasons: Season[]): number {
    return seasons.length > 0 
      ? Math.max(...seasons.map(s => s.id)) + 1 
      : 1;
  }

  private generatePeriodId(periods: Period[]): number {
    return periods.length > 0 
      ? Math.max(...periods.map(p => p.id)) + 1 
      : 1;
  }
}
