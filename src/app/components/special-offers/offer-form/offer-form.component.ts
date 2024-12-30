// src/app/components/special-offers/offer-form/offer-form.component.ts

import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
} from "@angular/forms";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogConfig,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { SpecialOffer, DiscountValue } from "../../../models/types";
import { MatStepper, MatStepperModule } from "@angular/material/stepper";
import { MatTooltipModule } from "@angular/material/tooltip";
import { StepperSelectionEvent } from "@angular/cdk/stepper";

interface DialogData {
  title: string;
  offer: SpecialOffer | null;
}

@Component({
  selector: "app-offer-form",
  templateUrl: "./offer-form.component.html",
  styleUrls: ["./offer-form.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatStepperModule,
    MatTooltipModule,
  ],
})
export class OfferFormComponent implements OnInit {
  @Input() offer: SpecialOffer | null = null;
  @Output() saveOffer = new EventEmitter<Partial<SpecialOffer>>();
  @ViewChild("stepper") stepper!: MatStepper;
  // @Output() cancel = new EventEmitter<void>();
  offerForm!: FormGroup;
  isEdit: boolean = false;
  isFirstStep = true;
  isLastStep = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OfferFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    const offerToEdit = this.data?.offer || this.offer;
    if (this.data.offer) {
      this.isEdit = true;
      this.populateForm(offerToEdit as SpecialOffer);
    }
  }

  private initForm(): void {
    this.offerForm = this.fb.group({
      code: ["", [Validators.required, Validators.minLength(3)]],
      name: ["", [Validators.required, Validators.minLength(3)]],
      type: ["combinable", Validators.required],
      description: ["", [Validators.required, Validators.minLength(10)]],
      discountType: ["percentage", Validators.required],
      discountValues: this.fb.array([], Validators.minLength(1)),
      startDate: ["", Validators.required],
      endDate: ["", Validators.required],
      conditions: this.fb.array([]),
      minimumNights: [null, [Validators.min(1)]],
      blackoutDates: this.fb.array([]),
      bookingWindow: this.fb.group({
        start: [""],
        end: [""],
      }),
    });

    // Add form value changes debug logging
    this.offerForm.valueChanges.subscribe((value) => {
      console.log("Form value changed:", value);
      console.log("Form valid:", this.offerForm.valid);
      if (!this.offerForm.valid) {
        console.log("Form errors:", this.getFormValidationErrors());
      }
    });
  }

  // Helper method to get form validation errors
  private getFormValidationErrors(): any {
    const errors: any = {};
    Object.keys(this.offerForm.controls).forEach((key) => {
      const control = this.offerForm.get(key);
      if (control?.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  get discountValues(): FormArray {
    return this.offerForm.get("discountValues") as FormArray;
  }

  get conditions(): FormArray {
    return this.offerForm.get("conditions") as FormArray;
  }

  get blackoutDates(): FormArray {
    return this.offerForm.get("blackoutDates") as FormArray;
  }

  addDiscountValue() {
    if (this.discountValues.length < 10) {
      const discountGroup = this.fb.group({
        startDate: ["", Validators.required],
        endDate: ["", Validators.required],
        value: [
          "",
          [
            Validators.required,
            Validators.min(
              this.offerForm.get("discountType")?.value === "percentage" ? 0 : 1
            ),
            ...(this.offerForm.get("discountType")?.value === "percentage"
              ? [Validators.max(100)]
              : []),
          ],
        ],
      });
      this.discountValues.push(discountGroup);
    }
  }

  removeDiscountValue(index: number): void {
    this.discountValues.removeAt(index);
  }

  addCondition(): void {
    this.conditions.push(this.fb.control(""));
  }

  removeCondition(index: number): void {
    this.conditions.removeAt(index);
  }

  addBlackoutDate(): void {
    this.blackoutDates.push(this.fb.control(""));
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
      bookingWindow: offer.bookingWindow || { start: "", end: "" },
    });

    // Populate discount values
    offer.discountValues.forEach((value) => {
      this.discountValues.push(
        this.fb.group({
          value: [value.value],
          startDate: [value.startDate || ""],
          endDate: [value.endDate || ""],
        })
      );
    });

    // Populate conditions
    offer.conditions?.forEach((condition) => {
      this.conditions.push(this.fb.control(condition));
    });

    // Populate blackout dates
    offer.blackoutDates?.forEach((date) => {
      this.blackoutDates.push(this.fb.control(date));
    });
  }

  async onSubmit(): Promise<void> {
    if (!this.isLastStep) {
      return; // Don't submit if not on last step
    }

    if (this.offerForm.valid && this.isLastStep) {
      try {
        this.loading = true;
        const formData: Partial<SpecialOffer> = {
          ...this.offerForm.value,
          id: this.data.offer?.id,
        };

        // Close dialog with form data
        this.dialogRef.close(formData);
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        this.loading = false;
      }
    } else {
      Object.keys(this.offerForm.controls).forEach((key) => {
        const control = this.offerForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  canExit(): boolean {
    return !this.loading;
  }

  onCancel(): void {
    if (!this.loading) {
      this.dialogRef.close();
    }
  }

  onStepChange(event: StepperSelectionEvent): void {
    // Update step tracking
    this.isFirstStep = event.selectedIndex === 0;
    this.isLastStep = event.selectedIndex === this.stepper.steps.length - 1;

    // Validate current step before moving forward
    if (event.previouslySelectedIndex < event.selectedIndex) {
      const currentStepControls = this.getControlsForStep(
        event.previouslySelectedIndex
      );
      if (currentStepControls.some((control) => control.invalid)) {
        // Instead of preventDefault, we can move back to the previous step
        this.stepper.selectedIndex = event.previouslySelectedIndex;
        this.markStepControlsAsTouched(currentStepControls);
        return;
      }
    }
  }

  private getControlsForStep(stepIndex: number): AbstractControl[] {
    switch (stepIndex) {
      case 0: // Basic Info
        return [
          this.offerForm.get("code")!,
          this.offerForm.get("name")!,
          this.offerForm.get("type")!,
          this.offerForm.get("description")!,
        ];
      case 1: // Discount Configuration
        return [
          this.offerForm.get("discountType")!,
          this.offerForm.get("discountValues")!,
        ];
      case 2: // Validity Period
        return [
          this.offerForm.get("startDate")!,
          this.offerForm.get("endDate")!,
        ];
      default:
        return [];
    }
  }

  private markStepControlsAsTouched(controls: AbstractControl[]): void {
    controls.forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        Object.values(control.controls).forEach((c) => c.markAsTouched());
      }
    });
  }

  onNextClick(): void {
    if (this.offerForm.valid) {
      this.stepper.next();
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.offerForm.controls).forEach((key) => {
        const control = this.offerForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onPreviousClick(): void {
    this.stepper.previous();
  }
}
