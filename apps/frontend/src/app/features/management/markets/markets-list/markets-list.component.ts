import { PanelState } from '@/app/shared/types/panel-state.type';
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Market } from '@runner/shared/types';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { take } from 'rxjs';
import { MarketsFormComponent } from '../markets-form/markets-form.component';
import { MarketsService } from '../markets.service';

@Component({
  selector: 'app-markets-list',
  imports: [
    AsyncPipe,
    MarketsFormComponent,
    ConfirmDialog,
    ToastModule,
    Button,
  ],
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

  readonly selectedMarket = computed(() => {
    const state = this.panelState();
    return state.mode === 'edit' ? state.item : null;
  });

  readonly isPanelOpen = computed(() => this.panelState().mode !== 'idle');

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
              this.onSaved();
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

  onDeleteClick(market: Market, event: Event): void {
    event.stopPropagation();
    this.confirmDelete(market);
  }
}
