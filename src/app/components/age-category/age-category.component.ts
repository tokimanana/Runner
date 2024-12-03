import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HotelService } from '../../services/hotel.service';
import { AgeCategory, Hotel } from '../../models/types';
import { Subscription } from 'rxjs';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-age-category',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatCheckboxModule,
    MatTooltipModule,
    ModalComponent
  ],
  templateUrl: './age-category.component.html',
  styleUrls: ['./age-category.component.css']
})
export class AgeCategoryComponent implements OnInit, OnDestroy {
  @Input() hotel!: Hotel;
  ageCategories: AgeCategory[] = [];
  showEditor = false;
  selectedCategory: AgeCategory | null = null;
  newCategory: Partial<AgeCategory> = {};
  private subscriptions: Subscription[] = [];

  constructor(private hotelService: HotelService) {
    this.subscriptions.push(
      this.hotelService.getAgeCategories().subscribe(categories => {
        this.ageCategories = categories;
      })
    );
  }

  ngOnInit(): void {
    this.loadAgeCategories();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadAgeCategories(): void {
    this.hotelService.getAgeCategories().subscribe(
      categories => {
        this.ageCategories = categories;
      },
      error => {
        console.error('Error loading age categories:', error);
        this.ageCategories = [];
      }
    );
  }

  openEditor(category?: AgeCategory): void {
    if (category) {
      this.selectedCategory = category;
      this.newCategory = { ...category };
    } else {
      this.selectedCategory = null;
      this.newCategory = {
        name: '',
        type: 'adult',
        label: '',
        minAge: undefined,
        maxAge: undefined,
        defaultRate: 0,
        description: '',
        isActive: true
      };
    }
    this.showEditor = true;
  }

  closeEditor(): void {
    this.showEditor = false;
    this.selectedCategory = null;
    this.newCategory = {};
  }

  saveCategory(): void {
    if (!this.newCategory.name || this.newCategory.minAge === undefined || this.newCategory.maxAge === undefined) {
      alert('Name, minimum age, and maximum age are required');
      return;
    }

    if (this.newCategory.minAge > this.newCategory.maxAge) {
      alert('Minimum age cannot be greater than maximum age');
      return;
    }

    try {
      const categoryData: AgeCategory = {
        id: this.selectedCategory?.id || Math.max(0, ...this.ageCategories.map(c => c.id)) + 1,
        name: this.newCategory.name,
        type: this.newCategory.type || 'adult',
        label: this.newCategory.label || this.newCategory.name,
        minAge: this.newCategory.minAge,
        maxAge: this.newCategory.maxAge,
        defaultRate: this.newCategory.defaultRate || 0,
        description: this.newCategory.description || '',
        isActive: this.newCategory.isActive ?? true
      };

      if (this.selectedCategory) {
        this.hotelService.updateAgeCategory(categoryData);
      } else {
        this.hotelService.addAgeCategory(categoryData);
      }

      this.closeEditor();
      this.loadAgeCategories();
    } catch (error) {
      console.error('Failed to save age category:', error);
      alert(error instanceof Error ? error.message : 'Failed to save age category');
    }
  }

  deleteCategory(category: AgeCategory): void {
    if (confirm(`Are you sure you want to delete ${category.name}?`)) {
      try {
        this.hotelService.deleteAgeCategory(category.id);
        this.loadAgeCategories();
      } catch (error) {
        console.error('Failed to delete age category:', error);
        alert(error instanceof Error ? error.message : 'Failed to delete age category');
      }
    }
  }
}
