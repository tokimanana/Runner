// src/app/services/season.service.ts
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, map } from "rxjs";
import { Season, Period } from "../models/types";
import { MockApiService } from "./mock/mock-api.service";

@Injectable({
  providedIn: "root",
})
export class SeasonService {
  private seasonsSubject = new BehaviorSubject<Map<number, Season[]>>(
    new Map()
  );
  private periodsSubject = new BehaviorSubject<Map<number, Period[]>>(
    new Map()
  );

  seasons$ = this.seasonsSubject.asObservable();
  periods$ = this.periodsSubject.asObservable();

  constructor() {
    this.initializeData();
  }

  private async initializeData(): Promise<void> {
    try {
      // Load seasons for all hotels
      const hotels = [1, 2, 3]; // Add hotel 3
      const seasonMap = new Map();

      for (const hotelId of hotels) {
        const seasons = await MockApiService.getSeasonsByHotel(hotelId);
        seasonMap.set(hotelId, seasons);
      }

      this.seasonsSubject.next(seasonMap);
      this.updatePeriodsFromSeasons(seasonMap);
    } catch (error) {
      console.error("Error initializing seasons:", error);
    }
  }

  async getSeasonsByHotel(hotelId: number): Promise<Season[]> {
    try {
      const seasons = await MockApiService.getSeasonsByHotel(hotelId);
      const currentMap = this.seasonsSubject.value;
      currentMap.set(hotelId, seasons);
      this.seasonsSubject.next(currentMap);
      this.updatePeriodsFromSeasons(currentMap);
      return seasons;
    } catch (error) {
      console.error(`Error loading seasons for hotel ${hotelId}:`, error);
      throw error;
    }
  }

  async createSeason(
    hotelId: number,
    seasonData: Omit<Season, "id">
  ): Promise<Season> {
    try {
      const newSeason = await MockApiService.createSeason(hotelId, seasonData);
      const currentMap = this.seasonsSubject.value;
      const hotelSeasons = currentMap.get(hotelId) || [];
      currentMap.set(hotelId, [...hotelSeasons, newSeason]);
      this.seasonsSubject.next(currentMap);

      if (newSeason.periods?.length) {
        this.updatePeriodsFromSeasons(currentMap);
      }

      return newSeason;
    } catch (error) {
      console.error("Error creating season:", error);
      throw error;
    }
  }

  async updateSeason(
    hotelId: number,
    seasonId: number,
    updates: Partial<Season>
  ): Promise<Season> {
    try {
      const updatedSeason = await MockApiService.updateSeason(
        hotelId,
        seasonId,
        updates
      );
      const currentMap = this.seasonsSubject.value;
      const hotelSeasons = currentMap.get(hotelId) || [];
      const index = hotelSeasons.findIndex((s) => s.id === seasonId);

      if (index !== -1) {
        hotelSeasons[index] = updatedSeason;
        currentMap.set(hotelId, [...hotelSeasons]);
        this.seasonsSubject.next(currentMap);

        if (updates.periods) {
          this.updatePeriodsFromSeasons(currentMap);
        }
      }

      return updatedSeason;
    } catch (error) {
      console.error("Error updating season:", error);
      throw error;
    }
  }

  async deleteSeason(hotelId: number, seasonId: number): Promise<void> {
    try {
      await MockApiService.deleteSeason(hotelId, seasonId);
      const currentMap = this.seasonsSubject.value;
      const hotelSeasons = currentMap.get(hotelId) || [];
      currentMap.set(
        hotelId,
        hotelSeasons.filter((s) => s.id !== seasonId)
      );
      this.seasonsSubject.next(currentMap);
      this.deletePeriodsForSeason(seasonId);
    } catch (error) {
      console.error("Error deleting season:", error);
      throw error;
    }
  }

  // Period-related methods
  async createPeriod(
    hotelId: number,
    seasonId: number,
    periodData: Omit<Period, "id">
  ): Promise<Period> {
    try {
      const newPeriod = await MockApiService.createPeriod(
        hotelId,
        seasonId,
        periodData
      );
      this.updatePeriodsAfterChange(hotelId, seasonId);
      return newPeriod;
    } catch (error) {
      console.error("Error creating period:", error);
      throw error;
    }
  }

  async updatePeriod(
    hotelId: number,
    seasonId: number,
    periodId: number,
    updates: Partial<Period>
  ): Promise<Period> {
    try {
      const updatedPeriod = await MockApiService.updatePeriod(
        hotelId,
        seasonId,
        periodId,
        updates
      );
      this.updatePeriodsAfterChange(hotelId, seasonId);
      return updatedPeriod;
    } catch (error) {
      console.error("Error updating period:", error);
      throw error;
    }
  }

  async deletePeriod(
    hotelId: number,
    seasonId: number,
    periodId: number
  ): Promise<void> {
    try {
      await MockApiService.deletePeriod(hotelId, seasonId, periodId);
      this.updatePeriodsAfterChange(hotelId, seasonId);
    } catch (error) {
      console.error("Error deleting period:", error);
      throw error;
    }
  }

  // Private helper methods
  private async updatePeriodsAfterChange(
    hotelId: number,
    seasonId: number
  ): Promise<void> {
    const season = await MockApiService.getSeasonById(hotelId, seasonId);
    if (season) {
      const currentPeriodsMap = this.periodsSubject.value;
      currentPeriodsMap.set(seasonId, season.periods || []);
      this.periodsSubject.next(currentPeriodsMap);
    }
  }

  private updatePeriodsFromSeasons(seasons: Map<number, Season[]>): void {
    const periodMap = new Map<number, Period[]>();

    seasons.forEach((hotelSeasons) => {
      hotelSeasons.forEach((season) => {
        if (season.periods?.length) {
          periodMap.set(season.id, season.periods);
        }
      });
    });

    this.periodsSubject.next(periodMap);
  }

  private deletePeriodsForSeason(seasonId: number): void {
    const currentPeriods = this.periodsSubject.value;
    currentPeriods.delete(seasonId);
    this.periodsSubject.next(currentPeriods);
  }

  getPeriodsBySeason(seasonId: number): Observable<Period[]> {
    return this.periods$.pipe(
      map(periodsMap => {
        const periods = periodsMap.get(seasonId) || [];
        console.log('Getting periods for season:', seasonId, periods);
        return periods;
      })
    );
  }
}
