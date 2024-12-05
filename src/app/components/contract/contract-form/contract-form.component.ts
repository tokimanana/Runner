import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { Contract, Hotel, Market, MealPlan } from '../../../models/types';
import { HotelService } from '../../../services/hotel.service';
import { MarketService } from '../../../services/market.service';
import { MealPlanService } from '../../../services/meal-plan.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-contract-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ],
  templateUrl: './contract-form.component.html',
  styleUrls: ['./contract-form.component.css']
})
export class ContractFormComponent implements OnInit {
  @Input() contract: Contract | null = null;
  @Output() saved = new EventEmitter<Contract>();
  @Output() cancelled = new EventEmitter<void>();

  form: FormGroup;
  hotels$: Observable<Hotel[]>;
  markets$: Observable<Market[]>;
  mealPlans$: Observable<MealPlan[]>;

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private marketService: MarketService,
    private mealPlanService: MealPlanService
  ) {
    this.form = this.createForm();
    this.hotels$ = this.hotelService.getHotels();
    this.markets$ = this.marketService.getMarkets();
    this.mealPlans$ = this.mealPlanService.getMealPlans();
  }

  ngOnInit(): void {
    if (this.contract) {
      this.form.patchValue(this.contract);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      hotelId: [null, Validators.required],
      marketId: [null, Validators.required],
      validFrom: [null, Validators.required],
      validTo: [null, Validators.required],
      mealPlanId: [null, Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.value;
      const contract: Contract = {
        ...this.contract,
        ...formValue,
        id: this.contract?.id || Date.now()
      };
      this.saved.emit(contract);
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
