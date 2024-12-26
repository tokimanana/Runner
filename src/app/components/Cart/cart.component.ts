// src/app/components/cart/cart.component.ts

import { Component, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MealPlanType, RoomType, PaymentMethod, MEAL_PLAN_NAMES, Contract } from 'src/app/models/types';
import { MatSelectModule } from '@angular/material/select';

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
  };
}

interface ReservationStep {
  room?: RoomType;
  selectedMealPlans?: MealPlanType[];
  baseRate?: number;
  supplementRates?: {
    type: MealPlanType;
    name: string;
    rates: {
      adult: number;
      child: number;
      infant: number;
    };
  }[];
  total?: number;
}

@Component({
  selector: 'app-cart',
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
    MatSelectModule
  ],

  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems = signal<ReservationStep[]>([]);
  reviewComplete = false;
  guestForm!: FormGroup;
  paymentForm!: FormGroup;

  private activeContractSignal = signal<Contract | null>(null)


  readonly MEAL_PLAN_NAMES: Record<MealPlanType, string> = MEAL_PLAN_NAMES;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.initializePaymentForm();
    this.initializeForms();
  }

  private initializePaymentForm(): void {
    this.paymentForm = this.fb.group({
      paymentMethod: ['', Validators.required],
      cardNumber: ['', [
        Validators.required,
        Validators.pattern(/^\d{16}$/)
      ]],
      expiryDate: ['', [
        Validators.required,
        Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
      ]],
      cvv: ['', [
        Validators.required,
        Validators.pattern(/^\d{3,4}$/)
      ]],
      nameOnCard: ['', Validators.required],
      billingAddress: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        country: ['', Validators.required],
        postalCode: ['', Validators.required]
      })
    });
  }



  // cart.component.ts

ngOnInit() {
  console.log('Cart component initialized');
  
  // Load cart items from localStorage
  const savedCart = localStorage.getItem('bookingCart');
  if (savedCart) {
    try {
      const parsedCart = JSON.parse(savedCart);
      console.log('Loaded cart items:', parsedCart);
      this.cartItems.set(parsedCart);
    } catch (error) {
      console.error('Error parsing cart data:', error);
      this.snackBar.open('Error loading cart data', 'Close', { duration: 3000 });
    }
  }

  // Initialize forms
  this.initializeForms();
}



  private initializeForms() {
    // Initialize Guest Form
    this.guestForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      // Add other guest form controls as needed
    });

    // Initialize Payment Form
    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required]],
      expiryDate: ['', [Validators.required]],
      cvv: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]],
      cardholderName: ['', Validators.required],
      // Add other payment form controls as needed
    });
  }

  readonly cartTotal = computed(() => {
    return this.cartItems().reduce((total, item) => total + (item.total || 0), 0);
  });

  

  removeItem(index: number): void {
    const currentItems = this.cartItems();
    currentItems.splice(index, 1);
    this.cartItems.set([...currentItems]);
    this.updateLocalStorage();

    if (currentItems.length === 0) {
      this.router.navigate(['/reservations']);
    }
  }

  async processPayment(): Promise<void> {
    if (this.paymentForm.invalid) {
      return;
    }

    try {
      // Add your payment processing logic here
      console.log('Processing payment:', {
        items: this.cartItems(),
        total: this.cartTotal(),
        paymentDetails: this.paymentForm.value
      });

      // Navigate to confirmation page after successful payment
      this.router.navigate(['/confirmation']);
    } catch (error) {
      console.error('Payment processing error:', error);
      // Handle payment errors
    }
  }

  calculateTotal(): number {
    return this.cartItems().reduce((total, item) => total + (item.total || 0), 0);
  }

  goBack(): void {
    this.router.navigate(['/booking/reservations']);
  }
  
  getMealPlanName(mealPlan: MealPlanType): string {
  return MEAL_PLAN_NAMES[mealPlan] || mealPlan;
}


  getBaseMealPlan(room: RoomType): MealPlanType {
    const contract = this.activeContract();
    if (!contract) {
      return MealPlanType.BB; // Default to BB if no contract
    }
    return contract.baseMealPlan;
  }

  activeContract(): Contract | null {
    return this.activeContractSignal();
  }

  setActiveContract(contract: Contract | null): void {
    this.activeContractSignal.set(contract);
  }
  

  private updateLocalStorage(): void {
    try {
      localStorage.setItem('bookingCart', JSON.stringify(this.cartItems()));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
      this.snackBar.open('Error saving cart data', 'Close', {
        duration: 3000
      });
    }
  }
  

  async confirmBooking(): Promise<void> {
    try {
      // Here you would typically:
      // 1. Validate all information
      // 2. Process payment
      // 3. Create booking in your system
      // 4. Send confirmation email
      
      this.snackBar.open('Booking confirmed successfully!', 'Close', {
        duration: 5000,
      });
      
      // Clear cart
      this.cartItems.set([]);
      this.updateLocalStorage();
      
      // Navigate to confirmation page
      this.router.navigate(['/booking-confirmation']);
    } catch (error) {
      this.snackBar.open('Error processing booking. Please try again.', 'Close', {
        duration: 5000,
      });
    }

  }
}
