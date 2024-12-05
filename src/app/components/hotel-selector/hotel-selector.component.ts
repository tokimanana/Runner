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
    <mat-form-field appearance="fill">
      <mat-label>Select Hotel</mat-label>
      <mat-select [formControl]="hotelControl">
        <mat-option *ngFor="let hotel of hotels" [value]="hotel">
          {{hotel.name}}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
  styles: []
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
      this.hotels = await firstValueFrom(this.hotelService.getHotels());
      
      // Set initial selected hotel if one is already selected in the service
      const currentHotel = await firstValueFrom(this.hotelService.getSelectedHotel());
      if (currentHotel) {
        this.hotelControl.setValue(currentHotel, { emitEvent: false });
      }
    } catch (error) {
      console.error('Error loading hotels:', error);
    }
  }
}