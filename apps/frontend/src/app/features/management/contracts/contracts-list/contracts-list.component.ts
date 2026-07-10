import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
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
export class ContractsListComponent {
  private readonly contractsService = inject(ContractsService);
  private readonly messageService = inject(MessageService);

  readonly hotelFilter = signal<string | null>(null);
  readonly marketFilter = signal<string | null>(null);
  readonly currentPage = signal<number>(0);
  readonly hasError = signal<boolean>(false);
  readonly rowsPerPage = signal<number>(10);

  readonly contracts = toSignal(this.contractsService.contracts$, {
    initialValue: [],
  });
  readonly loading = toSignal(this.contractsService.loading$, {
    initialValue: false,
  });
  readonly totalCount = toSignal(this.contractsService.totalCount$, {
    initialValue: 0,
  });

  constructor() {
    // Effect 1 : réagit UNIQUEMENT aux filtres, remet la page à 0
    effect(() => {
      this.hotelFilter();
      this.marketFilter();
      this.rowsPerPage();
      this.currentPage.set(0);
    });

    // Effect 2 : réagit à filtres + page, déclenche le fetch
    effect((onCleanup) => {
      this.hasError.set(false);
      const filters = {
        hotelId: this.hotelFilter() ?? undefined,
        marketId: this.marketFilter() ?? undefined,
      };
      const pagination = {
        limit: this.rowsPerPage(),
        offset: this.currentPage() * this.rowsPerPage(),
      };

      const subscription = this.contractsService
        .findAll(filters, pagination)
        .pipe(take(1))
        .subscribe({
          error: () => {
            this.hasError.set(true);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to load contracts',
            });
          },
        });

      onCleanup(() => subscription.unsubscribe());
    });
  }
}
