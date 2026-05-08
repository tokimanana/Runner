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
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  AgeCategory,
  RoomType,
  RoomTypeCapacity,
  RoomTypeCapacityDto,
  RoomTypeDto,
} from '@runner/shared/types';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { take } from 'rxjs';
import { HotelsService } from '../../hotels.service';

interface CapacityRow {
  ageCategory: AgeCategory;
  capacity: RoomTypeCapacity | null;
  maxPax: FormControl<number>;
  saving: boolean;
  editing: boolean;
}

@Component({
  selector: 'app-room-types-form',
  imports: [
    DialogModule,
    Button,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
  ],
  templateUrl: './room-types-form.component.html',
  styleUrl: './room-types-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomTypesFormComponent {
  private readonly hotelsService = inject(HotelsService);

  readonly hotelId = input.required<string>();
  readonly ageCategories = input<AgeCategory[]>([]);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  protected readonly _roomType = signal<RoomType | undefined>(undefined);
  readonly isEditMode = computed(() => !!this._roomType());
  readonly isSubmitting = signal(false);
  visible = false;

  readonly capacityRows = signal<CapacityRow[]>([]);

  readonly configuredRows = computed(() =>
    this.capacityRows().filter((r) => r.capacity !== null)
  );

  readonly availableRows = computed(() =>
    this.capacityRows().filter((r) => r.capacity === null)
  );

  private _suppressCancelledOnHide = false;

  readonly form = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    code: new FormControl('', {
      validators: [Validators.required, Validators.minLength(3)],
      nonNullable: true,
    }),
  });

  constructor() {
    effect(() => {
      const room = this._roomType();
      if (room) {
        this.form.patchValue(room);
        this._buildCapacityRows(room);
      } else {
        this.form.reset();
        this.capacityRows.set([]);
      }
    });
  }

  open(room?: RoomType): void {
    this._roomType.set(room);
    this.visible = true;
  }

  close(): void {
    this._suppressCancelledOnHide = true;
    this.visible = false;
    this._reset();
  }

  onDialogHide(): void {
    this._reset();
    if (!this._suppressCancelledOnHide) {
      this.cancelled.emit();
    }
    this._suppressCancelledOnHide = false;
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { name, code } = this.form.getRawValue();
    const dto: RoomTypeDto = { name, code };
    const room = this._roomType();

    this.isSubmitting.set(true);

    if (room) {
      this.hotelsService
        .updateRoomType(this.hotelId(), room.id, dto)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.isSubmitting.set(false);
            this.saved.emit();
          },
          error: () => this.isSubmitting.set(false),
        });
    } else {
      this.hotelsService
        .createRoomType(this.hotelId(), dto)
        .pipe(take(1))
        .subscribe({
          next: (created) => {
            this.isSubmitting.set(false);
            this._roomType.set(created);
            this._buildCapacityRows(created);
          },
          error: () => this.isSubmitting.set(false),
        });
    }
  }

  enableEditing(row: CapacityRow): void {
    row.editing = true;
    this.capacityRows.set([...this.capacityRows()]);
  }

  saveCapacity(row: CapacityRow): void {
    const room = this._roomType();
    if (!room || row.maxPax.invalid) return;

    row.saving = true;
    this.capacityRows.set([...this.capacityRows()]);
    const maxPax = row.maxPax.value;

    if (row.capacity) {
      this.hotelsService
        .updateRoomTypeCapacity(this.hotelId(), room.id, row.capacity.id, {
          maxPax,
        })
        .pipe(take(1))
        .subscribe({
          next: (updated) => {
            row.capacity = updated;
            row.saving = false;
            row.editing = false;
            this.capacityRows.set([...this.capacityRows()]);
          },
          error: () => {
            row.saving = false;
            this.capacityRows.set([...this.capacityRows()]);
          },
        });
    } else {
      const dto: RoomTypeCapacityDto = {
        ageCategoryId: row.ageCategory.id,
        maxPax,
      };
      this.hotelsService
        .createRoomTypeCapacity(this.hotelId(), room.id, dto)
        .pipe(take(1))
        .subscribe({
          next: (created) => {
            row.capacity = created;
            row.saving = false;
            row.editing = false;
            this.capacityRows.set([...this.capacityRows()]);
          },
          error: () => {
            row.saving = false;
            this.capacityRows.set([...this.capacityRows()]);
          },
        });
    }
  }

  deleteCapacity(row: CapacityRow): void {
    const room = this._roomType();
    if (!room || !row.capacity) return;

    this.hotelsService
      .deleteRoomTypeCapacity(this.hotelId(), room.id, row.capacity.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          row.capacity = null;
          row.maxPax.setValue(1);
          row.editing = false;
          this.capacityRows.set([...this.capacityRows()]);
        },
      });
  }

  deleteRoomType(): void {
    const room = this._roomType();
    if (!room) return;

    this.hotelsService
      .deleteRoomType(this.hotelId(), room.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.close();
          this.saved.emit();
        },
      });
  }

  private _buildCapacityRows(room: RoomType): void {
    const rows = this.ageCategories().map((cat) => {
      const existing =
        room.capacities?.find((c) => c.ageCategoryId === cat.id) ?? null;
      return {
        ageCategory: cat,
        capacity: existing,
        maxPax: new FormControl<number>(existing?.maxPax ?? 1, {
          validators: [Validators.required, Validators.min(1)],
          nonNullable: true,
        }),
        saving: false,
        editing: false,
      };
    });
    this.capacityRows.set(rows);
  }

  private _reset(): void {
    this.form.reset();
    this._roomType.set(undefined);
    this.capacityRows.set([]);
  }
}
