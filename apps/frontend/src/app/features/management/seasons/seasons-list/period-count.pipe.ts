import { Pipe, PipeTransform } from '@angular/core';
import { SeasonPeriod } from '@runner/shared/types';

@Pipe({
  name: 'periodCount',
  standalone: true,
})
export class PeriodCountPipe implements PipeTransform {
  transform(periods: SeasonPeriod[] | undefined): string {
    const count = periods?.length ?? 0;
    if (count === 0) return 'No periods';
    return `${count} period${count > 1 ? 's' : ''}`;
  }
}
