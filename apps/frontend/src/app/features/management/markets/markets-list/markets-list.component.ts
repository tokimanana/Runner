import { PanelState } from '@/app/shared/types/panel-state.type';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Market } from '@runner/shared/types';
import { ConfirmationService, MessageService } from 'primeng/api';
import { take } from 'rxjs';
import { MarketsService } from '../markets.service';

@Component({
  selector: 'app-markets-list',
  imports: [],
  templateUrl: './markets-list.component.html',
  styleUrl: './markets-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketsListComponent {
  private readonly marketsService = inject(MarketsService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly panelState = signal<PanelState<Market>>({ mode: 'idle' });
  readonly markets$ = this.marketsService.getAll();
  readonly loading$ = this.marketsService.loading$;

  startCreate(): void {
    this.panelState.set({ mode: 'create' });
  }

  selectMarket(market: Market): void {
    this.panelState.set({ mode: 'edit', item: market });
  }

  onSaved(): void {
    this.panelState.set({ mode: 'idle' });
  }

  onCancelled(): void {
    this.panelState.set({ mode: 'idle' });
  }

  confirmDelete(market: Market): void {
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
            },
            error: (err) => {
              this.messageService.add({
                severity: err.status === 409 ? 'warn' : 'error',
                summary: err.status === 409 ? 'Cannot delete' : 'Error',
                detail:
                  err.status === 409
                    ? `"${market.name}" is used in existing contracts.`
                    : 'An unexpected error occurred. Please try again.',
              });
            },
          });
      },
    });
  }
}
