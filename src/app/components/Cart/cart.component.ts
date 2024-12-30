// src/app/components/cart/cart.component.ts

import { Component, computed, inject, OnInit, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatStepperModule } from "@angular/material/stepper";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import {
  MealPlanType,
  RoomType,
  PaymentMethod,
  MEAL_PLAN_NAMES,
  Contract,
  ReservationStep,
} from "src/app/models/types";
import { MatSelectModule } from "@angular/material/select";

interface CartStep {
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  paymentInfo: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    nameOnCard: string;
    billingAddress: {
      street: string;
      city: string;
      country: string;
      postalCode: string;
    };
  };
}

@Component({
  selector: "app-cart",
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatSelectModule,
  ],
  templateUrl: "./cart.component.html",
  styleUrls: ["./cart.component.scss"],
})
export class CartComponent implements OnInit {
  // Signals
  cartItems = signal<ReservationStep[]>([]);
  private activeContractSignal = signal<Contract | null>(null);

  // Computed values
  readonly cartTotal = computed(() =>
    this.cartItems().reduce((total, item) => total + (item.total || 0), 0)
  );

  // Form controls
  guestForm!: FormGroup;
  paymentForm!: FormGroup;

  // State
  reviewComplete = false;
  isProcessing = false;

  searchForm = inject(FormBuilder).group({
    adults: [0],
    children: [0],
    infants: [0]
  });

  // Constants
  readonly MEAL_PLAN_NAMES: Record<MealPlanType, string> = MEAL_PLAN_NAMES;
  readonly PAYMENT_METHODS = [
    { value: PaymentMethod.CREDIT_CARD, label: "Credit Card" },
    { value: PaymentMethod.DEBIT_CARD, label: "Debit Card" },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadCartItems();
    this.initializeForms();
  }

