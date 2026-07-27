import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ContractDto } from '@runner/shared/types';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { StepperModule } from 'primeng/stepper';
import { CurrenciesService } from '../../currencies/currencies.service';
import { HotelsService } from '../../hotels/hotels.service';
import { MarketsService } from '../../markets/markets.service';
import { ContractsService } from '../contracts.service';

@Component({
  selector: 'app-contract-form',
  imports: [
    ReactiveFormsModule,
    Button,
    Select,
    InputText,
    StepperModule,
    NgTemplateOutlet,
  ],
  templateUrl: './contract-form.component.html',
  styleUrl: './contract-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly hotelsService = inject(HotelsService);
  private readonly marketsService = inject(MarketsService);
  private readonly currenciesService = inject(CurrenciesService);
  private readonly contractsService = inject(ContractsService);
  private readonly router = inject(Router);

  readonly activeStep = signal<number>(1);
  readonly step1Data = signal<ContractDto | null>(null);

  // Step 1 : formulaire typé, nonNullable
  readonly step1Form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    hotelId: ['', Validators.required],
    marketId: ['', Validators.required],
    currencyId: ['', Validators.required],
  });

  readonly hotels = toSignal(this.hotelsService.getHotels(), {
    initialValue: [],
  });
  readonly markets = toSignal(this.marketsService.getAll(), {
    initialValue: [],
  });
  readonly currencies = toSignal(this.currenciesService.getAll(), {
    initialValue: [],
  });

  goNext(activateCallback: (step: number) => void): void {
    if (this.step1Form.invalid) {
      this.step1Form.markAllAsTouched();
      return;
    }
    this.step1Data.set(this.step1Form.getRawValue());
    activateCallback(this.activeStep() + 1);
  }

  goBack(activateCallback: (step: number) => void): void {
    activateCallback(this.activeStep() - 1);
  }
}
