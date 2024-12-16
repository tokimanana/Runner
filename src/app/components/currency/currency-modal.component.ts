import { Component, Inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CurrencyService } from '../../services/currency.service';
import { CurrencySetting } from '../../models/types';
import { Subject, takeUntil, tap } from 'rxjs';

interface DialogData {
  title: string;
  currency: CurrencySetting | null;
}

@Component({
  selector: 'app-currency-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './currency-modal.component.html',
  styleUrls: ['./currency-modal.component.scss'],
})
export class CurrencyModalComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  currencyForm: FormGroup;
  isLoading = signal(false);

  constructor(
    public dialogRef: MatDialogRef<CurrencyModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder,
    private currencyService: CurrencyService
  ) {
    this.currencyForm = this.fb.group({
      code: ['', Validators.required],
      symbol: ['', Validators.required],
      name: ['', Validators.required],
    });

    if (data.currency) {
      this.currencyForm.patchValue(data.currency);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  async saveCurrency(): Promise<void> {
    if (this.currencyForm.valid) {
      this.isLoading.set(true);
      const currencyData = this.currencyForm.value;
      const currencyId = this.data.currency?.id;

      try {
        if (currencyId) {
          const updatedCurrency = await this.currencyService.updateCurrency({ ...currencyData, id: currencyId });
          this.dialogRef.close(true);
        } else {
          const newCurrency = await this.currencyService.addCurrency(currencyData);
          this.dialogRef.close(true);
        }
      } catch (error: any) {
        console.error('Error saving currency:', error);
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
