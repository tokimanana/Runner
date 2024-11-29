import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SpecialOffersService } from '../special-offers.service';
import { SpecialOffer } from '../../../models/types';
import { Subscription } from 'rxjs';
import { MatStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-offer-form',
  templateUrl: './offer-form.component.html',
  styleUrls: ['./offer-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatCardModule,
    MatDialogModule
  ]
})
export class OfferFormComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;
  offerForm: FormGroup;
  editingOffer: SpecialOffer | null = null;
  private subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private specialOffersService: SpecialOffersService,
    private dialog: MatDialog
  ) {
    this.offerForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', Validators.required],
      description: ['', Validators.required],
      discountType: ['percentage', Validators.required],
      discountValues: this.fb.array([]),
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      conditions: this.fb.array([]),
      minimumNights: [null, [Validators.min(1)]],
      maximumNights: [null, [Validators.min(1)]],
      blackoutDates: this.fb.array([]),
      bookingWindow: this.fb.group({
        start: [''],
        end: ['']
      })
    });
  }

  ngOnInit() {
    this.subscription.add(
      this.specialOffersService.getEditingOffer().subscribe(offer => {
        this.editingOffer = offer;
        if (offer) {
          this.populateForm(offer);
        } else {
          this.resetForm();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // Form array getters
  get discountValues() {
    return this.offerForm.get('discountValues') as FormArray;
  }

  get conditions() {
    return this.offerForm.get('conditions') as FormArray;
  }

  get blackoutDates() {
    return this.offerForm.get('blackoutDates') as FormArray;
  }

  // Step validation methods
  isBasicInfoValid(): boolean {
    const basicControls = ['code', 'name', 'description'];
    return basicControls.every(control => 
      this.offerForm.get(control)?.valid
    );
  }

  isDiscountDetailsValid(): boolean {
    const discountTypeControl = this.offerForm.get('discountType');
    return discountTypeControl?.valid === true &&
           this.discountValues.length > 0 &&
           this.discountValues.controls.every(control => control.valid);
  }

  // Form array management
  addDiscountValue() {
    const discountValue = this.fb.group({
      nights: ['', [Validators.required, Validators.min(1)]],
      value: ['', [Validators.required, Validators.min(0)]],
      startDate: [''],
      endDate: ['']
    });
    this.discountValues.push(discountValue);
  }

  removeDiscountValue(index: number) {
    this.discountValues.removeAt(index);
  }

  addCondition() {
    this.conditions.push(this.fb.control('', Validators.required));
  }

  removeCondition(index: number) {
    this.conditions.removeAt(index);
  }

  addBlackoutDate() {
    this.blackoutDates.push(this.fb.control(''));
  }

  removeBlackoutDate(index: number) {
    this.blackoutDates.removeAt(index);
  }

  // Form population and reset
  private populateForm(offer: SpecialOffer) {
    // Clear existing arrays
    while (this.discountValues.length) {
      this.discountValues.removeAt(0);
    }
    while (this.conditions.length) {
      this.conditions.removeAt(0);
    }
    while (this.blackoutDates.length) {
      this.blackoutDates.removeAt(0);
    }

    // Set basic fields
    this.offerForm.patchValue({
      code: offer.code,
      name: offer.name,
      description: offer.description,
      discountType: offer.discountType,
      startDate: offer.startDate,
      endDate: offer.endDate,
      minimumNights: offer.minimumNights,
      maximumNights: offer.maximumNights,
      bookingWindow: {
        start: offer.bookingWindow?.start,
        end: offer.bookingWindow?.end
      }
    });

    // Add discount values
    offer.discountValues.forEach(value => {
      this.discountValues.push(this.fb.group({
        nights: [value.nights, [Validators.required, Validators.min(1)]],
        value: [value.value, [Validators.required, Validators.min(0)]],
        startDate: [value.startDate],
        endDate: [value.endDate]
      }));
    });

    // Add conditions
    offer.conditions?.forEach(condition => {
      this.conditions.push(this.fb.control(condition, Validators.required));
    });

    // Add blackout dates
    offer.blackoutDates?.forEach(date => {
      this.blackoutDates.push(this.fb.control(date));
    });

    // Reset stepper
    if (this.stepper) {
      this.stepper.reset();
    }
  }

  private resetForm() {
    this.offerForm.reset({
      discountType: 'percentage'
    });
    
    while (this.discountValues.length) {
      this.discountValues.removeAt(0);
    }
    while (this.conditions.length) {
      this.conditions.removeAt(0);
    }
    while (this.blackoutDates.length) {
      this.blackoutDates.removeAt(0);
    }

    if (this.stepper) {
      this.stepper.reset();
    }
  }

  // Form submission
  onSubmit() {
    if (this.offerForm.valid) {
      const formValue = this.offerForm.value;
      
      // Remove empty conditions and blackout dates
      formValue.conditions = formValue.conditions.filter((c: string) => c.trim());
      formValue.blackoutDates = formValue.blackoutDates.filter((d: string) => d);
      
      if (this.editingOffer) {
        this.specialOffersService.updateOffer({
          ...formValue,
          id: this.editingOffer.id
        });
      } else {
        this.specialOffersService.addOffer(formValue);
      }
      
      this.specialOffersService.closeForm();
    }
  }

  cancel() {
    const dialogRef = this.dialog.open(CancelConfirmationDialog, {
      width: '400px',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.resetForm();
        this.specialOffersService.closeForm();
      }
    });
  }
}

@Component({
  selector: 'cancel-confirmation-dialog',
  template: `
    <h2 mat-dialog-title>Cancel Offer Creation</h2>
    <mat-dialog-content>
      <p>Are you sure you want to cancel? All changes will be lost.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">No, Continue Editing</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true" cdkFocusInitial>Yes, Cancel</button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [MatDialogModule, MatButtonModule]
})
class CancelConfirmationDialog {
  constructor(public dialogRef: MatDialogRef<CancelConfirmationDialog>) {}
}