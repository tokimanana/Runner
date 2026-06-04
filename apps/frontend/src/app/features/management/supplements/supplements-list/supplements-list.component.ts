import { SupplementUnitPipe } from '@/app/shared/pipes/supplement-unit.pipe';
import { PanelState } from '@/app/shared/types/panel-state.type';
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Supplement } from '@runner/shared/types';
import { Button } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { SupplementsFormComponent } from '../supplements-form/supplements-form.component';
import { SupplementsService } from '../supplements.service';

@Component({
  selector: 'app-supplements-list',
  imports: [
    AsyncPipe,
    Button,
    ToastModule,
    FormsModule,
    InputTextModule,
    SupplementsFormComponent,
    SupplementUnitPipe,
  ],
  templateUrl: './supplements-list.component.html',
  styleUrl: './supplements-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplementsListComponent {
  private readonly supplementsService = inject(SupplementsService);

  readonly panelState = signal<PanelState<Supplement>>({ mode: 'idle' });
  readonly supplements$ = this.supplementsService.getAll();
  readonly loading$ = this.supplementsService.loading$;
  readonly searchQuery = signal('');

  readonly selectedSupplement = computed(() => {
    const state = this.panelState();
    return state.mode === 'edit' ? state.item : null;
  });

  readonly isPanelOpen = computed(() => this.panelState().mode !== 'idle');

  startCreate(): void {
    this.panelState.set({ mode: 'create' });
  }

  selectSupplement(supplement: Supplement): void {
    this.panelState.set({ mode: 'edit', item: supplement });
  }

  onSaved(): void {
    this.panelState.set({ mode: 'idle' });
  }

  onCancelled(): void {
    this.panelState.set({ mode: 'idle' });
  }

  filterSupplements(supplements: Supplement[]): Supplement[] {
    const q = this.searchQuery().toLowerCase();
    if (!q) return supplements;
    return supplements.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
    );
  }
}
