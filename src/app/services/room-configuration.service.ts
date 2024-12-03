import { sampleData } from './../../data';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { RoomType } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class RoomConfigurationService {
  private roomsMap = new Map<number, RoomType[]>();
  private currentRooms = new BehaviorSubject<RoomType[]>([]);

  constructor() {
    this.initializeRoomsFromSampleData();
  }

  private initializeRoomsFromSampleData(): void {
    if (sampleData.hotels) {
      sampleData.hotels.forEach(hotel => {
        if (hotel.rooms) {
          this.roomsMap.set(hotel.id, [...hotel.rooms]);
        }
      });
    }
  }

  // Get rooms for a specific hotel
  getRooms(hotelId: number): Observable<RoomType[]> {
    const rooms = this.roomsMap.get(hotelId) || [];
    this.currentRooms.next(rooms);
    return this.currentRooms.asObservable();
  }

  // Add a new room type
  addRoom(hotelId: number, room: Omit<RoomType, 'id'>): void {
    const rooms = this.roomsMap.get(hotelId) || [];
    const newRoom: RoomType = {
      ...room,
      id: this.generateRoomId(rooms)
    };
    rooms.push(newRoom);
    this.roomsMap.set(hotelId, rooms);
    this.currentRooms.next(rooms);
    console.log(`Added new room for hotel ${hotelId}:`, newRoom);
  }

  // Update an existing room type
  updateRoom(hotelId: number, room: RoomType): void {
    const rooms = this.roomsMap.get(hotelId) || [];
    const index = rooms.findIndex(r => r.id === room.id);
    if (index !== -1) {
      rooms[index] = room;
      this.roomsMap.set(hotelId, rooms);
      this.currentRooms.next(rooms);
      console.log(`Updated room for hotel ${hotelId}:`, room);
    } else {
      console.warn(`Room with id ${room.id} not found for hotel ${hotelId}`);
    }
  }

  // Delete a room type
  deleteRoom(hotelId: number, roomId: number): void {
    const rooms = this.roomsMap.get(hotelId) || [];
    const filteredRooms = rooms.filter(r => r.id !== roomId);
    if (filteredRooms.length === rooms.length) {
      console.warn(`Room with id ${roomId} not found for hotel ${hotelId}`);
      return;
    }
    this.roomsMap.set(hotelId, filteredRooms);
    this.currentRooms.next(filteredRooms);
    console.log(`Deleted room ${roomId} from hotel ${hotelId}`);
  }

  // Initialize rooms for a hotel
  initializeRooms(hotelId: number, rooms: RoomType[]): void {
    this.roomsMap.set(hotelId, [...rooms]);
    this.currentRooms.next(rooms);
    console.log(`Initialized ${rooms.length} rooms for hotel ${hotelId}`);
  }

  // Validate room configuration
  validateRoomConfiguration(room: Partial<RoomType>): boolean {
    const maxOccupancyAdults = room.maxOccupancy?.adults ?? 0;
    
    const isValid = !!(
      room.type?.trim() &&
      room.name?.trim() &&
      room.maxOccupancy &&
      maxOccupancyAdults > 0
    );

    if (!isValid) {
      console.warn('Room validation failed:', {
        hasType: !!room.type?.trim(),
        hasName: !!room.name?.trim(),
        hasMaxOccupancy: !!room.maxOccupancy,
        hasValidAdults: maxOccupancyAdults > 0,
        currentAdults: maxOccupancyAdults
      });
    }

    return isValid;
  }

  // Get room by ID
  getRoomById(hotelId: number, roomId: number): RoomType | undefined {
    const rooms = this.roomsMap.get(hotelId) || [];
    return rooms.find(room => room.id === roomId);
  }

  // Get total room count for hotel
  getRoomCount(hotelId: number): number {
    return this.roomsMap.get(hotelId)?.length || 0;
  }

  // Private helper methods
  private generateRoomId(existingRooms: RoomType[]): number {
    const maxId = Math.max(...existingRooms.map(room => room.id), 0);
    return maxId + 1;
  }
}
