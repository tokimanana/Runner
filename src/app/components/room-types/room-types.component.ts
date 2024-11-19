import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../services/hotel.service';
import { Hotel, Room } from '../../models/types';

@Component({
  selector: 'app-room-types',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="room-types-container">
      <div class="header-actions">
        <h3>Room Types</h3>
        <button (click)="addNewRoom()" class="add-btn">
          <i class="material-icons">add</i> Add Room Type
        </button>
      </div>

      <div class="room-list">
        <div *ngFor="let room of rooms" class="room-card">
          <div class="room-header">
            <h4>{{ room.type }}</h4>
            <div class="actions">
              <button (click)="editRoom(room)" class="edit-btn">
                <i class="material-icons">edit</i>
              </button>
              <button (click)="deleteRoom(room)" class="delete-btn">
                <i class="material-icons">delete</i>
              </button>
            </div>
          </div>

          <div class="room-details">
            <p><strong>Description:</strong> {{ room.description }}</p>
            <p><strong>Location:</strong> {{ room.location }}</p>
            <div class="occupancy">
              <p><strong>Maximum Occupancy:</strong></p>
              <ul>
                <li>Adults: {{ room.maxOccupancy.adults }}</li>
                <li>Children: {{ room.maxOccupancy.children }}</li>
                <li>Infants: {{ room.maxOccupancy.infants }}</li>
              </ul>
            </div>
            <div class="amenities">
              <p><strong>Amenities:</strong></p>
              <div class="amenity-tags">
                <span *ngFor="let amenity of room.amenities" class="amenity-tag">
                  {{ amenity }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Room Form Modal -->
      <div *ngIf="showRoomForm" class="modal">
        <div class="modal-content">
          <h3>{{ editingRoom ? 'Edit Room Type' : 'Add New Room Type' }}</h3>
          
          <div class="form-group">
            <label>Room Type Name:</label>
            <input type="text" [(ngModel)]="roomForm.type" class="form-input">
          </div>

          <div class="form-group">
            <label>Description:</label>
            <textarea [(ngModel)]="roomForm.description" rows="3" class="form-input"></textarea>
          </div>

          <div class="form-group">
            <label>Location:</label>
            <input type="text" [(ngModel)]="roomForm.location" class="form-input">
          </div>

          <div class="form-group">
            <label>Maximum Occupancy:</label>
            <div class="occupancy-inputs">
              <div>
                <label>Adults:</label>
                <input type="number" [(ngModel)]="roomForm.maxOccupancy.adults" min="1" class="form-input">
              </div>
              <div>
                <label>Children:</label>
                <input type="number" [(ngModel)]="roomForm.maxOccupancy.children" min="0" class="form-input">
              </div>
              <div>
                <label>Infants:</label>
                <input type="number" [(ngModel)]="roomForm.maxOccupancy.infants" min="0" class="form-input">
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Amenities:</label>
            <div class="amenity-input">
              <input 
                type="text" 
                [(ngModel)]="newAmenity"
                (keyup.enter)="addAmenity()"
                placeholder="Type and press Enter"
                class="form-input"
              >
              <button (click)="addAmenity()" class="add-amenity-btn">Add</button>
            </div>
            <div class="amenity-tags">
              <span *ngFor="let amenity of roomForm.amenities" class="amenity-tag">
                {{ amenity }}
                <i class="material-icons" (click)="removeAmenity(amenity)">close</i>
              </span>
            </div>
          </div>

          <div class="modal-actions">
            <button (click)="saveRoom()" class="save-btn">Save</button>
            <button (click)="cancelEdit()" class="cancel-btn">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .room-types-container {
      padding: 1rem;
    }

    .header-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .room-list {
      display: grid;
      gap: 1.5rem;
    }

    .room-card {
      background: gainsboro;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 1.5rem;
    }

    .room-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .room-details {
      display: grid;
      gap: 1rem;
    }

    .occupancy ul {
      list-style: none;
      padding-left: 1rem;
    }

    .amenity-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .amenity-tag {
      background: #e9ecef;
      padding: 0.25rem 0.75rem;
      border-radius: 16px;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .amenity-tag i {
      font-size: 16px;
      cursor: pointer;
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

    .occupancy-inputs {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .amenity-input {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .add-amenity-btn {
      padding: 0.5rem 1rem;
      background: #0d6efd;
      color: white;
      border: none;
      border-radius: 4px;
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
export class RoomTypesComponent implements OnInit {
  @Input() hotel!: Hotel;
  rooms: Room[] = [];
  showRoomForm = false;
  editingRoom: Room | null = null;
  newAmenity = '';
  
  roomForm: Omit<Room, 'id'> = {
    type: '',
    description: '',
    location: '',
    maxOccupancy: {
      adults: 1,
      children: 0,
      infants: 0
    },
    amenities: []
  };

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    if (this.hotel) {
      this.rooms = this.hotelService.getRooms(this.hotel.id);
    }
  }

  addNewRoom() {
    this.editingRoom = null;
    this.roomForm = {
      type: '',
      description: '',
      location: '',
      maxOccupancy: {
        adults: 1,
        children: 0,
        infants: 0
      },
      amenities: []
    };
    this.showRoomForm = true;
  }

  editRoom(room: Room) {
    this.editingRoom = room;
    this.roomForm = {
      type: room.type || '',
      description: room.description || '',
      location: room.location || '',
      maxOccupancy: {
        adults: room.maxOccupancy?.adults || 1,
        children: room.maxOccupancy?.children || 0,
        infants: room.maxOccupancy?.infants || 0
      },
      amenities: Array.isArray(room.amenities) ? [...room.amenities] : []
    };
    this.showRoomForm = true;
  }
  
  

  deleteRoom(room: Room) {
    if (confirm('Are you sure you want to delete this room type?')) {
      this.hotelService.deleteRoom(this.hotel.id, room.id);
      this.rooms = this.hotelService.getRooms(this.hotel.id);
    }
  }

  addAmenity() {
    if (this.newAmenity.trim() && !this.roomForm.amenities.includes(this.newAmenity.trim())) {
      this.roomForm.amenities.push(this.newAmenity.trim());
      this.newAmenity = '';
    }
  }

  removeAmenity(amenity: string) {
    this.roomForm.amenities = this.roomForm.amenities.filter(a => a !== amenity);
  }

  saveRoom() {
    if (this.editingRoom) {
      this.hotelService.updateRoom(this.hotel.id, {
        ...this.roomForm,
        id: this.editingRoom.id
      });
    } else {
      this.hotelService.addRoom(this.hotel.id, this.roomForm);
    }
    
    this.rooms = this.hotelService.getRooms(this.hotel.id);
    this.showRoomForm = false;
    this.editingRoom = null;
  }

  cancelEdit() {
    this.showRoomForm = false;
    this.editingRoom = null;
  }
}