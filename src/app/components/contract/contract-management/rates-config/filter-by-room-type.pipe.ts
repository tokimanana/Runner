import { Pipe, PipeTransform,  } from '@angular/core';
import { RoomTypeRate } from '../../../../models/types';

@Pipe({
  name: 'filterByRoomType',
  standalone: true
})
export class FilterByRoomTypePipe implements PipeTransform {
  transform(roomRates: RoomTypeRate[], roomTypeId: number): RoomTypeRate[] {
    if (!roomRates || !roomTypeId) {
      return [];
    }
    return roomRates.filter(roomRate => roomRate.roomTypeId === roomTypeId);
  }
}
