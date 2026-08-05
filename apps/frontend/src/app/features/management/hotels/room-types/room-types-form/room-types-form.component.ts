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
  OccupancyGuidance,
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

// Générique — partagée entre la section Capacities et la section
// Occupancy Guidance (S4-FE-014-BIS), même cycle idle/editing/saving/saved
// pour les deux, aucune raison de dupliquer.
export enum EditableRowState {
  Idle = 'idle',
  Editing = 'editing',
  Saving = 'saving',
  Saved = 'saved',
}

interface CapacityRow {
  ageCategory: AgeCategory;
  capacity: RoomTypeCapacity | null;
  maxPax: FormControl<number>;
  state: ReturnType<typeof signal<EditableRowState>>;
}

interface GuidanceRowForm {
  description: FormControl<string>;
  maxAdults: FormControl<number>;
  maxTeens: FormControl<number>;
  maxChildren: FormControl<number>;
  maxInfants: FormControl<number>;
}

interface GuidanceRow {
  // tempId sert de clé stable pour le tracking, y compris pour une ligne
  // jamais sauvegardée (guidance === null) — l'id serveur n'existe pas encore.
  tempId: string;
  guidance: OccupancyGuidance | null;
  form: FormGroup<GuidanceRowForm>;
  state: ReturnType<typeof signal<EditableRowState>>;
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
  readonly guidanceRows = signal<GuidanceRow[]>([]);

  readonly visible = model(false);

  readonly configuredRows = computed(() =>
    this.capacityRows().filter((r) => r.capacity !== null)
  );
  readonly availableRows = computed(() =>
    this.capacityRows().filter((r) => r.capacity === null)
  );

  readonly EditableRowState = EditableRowState;

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
        this._loadGuidanceRows(room);
      } else {
        this.form.reset();
        this.capacityRows.set([]);
        this.guidanceRows.set([]);
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
    row.state.set(EditableRowState.Editing);
  }

  cancelEdit(row: CapacityRow): void {
    row.maxPax.setValue(row.capacity?.maxPax ?? 1);
    row.state.set(EditableRowState.Idle);
  }

  saveCapacity(row: CapacityRow): void {
    const room = this._roomType();
    if (!room || row.maxPax.invalid) return;

    row.state.set(EditableRowState.Saving);
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
            row.state.set(EditableRowState.Saved);
            setTimeout(() => row.state.set(EditableRowState.Idle), 2000);
          },
          error: () => row.state.set(EditableRowState.Editing),
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
            row.state.set(EditableRowState.Idle);
            this.capacityRows.set([...this.capacityRows()]);
          },
          error: () => row.state.set(EditableRowState.Idle),
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
              row.state.set(EditableRowState.Idle);
              this.capacityRows.set([...this.capacityRows()]);
            },
          });
      },
    });
  }

  // --- Occupancy Guidance (S4-FE-014-BIS) ---
  // Contrairement aux Capacities (une ligne par AgeCategory de l'hôtel, fixe),
  // les guidances sont une liste librement addable/supprimable — pas de
  // dérivation depuis une autre collection.

  addGuidanceRow(): void {
    this.guidanceRows.update((rows) => [
      ...rows,
      {
        tempId: crypto.randomUUID(),
        guidance: null,
        form: this._buildGuidanceForm(),
        state: signal(EditableRowState.Editing),
      },
    ]);
  }

  enableGuidanceEditing(row: GuidanceRow): void {
    row.state.set(EditableRowState.Editing);
  }

  cancelGuidanceEdit(row: GuidanceRow): void {
    if (!row.guidance) {
      // Jamais sauvegardée — annuler = la retirer, rien à restaurer.
      this._removeGuidanceRow(row.tempId);
      return;
    }
    row.form.patchValue(row.guidance);
    row.state.set(EditableRowState.Idle);
  }

  saveGuidance(row: GuidanceRow): void {
    const room = this._roomType();
    row.form.markAllAsTouched();
    if (!room || row.form.invalid) return;

    row.state.set(EditableRowState.Saving);
    const { description, maxAdults, maxTeens, maxChildren, maxInfants } =
      row.form.getRawValue();

    if (row.guidance) {
      this.hotelsService
        .updateOccupancyGuidance(row.guidance.id, {
          description,
          maxAdults,
          maxTeens,
          maxChildren,
          maxInfants,
        })
        .pipe(take(1))
        .subscribe({
          next: (updated) => {
            row.guidance = updated;
            row.state.set(EditableRowState.Saved);
            setTimeout(() => row.state.set(EditableRowState.Idle), 2000);
          },
          error: () => row.state.set(EditableRowState.Editing),
        });
    } else {
      this.hotelsService
        .createOccupancyGuidance({
          roomTypeId: room.id,
          description,
          maxAdults,
          maxTeens,
          maxChildren,
          maxInfants,
        })
        .pipe(take(1))
        .subscribe({
          next: (created) => {
            row.guidance = created;
            row.state.set(EditableRowState.Idle);
            this.guidanceRows.set([...this.guidanceRows()]);
          },
          error: () => row.state.set(EditableRowState.Editing),
        });
    }
  }

  deleteGuidance(row: GuidanceRow): void {
    if (!row.guidance) {
      this._removeGuidanceRow(row.tempId);
      return;
    }

    this.confirmationService.confirm({
      header: 'Remove Occupancy Guidance',
      message: `Remove the guidance "${row.guidance.description}"?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.hotelsService
          .deleteOccupancyGuidance(row.guidance!.id)
          .pipe(take(1))
          .subscribe({
            next: () => this._removeGuidanceRow(row.tempId),
          });
      },
    });
  }

  private _buildGuidanceForm(
    guidance?: OccupancyGuidance
  ): FormGroup<GuidanceRowForm> {
    return new FormGroup<GuidanceRowForm>({
      description: new FormControl(guidance?.description ?? '', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      maxAdults: new FormControl(guidance?.maxAdults ?? 0, {
        validators: [Validators.required, Validators.min(0)],
        nonNullable: true,
      }),
      maxTeens: new FormControl(guidance?.maxTeens ?? 0, {
        validators: [Validators.required, Validators.min(0)],
        nonNullable: true,
      }),
      maxChildren: new FormControl(guidance?.maxChildren ?? 0, {
        validators: [Validators.required, Validators.min(0)],
        nonNullable: true,
      }),
      maxInfants: new FormControl(guidance?.maxInfants ?? 0, {
        validators: [Validators.required, Validators.min(0)],
        nonNullable: true,
      }),
    });
  }

  private _loadGuidanceRows(room: RoomType): void {
    this.hotelsService
      .getOccupancyGuidances(room.id)
      .pipe(take(1))
      .subscribe((guidances) => {
        this.guidanceRows.set(
          guidances.map((guidance) => ({
            tempId: guidance.id,
            guidance,
            form: this._buildGuidanceForm(guidance),
            state: signal(EditableRowState.Idle),
          }))
        );
      });
  }

  private _removeGuidanceRow(tempId: string): void {
    this.guidanceRows.update((rows) => rows.filter((r) => r.tempId !== tempId));
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
        state: signal(EditableRowState.Idle),
      };
    });
    this.capacityRows.set(rows);
  }

  private _reset(): void {
    this.form.reset();
    this._roomType.set(undefined);
    this.capacityRows.set([]);
    this.guidanceRows.set([]);
  }
}
