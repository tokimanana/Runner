import { ConfirmationService, MessageService } from 'primeng/api';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

export interface ConfirmDeleteOptions {
  header: string;
  entityName: string;
  delete$: Observable<void>;
  onSuccess?: () => void;
  conflictMessage?: string;
  confirmationService: ConfirmationService;
  messageService: MessageService;
}

export function confirmDelete(opts: ConfirmDeleteOptions): void {
  opts.confirmationService.confirm({
    header: opts.header,
    message: `Are you sure you want to delete "${opts.entityName}"?`,
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      opts.delete$.pipe(take(1)).subscribe({
        next: () => {
          opts.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: `"${opts.entityName}" has been deleted.`,
          });
          opts.onSuccess?.();
        },
        error: (err: { status: number }) => {
          const is409 = err.status === 409;
          opts.messageService.add({
            severity: is409 ? 'warn' : 'error',
            summary: is409 ? 'Cannot delete' : 'Error',
            detail: is409
              ? (opts.conflictMessage ??
                `"${opts.entityName}" is used by existing records.`)
              : 'An unexpected error occurred.',
          });
        },
      });
    },
  });
}
