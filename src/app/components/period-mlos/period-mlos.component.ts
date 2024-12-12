import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SeasonService } from '../../services/season.service';
import { Season, Period, Hotel } from '../../models/types';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-period-mlos',
  templateUrl: './period-mlos.component.html',
  styleUrls: ['./period-mlos.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
  @Input() hotel!: Hotel;
  
  seasons: Season[] = [];
  displayedColumns: string[] = ['name', 'startDate', 'endDate', 'mlos', 'actions'];
  showSeasonForm = false;
  showPeriodForm = false;
  editingSeason: Season | null = null;
  editingPeriod: Period | null = null;
  currentSeason: Season | null = null;
  loading = false;
  error: string | null = null;

  periodForm!: FormGroup;
  seasonForm!: FormGroup;
  dialogRef: MatDialogRef<any> | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private seasonService: SeasonService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.initializeForms();
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

  ngOnInit(): void {
    this.loadSeasons();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  loadSeasons(): void {
    this.loading = true;
    this.error = null;
    this.seasonService.getSeasonsByHotel(this.hotel.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (seasons: Season[]) => {
          this.seasons = seasons;
          this.loading = false;
        },
        error: (error: Error) => {
          this.error = 'Failed to load seasons. Please try again.';
          this.loading = false;
          console.error('Error loading seasons:', error);
        }
      });
  }

  addNewSeason(): void {
    this.editingSeason = null;
    this.seasonForm.reset({
      name: '',
      description: '',
      isActive: true,
      periods: []
    });
    this.openSeasonDialog();
  }

  editSeason(season: Season): void {
    this.editingSeason = season;
    this.seasonForm.patchValue({
      name: season.name,
      description: season.description,
      isActive: season.isActive,
      periods: season.periods || []
    });
    this.openSeasonDialog();
  }

  openSeasonDialog(): void {
    this.showSeasonForm = true;
    // TODO: Create a separate SeasonDialogComponent and use it here
    // this.dialogRef = this.dialog.open(SeasonDialogComponent, {
    //   width: '500px',
    //   data: {
    //     form: this.seasonForm,
    //     isEdit: !!this.editingSeason
    //   }
    // });

    // this.dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     if (this.editingSeason) {
    //       this.updateSeason(result);
    //     } else {
    //       this.createSeason(result);
    //     }
    //   }
    //   this.editingSeason = null;
    //   this.showSeasonForm = false;
    // });
  }

  deleteSeason(season: Season): void {
    if (confirm(`Are you sure you want to delete the season "${season.name}"?`)) {
      this.seasonService.deleteSeason(this.hotel.id, season.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadSeasons();
          },
          error: (error: Error) => {
            this.error = 'Failed to delete season. Please try again.';
            console.error('Error deleting season:', error);
          }
        });
    }
  }

  addPeriodToSeason(season: Season): void {
    this.currentSeason = season;
    this.editingPeriod = null;
    this.periodForm.reset({
      name: '',
      startDate: '',
      endDate: '',
      mlos: 1,
      description: '',
      isBlackout: false
    });
    this.openPeriodDialog();
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
    this.showPeriodForm = true;
  }

  openPeriodDialog(): void {
    this.showPeriodForm = true;
    // TODO: Create a separate PeriodDialogComponent and use it here
    // this.dialogRef = this.dialog.open(PeriodDialogComponent, {
    //   width: '500px',
    //   data: {
    //     form: this.periodForm,
    //     isEdit: !!this.editingPeriod
    //   }
    // });

    // this.dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     if (this.editingPeriod) {
    //       this.updatePeriod(result);
    //     } else {
    //       this.createPeriod(result);
    //     }
    //   }
    //   this.editingPeriod = null;
    //   this.currentSeason = null;
    //   this.showPeriodForm = false;
    // });
  }

  deletePeriod(season: Season, period: Period): void {
    if (confirm(`Are you sure you want to delete the period "${period.name}"?`)) {
      this.seasonService.deletePeriod(this.hotel.id, period.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadSeasons();
          },
          error: (error: Error) => {
            this.error = 'Failed to delete period. Please try again.';
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

    if (this.editingPeriod) {
      this.loading = true;
      this.seasonService.updatePeriod(this.hotel.id, this.editingPeriod.id, periodData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.loadSeasons();
            this.cancelPeriodEdit();
          },
          error: (error: Error) => {
            this.loading = false;
            this.error = 'Failed to update period. Please try again.';
            console.error('Error updating period:', error);
          }
        });
    } else {
      this.loading = true;
      this.seasonService.createPeriod(this.hotel.id, periodData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.loadSeasons();
            this.cancelPeriodEdit();
          },
          error: (error: Error) => {
            this.loading = false;
            this.error = 'Failed to create period. Please try again.';
            console.error('Error creating period:', error);
          }
        });
    }
  }

  cancelPeriodEdit(): void {
    this.showPeriodForm = false;
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