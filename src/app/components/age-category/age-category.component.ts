import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HotelService } from '../../services/hotel.service';
import { AgeCategory, Hotel } from '../../models/types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-age-category',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  templateUrl: './age-category.component.html',
  styleUrls: ['./age-category.component.css']
})
export class AgeCategoryComponent implements OnInit, OnDestroy {
  @Input() hotel!: Hotel;
  
  // Form and UI state
  categoryForm: FormGroup;
  showCategoryForm = false;
  editingCategory: AgeCategory | null = null;
  modalMessage = '';
  modalError = false;
  categories: AgeCategory[] = [];

  // Category types with icons
  categoryTypes = [
    { value: 'adult', label: 'Adult', icon: 'person' },
    { value: 'teen', label: 'Teen', icon: 'face' },
    { value: 'child', label: 'Child', icon: 'child_care' },
    { value: 'infant', label: 'Infant', icon: 'baby_changing_station' }
  ];

  private subscriptions: Subscription[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private hotelService: HotelService
  ) {
    this.categoryForm = this.createCategoryForm();
  }

  getCategoryIcon(type: string): string {
    const categoryType = this.categoryTypes.find(ct => ct.value === type);
    return categoryType?.icon || 'category';
  }

  ngOnInit(): void {
    // Subscribe to selected hotel changes
    this.subscriptions.push(
      this.hotelService.selectedHotel$.subscribe(hotel => {
        if (hotel) {
          this.categories = hotel.ageCategories || [];
          console.log('Loaded age categories for hotel:', hotel.name);
        } else {
          this.categories = [];
          console.log('No hotel selected, cleared age categories');
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private createCategoryForm(): FormGroup {
    return this.formBuilder.group({
      type: ['adult', Validators.required],
      label: ['', Validators.required],
      minAge: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      maxAge: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      defaultRate: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      isActive: [true]
    }, {
      validators: this.ageRangeValidator
    });
  }

  private ageRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const minAge = group.get('minAge')?.value;
    const maxAge = group.get('maxAge')?.value;
    
    if (minAge === null || maxAge === null) {
      return null;
    }

    return minAge >= maxAge ? { invalidAgeRange: true } : null;
  }

  private loadCategories(): void {
    if (!this.hotel?.id) return;

    this.categories = this.hotel.ageCategories || [];
  }

  addNewCategory(): void {
    this.editingCategory = null;
    this.categoryForm.reset({
      type: 'adult',
      isActive: true,
      defaultRate: 0,
      minAge: 0,
      maxAge: 0
    });
    this.showCategoryForm = true;
  }

  editCategory(category: AgeCategory): void {
    this.editingCategory = category;
    this.categoryForm.patchValue({
      type: category.type,
      label: category.label,
      minAge: category.minAge,
      maxAge: category.maxAge,
      defaultRate: category.defaultRate,
      isActive: category.isActive ?? true
    });
    this.showCategoryForm = true;
  }

  deleteCategory(category: AgeCategory): void {
    // Get current hotel using the public method
    this.hotelService.getSelectedHotel().subscribe(currentHotel => {
      if (!currentHotel) {
        this.showError('No hotel selected');
        return;
      }

      const updatedCategories = this.categories.filter(c => c.id !== category.id);
      
      this.hotelService.updateHotelAgeCategories(currentHotel.id, updatedCategories)
        .subscribe({
          next: (updatedHotel) => {
            this.categories = updatedHotel.ageCategories || [];
            this.showSuccess('Age category deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting age category:', error);
            this.showError('Failed to delete age category');
          }
        });
    });
  }

  saveCategory(): void {
    if (this.categoryForm.valid) {
      const formValue = this.categoryForm.value;
      const category: AgeCategory = {
        id: this.editingCategory ? this.editingCategory.id : this.categories.length + 1,
        name: formValue.name,
        type: formValue.type,
        label: formValue.name,
        minAge: formValue.minAge,
        maxAge: formValue.maxAge,
        description: formValue.description,
        defaultRate: 0,
        isActive: formValue.isActive
      };

      // Get current hotel using the public method
      this.hotelService.getSelectedHotel().subscribe(currentHotel => {
        if (!currentHotel) {
          this.showError('No hotel selected');
          return;
        }

        // Update categories array
        let updatedCategories: AgeCategory[];
        if (this.editingCategory) {
          updatedCategories = this.categories.map(c => 
            c.id === category.id ? category : c
          );
        } else {
          updatedCategories = [...this.categories, category];
        }

        // Update hotel's age categories
        this.hotelService.updateHotelAgeCategories(currentHotel.id, updatedCategories)
          .subscribe({
            next: (updatedHotel) => {
              this.categories = updatedHotel.ageCategories || [];
              this.showSuccess(`Age category ${this.editingCategory ? 'updated' : 'added'} successfully`);
              this.resetForm();
            },
            error: (error) => {
              console.error('Error saving age category:', error);
              this.showError('Failed to save age category');
            }
          });
      });
    } else {
      this.showError('Please fill in all required fields correctly');
    }
  }

  cancelCategoryEdit(): void {
    this.showCategoryForm = false;
    this.editingCategory = null;
    this.categoryForm.reset();
    this.modalMessage = '';
  }

  onTypeChange(): void {
    // Add any specific logic needed when type changes
  }

  private getNextCategoryId(): number {
    return this.hotel?.ageCategories?.length ? 
      Math.max(...this.hotel.ageCategories.map(c => c.id)) + 1 : 1;
  }

  private showSuccess(message: string): void {
    this.modalError = false;
    this.modalMessage = message;
    setTimeout(() => this.modalMessage = '', 3000);
  }

  private showError(message: string): void {
    this.modalError = true;
    this.modalMessage = message;
    setTimeout(() => this.modalMessage = '', 3000);
  }

  private resetForm(): void {
    this.categoryForm.reset({
      type: 'adult',
      isActive: true,
      defaultRate: 0,
      minAge: 0,
      maxAge: 0
    });
  }
}
