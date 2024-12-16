// src/app/components/contract/contract-management/contract-form/contract-form.component.ts
import { CommonModule } from "@angular/common";
import {
  Component,
  OnInit,
  inject,
  computed,
  signal,
  Inject,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
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
    MatCheckboxModule,
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
    });
  }

  private ensureContract(
    contract: Contract | undefined
  ): asserts contract is Contract {
    if (!contract) {
      throw new Error("Contract is required in edit mode");
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
      const [hotelsResult, marketsResult] = await Promise.all([
        firstValueFrom(this.hotelService.getHotels()),
        firstValueFrom(this.marketService.markets$),
      ]);

      this.hotels.set(hotelsResult);
      this.markets.set(marketsResult);

      // If editing, load seasons for the selected hotel
      if (this.isEditMode() && this.data.contract?.hotelId) {
        const seasons = await this.seasonService.getSeasonsByHotel(
          this.data.contract.hotelId
        );
        this.seasons.set(seasons);
      }
    } catch (error) {
      console.error("Error loading form data:", error);
    }
  }

  private async patchFormData(contract: Contract) {
    if (!contract.hotelId) return;

    try {
      const [roomTypes, hotel, seasons] = await Promise.all([
        firstValueFrom(this.hotelService.getRoomTypes(contract.hotelId)),
        this.hotelService.getHotelById(contract.hotelId),
        this.seasonService.getSeasonsByHotel(contract.hotelId),
      ]);

      this.roomTypes.set(roomTypes || []);
      this.seasons.set(seasons || []);

      if (hotel?.mealPlans) {
        this.mealPlans.set(hotel.mealPlans);
      }

      // Patch form with existing values
      this.contractForm.patchValue({
        ...contract,
        selectedRooms: roomTypes.filter((room) =>
          contract.selectedRoomTypes?.includes(room.id)
        ),
        selectedMealPlans: hotel?.mealPlans?.filter((mealPlan) =>
          contract.selectedMealPlans?.includes(mealPlan.type)
        ) || []
      });
      
    } catch (error) {
      console.error("Error patching form data:", error);
    }
  }

  isRoomSelected(room: RoomType): boolean {
    const selectedRooms = this.contractForm.get("selectedRooms")?.value || [];
    return selectedRooms.some(
      (selectedRoom: RoomType) => selectedRoom.id === room.id
    );
  }

  isMealPlanSelected(mealPlan: MealPlan): boolean {
    const selectedMealPlans =
      this.contractForm.get("selectedMealPlans")?.value || [];
    return selectedMealPlans.some(
      (selected: MealPlan) => selected.type === mealPlan.type
    );
  }

  onMealPlanChange(checked: boolean, mealPlan: MealPlan) {
    const selectedMealPlans = this.contractForm.value.selectedMealPlans || [];
    if (checked) {
      this.contractForm.patchValue({
        selectedMealPlans: [...selectedMealPlans, mealPlan],
      });
    } else {
      this.contractForm.patchValue({
        selectedMealPlans: selectedMealPlans.filter(
          (selected: MealPlan) => selected.type !== mealPlan.type
        ),
      });
    }
  }

  async onHotelChange(hotelId: number) {
    if (!hotelId) return;

    try {
      this.loading.set(true);

      const [roomTypes, hotel, seasons] = await Promise.all([
        firstValueFrom(this.hotelService.getRoomTypes(hotelId)),
        this.hotelService.getHotelById(hotelId),
        this.seasonService.getSeasonsByHotel(hotelId),
      ]);

      this.roomTypes.set(roomTypes || []);
      this.seasons.set(seasons || []);

      if (hotel?.mealPlans) {
        this.mealPlans.set(hotel.mealPlans);
      }

      // Reset dependent fields
      this.contractForm.patchValue({
        seasonId: null,
        selectedRooms: [],
        selectedMealPlans: [],
      });
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
        selectedRooms: [...selectedRooms, room],
      });
    } else {
      this.contractForm.patchValue({
        selectedRooms: selectedRooms.filter(
          (selectedRoom: any) => selectedRoom.id !== room.id
        ),
      });
    }
  }

  async onSubmit() {
    if (this.contractForm.invalid) return;

    try {
      this.loading.set(true);
      const formData = this.contractForm.value;

      // Convert selectedRooms and selectedMealPlans back to IDs/types before submitting
      const selectedRoomIds = formData.selectedRooms.map(
        (room: RoomType) => room.id
      );
      const selectedMealPlanTypes = formData.selectedMealPlans.map(
        (meal: MealPlan) => meal.type
      );

      const formDataWithIds = {
        ...formData,
        selectedRooms: selectedRoomIds,
        selectedMealPlans: selectedMealPlanTypes,
      };

      if (this.isEditMode()) {
        this.ensureContract(this.data.contract);
        await this.contractService.updateContract(
          this.data.contract.id,
          formDataWithIds
        );
      } else {
        await this.contractService.createContract(formDataWithIds);
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
