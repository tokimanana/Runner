import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../services/hotel.service';
import { Hotel, RoomType } from '../../models/types';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-room-types',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './room-types.component.html',
  styleUrls: ['./room-types.component.css']
})
export class RoomTypesComponent implements OnInit, OnDestroy, OnChanges {
  @Input() hotel: Hotel | null = null;
  rooms: RoomType[] = [];
  showRoomForm = false;
  editingRoom: RoomType | null = null;
  newAmenity = '';
  
  roomForm: Omit<RoomType, 'id'> = {
    type: '',
    name: '',
    description: '',
    location: '',
    maxOccupancy: {
      adults: 0,
      children: 0,
      infants: 0
    },
    amenities: [],
    size: 0,
    images: [],
    bedConfiguration: []
  };

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    if (this.hotel) {
      this.loadRooms(this.hotel);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['hotel']) {
      const hotel = changes['hotel'].currentValue;
      if (hotel) {
        this.loadRooms(hotel);
      } else {
        this.resetRooms();
      }
    }
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  private loadRooms(hotel: Hotel) {
    this.hotelService.currentRooms$.subscribe(rooms => {
      this.rooms = rooms;
    });
  }

  private resetRooms() {
    this.rooms = [];
  }

  addNewRoom() {
    this.editingRoom = null;
    this.resetRoomForm();
    this.showRoomForm = true;
  }

  editRoom(room: RoomType) {
    this.editingRoom = room;
    this.roomForm = {
      type: room.type || '',
      name: room.name || '',
      description: room.description || '',
      location: room.location || '',
      maxOccupancy: {
        adults: room.maxOccupancy?.adults || 0,
        children: room.maxOccupancy?.children || 0,
        infants: room.maxOccupancy?.infants || 0
      },
      amenities: Array.isArray(room.amenities) ? [...room.amenities] : [],
      size: room.size || 0,
      images: Array.isArray(room.images) ? [...room.images] : [],
      bedConfiguration: Array.isArray(room.bedConfiguration) ? [...room.bedConfiguration] : []
    };
    this.showRoomForm = true;
  }
  
  deleteRoom(room: RoomType) {
    if (confirm('Are you sure you want to delete this room type?')) {
      this.hotelService.deleteRoom(this.hotel!.id, room.id);
      this.rooms = this.hotelService.getRooms(this.hotel!.id);
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
      this.hotelService.updateRoom(this.hotel!.id, {
        ...this.roomForm,
        id: this.editingRoom.id
      });
    } else {
      this.hotelService.addRoom(this.hotel!.id, this.roomForm);
    }
    
    this.rooms = this.hotelService.getRooms(this.hotel!.id);
    this.showRoomForm = false;
    this.editingRoom = null;
  }

  cancelEdit() {
    this.showRoomForm = false;
    this.editingRoom = null;
  }

  resetRoomForm() {
    this.roomForm = {
      type: '',
      name: '',
      description: '',
      location: '',
      maxOccupancy: {
        adults: 0,
        children: 0,
        infants: 0
      },
      amenities: [],
      size: 0,
      images: [],
      bedConfiguration: []
    };
  }
}