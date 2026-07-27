import { confirmDelete } from '@/app/shared/utils/confirm-delete.util';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Contract } from '@runner/shared/types';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { take } from 'rxjs';
import { HotelsService } from '../../hotels/hotels.service';
import { MarketsService } from '../../markets/markets.service';
import { ContractsService } from '../contracts.service';

@Component({
  selector: 'app-contracts-list',
  imports: [
    Button,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ConfirmDialog,
    RouterLink,
    Select,
  ],
  templateUrl: './contracts-list.component.html',
  styleUrl: './contracts-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractsListComponent {
  private readonly contractsService = inject(ContractsService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly hotelsService = inject(HotelsService);
  private readonly marketsService = inject(MarketsService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly hotelFilter = signal<string | null>(null);
  readonly marketFilter = signal<string | null>(null);
  readonly currentPage = signal<number>(0);
  readonly hasError = signal<boolean>(false);
  readonly rowsPerPage = signal<number>(10);
  readonly rowsPerPageOptions: number[] = [10, 25, 50];

  readonly paginationEnd = computed(() =>
    Math.min((this.currentPage() + 1) * this.rowsPerPage(), this.totalCount())
  );

  readonly contracts = toSignal(this.contractsService.contracts$, {
    initialValue: [],
  });
  readonly loading = toSignal(this.contractsService.loading$, {
    initialValue: false,
  });
  readonly totalCount = toSignal(this.contractsService.totalCount$, {
    initialValue: 0,
  });

  readonly hotels = toSignal(this.hotelsService.getHotels(), {
    initialValue: [],
  });
  readonly markets = toSignal(this.marketsService.getAll(), {
    initialValue: [],
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
      const subscription = this.fetchContracts();
      onCleanup(() => subscription.unsubscribe());
    });
  }

  confirmDelete(contract: Contract): void {
    confirmDelete({
      header: 'Delete Contract',
      entityName: contract.name,
      delete$: this.contractsService.remove(contract.id),
      conflictMessage: `"${contract.name}" still has existing contract periods.`,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
    });
  }

  retry(): void {
    this.fetchContracts();
  }

  goToCreate(): void {
    this.router.navigate(['/management/contracts/create']);
  }

  private fetchContracts() {
    this.hasError.set(false);
    const filters = {
      hotelId: this.hotelFilter() ?? undefined,
      marketId: this.marketFilter() ?? undefined,
    };
    const pagination = {
      limit: this.rowsPerPage(),
      offset: this.currentPage() * this.rowsPerPage(),
    };

    return this.contractsService
      .findAll(filters, pagination)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
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
  }
}
