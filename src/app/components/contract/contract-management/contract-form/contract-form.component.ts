// src/app/components/contract/contract-management/contract-form/contract-form.component.ts
import { CommonModule } from "@angular/common";
import { Component, OnInit, inject, computed, signal, Inject } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { MatTabsModule } from "@angular/material/tabs";
import { firstValueFrom, switchMap } from "rxjs";
import {
  Contract,
  Hotel,
  Market,
  Season,
  RoomType,
  MealPlan,
} from "src/app/models/types";
import { ContractService } from "src/app/services/contract.service";
import { HotelService } from "src/app/services/hotel.service";
import { MarketService } from "src/app/services/market.service";
import { SeasonService } from "src/app/services/season.service";
import { ContractDialogData } from "../contract-list/contract-list.component";
import { MatCheckboxModule } from "@angular/material/checkbox";

@Component({
  selector: "app-contract-form",
  templateUrl: "./contract-form.component.html",
  styleUrls: ["./contract-form.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
    MatProgressSpinnerModule, 
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule
    // ... any other modules you need
  ],
})
export class ContractFormComponent implements OnInit {
  // Inject services
  private fb = inject(FormBuilder);
  private contractService = inject(ContractService);
  private hotelService = inject(HotelService);
  private marketService = inject(MarketService);
  private seasonService = inject(SeasonService);

  // Form
  contractForm: FormGroup = this.fb.group({
    name: ["", Validators.required],
    hotelId: [null, Validators.required],
    marketId: [null, Validators.required],
    seasonId: [null, Validators.required],
    description: [""],
    status: ["draft"],
    selectedRooms: [[], Validators.required],
    selectedMealPlans: [[], Validators.required],
  });

  // State signals
  loading = signal(false);
  error = signal<string | null>(null);

  // Data signals
  hotels = signal<Hotel[]>([]);
  markets = signal<Market[]>([]);
  seasons = signal<Season[]>([]);
  roomTypes = signal<RoomType[]>([]);
  mealPlans = signal<MealPlan[]>([]);

  // Computed values
  isEditMode = computed(() => this.data?.mode === "edit");
  formTitle = computed(() =>
    this.isEditMode() ? "Edit Contract" : "Create Contract"
  );
  submitButtonText = computed(() => (this.isEditMode() ? "Update" : "Create"));

  constructor(
    public dialogRef: MatDialogRef<ContractFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ContractDialogData
  ) {
    this.initForm();
  }

  private initForm() {
    this.contractForm = this.fb.group({
      name: ["", Validators.required],
      hotelId: [null, Validators.required],
      marketId: [null, Validators.required],
      seasonId: [null, Validators.required],
      description: [""],
      status: ["draft"],
      selectedRooms: [[], Validators.required],
      selectedMealPlans: [[], Validators.required],
      terms: [""],
      validFrom: [null, Validators.required],
      validTo: [null, Validators.required],
    });
  }

  private ensureContract(contract: Contract | undefined): asserts contract is Contract {
    if (!contract) {
      throw new Error('Contract is required in edit mode');
    }
  }

  async ngOnInit() {
    try {
      this.loading.set(true);
      await this.loadFormData();

      if (this.isEditMode() && this.data.contract) {  
        this.patchFormData(this.data.contract);
      }
    } catch (error) {
      this.error.set("Failed to load form data");
      console.error(error);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadFormData() {
    try {
      const [hotelsResult, marketsResult, seasonsResult] = await Promise.all([
        // Convert Observable<Hotel[]> to Promise<Hotel[]>
        firstValueFrom(this.hotelService.getHotels()),
        firstValueFrom(this.marketService.markets$),
        // Convert Map<number, Season[]> to Season[] by getting all values and flattening
        firstValueFrom(this.seasonService.seasons$).then(seasonMap => 
          Array.from(seasonMap.values()).flat()
        )
      ]);

      this.hotels.set(hotelsResult);
      this.markets.set(marketsResult);
      this.seasons.set(seasonsResult);
    } catch (error) {
      console.error('Error loading form data:', error);
      // Handle error appropriately
    }
}


  private patchFormData(contract: Contract) {
    if (!contract.hotelId) return;
    this.hotelService.getRoomTypes(contract.hotelId).subscribe(roomTypes => {
      const selectedRooms = roomTypes.filter(room => contract.selectedRoomTypes?.includes(room.id));
      this.contractForm.patchValue({
        ...contract,
        hotelId: contract.hotelId,
        marketId: contract.marketId,
        seasonId: contract.seasonId,
        selectedRooms: selectedRooms,
        selectedMealPlans: contract.selectedMealPlans || [],
      });
    });
  }

  async onHotelChange(hotelId: number) {
    if (!hotelId) return;

    try {
      this.loading.set(true);
      // Use the new getRoomTypes method
      this.hotelService.getRoomTypes(hotelId).subscribe(roomTypes => {
        this.roomTypes.set(roomTypes);
      });
      const hotel = await this.hotelService.getHotelById(hotelId);

      if (hotel) {
        this.mealPlans.set(hotel.mealPlans || []);
      }
    } catch (error) {
      this.error.set("Failed to load hotel details");
      console.error(error);
    } finally {
      this.loading.set(false);
    }
  }

  onRoomTypeChange(checked: boolean, room: RoomType) {
    const selectedRooms = this.contractForm.value.selectedRooms || [];
    if (checked) {
      this.contractForm.patchValue({
        selectedRooms: [...selectedRooms, room]
      });
    } else {
      this.contractForm.patchValue({
        selectedRooms: selectedRooms.filter((selectedRoom: any) => selectedRoom.id !== room.id)
      });
    }
  }

  async onSubmit() {
    if (this.contractForm.invalid) return;

    try {
      this.loading.set(true);
      const formData = this.contractForm.value;
      
      // Convert selectedRooms back to IDs before submitting
      const selectedRoomIds = formData.selectedRooms.map((room: RoomType) => room.id);
      const formDataWithRoomIds = { ...formData, selectedRooms: selectedRoomIds };

      if (this.isEditMode()) {
        // Use the type guard before accessing contract
        this.ensureContract(this.data.contract);
        await this.contractService.updateContract(
          this.data.contract.id,
          formDataWithRoomIds
        );
      } else {
        await this.contractService.createContract(formDataWithRoomIds);
      }

      this.dialogRef.close(true);
    } catch (error) {
      this.error.set(
        this.isEditMode()
          ? "Failed to update contract"
          : "Failed to create contract"
      );
      console.error(error);
    } finally {
      this.loading.set(false);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  compareById(item1: any, item2: any): boolean {
    return item1 && item2 && item1.id === item2.id;
  }
}
