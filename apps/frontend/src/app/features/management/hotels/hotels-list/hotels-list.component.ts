import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { HotelsService } from '../hotels.service';
@Component({
  selector: 'app-hotels-list',
  imports: [AsyncPipe, TableModule, Button, RouterLink],
  templateUrl: './hotels-list.component.html',
  styleUrl: './hotels-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelsListComponent {
  private readonly hotelsService = inject(HotelsService);

  readonly hotels$ = this.hotelsService.getHotels();
  readonly loading$ = this.hotelsService.loading$;

  onDelete(id: string) {
    console.log('Deleting', id);
    this.hotelsService.deleteHotel(id).subscribe();
  }
}
