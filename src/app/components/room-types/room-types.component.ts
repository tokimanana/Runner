// room-types.component.ts
import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RoomConfigurationService } from '../../services/room-configuration.service';
import { Hotel, RoomType, RoomCategory } from '../../models/types';
import { ModalComponent } from '../modal/modal.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-room-types',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    ModalComponent
  ],
  templateUrl: './room-types.component.html',
  styleUrls: ['./room-types.component.scss']
})
export class RoomTypesComponent implements OnInit, OnDestroy, OnChanges {
  @Input() hotel!: Hotel;
  rooms: RoomType[] = [];
  showRoomForm = false;
  editingRoom: RoomType | null = null;
  roomCategories = Object.values(RoomCategory);
  private roomSubscription?: Subscription;
  roomForm: FormGroup;
  
  constructor(
    private roomConfigService: RoomConfigurationService,
    private fb: FormBuilder
  ) {
    this.roomForm = this.initializeForm();
  }

  private initializeForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      description: [''],
      maxOccupancy: this.fb.group({
        adults: [2, [Validators.required, Validators.min(1)]],
        children: [0, [Validators.required, Validators.min(0)]],
        infants: [0, [Validators.required, Validators.min(0)]]
      }),
      baseOccupancy: [2, [Validators.required, Validators.min(1)]],
      size: [0, [Validators.required, Validators.min(0)]],
      amenities: [[]],
      status: ['active']
    });
  }

  ngOnInit() {
    if (this.hotel) {
      this.loadRooms();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['hotel'] && changes['hotel'].currentValue) {
      this.loadRooms();
    }
  }

  ngOnDestroy() {
    this.roomSubscription?.unsubscribe();
  }

  private loadRooms() {
    if (!this.hotel) return;
    
    this.roomSubscription?.unsubscribe();
    this.roomSubscription = this.roomConfigService
      .getRooms(this.hotel.id)
      .subscribe(rooms => {
        this.rooms = rooms;
      });
  }

  addNewRoom() {
    this.editingRoom = null;
    this.initializeForm();
    this.showRoomForm = true;
  }

  editRoom(room: RoomType) {
    this.editingRoom = room;
    this.showRoomForm = true;
    
    this.roomForm.patchValue({
      name: room.name,
      category: room.category,
      description: room.description,
      size: room.size,
      maxOccupancy: {
        adults: room.maxOccupancy.adults,
        children: room.maxOccupancy.children,
        infants: room.maxOccupancy.infants
      },
      baseOccupancy: room.baseOccupancy,
      amenities: room.amenities || [],
      status: room.status
    });
  }

  async deleteRoom(room: RoomType) {
    if (confirm('Are you sure you want to delete this room type?')) {
      try {
        await this.roomConfigService.deleteRoom(this.hotel.id, room.id);
        await this.loadRooms();
      } catch (error) {
        console.error('Error deleting room:', error);
        // Handle error (show message to user)
      }
    }
  }

  private confirmDelete(): Promise<boolean> {
    return new Promise(resolve => {
      const result = window.confirm('Are you sure you want to delete this room type? This action cannot be undone.');
      resolve(result);
    });
  }

  // Helper methods for amenities
  addAmenity(amenity: string) {
    const currentAmenities = this.roomForm.get('amenities')?.value || [];
    if (amenity.trim() && !currentAmenities.includes(amenity.trim())) {
      this.roomForm.patchValue({
        amenities: [...currentAmenities, amenity.trim()]
      });
    }
  }

  removeAmenity(amenity: string) {
    const currentAmenities = this.roomForm.get('amenities')?.value || [];
    this.roomForm.patchValue({
      amenities: currentAmenities.filter((a: string) => a !== amenity)
    });
  }
  async saveRoom() {
    if (!this.hotel || !this.roomForm.valid) return;

    try {
      const roomData = this.roomForm.value;
      
      if (this.editingRoom) {
        await this.roomConfigService.updateRoom(this.hotel.id, {
          ...roomData,
          id: this.editingRoom.id,
          hotelId: this.hotel.id
        });
      } else {
        await this.roomConfigService.addRoom(this.hotel.id, {
          ...roomData,
          hotelId: this.hotel.id
        });
      }

      this.resetForm();
      await this.loadRooms();
    } catch (error) {
      console.error('Error saving room:', error);
      // Handle error (show message to user)
    }
  }

  resetForm() {
    this.editingRoom = null;
    this.roomForm.reset({
      maxOccupancy: {
        adults: 2,
        children: 0,
        infants: 0
      },
      baseOccupancy: 2,
      status: 'active'
    });
  }

  cancelEdit() {
    this.showRoomForm = false;
    this.editingRoom = null;
    this.initializeForm();
  }

  getFormErrorMessage(controlName: string): string {
    const control = this.roomForm.get(controlName);
    if (control?.hasError('required')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} is required`;
    }
    if (control?.hasError('min')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must be at least ${control.errors?.['min'].min}`;
    }
    if (control?.hasError('minlength')) {
      return `${controlName.charAt(0).toUpperCase() + controlName.slice(1)} must be at least ${control.errors?.['requiredLength'].characters}`;
    }
    return '';
  }
}
