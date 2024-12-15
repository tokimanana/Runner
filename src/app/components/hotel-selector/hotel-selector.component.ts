import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { Hotel } from '../../models/types';
import { HotelService } from '../../services/hotel.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-hotel-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  template: `
    <mat-form-field appearance="outline">
      <mat-label>Select Hotel</mat-label>
      <mat-select [formControl]="hotelControl">
        <mat-option *ngFor="let hotel of hotels" [value]="hotel">
          {{hotel.name}}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    mat-form-field {
      width: 100%;
      min-width: 250px;
    }

    ::ng-deep {
      .mat-mdc-select-panel {
        max-height: 400px !important;
        border-radius: 8px !important;
        
        .mat-mdc-option {
          height: 48px;
          padding: 0 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          
          &:hover {
            background-color: rgba(0, 0, 0, 0.04);
          }
          
          &.mat-mdc-option-active {
            background-color: rgba(0, 0, 0, 0.08);
          }
          
          .mdc-list-item__primary-text {
            display: flex;
            align-items: center;
            gap: 8px;
            
            i {
              font-size: 20px;
              color: rgba(0, 0, 0, 0.54);
            }
          }
        }
      }

      .mat-mdc-form-field-subscript-wrapper {
        display: none;
      }
    }

    .hotel-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      margin-right: 8px;
      color: rgba(0, 0, 0, 0.54);
    }

    .hotel-details {
      display: flex;
      flex-direction: column;
      
      .hotel-name {
        font-size: 14px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.87);
      }
      
      .hotel-location {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.54);
      }
    }

    /* Responsive adjustments */
    @media (max-width: 600px) {
      mat-form-field {
        min-width: 200px;
      }
      
      ::ng-deep .mat-mdc-select-panel {
        max-width: 90vw;
      }
    }
  `]
})
export class HotelSelectorComponent implements OnInit {
  @Output() hotelSelected = new EventEmitter<Hotel>();
  hotels: Hotel[] = [];
  hotelControl = new FormControl<Hotel | null>(null);

  constructor(private hotelService: HotelService) {
    this.hotelControl.valueChanges.subscribe(hotel => {
      if (hotel) {
        this.hotelService.setSelectedHotel(hotel);
        this.hotelSelected.emit(hotel);
      }
    });
  }

  async ngOnInit() {
    try {
      await this.hotelService.loadHotels();
      this.hotels = await firstValueFrom(this.hotelService.getHotels());
      
      // Set initial selected hotel if one is already selected in the service
      const currentHotel = await firstValueFrom(this.hotelService.selectedHotel$);
      if (currentHotel) {
        this.hotelControl.setValue(currentHotel, { emitEvent: false });
      }
    } catch (error) {
      console.error('Error loading hotels:', error);
    }
  }
}
