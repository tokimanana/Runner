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
import { Market, MarketDto } from '@runner/shared/types';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { take } from 'rxjs';
import { MarketsService } from '../markets.service';

@Component({
  selector: 'app-markets-form',
  imports: [ReactiveFormsModule, InputTextModule, Button, ConfirmDialog],
  templateUrl: './markets-form.component.html',
  styleUrl: './markets-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketsFormComponent {
  private readonly marketsService = inject(MarketsService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly market = input<Market | null>(null);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly isEditMode = computed(() => !!this.market());
  readonly isSubmitting = signal(false);

  readonly form = new FormGroup({
    code: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    name: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
  });

  constructor() {
    effect(() => {
      const market = this.market();
      if (market) {
        this.form.patchValue(market);
      } else {
        this.form.reset();
      }
    });
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const dto = this.form.getRawValue() as MarketDto;
    const market = this.market();

    this.isSubmitting.set(true);

    const request$ = market
      ? this.marketsService.update(market.id, dto)
      : this.marketsService.create(dto);

    request$.pipe(take(1)).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: market ? 'Updated' : 'Created',
          detail: `Market "${dto.name}" has been ${market ? 'updated' : 'created'}.`,
        });
        this.isSubmitting.set(false);
        this.saved.emit();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not save market. Please try again.',
        });
        this.isSubmitting.set(false);
      },
    });
  }

  confirmDelete(): void {
    const market = this.market();
    if (!market) return;

    this.confirmationService.confirm({
      header: 'Delete Market',
      message: `Are you sure you want to delete "${market.name}"?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.marketsService
          .remove(market.id)
          .pipe(take(1))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Deleted',
                detail: `"${market.name}" has been deleted.`,
              });
              this.saved.emit();
            },
            error: (err) => {
              this.messageService.add({
                severity: err.status === 409 ? 'warn' : 'error',
                summary: err.status === 409 ? 'Cannot delete' : 'Error',
                detail:
                  err.status === 409
                    ? `"${market.name}" is used in existing contracts.`
                    : 'An unexpected error occurred.',
              });
            },
          });
      },
    });
  }
}
