import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AgeCategory, RoomType } from '@runner/shared/types';
import { Button } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import { take } from 'rxjs';
import { AgeCategoriesListComponent } from '../age-categories/age-categories-list/age-categories-list.component';
import { AgeCategoriesFormComponent } from '../age-categories/age-catergories-form/age-categories-form.component';
import { HotelsService } from '../hotels.service';
import { RoomTypesFormComponent } from '../room-types/room-types-form/room-types-form.component';
import { RoomTypesListComponent } from '../room-types/rooms-types-list/room-types-list.component';

@Component({
  selector: 'app-hotels-form',
  imports: [
    InputTextModule,
    ReactiveFormsModule,
    Button,
    TabsModule,
    AgeCategoriesListComponent,
    AgeCategoriesFormComponent,
    RoomTypesListComponent,
    RoomTypesFormComponent,
  ],
  templateUrl: './hotels-form.component.html',
  styleUrl: './hotels-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelsFormComponent {
  readonly categoriesList = viewChild(AgeCategoriesListComponent);
  readonly categoriesForm = viewChild(AgeCategoriesFormComponent);
  readonly roomsList = viewChild(RoomTypesListComponent);
  readonly roomsForm = viewChild(RoomTypesFormComponent);

  private readonly router = inject(Router);
  private readonly hotelsService = inject(HotelsService);

  readonly hotelId = input<string>();
  readonly isEditMode = computed(() => !!this.hotelId());
  readonly isSubmitting = signal(false);
  readonly ageCategories = computed(
    () => this.categoriesList()?.categories() ?? []
  );

  readonly form = new FormGroup({
    code: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    name: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    city: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    country: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    region: new FormControl('', { nonNullable: true }),
    destination: new FormControl('', { nonNullable: true }),
    address: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true }),
    phone: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      const hotelId = this.hotelId();
      if (!hotelId) return;

      this.hotelsService
        .getHotelById(hotelId)
        .pipe(take(1))
        .subscribe((hotel) => {
          this.form.patchValue(hotel);
        });
    });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const dto = this.form.getRawValue();
    const hotelId = this.hotelId();

    this.isSubmitting.set(true);

    const request$ = hotelId
      ? this.hotelsService.updateHotel(hotelId, dto)
      : this.hotelsService.createHotel(dto);

    request$.pipe(take(1)).subscribe({
      next: () => this.navigateToList(),
      error: () => this.isSubmitting.set(false),
    });
  }

  cancel(): void {
    this.navigateToList();
  }

  onAddCategory(): void {
    this.categoriesForm()?.open();
  }

  onEditCategory(category: AgeCategory): void {
    this.categoriesForm()?.open(category);
  }

  onCategorySaved(): void {
    this.categoriesForm()?.close();
    this.categoriesList()?.loadCategories(this.hotelId()!);
  }

  onAddRoom(): void {
    this.roomsForm()?.open();
  }

  onEditRoom(room: RoomType): void {
    this.roomsForm()?.open(room);
  }

  onRoomSaved(): void {
    this.roomsList()?.loadRooms(this.hotelId()!);
  }

  private navigateToList(): void {
    this.router.navigate(['/management/hotels/hotels-list']);
  }
}
