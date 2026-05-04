import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TabsModule } from 'primeng/tabs';
import { HotelsService } from '../hotels.service';

@Component({
  selector: 'app-hotels-form',
  imports: [Card, InputTextModule, ReactiveFormsModule, Button, TabsModule],
  templateUrl: './hotels-form.component.html',
  styleUrl: './hotels-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelsFormComponent {
  private readonly router = inject(Router);
  private readonly hotelsService = inject(HotelsService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly hotelId = input<string>();
  readonly isEditMode = computed(() => !!this.hotelId());
  readonly isSubmitting = signal(false);

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
      {
        if (!hotelId) return;
        this.cdr.markForCheck();
      }

      this.hotelsService.getHotelById(hotelId).subscribe((hotel) => {
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

    request$.subscribe({
      next: () => this.navigateToList(),
      error: () => this.isSubmitting.set(false),
    });
  }

  cancel(): void {
    this.navigateToList();
  }

  private navigateToList(): void {
    this.router.navigate(['/management/hotels/hotels-list']);
  }
}
