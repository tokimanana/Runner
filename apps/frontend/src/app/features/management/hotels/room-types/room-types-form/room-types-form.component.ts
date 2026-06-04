import { confirmDelete } from '@/app/shared/utils/confirm-delete.util';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
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
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { take } from 'rxjs';
import { HotelsService } from '../../hotels.service';

export enum CapacityRowState {
  Idle = 'idle',
  Editing = 'editing',
  Saving = 'saving',
  Saved = 'saved',
}

interface CapacityRow {
  ageCategory: AgeCategory;
  capacity: RoomTypeCapacity | null;
  maxPax: FormControl<number>;
  state: ReturnType<typeof signal<CapacityRowState>>;
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
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly hotelId = input.required<string>();
  readonly ageCategories = input<AgeCategory[]>([]);
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  protected readonly _roomType = signal<RoomType | undefined>(undefined);
  readonly isEditMode = computed(() => !!this._roomType());

  readonly isSubmitting = signal(false);
  readonly capacityRows = signal<CapacityRow[]>([]);

  readonly visible = model(false);

  readonly configuredRows = computed(() =>
    this.capacityRows().filter((r) => r.capacity !== null)
  );
  readonly availableRows = computed(() =>
    this.capacityRows().filter((r) => r.capacity === null)
  );

  readonly CapacityRowState = CapacityRowState;

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
    this.visible.set(true);
  }

  close(): void {
    this.visible.set(false);
    this._reset();
  }

  onDialogHide(): void {
    this._reset();
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
            this.close();
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
    row.state.set(CapacityRowState.Editing);
  }

  cancelEdit(row: CapacityRow): void {
    row.maxPax.setValue(row.capacity?.maxPax ?? 1);
    row.state.set(CapacityRowState.Idle);
  }

  saveCapacity(row: CapacityRow): void {
    const room = this._roomType();
    if (!room || row.maxPax.invalid) return;

    row.state.set(CapacityRowState.Saving);
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
            row.state.set(CapacityRowState.Saved);
            setTimeout(() => row.state.set(CapacityRowState.Idle), 2000);
          },
          error: () => row.state.set(CapacityRowState.Editing),
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
            row.state.set(CapacityRowState.Idle);
            this.capacityRows.set([...this.capacityRows()]);
          },
          error: () => row.state.set(CapacityRowState.Idle),
        });
    }
  }

  deleteCapacity(row: CapacityRow): void {
    const room = this._roomType();
    if (!room || !row.capacity) return;

    this.confirmationService.confirm({
      header: 'Remove Capacity',
      message: `Remove the capacity for "${row.ageCategory.name}"?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.hotelsService
          .deleteRoomTypeCapacity(this.hotelId(), room.id, row.capacity!.id)
          .pipe(take(1))
          .subscribe({
            next: () => {
              row.capacity = null;
              row.maxPax.setValue(1);
              row.state.set(CapacityRowState.Idle);
              this.capacityRows.set([...this.capacityRows()]);
            },
          });
      },
    });
  }

  deleteRoomType(): void {
    const room = this._roomType();
    if (!room) return;

    confirmDelete({
      header: 'Delete Room Type',
      entityName: room.name,
      delete$: this.hotelsService.deleteRoomType(this.hotelId(), room.id),
      onSuccess: () => {
        this.close();
        this.saved.emit();
      },
      conflictMessage: `"${room.name}" cannot be deleted because it is used in existing contracts.`,
      confirmationService: this.confirmationService,
      messageService: this.messageService,
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
        state: signal(CapacityRowState.Idle),
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
