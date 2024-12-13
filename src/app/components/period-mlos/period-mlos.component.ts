// period-mlos.component.ts
import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Season, Period, Hotel } from '../../models/types';
import { SeasonService } from '../../services/season.service';

@Component({
  selector: 'app-period-mlos',
  templateUrl: './period-mlos.component.html',
  styleUrls: ['./period-mlos.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // Material Modules
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatChipsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatCheckboxModule
  ]
})
export class PeriodMlosComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private seasonService = inject(SeasonService);
  private destroy$ = new Subject<void>();

  // Signals
  seasons = signal<Season[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  showPeriodForm = signal(false);
  showSeasonForm = signal(false);

  // Form states
  seasonForm!: FormGroup;
  periodForm!: FormGroup;
  editingSeason: Season | null = null;
  editingPeriod: Period | null = null;
  currentSeason: Season | null = null;
  hotel!: Hotel;

  // Computed values
  activeSeasonsCount = computed(() => 
    this.seasons().filter(season => season.isActive).length
  );

  constructor() {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadSeasons();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clearError() {
    this.error.set(null);
  }


  private initializeForms(): void {
    this.seasonForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      isActive: [true],
      periods: [[]]
    });

    this.periodForm = this.fb.group({
      name: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      mlos: [1, [Validators.required, Validators.min(1)]],
      description: [''],
      isBlackout: [false]
    });
  }

  async loadSeasons(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    
    try {
      const seasons = await this.seasonService.getSeasonsByHotel(this.hotel.id);
      this.seasons.set(seasons);
    } catch (err) {
      this.error.set('Failed to load seasons. Please try again.');
      console.error('Error loading seasons:', err);
    } finally {
      this.loading.set(false);
    }
  }

  displayedColumns: string[] = [
    'name',
    'startDate',
    'endDate',
    'mlos',
    'actions'
  ];

  get seasonsArray() {
    return this.seasons();
  }
  

  addNewSeason(): void {
    this.editingSeason = null;
    this.seasonForm.reset({
      name: '',
      description: '',
      isActive: true,
      periods: []
    });
    this.showSeasonForm.set(true);
  }

  editSeason(season: Season): void {
    this.editingSeason = season;
    this.seasonForm.patchValue({
      name: season.name,
      description: season.description,
      isActive: season.isActive,
      periods: season.periods
    });
    this.showSeasonForm.set(true);
  }

  async deleteSeason(season: Season): Promise<void> {
    if (confirm(`Are you sure you want to delete the season "${season.name}"?`)) {
      try {
        await this.seasonService.deleteSeason(this.hotel.id, season.id);
        await this.loadSeasons();
        this.snackBar.open('Season deleted successfully', 'Close', { duration: 3000 });
      } catch (error) {
        this.error.set('Failed to delete season. Please try again.');
        console.error('Error deleting season:', error);
      }
    }
  }

  addPeriodToSeason(season: Season): void {
    this.currentSeason = season;
    this.editingPeriod = null;
    this.periodForm.reset({
      name: '',
      startDate: null,
      endDate: null,
      mlos: 1,
      description: '',
      isBlackout: false
    });
    this.showPeriodForm.set(true);
  }

  editPeriod(season: Season, period: Period): void {
    this.currentSeason = season;
    this.editingPeriod = period;
    this.periodForm.patchValue({
      name: period.name,
      startDate: new Date(period.startDate),
      endDate: new Date(period.endDate),
      mlos: period.mlos,
      description: period.description || '',
      isBlackout: period.isBlackout || false
    });
    this.showPeriodForm.set(true);
  }

  deletePeriod(season: Season, period: Period): void {
    if (confirm(`Are you sure you want to delete the period "${period.name}"?`)) {
      from(this.seasonService.deletePeriod(this.hotel.id, season.id, period.id))
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadSeasons();
            this.snackBar.open('Period deleted successfully', 'Close', { duration: 3000 });
          },
          error: (error: Error) => {
            this.error.set('Failed to delete period. Please try again.');
            console.error('Error deleting period:', error);
          }
        });
    }
}

savePeriod(): void {
  if (!this.currentSeason || !this.periodForm.valid) {
    return;
  }

  const periodData = {
    ...this.periodForm.value,
    startDate: this.periodForm.value.startDate?.toISOString(),
    endDate: this.periodForm.value.endDate?.toISOString(),
    seasonId: this.currentSeason.id
  };

  this.loading.set(true);

  if (this.editingPeriod) {
    from(this.seasonService.updatePeriod(
      this.hotel.id,
      this.currentSeason.id,
      this.editingPeriod.id,
      periodData
    ))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.loadSeasons();
          this.cancelPeriodEdit();
          this.snackBar.open('Period updated successfully', 'Close', { duration: 3000 });
        },
        error: (error: Error) => {
          this.loading.set(false);
          this.error.set('Failed to update period. Please try again.');
          console.error('Error updating period:', error);
        }
      });
  } else {
    from(this.seasonService.createPeriod(
      this.hotel.id,
      this.currentSeason.id,
      periodData
    ))
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.loadSeasons();
          this.cancelPeriodEdit();
          this.snackBar.open('Period created successfully', 'Close', { duration: 3000 });
        },
        error: (error: Error) => {
          this.loading.set(false);
          this.error.set('Failed to create period. Please try again.');
          console.error('Error creating period:', error);
        }
      });
  }
}

  cancelPeriodEdit(): void {
    this.showPeriodForm.set(false);
    this.editingPeriod = null;
    this.currentSeason = null;
    this.periodForm.reset({
      name: '',
      startDate: null,
      endDate: null,
      mlos: 1,
      description: '',
      isBlackout: false
    });
  }
}
