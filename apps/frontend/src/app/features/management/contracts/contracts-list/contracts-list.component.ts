import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { take } from 'rxjs';
import { ContractsService } from '../contracts.service';

@Component({
  selector: 'app-contracts-list',
  imports: [],
  templateUrl: './contracts-list.component.html',
  styleUrl: './contracts-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractsListComponent implements OnInit {
  private readonly contractsService = inject(ContractsService);
  private readonly messageService = inject(MessageService);

  readonly hotelFilter = signal<string | null>(null);
  readonly marketFilter = signal<string | null>(null);
  readonly currentPage = signal<number>(0);

  readonly contracts = toSignal(this.contractsService.contracts$, {
    initialValue: [],
  });
  readonly loading = toSignal(this.contractsService.loading$, {
    initialValue: false,
  });

  constructor() {
    effect(() => {
      const filters = {
        hotelId: this.hotelFilter() ?? undefined,
        marketId: this.marketFilter() ?? undefined,
      };
      const pagination = { limit: 10, offset: this.currentPage() * 10 };

      this.contractsService
        .findAll(filters, pagination)
        .pipe(take(1))
        .subscribe({
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to load contracts',
            });
          },
        });
    });
  }
}
