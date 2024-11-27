import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';
import { HotelService } from '../../services/hotel.service';
import { Season, Period, Hotel } from '../../models/types';

@Component({
  selector: 'app-period-mlos',
  templateUrl: './period-mlos.component.html',
  styleUrls: ['./period-mlos.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent]
})
export class PeriodMlosComponent implements OnInit {
  @Input() hotel!: Hotel;
  seasons: Season[] = [];
  showSeasonForm = false;
  showPeriodForm = false;
  editingSeason: Season | null = null;
  editingPeriod: Period | null = null;
  currentSeason: Season | null = null;

  seasonForm: Partial<Season> = {
    name: '',
    description: '',
    isActive: true,
    periods: []
  };

  periodForm: Partial<Period> = {
    startDate: '',
    endDate: '',
    mlos: 1,
    description: '',
    isBlackout: false
  };

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.loadSeasons();
  }

  loadSeasons(): void {
    if (this.hotel) {
      this.hotelService.currentSeasons$.subscribe(seasons => {
        this.seasons = seasons;
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
      alert('Season name is required');
      return;
    }

    if (this.editingSeason) {
      // Update existing season
      const index = this.seasons.findIndex(s => s.id === this.editingSeason!.id);
      if (index !== -1) {
        this.seasons[index] = {
          ...this.editingSeason,
          ...this.seasonForm,
          periods: this.editingSeason.periods
        } as Season;
      }
    } else {
      // Add new season
      const newSeason: Season = {
        id: Math.max(0, ...this.seasons.map(s => s.id)) + 1,
        name: this.seasonForm.name!,
        description: this.seasonForm.description,
        isActive: this.seasonForm.isActive!,
        periods: []
      };
      this.seasons.push(newSeason);
    }

    this.closeSeasonForm();
    this.updateSeasons();
  }

  deleteSeason(season: Season): void {
    if (confirm(`Are you sure you want to delete the season "${season.name}"?`)) {
      this.seasons = this.seasons.filter(s => s.id !== season.id);
      this.updateSeasons();
    }
  }

  // Period CRUD operations
  addPeriodToSeason(season: Season): void {
    this.editingPeriod = null;
    this.currentSeason = season;
    this.periodForm = {
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
    if (!this.periodForm.startDate || !this.periodForm.endDate) {
      alert('Start and end dates are required');
      return;
    }

    if (new Date(this.periodForm.startDate) > new Date(this.periodForm.endDate)) {
      alert('Start date must be before end date');
      return;
    }

    if (!this.currentSeason) {
      alert('No season selected');
      return;
    }

    // Check for date overlaps with existing periods
    const overlappingPeriod = this.currentSeason.periods.find(p => {
      if (this.editingPeriod && p.id === this.editingPeriod.id) return false;
      const start = new Date(p.startDate);
      const end = new Date(p.endDate);
      const newStart = new Date(this.periodForm.startDate!);
      const newEnd = new Date(this.periodForm.endDate!);
      return (newStart <= end && newEnd >= start);
    });

    if (overlappingPeriod) {
      alert('This period overlaps with an existing period');
      return;
    }

    const periodData: Period = {
      id: this.editingPeriod ? this.editingPeriod.id : Math.random(),
      startDate: this.periodForm.startDate,
      endDate: this.periodForm.endDate,
      mlos: this.periodForm.mlos || 1,
      description: this.periodForm.description,
      isBlackout: this.periodForm.isBlackout
    };

    const seasonIndex = this.seasons.findIndex(s => s.id === this.currentSeason!.id);
    if (seasonIndex === -1) return;

    if (this.editingPeriod) {
      // Update existing period
      const periodIndex = this.seasons[seasonIndex].periods.findIndex(
        p => p.id === this.editingPeriod!.id
      );
      if (periodIndex !== -1) {
        this.seasons[seasonIndex].periods[periodIndex] = periodData;
      }
    } else {
      // Add new period
      this.seasons[seasonIndex].periods.push(periodData);
    }

    this.closePeriodForm();
    this.updateSeasons();
  }

  deletePeriod(season: Season, period: Period): void {
    if (confirm('Are you sure you want to delete this period?')) {
      const seasonIndex = this.seasons.findIndex(s => s.id === season.id);
      if (seasonIndex !== -1) {
        this.seasons[seasonIndex].periods = this.seasons[seasonIndex].periods.filter(
          p => p.id !== period.id
        );
        this.updateSeasons();
      }
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
    this.periodForm = {
      startDate: '',
      endDate: '',
      mlos: 1,
      description: '',
      isBlackout: false
    };
  }

  private updateSeasons(): void {
    if (this.hotel) {
      // Update the seasons in the service
      this.hotelService.updateSeasons(this.hotel.id, this.seasons);
    }
  }

  cancelEdit(): void {
    this.closeSeasonForm();
  }

  cancelPeriodEdit(): void {
    this.closePeriodForm();
  }
}