import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomConfigurationService } from '../../services/room-configuration.service';
import { Hotel, RoomType } from '../../models/types';
import { ModalComponent } from '../modal/modal.component';
import { Subscription } from 'rxjs';

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
  private roomSubscription?: Subscription;
  
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

  constructor(private roomConfigService: RoomConfigurationService) {}

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
    if (this.roomSubscription) {
      this.roomSubscription.unsubscribe();
    }
  }

  private loadRooms(hotel: Hotel) {
    this.roomSubscription?.unsubscribe();
    this.roomSubscription = this.roomConfigService.getRooms(hotel.id)
      .subscribe(rooms => {
        this.rooms = rooms;
        console.log(`Loaded ${rooms.length} rooms for hotel ${hotel.id}`);
      });
  }

  private resetRooms() {
    this.rooms = [];
    console.log('Reset rooms');
  }

  addNewRoom() {
    this.editingRoom = null;
    this.resetRoomForm();
    this.showRoomForm = true;
    console.log('Preparing to add new room');
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
    console.log('Editing room:', room.id);
  }
  
  deleteRoom(room: RoomType) {
    if (confirm('Are you sure you want to delete this room type?')) {
      this.roomConfigService.deleteRoom(this.hotel!.id, room.id);
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
    if (!this.hotel) return;
    
    if (!this.roomConfigService.validateRoomConfiguration(this.roomForm)) {
      alert('Please fill in all required fields correctly. Room must have a name, type, and at least one adult occupancy.');
      return;
    }

    if (this.editingRoom) {
      this.roomConfigService.updateRoom(this.hotel.id, {
        ...this.roomForm,
        id: this.editingRoom.id
      });
    } else {
      this.roomConfigService.addRoom(this.hotel.id, this.roomForm);
    }
    
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