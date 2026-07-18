import { ConfirmationService } from 'primeng/api';

export interface ConfirmActionOptions {
  header: string;
  message: string;
  confirmationService: ConfirmationService;
  onAccept: () => void;
  onReject?: () => void;
}

export function confirmAction(opts: ConfirmActionOptions): void {
  opts.confirmationService.confirm({
    header: opts.header,
    message: opts.message,
    icon: 'pi pi-exclamation-triangle',
    accept: () => opts.onAccept(),
    reject: () => opts.onReject?.(),
  });
}
