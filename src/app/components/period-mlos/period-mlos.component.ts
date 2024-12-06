import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';
import { SeasonService } from '../../services/season.service';
import { Season, Period, Hotel } from '../../models/types';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-period-mlos',
  templateUrl: './period-mlos.component.html',
  styleUrls: ['./period-mlos.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent]
})
export class PeriodMlosComponent implements OnInit, OnDestroy {
  @Input() hotel!: Hotel;
  
  seasons: Season[] = [];
  showSeasonForm = false;
  showPeriodForm = false;
  editingSeason: Season | null = null;
  editingPeriod: Period | null = null;
  currentSeason: Season | null = null;
  loading = false;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  seasonForm: Omit<Season, 'id'> = {
    name: '',
    description: '',
    isActive: true,
    periods: []
  };

  periodForm: Omit<Period, 'id' | 'seasonId'> = {
    name: '',
    startDate: '',
    endDate: '',
    mlos: 1,
    description: '',
    isBlackout: false
  };

  constructor(private seasonService: SeasonService) {}

  ngOnInit(): void {
    this.loadSeasons();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSeasons(): void {
    if (this.hotel) {
      this.loading = true;
      this.seasonService.getSeasonsByHotel(this.hotel.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (seasons) => {
            this.seasons = seasons;
            this.loading = false;
            this.error = null;
          },
          error: (err) => {
            console.error('Error loading seasons:', err);
            this.error = 'Failed to load seasons. Please try again.';
            this.loading = false;
          }
        });
    }
  }

  // Season CRUD operations
  addNewSeason(): void {
    this.editingSeason = null;
    this.seasonForm = {
      name: '',
      description: '',
      isActive: true,
      periods: []
    };
    this.showSeasonForm = true;
  }

  editSeason(season: Season): void {
    this.editingSeason = season;
    this.seasonForm = { ...season };
    this.showSeasonForm = true;
  }

  saveSeason(): void {
    if (!this.seasonForm.name) {
      this.error = 'Season name is required';
      return;
    }

    this.loading = true;
    this.error = null;

    if (this.editingSeason) {
      // Update existing season
      const updateData: Partial<Season> = {
        name: this.seasonForm.name,
        description: this.seasonForm.description,
        isActive: this.seasonForm.isActive
      };

      this.seasonService.updateSeason(
        this.hotel.id,
        this.editingSeason.id,
        updateData
      ).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.closeSeasonForm();
            this.loadSeasons();
          },
          error: (err) => {
            console.error('Error updating season:', err);
            this.error = 'Failed to update season. Please try again.';
            this.loading = false;
          }
        });
    } else {
      // Add new season
      this.seasonService.createSeason(
        this.hotel.id,
        this.seasonForm
      ).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.closeSeasonForm();
            this.loadSeasons();
          },
          error: (err) => {
            console.error('Error creating season:', err);
            this.error = 'Failed to create season. Please try again.';
            this.loading = false;
          }
        });
    }
  }

  deleteSeason(season: Season): void {
    if (confirm(`Are you sure you want to delete the season "${season.name}"?`)) {
      this.loading = true;
      this.error = null;

      this.seasonService.deleteSeason(this.hotel.id, season.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.loadSeasons();
          },
          error: (err) => {
            console.error('Error deleting season:', err);
            this.error = 'Failed to delete season. Please try again.';
            this.loading = false;
          }
        });
    }
  }

  // Period CRUD operations
  addPeriodToSeason(season: Season): void {
    this.editingPeriod = null;
    this.currentSeason = season;
    this.periodForm = {
      name: '',
      startDate: '',
      endDate: '',
      mlos: 1,
      description: '',
      isBlackout: false
    };
    this.showPeriodForm = true;
  }

  editPeriod(season: Season, period: Period): void {
    this.editingPeriod = period;
    this.currentSeason = season;
    this.periodForm = { ...period };
    this.showPeriodForm = true;
  }

  savePeriod(): void {
    if (!this.currentSeason) {
      this.error = 'No season selected';
      return;
    }

    if (!this.periodForm.name || !this.periodForm.startDate || !this.periodForm.endDate) {
      this.error = 'Period name and dates are required';
      return;
    }

    this.loading = true;
    this.error = null;

    if (this.editingPeriod) {
      // Update existing period
      const updateData: Partial<Period> = {
        name: this.periodForm.name,
        startDate: this.periodForm.startDate,
        endDate: this.periodForm.endDate,
        mlos: this.periodForm.mlos,
        description: this.periodForm.description,
        isBlackout: this.periodForm.isBlackout
      };

      this.seasonService.updatePeriod(
        this.currentSeason.id,
        this.editingPeriod.id,
        updateData
      ).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.closePeriodForm();
            this.loadSeasons();
          },
          error: (err) => {
            console.error('Error updating period:', err);
            this.error = 'Failed to update period. Please try again.';
            this.loading = false;
          }
        });
    } else {
      // Add new period
      const newPeriod: Omit<Period, 'id'> = {
        ...this.periodForm,
        seasonId: this.currentSeason.id
      };

      this.seasonService.createPeriod(
        this.currentSeason.id,
        newPeriod
      ).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.closePeriodForm();
            this.loadSeasons();
          },
          error: (err) => {
            console.error('Error creating period:', err);
            this.error = 'Failed to create period. Please try again.';
            this.loading = false;
          }
        });
    }
  }

  deletePeriod(season: Season, period: Period): void {
    if (confirm('Are you sure you want to delete this period?')) {
      this.loading = true;
      this.error = null;

      this.seasonService.deletePeriod(season.id, period.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.loadSeasons();
          },
          error: (err) => {
            console.error('Error deleting period:', err);
            this.error = 'Failed to delete period. Please try again.';
            this.loading = false;
          }
        });
    }
  }

  // Helper methods
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  closeSeasonForm(): void {
    this.showSeasonForm = false;
    this.editingSeason = null;
    this.error = null;
    this.seasonForm = {
      name: '',
      description: '',
      isActive: true,
      periods: []
    };
  }

  closePeriodForm(): void {
    this.showPeriodForm = false;
    this.editingPeriod = null;
    this.currentSeason = null;
    this.error = null;
    this.periodForm = {
      name: '',
      startDate: '',
      endDate: '',
      mlos: 1,
      description: '',
      isBlackout: false
    };
  }

  cancelEdit(): void {
    this.closeSeasonForm();
  }

  cancelPeriodEdit(): void {
    this.closePeriodForm();
  }
}