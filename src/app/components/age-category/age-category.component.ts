// src/app/components/age-category/age-category.component.ts
import { Component, OnInit, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
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
  styleUrls: ['./age-category.component.scss']
})
export class AgeCategoryComponent implements OnInit {
  @Input() set hotel(value: Hotel) {
    if (value) {
      this.selectedHotel.set(value);
      this.categories.set(value.ageCategories || []);
    }
  }

  // Signals
  selectedHotel = signal<Hotel | null>(null);
  categories = signal<AgeCategory[]>([]);
  showCategoryForm = signal(false);
  editingCategory = signal<AgeCategory | null>(null);
  modalMessage = signal<string>('');
  modalError = signal(false);

  // Computed values
  sortedCategories = computed(() => 
    [...this.categories()].sort((a, b) => a.minAge - b.minAge)
  );

  // Form and static data
  categoryForm: FormGroup;
  categoryTypes = [
    { value: 'adult', label: 'Adult', icon: 'person' },
    { value: 'teen', label: 'Teen', icon: 'face' },
    { value: 'child', label: 'Child', icon: 'child_care' },
    { value: 'infant', label: 'Infant', icon: 'baby_changing_station' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private hotelService: HotelService
  ) {
    this.categoryForm = this.createCategoryForm();
  }

  ngOnInit(): void {
    // Initial setup if needed
  }

  private createCategoryForm(): FormGroup {
    return this.formBuilder.group({
      type: ['adult', Validators.required],
      name: ['', Validators.required],
      minAge: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      maxAge: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      isActive: [true]
    }, {
      validators: this.ageRangeValidator.bind(this)  // Bind the validator to the component
    });
  }

  async saveCategory(): Promise<void> {
    if (this.categoryForm.valid && this.selectedHotel()) {
      const formValue = this.categoryForm.value;
      const category: AgeCategory = {
        id: this.editingCategory()?.id || this.getNextCategoryId(),
        name: formValue.name,
        type: formValue.type,
        label: this.generateAgeLabel(formValue),
        minAge: formValue.minAge,
        maxAge: formValue.maxAge,
        description: this.generateAgeDescription(formValue),
        defaultRate: 0,
        isActive: formValue.isActive
      };

      try {
        const hotel = this.selectedHotel();
        if (!hotel) return;

        const updatedCategories = this.editingCategory() 
          ? this.categories().map(c => c.id === category.id ? category : c)
          : [...this.categories(), category];

        const updatedHotel = await this.hotelService.updateHotelAgeCategories(
          hotel.id, 
          updatedCategories
        );

        this.categories.set(updatedHotel.ageCategories || []);
        this.showCategoryForm.set(false);
        this.editingCategory.set(null);
        this.showSuccess('Age category saved successfully');
      } catch (error) {
        this.showError('Failed to save age category');
        console.error(error);
      }
    }
  }

  deleteCategory(category: AgeCategory): void {
    const hotel = this.selectedHotel();
    if (!hotel) return;

    const updatedCategories = this.categories()
      .filter(c => c.id !== category.id);

    this.hotelService.updateHotelAgeCategories(hotel.id, updatedCategories)
      .then(updatedHotel => {
        this.categories.set(updatedHotel.ageCategories || []);
        this.showSuccess('Age category deleted successfully');
      })
      .catch(error => {
        console.error('Error deleting category:', error);
        this.showError('Failed to delete age category');
      });
  }

  editCategory(category: AgeCategory): void {
    this.editingCategory.set(category);
    this.categoryForm.patchValue({
      type: category.type,
      name: category.name,
      minAge: category.minAge,
      maxAge: category.maxAge,
      isActive: category.isActive
    });
    this.showCategoryForm.set(true);
  }

  addNewCategory(): void {
    this.editingCategory.set(null);
    this.categoryForm.reset({
      type: 'adult',
      name: '',
      minAge: 0,
      maxAge: 100,
      isActive: true
    });
    this.showCategoryForm.set(true);
  }

  private showSuccess(message: string): void {
    this.modalError.set(false);
    this.modalMessage.set(message);
    setTimeout(() => this.modalMessage.set(''), 3000);
  }

  private showError(message: string): void {
    this.modalError.set(true);
    this.modalMessage.set(message);
    setTimeout(() => this.modalMessage.set(''), 3000);
  }

  private getNextCategoryId(): number {
    return Math.max(0, ...this.categories().map(c => c.id)) + 1;
  }

  private generateAgeLabel(formValue: any): string {
    const name = formValue.type.charAt(0).toUpperCase() + formValue.type.slice(1);
    return formValue.maxAge === 100 ? 
      `${name} (${formValue.minAge}+ years)` : 
      `${name} (${formValue.minAge}-${formValue.maxAge} years)`;
  }

  private generateAgeDescription(formValue: any): string {
    return formValue.maxAge === 100 ?
      `${formValue.name} age category (${formValue.minAge}+ years)` :
      `${formValue.name} age category (${formValue.minAge}-${formValue.maxAge} years)`;
}

  private ageRangeValidator(group: FormGroup): ValidationErrors | null {
    const minAge = group.get('minAge')?.value;
    const maxAge = group.get('maxAge')?.value;
    
    if (minAge === null || maxAge === null) {
      return null;
    }

    // Check if minAge is greater than maxAge
    if (minAge > maxAge) {
      return { ageRange: true };
    }

    // Check if ages are within valid range
    if (minAge < 0 || maxAge > 100) {
      return { invalidAgeRange: true };
    }

    return null;
  }

  getCategoryIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'adult': 'person',
      'teen': 'face',
      'child': 'child_care',
      'infant': 'baby_changing_station'
    };
    
    return iconMap[type] || 'person_outline';
  }
}
