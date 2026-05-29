import { PanelState } from '@/app/shared/types/panel-state.type';
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Currency } from '@runner/shared/types';
import { Button } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { CurrenciesFormComponent } from '../currencies-form/currencies-form.component';
import { CurrenciesService } from '../currencies.service';

@Component({
  selector: 'app-currencies-list',
  imports: [
    AsyncPipe,
    Button,
    ToastModule,
    InputTextModule,
    CurrenciesFormComponent,
  ],
  templateUrl: './currencies-list.component.html',
  styleUrl: './currencies-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurrenciesListComponent {
  private readonly currenciesService = inject(CurrenciesService);

  readonly panelState = signal<PanelState<Currency>>({ mode: 'idle' });
  readonly currencies$ = this.currenciesService.getAll();
  readonly loading$ = this.currenciesService.loading$;

  readonly selectedCurrency = computed(() => {
    const state = this.panelState();
    return state.mode === 'edit' ? state.item : null;
  });

  readonly isPanelOpen = computed(() => this.panelState().mode !== 'idle');

  startCreate(): void {
    this.panelState.set({ mode: 'create' });
  }

  selectCurrency(currency: Currency): void {
    this.panelState.set({ mode: 'edit', item: currency });
  }

  onSaved(): void {
    this.panelState.set({ mode: 'idle' });
  }

  onCancelled(): void {
    this.panelState.set({ mode: 'idle' });
  }
}
