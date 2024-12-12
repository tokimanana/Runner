// src/app/services/room-configuration.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, from } from 'rxjs';
import { RoomType } from '../models/types';
import { MockApiService } from './mock/mock-api.service';
import { BaseDataService } from './base-data.service';

@Injectable({
  providedIn: 'root'
})
export class RoomConfigurationService extends BaseDataService<RoomType> {
  private roomsSubject = new BehaviorSubject<RoomType[]>([]);
  rooms$ = this.roomsSubject.asObservable();

  constructor() {
    super();
  }

  protected override handleError(error: any): never {
    console.error('Room configuration error:', error);
    throw error;
  }

  // Get rooms for a specific hotel
  getRooms(hotelId: number): Observable<RoomType[]> {
    return from(MockApiService.getRoomsByHotelId(hotelId)).pipe(
      catchError(error => {
        this.handleError('Error getting rooms: ' + error);
        return [];
      })
    );
  }

  // Add a new room type
  async addRoom(hotelId: number, room: Omit<RoomType, 'id'>): Promise<RoomType> {
    try {
      const newRoom = await MockApiService.createRoom(hotelId, room);
      const currentRooms = await MockApiService.getRoomsByHotelId(hotelId);
      this.roomsSubject.next(currentRooms);
      return newRoom;
    } catch (error) {
      console.error('Error adding room:', error);
      throw error;
    }
  }

  // Update an existing room type
  async updateRoom(hotelId: number, room: RoomType): Promise<RoomType> {
    try {
      const updatedRoom = await MockApiService.updateRoom(hotelId, room.id, room);
      const currentRooms = await MockApiService.getRoomsByHotelId(hotelId);
      this.roomsSubject.next(currentRooms);
      return updatedRoom;
    } catch (error) {
      console.error('Error updating room:', error);
      throw error;
    }
  }

  // Delete a room type
  async deleteRoom(hotelId: number, roomId: number): Promise<boolean> {
    try {
      await MockApiService.deleteRoom(hotelId, roomId);
      const currentRooms = await MockApiService.getRoomsByHotelId(hotelId);
      this.roomsSubject.next(currentRooms);
      return true;
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  }

  // Get room by ID
  getRoomById(hotelId: number, roomId: number): Promise<RoomType | undefined> {
    return MockApiService.getRoomById(hotelId, roomId);
  }

  // Validate room configuration
  validateRoomConfiguration(room: Partial<RoomType>): boolean {
    const maxOccupancyAdults = room.maxOccupancy?.adults ?? 0;
    
    const isValid = !!(
      room.category &&
      room.name?.trim() &&
      room.maxOccupancy &&
      maxOccupancyAdults > 0
    );

    if (!isValid) {
      console.warn('Room validation failed:', {
        hasCategory: !!room.category,
        hasName: !!room.name?.trim(),
        hasMaxOccupancy: !!room.maxOccupancy,
        hasValidAdults: maxOccupancyAdults > 0,
        currentAdults: maxOccupancyAdults
      });
    }

    return isValid;
  }

  // Get total room count for hotel
  async getRoomCount(hotelId: number): Promise<number> {
    const rooms = await MockApiService.getRoomsByHotelId(hotelId);
    return rooms.length;
  }

  // Reset rooms to initial state
  async resetRooms(): Promise<void> {
    try {
      await MockApiService.resetStorage();
      const rooms = await MockApiService.getRooms();
      this.roomsSubject.next(rooms);
    } catch (error) {
      console.error('Error resetting rooms:', error);
      throw error;
    }
  }
}
