import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../services/hotel.service';
import { Hotel } from '../../models/types';

@Component({
  selector: 'app-hotel-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="hotel-selector">
      <select
        class="form-select"
        (change)="onHotelChange($event)"
        [value]="selectedHotel?.id || ''"
      >
        <option value="">Select a Hotel</option>
        <option *ngFor="let hotel of hotels" [value]="hotel.id">
          {{ hotel.name }}
        </option>
      </select>
      <button class="add-hotel-btn" (click)="addNewHotel()">Add New Hotel</button>
    </div>
  `,
  styles: [`
    .hotel-selector {
      margin: 1rem;
      display: flex;
      gap: 1rem;
    }
    .form-select {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1rem;
    }
    .add-hotel-btn {
      padding: 0.5rem 1rem;
      background: #0d6efd;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .add-hotel-btn:hover {
      background: #0b5ed7;
    }
  `]
})
export class HotelSelectorComponent implements OnInit {
  hotels: Hotel[] = [];
  selectedHotel: Hotel | null = null;

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.hotels = this.hotelService.getHotels();
    this.hotelService.getSelectedHotel().subscribe(
      hotel => this.selectedHotel = hotel
    );
  }

  onHotelChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const hotelId = parseInt(select.value, 10);
    const selectedHotel = this.hotels.find(h => h.id === hotelId);
    if (selectedHotel) {
      this.hotelService.setSelectedHotel(selectedHotel);
    }
  }

  addNewHotel(): void {
    const name = prompt('Enter hotel name:');
    if (name) {
      this.hotelService.addHotel(name);
      this.hotels = this.hotelService.getHotels();
    }
  }
}