  // Form Initialization
  private initializeForms() {
    this.guestForm = this.fb.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      phone: ["", Validators.required],
    });

    this.paymentForm = this.fb.group({
      cardNumber: ["", Validators.required],
      expiryDate: ["", Validators.required],
      cvv: ["", Validators.required],
    });
  }

  private initializeGuestForm(): void {
    this.guestForm = this.fb.group({
      firstName: ["", [Validators.required, Validators.minLength(2)]],
      lastName: ["", [Validators.required, Validators.minLength(2)]],
      email: ["", [Validators.required, Validators.email]],
      phone: [
        "",
        [Validators.required, Validators.pattern(/^\+?[\d\s-]{10,}$/)],
      ],
    });
  }

  private initializePaymentForm(): void {
    this.paymentForm = this.fb.group({
      paymentMethod: ["", Validators.required],
      cardNumber: ["", [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiryDate: [
        "",
        [
          Validators.required,
          Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/),
        ],
      ],
      cvv: ["", [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      nameOnCard: ["", Validators.required],
      billingAddress: this.fb.group({
        street: ["", Validators.required],
        city: ["", Validators.required],
        country: ["", Validators.required],
        postalCode: [
          "",
          [Validators.required, Validators.pattern(/^[A-Z0-9]{3,10}$/i)],
        ],
      }),
    });
  }

  // Cart Management
  private loadCartItems(): void {
    try {
      const savedCart = localStorage.getItem("bookingCart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        this.cartItems.set(parsedCart);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      this.showError("Error loading cart data");
    }
  }

  removeItem(index: number): void {
    if (confirm("Are you sure you want to remove this item?")) {
      const currentItems = this.cartItems();
      currentItems.splice(index, 1);
      this.cartItems.set([...currentItems]);
      this.updateLocalStorage();

      if (currentItems.length === 0) {
        this.router.navigate(["/reservations"]);
      }
    }
  }

  calculateCartTotal(): number {
    return this.cartItems().reduce((sum, item) => sum + (item.total || 0), 0);
  }

  calculateBaseTotalTotal(): number {
    return this.cartItems().reduce((sum, item) => {
      return sum + (item.baseRate || 0);
    }, 0);
  }

  calculateMealPlanTotal(): number {
    return this.cartItems().reduce((sum, item) => {
      const mealPlanTotal = item.selectedMealPlans?.reduce((mealSum, plan) => {
        // Calculate rates for each person type
        const adultRate = this.getMealPlanRate(plan, 'adult');
        const childRate = this.getMealPlanRate(plan, 'child');
        const infantRate = this.getMealPlanRate(plan, 'infant');
  
        // Return sum of all rates
        return mealSum + adultRate + childRate + infantRate;
      }, 0) || 0;
  
      return sum + mealPlanTotal;
    }, 0);
  }
  
  // Helper method to get meal plan rate
  private getMealPlanRate(plan: any, type: 'adult' | 'child' | 'infant'): number {
    const rates = plan.ratePerPerson;
    if (!rates) return 0;
  
    switch (type) {
      case 'adult':
        return rates.adult || 0;
      case 'child':
        return rates.child || 0;
      case 'infant':
        return rates.infant || 0;
      default:
        return 0;
    }
  }
  
  
  calculateTotalSavings(): number {
    return this.cartItems().reduce((sum, item) => {
      if (item.totalBeforeDiscounts && item.total) {
        return sum + (item.totalBeforeDiscounts - item.total);
      }
      return sum;
    }, 0);
  }

  // Method to proceed to checkout
  proceedToCheckout(): void {
    if (this.guestForm.invalid || this.paymentForm.invalid) {
      this.snackBar.open("Please complete all required fields", "Close", {
        duration: 3000,
        panelClass: ["error-snackbar"],
      });
      return;
    }

    // Add your checkout logic here
  }

  private updateLocalStorage(): void {
    try {
      localStorage.setItem("bookingCart", JSON.stringify(this.cartItems()));
    } catch (error) {
      console.error("Error saving cart:", error);
      this.showError("Error saving cart data");
    }
  }

  // Payment Processing
  async processPayment(): Promise<void> {
    if (this.paymentForm.invalid || this.guestForm.invalid) {
      this.markFormGroupTouched(this.paymentForm);
      this.markFormGroupTouched(this.guestForm);
      this.showError("Please complete all required fields");
      return;
    }

    this.isProcessing = true;

    try {
      // Mock payment processing
      await this.simulatePaymentProcessing();

      await this.confirmBooking();

      this.showSuccess("Payment processed successfully!");
      this.router.navigate(["/confirmation"]);
    } catch (error) {
      console.error("Payment error:", error);
      this.showError("Payment processing failed. Please try again.");
    } finally {
      this.isProcessing = false;
    }
  }

  private simulatePaymentProcessing(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Booking Confirmation
  async confirmBooking(): Promise<void> {
    try {
      // Here you would typically make API calls to:
      // 1. Create booking record
      // 2. Send confirmation email
      // 3. Update inventory

      this.cartItems.set([]);
      this.updateLocalStorage();

      this.showSuccess("Booking confirmed successfully!");
      this.router.navigate(["/booking-confirmation"]);
    } catch (error) {
      console.error("Booking error:", error);
      this.showError("Error processing booking");
      throw error;
    }
  }
  getMealPlanName(mealPlan: MealPlanType): string {
    return MEAL_PLAN_NAMES[mealPlan] || mealPlan;
  }

  getBaseMealPlan(room: RoomType): MealPlanType {
    return this.activeContract()?.baseMealPlan || MealPlanType.BB;
  }

  activeContract(): Contract | null {
    return this.activeContractSignal();
  }

  setActiveContract(contract: Contract | null): void {
    this.activeContractSignal.set(contract);
  }

  // Navigation
  goBack(): void {
    this.router.navigate(["/booking/reservations"]);
  }

  // Form Utilities
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Notifications
  private showSuccess(message: string): void {
    this.snackBar.open(message, "Close", {
      duration: 5000,
      panelClass: ["success-snackbar"],
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, "Close", {
      duration: 5000,
      panelClass: ["error-snackbar"],
    });
  }

  calculateBaseTotal(): number {
    return this.cartItems().reduce(
      (sum, item) => sum + (item.baseRate || 0),
      0
    );
  }
}
