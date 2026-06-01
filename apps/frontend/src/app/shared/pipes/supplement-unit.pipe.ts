import { Pipe, PipeTransform } from '@angular/core';
import { SupplementUnit } from '@runner/shared/types';

const UNIT_LABELS: Record<SupplementUnit, string> = {
  PER_PERSON_PER_NIGHT: 'Per person / per night',
  PER_PERSON_PER_STAY: 'Per person / per stay',
  PER_ROOM_PER_NIGHT: 'Per room / per night',
  PER_ROOM_PER_STAY: 'Per room / per stay',
};

@Pipe({
  name: 'supplementUnit',
})
export class SupplementUnitPipe implements PipeTransform {
  transform(value: SupplementUnit): string {
    return UNIT_LABELS[value] ?? value;
  }
}
