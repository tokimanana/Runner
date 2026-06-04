import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Currency, CurrencyDto } from '@runner/shared/types';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { take } from 'rxjs';
import { CurrenciesService } from '../currencies.service';

@Component({
  selector: 'app-currencies-form',
  imports: [ReactiveFormsModule, InputTextModule, Button, ConfirmDialog],
  templateUrl: './currencies-form.component.html',
  styleUrl: './currencies-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrenciesFormComponent {
  private readonly currenciesService = inject(CurrenciesService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly currency = input<Currency | null>(null);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly isEditMode = computed(() => !!this.currency());
  readonly isSubmitting = signal(false);

  readonly liveSymbol = signal('');

  readonly form = new FormGroup({
    code: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    name: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    symbol: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });

  constructor() {
    effect(() => {
      const currency = this.currency();
      if (currency) {
        this.form.patchValue(currency);
        this.liveSymbol.set(currency.symbol);
      } else {
        this.form.reset();
        this.liveSymbol.set('');
      }
    });

    this.form.controls.symbol.valueChanges.subscribe((val) => {
      this.liveSymbol.set(val);
    });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const dto = this.form.getRawValue() as CurrencyDto;
    const currency = this.currency();

    this.isSubmitting.set(true);

    const request$ = currency
      ? this.currenciesService.update(currency.id, dto)
      : this.currenciesService.create(dto);

    request$.pipe(take(1)).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: currency ? 'Updated' : 'Created',
          detail: `Currency "${dto.name}" has been ${currency ? 'updated' : 'created'}.`,
        });
        this.isSubmitting.set(false);
        this.saved.emit();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not save currency. Please try again.',
        });
        this.isSubmitting.set(false);
      },
    });
  }

  confirmDelete(): void {
    const currency = this.currency();
    if (!currency) return;

    this.confirmationService.confirm({
      header: 'Delete Currency',
      message: `Are you sure you want to delete "${currency.name}"?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.currenciesService
          .remove(currency.id)
          .pipe(take(1))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Deleted',
                detail: `"${currency.name}" has been deleted.`,
              });
              this.saved.emit();
            },
            error: (err) => {
              this.messageService.add({
                severity: err.status === 409 ? 'warn' : 'error',
                summary: err.status === 409 ? 'Cannot delete' : 'Error',
                detail:
                  err.status === 409
                    ? `"${currency.name}" is used in existing contracts.`
                    : 'An unexpected error occurred.',
              });
            },
          });
      },
    });
  }
}
