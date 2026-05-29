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
import { Button } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MarketsFormComponent } from '../markets-form/markets-form.component';
import { MarketsService } from '../markets.service';

@Component({
  selector: 'app-markets-list',
  imports: [AsyncPipe, Button, ToastModule, MarketsFormComponent],
  templateUrl: './markets-list.component.html',
  styleUrl: './markets-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketsListComponent {
  private readonly marketsService = inject(MarketsService);

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
}
