import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../services/hotel.service';
import { Hotel, Season } from '../../models/types';

@Component({
  selector: 'app-period-mlos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="period-container">
      <div class="header-actions">
        <h3>Periods & Minimum Length of Stay</h3>
        <button (click)="addNewSeason()" class="add-btn">
          <i class="material-icons">add</i> Add Season
        </button>
      </div>

      <div class="seasons-list">
        <div *ngFor="let season of seasons" class="season-card" [class.blackout]="season.isBlackout">
          <div class="season-header">
            <div class="season-title">
              <h4>{{ season.name }}</h4>
              <span class="date-range">
                {{ formatDate(season.startDate) }} - {{ formatDate(season.endDate) }}
              </span>
            </div>
            <div class="actions">
              <button (click)="editSeason(season)" class="edit-btn">
                <i class="material-icons">edit</i>
              </button>
              <button (click)="deleteSeason(season)" class="delete-btn">
                <i class="material-icons">delete</i>
              </button>
            </div>
          </div>

          <div class="season-details">
            <div class="mlos-info">
              <span class="mlos-label">Minimum Stay:</span>
              <span class="mlos-value">{{ season.mlos }} nights</span>
            </div>
            <p *ngIf="season.description" class="description">
              {{ season.description }}
            </p>
            <div *ngIf="season.isBlackout" class="blackout-badge">
              Blackout Period
            </div>
          </div>
        </div>
      </div>

      <!-- Season Form Modal -->
      <div *ngIf="showSeasonForm" class="modal">
        <div class="modal-content">
          <h3>{{ editingSeason ? 'Edit Season' : 'Add New Season' }}</h3>
          
          <div class="form-group">
            <label>Season Name:</label>
            <input 
              type="text" 
              [(ngModel)]="seasonForm.name" 
              class="form-input"
              placeholder="e.g., Peak Season, Low Season"
            >
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Start Date:</label>
              <input 
                type="date" 
                [(ngModel)]="seasonForm.startDate" 
                class="form-input"
              >
            </div>
            <div class="form-group">
              <label>End Date:</label>
              <input 
                type="date" 
                [(ngModel)]="seasonForm.endDate" 
                class="form-input"
              >
            </div>
          </div>

          <div class="form-group">
            <label>Minimum Length of Stay (Nights):</label>
            <input 
              type="number" 
              [(ngModel)]="seasonForm.mlos" 
              class="form-input"
              min="1"
            >
          </div>

          <div class="form-group">
            <label>Description (Optional):</label>
            <textarea 
              [(ngModel)]="seasonForm.description" 
              rows="3" 
              class="form-input"
              placeholder="Add any special notes or conditions..."
            ></textarea>
          </div>

          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                [(ngModel)]="seasonForm.isBlackout"
              >
              Mark as Blackout Period
            </label>
          </div>

          <div class="modal-actions">
            <button (click)="saveSeason()" class="save-btn">Save</button>
            <button (click)="cancelEdit()" class="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .period-container {
      padding: 1rem;
    }

    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .seasons-list {
      display: grid;
      gap: 1.5rem;
    }

    .season-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 1.5rem;
      border-left: 4px solid #0d6efd;
    }

    .season-card.blackout {
      border-left-color: #dc3545;
    }

    .season-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .season-title {
      display: grid;
      gap: 0.5rem;
    }

    .date-range {
      color: #666;
      font-size: 0.9rem;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .season-details {
      display: grid;
      gap: 1rem;
      position: relative;
    }

    .mlos-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .mlos-label {
      color: #666;
    }

    .mlos-value {
      font-weight: 500;
      color: #0d6efd;
    }

    .description {
      color: #666;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .blackout-badge {
      position: absolute;
      top: 0;
      right: 0;
      background: #dc3545;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }

    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }

    .form-input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .checkbox-group {
      margin-top: 1rem;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    .add-btn, .edit-btn, .delete-btn, .save-btn, .cancel-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .add-btn {
      background: #0d6efd;
      color: white;
    }

    .edit-btn {
      background: #6c757d;
      color: white;
    }

    .delete-btn {
      background: #dc3545;
      color: white;
    }

    .save-btn {
      background: #198754;
      color: white;
    }

    .cancel-btn {
      background: #6c757d;
      color: white;
    }
  `]
})
export class PeriodMlosComponent implements OnInit {
  @Input() hotel!: Hotel;
  seasons: Season[] = [];
  showSeasonForm = false;
  editingSeason: Season | null = null;
  
  seasonForm: Omit<Season, 'id'> = {
    name: '',
    startDate: '',
    endDate: '',
    mlos: 1,
    description: '',
    isBlackout: false
  };

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    if (this.hotel) {
      this.seasons = this.hotelService.getSeasons(this.hotel.id);
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  addNewSeason() {
    this.editingSeason = null;
    this.seasonForm = {
      name: '',
      startDate: '',
      endDate: '',
      mlos: 1,
      description: '',
      isBlackout: false
    };
    this.showSeasonForm = true;
  }

  editSeason(season: Season) {
    this.editingSeason = season;
    this.seasonForm = {
      name: season.name,
      startDate: season.startDate,
      endDate: season.endDate,
      mlos: season.mlos,
      description: season.description,
      isBlackout: season.isBlackout
    };
    this.showSeasonForm = true;
  }

  deleteSeason(season: Season) {
    if (confirm('Are you sure you want to delete this season?')) {
      this.hotelService.deleteSeason(this.hotel.id, season.id);
      this.seasons = this.hotelService.getSeasons(this.hotel.id);
    }
  }

  saveSeason(): void {
    if (!this.hotel || !this.validateDates()) return;

    const seasonData: Season = {
      id: this.editingSeason?.id || 0,
      name: this.seasonForm.name,
      startDate: this.seasonForm.startDate,
      endDate: this.seasonForm.endDate,
      mlos: this.seasonForm.mlos,
      description: this.seasonForm.description || '',  
      isBlackout: this.seasonForm.isBlackout || false
    };

    if (this.editingSeason) {
      this.hotelService.updateSeason(this.hotel.id, seasonData);
    } else {
      this.hotelService.addSeason(this.hotel.id, seasonData);
    }

    this.seasons = this.hotelService.getSeasons(this.hotel.id);
    this.showSeasonForm = false;
    this.editingSeason = null;
  }

  cancelEdit() {
    this.showSeasonForm = false;
    this.editingSeason = null;
  }

  private validateDates(): boolean {
    const start = new Date(this.seasonForm.startDate);
    const end = new Date(this.seasonForm.endDate);
    return end >= start;
  }
}