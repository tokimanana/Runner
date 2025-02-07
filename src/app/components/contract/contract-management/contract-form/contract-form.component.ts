import { MealPlanService } from "./../../../../services/meal-plan.service";
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
  FormArray,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
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
  ContractStatus,
  MealPlanType,
} from "src/app/models/types";
import { ContractService } from "src/app/services/contract.service";
import { HotelService } from "src/app/services/hotel.service";
import { MarketService } from "src/app/services/market.service";
import { SeasonService } from "src/app/services/season.service";
import { ContractDialogData } from "../contract-list/contract-list.component";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { RatesConfigComponent } from "../rates-config/rates-config.component";
import { MatListOption, MatSelectionList } from "@angular/material/list";

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
  ],
})
export class ContractFormComponent implements OnInit {
  // Inject services
  private fb = inject(FormBuilder);
  private contractService = inject(ContractService);
  private hotelService = inject(HotelService);
  private marketService = inject(MarketService);
  private seasonService = inject(SeasonService);
  private MealPlanService = inject(MealPlanService);
  private dialog = inject(MatDialog);

  // Form
  contractForm: FormGroup = this.fb.group({
    name: ["", Validators.required],
    hotelId: [null, Validators.required],
    marketId: [null, Validators.required],
    seasonId: [null, Validators.required],
    description: [""],
    status: ["draft"],
    selectedRoomTypes: this.fb.control([], Validators.required),
    selectedMealPlans: [[], Validators.required],
    baseMealPlan: [null, Validators.required],
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
      selectedRoomTypes: [[], Validators.required],
      selectedMealPlans: [[], Validators.required],
      baseMealPlan: [null, Validators.required],
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
      const [roomTypes, seasons, mealPlans] = await Promise.all([
        firstValueFrom(this.hotelService.getRoomTypes(contract.hotelId)),
        this.seasonService.getSeasonsByHotel(contract.hotelId),
        firstValueFrom(
          this.MealPlanService.getMealPlansByHotel(contract.hotelId)
        ),
      ]);

      this.roomTypes.set(roomTypes || []);
      this.seasons.set(seasons || []);
      this.mealPlans.set(mealPlans || []);

      // *** Move selectedRooms calculation here ***
      const selectedRooms = this.roomTypes().filter((room) =>
        contract.selectedRoomTypes?.includes(room.id)
      );

      console.log("Selected rooms:", selectedRooms);

      // Patch form with existing values, extracting IDs and types
      this.contractForm.patchValue({
        name: contract.name,
        hotelId: contract.hotelId,
        marketId: contract.marketId,
        seasonId: contract.seasonId,
        description: contract.description,
        status: contract.status,
        selectedRoomTypes: contract.selectedRoomTypes || [],
        selectedMealPlans: contract.selectedMealPlans || [],
        baseMealPlan: contract.baseMealPlan,
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
    const currentBaseMealPlan = this.contractForm.get("baseMealPlan")?.value;
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

    if (
      currentBaseMealPlan &&
      !selectedMealPlans.includes(currentBaseMealPlan)
    ) {
      this.contractForm.patchValue({ baseMealPlan: null });
    }
  }

  async onHotelChange(hotelId: number) {
    if (!hotelId) return;

    try {
      this.loading.set(true);

      const [roomTypes, seasons, mealPlans] = await Promise.all([
        firstValueFrom(this.hotelService.getRoomTypes(hotelId)),
        this.seasonService.getSeasonsByHotel(hotelId),
        firstValueFrom(this.MealPlanService.getMealPlansByHotel(hotelId)),
      ]);

      this.roomTypes.set(roomTypes || []);
      this.seasons.set(seasons || []);
      this.mealPlans.set(mealPlans || []);

      // Reset dependent fields
      this.contractForm.patchValue({
        seasonId: null,
        selectedRooms: [],
        selectedMealPlans: [],
        baseMealPlan: null,
      });
    } catch (error) {
      this.error.set("Failed to load hotel details");
      console.error(error);
    } finally {
      this.loading.set(false);
    }
  }

  onRoomTypeChange(checked: boolean, room: RoomType) {
    const selectedRoomTypes = this.contractForm.value.selectedRoomTypes || [];
    if (checked) {
      this.contractForm.patchValue({
        selectedRoomTypes: [...selectedRoomTypes, room],
      });
    } else {
      this.contractForm.patchValue({
        selectedRoomTypes: selectedRoomTypes.filter(
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

        const contractData = {
            name: formData.name,
            code: `CNT-${Date.now()}`,
            hotelId: Number(formData.hotelId),
            marketId: Number(formData.marketId),
            seasonId: Number(formData.seasonId),
            description: formData.description || '',
            status: 'no_rate' as ContractStatus,
            selectedRoomTypes: formData.selectedRoomTypes,
            selectedMealPlans: [MealPlanType.HB], // Use enum value
            baseMealPlan: MealPlanType.HB, // Use enum value
            isRatesConfigured: false,
            validityPeriod: {
                startDate: new Date().toISOString(),
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
            }
        };

        console.log('Submitting contract data:', contractData);

        if (this.isEditMode()) {
            this.ensureContract(this.data.contract);
            await this.contractService.updateContract(this.data.contract.id, contractData);
        } else {
            await this.contractService.createContract(contractData);
        }

        this.dialogRef.close(true);
    } catch (error) {
        this.error.set(this.isEditMode() ? "Failed to update contract" : "Failed to create contract");
        console.error('Contract submission error:', error);
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

  openRatesConfigDialog(contract: Contract) {
    const mealPlanIdMap: { [key: string]: string } = {
      RO: "default-ro",
      BB: "default-bb",
      HB: "default-hb",
      FB: "default-fb",
      AI: "default-ai",
      "BB+": "riveria-bb-plus",
      "HB+": "riveria-hb-plus",
      "AI+": "maldives-ai-plus",
      UAI: "maldives-uai",
    };

    const dialogRef = this.dialog.open(RatesConfigComponent, {
      width: "90%",
      data: {
        contract: contract,
        periods:
          this.seasons().find((s) => s.id === contract.seasonId)?.periods || [],
        roomTypes: this.roomTypes(),
        mealPlans: contract.selectedMealPlans.map(
          (mealPlan) => mealPlanIdMap[mealPlan]
        ),
      },
    });
  }
}
