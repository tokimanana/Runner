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
import { RoomType, RoomTypeDto } from '@runner/shared/types';
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { take } from 'rxjs';
import { HotelsService } from '../../hotels.service';

@Component({
  selector: 'app-room-types-form',
  imports: [DialogModule, Button, ReactiveFormsModule, InputTextModule],
  templateUrl: './room-types-form.component.html',
  styleUrl: './room-types-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomTypesFormComponent {
  private readonly hotelsService = inject(HotelsService);

  readonly hotelId = input.required<string>();
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  protected readonly _roomType = signal<RoomType | undefined>(undefined);
  readonly isEditMode = computed(() => !!this._roomType());
  readonly isSubmitting = signal(false);
  visible = false;

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
      } else {
        this.form.reset();
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

    const request$ = room
      ? this.hotelsService.updateRoomType(this.hotelId(), room.id, dto)
      : this.hotelsService.createRoomType(this.hotelId(), dto);

    request$.pipe(take(1)).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.saved.emit();
      },
      error: () => this.isSubmitting.set(false),
    });
  }

  deleteRoomType(typeId: string): void {
    this.hotelsService
      .deleteRoomType(this.hotelId(), typeId)
      .pipe(take(1))
      .subscribe({
        next: () => this.saved.emit(),
        error: () => this.isSubmitting.set(false),
      });
  }

  private _reset(): void {
    this.form.reset();
    this._roomType.set(undefined);
  }
}
