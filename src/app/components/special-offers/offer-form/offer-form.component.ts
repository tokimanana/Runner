// src/app/components/special-offers/offer-form/offer-form.component.ts

import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { SpecialOffer, DiscountValue } from '../../../models/types';

interface DialogData {
  title: string;
  offer: SpecialOffer | null;
}

@Component({
  selector: 'app-offer-form',
  templateUrl: './offer-form.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule
  ]
})
export class OfferFormComponent implements OnInit {
  offerForm!: FormGroup;
  isEdit: boolean = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OfferFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    if (this.data.offer) {
      this.isEdit = true;
      this.populateForm(this.data.offer);
    }
  }

  private initForm(): void {
    this.offerForm = this.fb.group({
      code: ['', Validators.required],
      name: ['', Validators.required],
      type: ['combinable', Validators.required],
      description: ['', Validators.required],
      discountType: ['percentage', Validators.required],
      discountValues: this.fb.array([]),
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      conditions: this.fb.array([]),
      minimumNights: [null],
      maximumNights: [null],
      blackoutDates: this.fb.array([]),
      bookingWindow: this.fb.group({
        start: [''],
        end: ['']
      })
    });
  }

  get discountValues(): FormArray {
    return this.offerForm.get('discountValues') as FormArray;
  }

  get conditions(): FormArray {
    return this.offerForm.get('conditions') as FormArray;
  }

  get blackoutDates(): FormArray {
    return this.offerForm.get('blackoutDates') as FormArray;
  }

  addDiscountValue(): void {
    const discountGroup = this.fb.group({
      nights: ['', Validators.required],
      value: ['', Validators.required],
      startDate: [''],
      endDate: ['']
    });
    this.discountValues.push(discountGroup);
  }

  removeDiscountValue(index: number): void {
    this.discountValues.removeAt(index);
  }

  addCondition(): void {
    this.conditions.push(this.fb.control(''));
  }

  removeCondition(index: number): void {
    this.conditions.removeAt(index);
  }

  addBlackoutDate(): void {
    this.blackoutDates.push(this.fb.control(''));
  }

  removeBlackoutDate(index: number): void {
    this.blackoutDates.removeAt(index);
  }

  private populateForm(offer: SpecialOffer): void {
    this.offerForm.patchValue({
      code: offer.code,
      name: offer.name,
      type: offer.type,
      description: offer.description,
      discountType: offer.discountType,
      startDate: offer.startDate,
      endDate: offer.endDate,
      minimumNights: offer.minimumNights,
      maximumNights: offer.maximumNights,
      bookingWindow: offer.bookingWindow || { start: '', end: '' }
    });

    // Populate discount values
    offer.discountValues.forEach(value => {
      this.discountValues.push(this.fb.group({
        nights: [value.nights],
        value: [value.value],
        startDate: [value.startDate || ''],
        endDate: [value.endDate || '']
      }));
    });

    // Populate conditions
    offer.conditions?.forEach(condition => {
      this.conditions.push(this.fb.control(condition));
    });

    // Populate blackout dates
    offer.blackoutDates?.forEach(date => {
      this.blackoutDates.push(this.fb.control(date));
    });
  }

  onSubmit(): void {
    if (this.offerForm.valid) {
      const formData = this.offerForm.value;
      this.dialogRef.close(formData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
