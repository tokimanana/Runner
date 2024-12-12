// src/app/services/base-data.service.ts

import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { MockApiService } from './mock/mock-api.service';

@Injectable({
  providedIn: 'root'
})

export abstract class BaseDataService<T> {
  protected dataSubject: BehaviorSubject<T[]>;
  protected loadingSubject = new BehaviorSubject<boolean>(false);
  protected selectedItemSubject: BehaviorSubject<T | null>;
  protected errorSubject = new BehaviorSubject<string | null>(null);

  

  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  constructor() {
    this.dataSubject = new BehaviorSubject<T[]>([]);
    this.selectedItemSubject = new BehaviorSubject<T | null>(null);
  }

  protected async loadData(fetchFunction: () => Promise<T[]>): Promise<void> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      const data = await fetchFunction();
      this.dataSubject.next(data);
    } catch (error) {
      console.error('Error loading data:', error);
      this.errorSubject.next(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      this.loadingSubject.next(false);
    }
  }


  protected async updateData<U extends Partial<T>>(
    id: number,
    updateFunction: (id: number, data: U) => Promise<T>,
    updateData: U
  ): Promise<T> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      
      const updatedItem = await updateFunction(id, updateData);
      const currentData = this.dataSubject.value;
      const index = currentData.findIndex((item: any) => item.id === id);
      
      if (index !== -1) {
        currentData[index] = updatedItem;
        this.dataSubject.next([...currentData]);
      }
      
      return updatedItem;
    } catch (error) {
      console.error('Error updating data:', error);
      this.errorSubject.next(error instanceof Error ? error.message : 'An error occurred');
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  protected async addData(
    addFunction: (data: Omit<T, 'id'>) => Promise<T>,
    newData: Omit<T, 'id'>
  ): Promise<T> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      
      const addedItem = await addFunction(newData);
      const currentData = this.dataSubject.value;
      this.dataSubject.next([...currentData, addedItem]);
      
      return addedItem;
    } catch (error) {
      console.error('Error adding data:', error);
      this.errorSubject.next(error instanceof Error ? error.message : 'An error occurred');
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  protected async deleteData(
    deleteFunction: (id: number) => Promise<void>,
    id: number
  ): Promise<void> {
    try {
      this.loadingSubject.next(true);
      this.errorSubject.next(null);
      
      await deleteFunction(id);
      const currentData = this.dataSubject.value;
      this.dataSubject.next(currentData.filter((item: any) => item.id !== id));
    } catch (error) {
      console.error('Error deleting data:', error);
      this.errorSubject.next(error instanceof Error ? error.message : 'An error occurred');
      throw error;
    } finally {
      this.loadingSubject.next(false);
    }
  }

  getData(): Observable<T[]> {
    return this.dataSubject.asObservable();
  }

  getSelected(): Observable<T | null> {
    return this.selectedItemSubject.asObservable();
  }

  setSelected(item: T | null): void {
    this.selectedItemSubject.next(item);
  }

  getById(id: number): T | undefined {
    return this.dataSubject.value.find((item: any) => item.id === id);
  }

  protected clearError() {
    this.errorSubject.next(null);
  }

  protected clearData() {
    this.dataSubject.next([]);
    this.clearError();
  }

  protected handleError(message: string, error?: any): void {
    console.error('Operation failed:', message, error);
    this.errorSubject.next(error instanceof Error ? error.message : 'An error occurred');
  }
  
}
