import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoomType } from '@runner/shared/types';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { take } from 'rxjs';
import { HotelsService } from '../../hotels.service';

@Component({
  selector: 'app-room-types-list',
  imports: [
    ButtonModule,
    ConfirmDialogModule,
    IconFieldModule,
    InputIconModule,
    FormsModule,
    InputTextModule,
    TableModule,
  ],
  templateUrl: './room-types-list.component.html',
  styleUrl: './room-types-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomTypesListComponent {
  private readonly hotelsService = inject(HotelsService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly hotelId = input.required<string>();

  readonly roomTypes = signal<RoomType[]>([]);
  readonly loading = signal(false);
  readonly search = signal('');

  readonly addRoom = output<void>();
  readonly editRoom = output<RoomType>();

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    if (!q) return this.roomTypes();
    return this.roomTypes().filter(
      (r) =>
        r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q)
    );
  });

  constructor() {
    effect(() => this.loadRooms(this.hotelId()));
  }

  loadRooms(hotelId: string): void {
    this.loading.set(true);
    this.hotelsService
      .getRoomTypes(hotelId)
      .pipe(take(1))
      .subscribe({
        next: (rooms) => {
          this.roomTypes.set(rooms);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  confirmDelete(room: RoomType): void {
    this.confirmationService.confirm({
      message: `Delete "${room.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.hotelsService
          .deleteRoomType(this.hotelId(), room.id)
          .pipe(take(1))
          .subscribe({
            next: () => this.loadRooms(this.hotelId()),
            error: () => {},
          });
      },
    });
  }
}
