import {
  Component,
  OnInit,
  OnDestroy,
  OnChanges,
  Input,
  SimpleChanges,
  signal,
  WritableSignal,
  Signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  NgxFileDropModule,
  NgxFileDropEntry,
  FileSystemFileEntry,
} from "ngx-file-drop";
import { Hotel, DressCodePolicy } from "../../models/types";
import { HotelService } from "../../services/hotel.service";
import { Subscription, catchError, of } from "rxjs";
import { ModalComponent } from "../modal/modal.component";

interface ModalValues {
  description?: string;
  dressCode?: string;
  // ... other properties
}

@Component({
  selector: "app-description",
  standalone: true,
  imports: [CommonModule, FormsModule, NgxFileDropModule, ModalComponent],
  templateUrl: "./description.component.html",
  styleUrls: ["./description.component.scss"],
})
export class DescriptionComponent implements OnInit, OnDestroy, OnChanges {
  @Input() hotel: Hotel | null = null;

  // State signals with corrected types
  showModal = signal(false);
  modalTitle = signal("");
  modalInitialValues = signal<ModalValues>({
    description: '',
    dressCode: ''
  });
  currentEditMode = signal<keyof ModalValues>('description');

  description: string = "";
  dressCode: DressCodePolicy | null = null;
  currentFactSheet: string = "";
  private subscriptions: Subscription[] = [];

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    if (this.hotel) {
      this.loadHotelData();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["hotel"] && this.hotel) {
      this.loadHotelData();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private loadHotelData() {
    if (!this.hotel) return;

    // Subscribe to description
    this.subscriptions.push(
      this.hotelService
        .getHotelDescription(Number(this.hotel.id))
        .pipe(
          catchError((error: any) => {
            console.error("Error loading hotel description:", error);
            return of("");
          })
        )
        .subscribe((description: string) => {
          this.description = description || "";
        })
    );

    // Subscribe to dress code
    this.subscriptions.push(
      this.hotelService
        .getHotelDressCode(Number(this.hotel.id))
        .pipe(
          catchError((error: any) => {
            console.error("Error loading hotel dress code:", error);
            return of(null);
          })
        )
        .subscribe((dressCode: DressCodePolicy | null) => {
          this.dressCode = dressCode;
        })
    );

    // Subscribe to fact sheet
    this.subscriptions.push(
      this.hotelService
        .getHotelFactSheet(Number(this.hotel.id))
        .pipe(
          catchError((error: any) => {
            console.error("Error loading hotel fact sheet:", error);
            return of("");
          })
        )
        .subscribe((factSheet: string) => {
          this.currentFactSheet = factSheet || "";
        })
    );
  }

  openModal(mode: keyof ModalValues) {
    this.currentEditMode.set(mode);
    this.modalTitle.set(`Edit ${mode === 'description' ? 'Description' : 'Dress Code'}`);
    this.modalInitialValues.set({
      description: mode === 'description' ? this.description : '',
      dressCode: mode === 'dressCode' ? JSON.stringify(this.dressCode) : ''
    });
    this.showModal.set(true);
  }

  handleModalClose() {
    this.showModal.set(false);
  }

  getCurrentValue(
    mode: "description" | "dressCode"
  ): string | DressCodePolicy | null {
    if (mode === "description") {
      return this.description;
    } else if (mode === "dressCode") {
      return this.dressCode;
    }
    return null;
  }

  openDescriptionModal() {
    this.currentEditMode.set("description");
    this.modalTitle.set("Edit Hotel Description");
    this.modalInitialValues.set({
      ["description"]: this.description,
    });
    this.showModal.set(true);
  }

  openDressCodeModal() {
    this.currentEditMode.set("dressCode");
    this.modalTitle.set("Edit Dress Code");
    this.modalInitialValues.set({
      ["dressCode"]: JSON.stringify(this.dressCode),
    });
    this.showModal.set(true);
  }

  handleModalCancel() {
    this.showModal.set(false);
  }

  handleModalSubmit(data: Record<string, any>) {
    // Handle form submission
    const mode = this.currentEditMode();
    // Update your data
    this.showModal.set(false);
  }

  onFileDropped(files: NgxFileDropEntry[]) {
    if (!this.hotel) return;

    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          if (file.type === "application/pdf") {
            const previousFile = this.currentFactSheet;
            this.currentFactSheet = file.name;

            this.hotelService
              .saveHotelData(this.hotel!.id, "factSheet", file.name)
              .pipe(
                catchError((error: any) => {
                  console.error("Failed to upload fact sheet:", error);
                  this.currentFactSheet = previousFile;
                  return of(void 0);
                })
              )
              .subscribe();
          }
        });
      }
    }
  }

  viewFactSheet() {
    if (this.hotel && this.currentFactSheet) {
      this.hotelService
        .getHotelData<string>(Number(this.hotel.id), "factSheet")
        .subscribe((factSheet: string | null) => {
          if (factSheet) {
            window.open(factSheet, "_blank");
          }
        });
    }
  }

  removeFactSheet() {
    if (this.hotel && this.currentFactSheet) {
      const previousFile = this.currentFactSheet;
      this.currentFactSheet = "";

      this.hotelService
        .saveHotelData(this.hotel.id, "factSheet", null)
        .pipe(
          catchError((error: any) => {
            console.error("Failed to remove fact sheet:", error);
            this.currentFactSheet = previousFile;
            return of(void 0);
          })
        )
        .subscribe();
    }
  }

  updateFormData(key: keyof ModalValues, value: string) {
    this.modalInitialValues.update(current => ({
      ...current,
      [key]: value
    }));
  }
}