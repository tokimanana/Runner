import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../services/hotel.service';
import { Contract, Market, RateConfiguration, MarketTemplate, Room, Season, Hotel, SpecialOffer } from '../../models/types';

@Component({
  selector: 'app-rates-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
     <div class="rates-container">
      <div class="rates-header">
        <h3>Rates Configuration</h3>
        <button class="add-btn" (click)="showRateEditor = true">
          <i class="material-icons">add</i>
          Add Rate
        </button>
      </div>

      <div class="rates-grid">
        <div class="filters">
          <select [(ngModel)]="selectedSeason">
            <option [ngValue]="null">Select Season</option>
            <option *ngFor="let season of seasons" [value]="season.id">
              {{season.name}}
            </option>
          </select>

          <select [(ngModel)]="selectedRoomType">
            <option [ngValue]="null">Select Room Type</option>
            <option *ngFor="let room of rooms" [value]="room.id">
              {{room.type}}
            </option>
          </select>
        </div>

        <div class="rates-table">
          <div *ngFor="let contract of activeContracts" class="contract-card">
            <div class="contract-header">
              <h4>{{contract.name}}</h4>
              <div class="contract-actions">
                <button (click)="editRates(contract)">Edit</button>
                <button (click)="duplicateContract(contract)">Duplicate</button>
              </div>
            </div>
            <div class="contract-details">
              <p>Valid: {{formatDate(contract.validFrom)}} - {{formatDate(contract.validTo)}}</p>
              <div class="rates-list">
                <div *ngFor="let rate of contract.rates" class="rate-item">
                  <span>{{getMarketName(rate.marketId)}}</span>
                  <span>{{rate.amount | currency}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="showRateEditor" class="rate-editor-modal">
        <div class="modal-content">
          <h3>Configure Rates</h3>
          
          <div class="template-section">
            <h4>Rate Templates</h4>
            <div class="template-list">
              <button *ngFor="let template of marketTemplates" 
                      (click)="useTemplate(template)">
                {{template.name}}
              </button>
              <button (click)="createTemplate()">Save as Template</button>
            </div>
          </div>

          <div class="rates-form">
            <!-- Add rate form fields here -->
          </div>

          <div class="special-offers">
            <h4>Special Offers</h4>
            <button (click)="addOffer()">Add Offer</button>
            <div *ngFor="let offer of specialOffers" class="offer-item">
              <span>{{offer.type}} - {{offer.discount}}%</span>
              <button (click)="removeOffer(offer)">Remove</button>
            </div>
          </div>

          <div class="modal-actions">
            <button (click)="saveRates()">Save</button>
            <button (click)="closeRateEditor()">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rates-container {
      padding: 1rem;
    }

    .rates-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .add-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: #0d6efd;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    select {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      min-width: 200px;
    }

    .rates-table {
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 1rem;
    }

    .contract-card {
      background: white;
      border-radius: 4px;
      padding: 1rem;
      margin-bottom: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .contract-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .contract-actions {
      display: flex;
      gap: 0.5rem;
    }

    .rate-editor-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .modal-content {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      width: 80%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .template-section {
      margin-bottom: 2rem;
    }

    .template-list {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .special-offers {
      margin-top: 2rem;
    }

    .offer-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: #f8f9fa;
      margin-bottom: 0.5rem;
      border-radius: 4px;
    }

    .modal-actions {
      margin-top: 2rem;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
  `]
})
export class RatesConfigComponent implements OnInit {
  @Input() hotel!: Hotel;
  marketTemplates: MarketTemplate[] = [];
  activeContracts: Contract[] = [];
  showRateEditor = false;
  selectedSeason: number | null = null;
  selectedRoomType: number | null = null;
  currentRates: RateConfiguration[] = [];
  specialOffers: any[] = [];
  seasons: Season[] = [];
  rooms: Room[] = [];

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    const selectedHotel = this.hotelService.getSelectedHotel();
    selectedHotel.subscribe(hotel => {
      if (hotel) {
        this.seasons = this.hotelService.getSeasons(hotel.id);
        this.rooms = this.hotelService.getRooms(hotel.id);
      }
    });
  }

  useTemplate(template: MarketTemplate) {
    this.currentRates = template.rates.map(rate => ({
      ...rate,
      seasonId: this.selectedSeason || 0,
      roomTypeId: this.selectedRoomType || 0,
      contractId: this.activeContracts.length + 1,
      baseRate: rate.baseRate,
      supplements: rate.supplements,
      specialOffers: rate.specialOffers
    }));
    this.showRateEditor = true;
  }
  
  createTemplate() {
    const templateName = prompt('Enter template name:');
    if (templateName) {
      const newTemplate: MarketTemplate = {
        id: this.marketTemplates.length + 1,
        name: templateName,
        rates: this.currentRates,
        baseConfiguration: {
          defaultMealPlans: [],
          defaultSupplements: true,
          defaultSpecialOffers: true
        }
      };
      this.marketTemplates.push(newTemplate);
    }
  }
  
  getMarketName(marketId: number): string {
    const markets = this.hotelService.getMarketsForHotel(this.hotel.id);
    const market = markets.find(m => m.id === marketId);
    return market ? market.name : 'Unknown Market';
  }
  
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
  
  editRates(contract: Contract) {
    this.currentRates = contract.rates;
    this.selectedSeason = contract.seasonId;
    this.selectedRoomType = contract.roomTypeId;
    this.showRateEditor = true;
  }
  
  duplicateContract(contract: Contract) {
    const newContract: Contract = {
      ...contract,
      id: this.activeContracts.length + 1,
      name: `${contract.name} (Copy)`,
      status: 'draft',
      startDate: new Date().toISOString(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
    };
    this.activeContracts.push(newContract);
  }
  
  
  addOffer() {
    const newOffer: SpecialOffer = {
      type: 'early_bird',
      discount: 15,
      conditions: 'Book 60 days in advance',
      validFrom: new Date(),
      validTo: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      minimumStay: 3
    };
    this.specialOffers.push(newOffer);
  }
  
  saveRates() {
    if (!this.selectedSeason || !this.selectedRoomType) {
      alert('Please select both season and room type');
      return;
    }
  
    const newContract: Contract = {
      id: this.activeContracts.length + 1,
      name: `Contract ${this.activeContracts.length + 1}`,
      marketId: 1, // Default market ID
      seasonId: this.selectedSeason,
      roomTypeId: this.selectedRoomType,
      rates: this.currentRates,
      status: 'draft',
      rateType: 'public',
      terms: '',
      startDate: new Date().toISOString(),
      endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      validFrom: new Date(),
      validTo: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    };
  
    this.activeContracts.push(newContract);
    this.showRateEditor = false;
    this.currentRates = [];
  }
  
  closeRateEditor() {
    if (confirm('Are you sure you want to close? Any unsaved changes will be lost.')) {
      this.showRateEditor = false;
      this.currentRates = [];
    }
  }

  removeOffer(offer: SpecialOffer) {
    const index = this.specialOffers.indexOf(offer);
    if (index > -1) {
      this.specialOffers.splice(index, 1);
    }
  }
}