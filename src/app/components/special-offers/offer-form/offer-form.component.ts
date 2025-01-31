import {
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormArray,
  AbstractControl,
  FormControl,
} from "@angular/forms";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from "@angular/material/dialog";
import { MatStepper, MatStepperModule } from "@angular/material/stepper";
import { StepperSelectionEvent } from "@angular/cdk/stepper";
import { SpecialOffer } from "src/app/models/types";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DATE_FORMATS, MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from "@angular/material/tooltip";

interface DialogData {
  offer: SpecialOffer | null;
  title: string;
}

const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'dd/MM/yyyy',
  },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MMM yyyy',
    dateA11yLabel: 'dd/MM/yyyy',
    monthYearA11yLabel: 'MMMM yyyy',
  },
};

@Component({
  selector: "app-offer-form",
  standalone: true,
  templateUrl: "./offer-form.component.html",
  styleUrls: ["./offer-form.component.scss"],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ]
})
export class OfferFormComponent {
  @Input() offer!: SpecialOffer;
  @Output() saveOffer = new EventEmitter<Partial<SpecialOffer>>();
  @ViewChild("stepper") stepper!: MatStepper;
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
    // Initialize offerForm first
    this.offerForm = this.fb.group({
      // ... form group definition here
    });

    this.initForm();
  }

  ngOnInit(): void {
    const offerToEdit = this.data?.offer;
    if (offerToEdit) {
      this.isEdit = true;
      this.populateForm(offerToEdit);
    }
  }

  private initForm(): void {
    this.offerForm = this.fb.group({
      code: ["", [Validators.required, Validators.minLength(3)]],
      name: ["", [Validators.required, Validators.minLength(3)]],
      type: ["combinable", Validators.required],
      description: ["", [Validators.required, Validators.minLength(10)]],
      discountType: ["percentage", Validators.required],
      discountValues: this.fb.array(
        [this.createDiscountValueFormGroup()],
        Validators.minLength(1)
      ),
      travelDateRange: this.fb.group({
        start: ["", Validators.required],
        end: ["", Validators.required],
      }),
      conditions: this.fb.array([this.fb.control("")]),
      minimumNights: [null, [Validators.min(1)]],
      blackoutDates: this.fb.array([]),
      bookingWindow: this.fb.group({
        start: ["", Validators.required],
        end: ["", Validators.required],
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

  get discountValues(): FormArray {
    return this.offerForm.get("discountValues") as FormArray;
  }

  get conditions(): FormArray {
    return this.offerForm.get("conditions") as FormArray;
  }

  get blackoutDates(): FormArray {
    return this.offerForm.get("blackoutDates") as FormArray;
  }

  createDiscountValueFormGroup(): FormGroup {
    return this.fb.group({
      bookingDateRange: this.fb.group({
        start: ["", Validators.required],
        end: ["", Validators.required],
      }),
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
  }

  addDiscountValue() {
    this.discountValues.push(this.createDiscountValueFormGroup());
  }

  removeDiscountValue(index: number): void {
    this.discountValues.removeAt(index);
  }

  addCondition(): void {
    this.conditions.push(this.fb.control("")); // Use fb.control to create a FormControl
  }

  removeCondition(index: number): void {
    this.conditions.removeAt(index);
  }

  addBlackoutDate(): void {
    this.blackoutDates.push(
      this.fb.group({
        start: ["", Validators.required],
        end: ["", Validators.required],
      })
    );
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
      travelDateRange: offer.travelDateRange,
      minimumNights: offer.minimumNights,
      bookingWindow: offer.bookingWindow,
    });

    // Populate discount values
    this.discountValues.clear();
    offer.discountValues.forEach((value) => {
      this.discountValues.push(
        this.fb.group({
          bookingDateRange: this.fb.group({
            start: [
              value.bookingDateRange.start
                ? new Date(value.bookingDateRange.start)
                : "",
            ],
            end: [
              value.bookingDateRange.end
                ? new Date(value.bookingDateRange.end)
                : "",
            ],
          }),
          value: [value.value],
        })
      );
    });

    // Populate conditions
    this.conditions.clear();
    offer.conditions?.forEach((condition, i) => {
      this.conditions.setControl(i, this.fb.control(condition));
    });

    // Populate blackout dates
    this.blackoutDates.clear();
    offer.blackoutDates?.forEach((date, i) => {
      this.blackoutDates.setControl(
        i,
        this.fb.group({
          start: [date.start ? new Date(date.start) : ""],
          end: [date.end ? new Date(date.end) : ""],
        })
      );
    });
  }

  selectionChange(event: StepperSelectionEvent) {
    this.isFirstStep = event.selectedIndex === 0;
    this.isLastStep = event.selectedIndex === this.stepper.steps.length - 1;
  }

  onNextClick(): void {
    const currentStepIndex = this.stepper.selectedIndex;
    const controlsForCurrentStep = this.getControlsForStep(currentStepIndex);

    if (controlsForCurrentStep.every((control) => control.valid)) {
      this.stepper.next();
    } else {
      // Mark all fields as touched to trigger validation messages
      controlsForCurrentStep.forEach((control) => control.markAsTouched());
    }
  }

  onPreviousClick(): void {
    const previousStepIndex = this.stepper.selectedIndex - 1;
    const controlsForPreviousStep = this.getControlsForStep(previousStepIndex);

    if (controlsForPreviousStep.every((control) => control.valid)) {
      this.stepper.previous();
    } else {
      // Mark all fields as touched to trigger validation messages
      controlsForPreviousStep.forEach((control) => control.markAsTouched());
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
          this.offerForm.get("travelDateRange")!.get("start")!,
          this.offerForm.get("travelDateRange")!.get("end")!,
          this.offerForm.get("minimumNights")!,
        ];
      case 3: // Booking Window and Blackout Dates
        return [
          this.offerForm.get("bookingWindow")!.get("start")!,
          this.offerForm.get("bookingWindow")!.get("end")!,
          this.offerForm.get("blackoutDates")!,
        ];
      case 4: // Conditions
        return [this.offerForm.get("conditions")!];
      default:
        return [];
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.isLastStep) {
      return;
    }
    if (this.offerForm.valid && this.isLastStep) {
      try {
        this.loading = true;
        const formData: Partial<SpecialOffer> = {
          ...this.offerForm.value,
          id: this.data.offer?.id,
        };

        // Emit the form data
        this.saveOffer.emit(formData);

        // Close dialog
        this.dialogRef.close();
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

  getFormErrorMessage(control: AbstractControl | null): string {
    if (!control) {
      return "";
    }
    if (control.hasError("required")) {
      return "This field is required";
    }
    if (control.hasError("minlength")) {
      return `Minimum length is ${control.errors?.["minlength"].requiredLength}`;
    }
    if (control.hasError("min")) {
      return `Minimum value is ${control.errors?.["min"].min}`;
    }
    if (control.hasError("max")) {
      return `Maximum value is ${control.errors?.["max"].max}`;
    }
    return "";
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

  // Getter method to cast control to FormControl
  getFormControl(control: AbstractControl): FormControl {
    return control as FormControl;
  }
}
