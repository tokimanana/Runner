import { DatePipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Types internes
import {
  AgeCategory,
  BaseRateReference,
  BillingUnit,
  ContractDto,
  PricingMode,
  RoomType,
  Season,
  SharingType,
} from '@runner/shared/types';

// PrimeNG core & APIs
import { ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';

// Composants Standalone PrimeNG v19
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionPanel,
} from 'primeng/accordion';
import { Button } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DatePicker } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { MultiSelect } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import {
  Step,
  StepList,
  StepPanel,
  StepPanels,
  Stepper,
} from 'primeng/stepper';

// RxJS operators
import { filter, pairwise, startWith, switchMap } from 'rxjs';

// Services métiers
import { confirmAction } from '@/app/shared/utils/confirm-action.util';
import { isValidDateRange } from '@/app/shared/utils/date-range.util';
import { CurrenciesService } from '../../currencies/currencies.service';
import { HotelsService } from '../../hotels/hotels.service';
import { MarketsService } from '../../markets/markets.service';
import { MealPlansService } from '../../meal-plans/meal-plans.service';
import { SeasonsService } from '../../seasons/seasons.service';
import { ContractsService } from '../contracts.service';
import {
  emptyBaseRate,
  LocalAgePolicyEntry,
  LocalBaseRate,
  LocalContractPeriod,
  LocalMealPlanSupplement,
  LocalRoomPrice,
  LocalStopSalesDate,
} from './contract-form.types';

@Component({
  selector: 'app-contract-form',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgTemplateOutlet,
    DatePipe,

    InputText,
    InputNumber,
    DatePicker,
    Select,
    SelectButton,
    MultiSelect,
    Button,
    TableModule,
    ConfirmDialog,

    Accordion,
    AccordionPanel,
    AccordionHeader,
    AccordionContent,

    Stepper,
    StepList,
    Step,
    StepPanels,
    StepPanel,
  ],
  templateUrl: './contract-form.component.html',
  styleUrl: './contract-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractFormComponent {
  private readonly hotelsService = inject(HotelsService);
  private readonly marketsService = inject(MarketsService);
  private readonly currenciesService = inject(CurrenciesService);
  private readonly seasonsService = inject(SeasonsService);
  private readonly mealPlansService = inject(MealPlansService);
  private readonly contractsService = inject(ContractsService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly activeStep = signal<number>(1);

  // Step 1
  readonly step1Form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    hotelId: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    marketId: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
    currencyId: new FormControl('', {
      nonNullable: true,
      validators: Validators.required,
    }),
  });
  readonly step1Data = signal<ContractDto | null>(null);

  readonly hotels = toSignal(this.hotelsService.getHotels(), {
    initialValue: [],
  });
  readonly markets = toSignal(this.marketsService.getAll(), {
    initialValue: [],
  });
  readonly currencies = toSignal(this.currenciesService.getAll(), {
    initialValue: [],
  });

  // Step 2
  readonly localPeriods = signal<LocalContractPeriod[]>([]);
  readonly draftPeriods = signal<LocalContractPeriod[]>([]);
  readonly selectedSeasonId = signal<string | null>(null);
  readonly periodStepError = signal<boolean>(false);
  readonly draftConfirmError = signal<string | null>(null);

  readonly sortedLocalPeriods = computed(() =>
    [...this.localPeriods()].sort(
      (a, b) => (a.startDate?.getTime() ?? 0) - (b.startDate?.getTime() ?? 0)
    )
  );

  readonly seasons = toSignal(this.seasonsService.getSeasons(), {
    initialValue: [],
  });
  readonly mealPlans = toSignal(this.mealPlansService.getAll(), {
    initialValue: [],
  });

  readonly allSeasonPeriods = computed(() =>
    this.seasons().flatMap((season: Season) => season.seasonPeriods ?? [])
  );

  // Step 3 Helpers & Derived Context
  readonly selectedHotelName = computed(() => {
    const id = this.step1Form.controls.hotelId.value;
    return this.hotels().find((h) => h.id === id)?.name ?? 'N/A';
  });

  readonly selectedMarketName = computed(() => {
    const id = this.step1Form.controls.marketId.value;
    return this.markets().find((m) => m.id === id)?.name ?? 'N/A';
  });

  readonly selectedCurrencyCode = computed(() => {
    const id = this.step1Form.controls.currencyId.value;
    return this.currencies().find((c) => c.id === id)?.code ?? 'USD';
  });

  readonly mealPlansById = computed(() => {
    const map = new Map<string, string>();
    for (const mp of this.mealPlans()) {
      map.set(mp.id, mp.code || mp.name);
    }
    return map;
  });

  readonly selectedRoomTypeIds = signal<string[]>([]);
  readonly localRoomPrices = signal<LocalRoomPrice[]>([]);
  readonly localAgePolicies = signal<LocalAgePolicyEntry[]>([]);
  readonly roomPriceStepError = signal<boolean>(false);

  readonly sharingTypeOptions: { label: string; value: SharingType }[] = [
    { label: 'With parents', value: 'WITH_PARENTS' },
    { label: 'Separate room', value: 'SEPARATE_ROOM' },
  ];

  readonly pricingModeOptions: { label: string; value: PricingMode }[] = [
    { label: 'Per room', value: 'PER_ROOM' },
    { label: 'Per occupancy', value: 'PER_OCCUPANCY' },
  ];

  // baseRateReference exclut volontairement 'thirdPersonAdult' — jamais utilisé
  // comme base de calcul d'une règle AgePolicy (confirmé sur les 8 contrats, S4-BE-014-BIS)
  readonly baseRateReferenceOptionsAll: {
    label: string;
    value: BaseRateReference;
  }[] = [
    { label: 'Single', value: 'single' },
    { label: 'Half Double', value: 'halfDouble' },
    { label: 'Triple', value: 'triple' },
    { label: 'Quadruple', value: 'quadruple' },
  ];

  // Step 4
  readonly localMealPlanSupplements = signal<LocalMealPlanSupplement[]>([]);

  // billingUnit n'a volontairement aucune valeur par défaut : select vide tant
  // que l'agent n'a pas choisi explicitement (friction assumée, cf. décision
  // S4-FE-007 — pas de valeur silencieuse qui se multiplie par la durée/volume)
  readonly billingUnitOptions: { label: string; value: BillingUnit }[] = [
    { label: 'Per Night', value: 'PER_NIGHT' },
    { label: 'Per Stay', value: 'PER_STAY' },
  ];

  // Step 5
  readonly localStopSalesDates = signal<LocalStopSalesDate[]>([]);

  // Step 4
  readonly localMealPlanSupplements = signal<LocalMealPlanSupplement[]>([]);

  // billingUnit n'a volontairement aucune valeur par défaut : select vide tant
  // que l'agent n'a pas choisi explicitement (friction assumée, cf. décision
  // S4-FE-007 — pas de valeur silencieuse qui se multiplie par la durée/volume)
  readonly billingUnitOptions: { label: string; value: BillingUnit }[] = [
    { label: 'Per Night', value: 'PER_NIGHT' },
    { label: 'Per Stay', value: 'PER_STAY' },
  ];

  readonly roomTypes = toSignal(
    this.step1Form.controls.hotelId.valueChanges.pipe(
      startWith(this.step1Form.controls.hotelId.value),
      filter((hotelId): hotelId is string => !!hotelId),
      switchMap((hotelId) => this.hotelsService.getRoomTypes(hotelId))
    ),
    { initialValue: [] as RoomType[] }
  );

  readonly ageCategories = toSignal(
    this.step1Form.controls.hotelId.valueChanges.pipe(
      startWith(this.step1Form.controls.hotelId.value),
      filter((hotelId): hotelId is string => !!hotelId),
      switchMap((hotelId) => this.hotelsService.getAgeCategories(hotelId))
    ),
    { initialValue: [] as AgeCategory[] }
  );

  private readonly roomTypesById = computed(() => {
    const map = new Map<string, RoomType>();
    for (const rt of this.roomTypes()) {
      map.set(rt.id, rt);
    }
    return map;
  });

  readonly periodRoomPriceGroups = computed(() => {
    const roomTypesById = this.roomTypesById();

    return this.localPeriods().map((period) => {
      const roomPrices = this.localRoomPrices()
        .filter((rp) => rp.periodTempId === period.tempId)
        .map((rp) => ({
          ...rp,
          roomTypeName: roomTypesById.get(rp.roomTypeId)?.name ?? '',
        }));

      return {
        period,
        roomPrices,
      };
    });
  });

  /**
   * Pour chaque LocalRoomPrice en PER_OCCUPANCY : un groupe par (AgeCategory, SharingType),
   * chaque groupe portant ses occurrences (LocalAgePolicyEntry) triées par occurrenceIndex.
   * Remplace l'ancienne agePolicyRowsByRoomPrice (une seule valeur par groupe, sans occurrence).
   */
  readonly agePolicyGroupsByRoomPrice = computed(() => {
    const categories = this.ageCategories();
    const entries = this.localAgePolicies();

    const map = new Map<
      string,
      {
        ageCategory: AgeCategory;
        sharingType: SharingType;
        occurrences: LocalAgePolicyEntry[];
      }[]
    >();

    for (const rp of this.localRoomPrices()) {
      if (rp.pricingMode !== 'PER_OCCUPANCY') continue;

      const groups = categories.flatMap((category) =>
        this.sharingTypeOptions.map(({ value: sharingType }) => ({
          ageCategory: category,
          sharingType,
          occurrences: entries
            .filter(
              (e) =>
                e.periodTempId === rp.periodTempId &&
                e.roomTypeId === rp.roomTypeId &&
                e.ageCategoryId === category.id &&
                e.sharingType === sharingType
            )
            .sort((a, b) => a.occurrenceIndex - b.occurrenceIndex),
        }))
      );
      map.set(rp.tempId, groups);
    }

    return map;
  });

  /** Groupe les LocalMealPlanSupplement par période (une entrée par mealPlan ajouté). */
  readonly mealPlanSupplementsByPeriod = computed(() => {
    const map = new Map<string, LocalMealPlanSupplement[]>();
    for (const supplement of this.localMealPlanSupplements()) {
      const list = map.get(supplement.periodTempId) ?? [];
      list.push(supplement);
      map.set(supplement.periodTempId, list);
    }
    return map;
  });

  /** Groupe les LocalStopSalesDate par période, triées chronologiquement. */
  readonly stopSalesDatesByPeriod = computed(() => {
    const map = new Map<string, LocalStopSalesDate[]>();
    for (const stopSale of this.localStopSalesDates()) {
      const list = map.get(stopSale.periodTempId) ?? [];
      list.push(stopSale);
      map.set(stopSale.periodTempId, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.date.getTime() - b.date.getTime());
    }
    return map;
  });

  constructor() {
    this.step1Form.controls.hotelId.valueChanges
      .pipe(pairwise(), takeUntilDestroyed())
      .subscribe(([previousHotelId, newHotelId]) => {
        if (!newHotelId || previousHotelId === newHotelId) return;

        const hasDataAtRisk =
          this.selectedRoomTypeIds().length > 0 ||
          this.localRoomPrices().length > 0 ||
          this.localAgePolicies().length > 0;

        if (!hasDataAtRisk) return;

        confirmAction({
          header: 'Hotel changed',
          message:
            'Changing the hotel will clear all selected room types and their prices. Continue?',
          confirmationService: this.confirmationService,
          onAccept: () => {
            this.selectedRoomTypeIds.set([]);
            this.localRoomPrices.set([]);
            this.localAgePolicies.set([]);
          },
          onReject: () => {
            this.step1Form.controls.hotelId.setValue(previousHotelId, {
              emitEvent: false,
            });
          },
        });
      });
  }

  getMealPlanCode(id: string): string {
    return this.mealPlansById().get(id) ?? '';
  }

  goNext(activateCallback: (step: number) => void): void {
    switch (this.activeStep()) {
      case 1:
        this.goNextFromStep1(activateCallback);
        break;
      case 2:
        this.goNextFromStep2(activateCallback);
        break;
      case 3:
        this.goNextFromStep3(activateCallback);
        break;
      case 4:
        // Pas de validation : un supplément meal plan est optionnel par
        // période (l'agent choisit librement lesquels ajouter, cf. décision
        // S4-FE-007).
        activateCallback(this.activeStep() + 1);
        break;
      case 5:
        // Idem : une date de stop-sale est optionnelle par période. Pas de
        // step 6 pour l'instant (S4-FE-009 hors scope) — flag pour toi, à
        // revoir quand ce ticket démarre.
        activateCallback(this.activeStep() + 1);
        break;
    }
  }

  private goNextFromStep1(activateCallback: (step: number) => void): void {
    if (this.step1Form.invalid) {
      this.step1Form.markAllAsTouched();
      return;
    }
    this.step1Data.set(this.step1Form.getRawValue());
    activateCallback(this.activeStep() + 1);
  }

  private goNextFromStep2(activateCallback: (step: number) => void): void {
    if (this.localPeriods().length === 0) {
      this.periodStepError.set(true);
      return;
    }
    this.periodStepError.set(false);
    this.syncRoomPriceMatrix();
    activateCallback(this.activeStep() + 1);
  }

  private goNextFromStep3(activateCallback: (step: number) => void): void {
    const uncoveredPeriods = this.periodRoomPriceGroups().filter(
      (group) => group.roomPrices.length === 0
    );

    if (
      uncoveredPeriods.length > 0 ||
      this.selectedRoomTypeIds().length === 0
    ) {
      this.roomPriceStepError.set(true);
      return;
    }

    this.roomPriceStepError.set(false);
    activateCallback(this.activeStep() + 1);
  }

  goBack(activateCallback: (step: number) => void): void {
    activateCallback(this.activeStep() - 1);
  }

  cancelWizard(): void {
    confirmAction({
      header: 'Cancel contract creation',
      message:
        'Any unsaved progress will be lost. Are you sure you want to leave?',
      confirmationService: this.confirmationService,
      onAccept: () => {
        this.router.navigate(['../contracts-list'], { relativeTo: this.route });
      },
    });
  }

  onSeasonSelected(seasonId: string | null): void {
    this.selectedSeasonId.set(seasonId);
    if (!seasonId) {
      this.draftPeriods.set([]);
      return;
    }

    const alreadyConfirmedSeasonPeriodIds = new Set(
      this.localPeriods()
        .map((p) => p.seasonPeriodId)
        .filter((id): id is string => !!id)
    );

    const periodsForSeason = this.allSeasonPeriods().filter(
      (sp) =>
        sp.seasonId === seasonId && !alreadyConfirmedSeasonPeriodIds.has(sp.id)
    );

    this.draftPeriods.set(
      periodsForSeason.map((sp) => ({
        tempId: crypto.randomUUID(),
        seasonPeriodId: sp.id,
        name: sp.name,
        startDate: new Date(sp.startDate),
        endDate: new Date(sp.endDate),
        baseMealPlanId: '',
        minStay: undefined,
      }))
    );
  }

  addManualDraftPeriod(): void {
    this.draftPeriods.update((drafts) => [
      ...drafts,
      {
        tempId: crypto.randomUUID(),
        seasonPeriodId: null,
        name: '',
        startDate: null,
        endDate: null,
        baseMealPlanId: '',
        minStay: undefined,
      },
    ]);
  }

  updateDraftField<K extends keyof LocalContractPeriod>(
    tempId: string,
    field: K,
    value: LocalContractPeriod[K]
  ): void {
    this.draftPeriods.update((drafts) =>
      drafts.map((d) => (d.tempId === tempId ? { ...d, [field]: value } : d))
    );
  }

  confirmDraftPeriod(tempId: string): void {
    const draft = this.draftPeriods().find((d) => d.tempId === tempId);
    if (
      !draft ||
      !draft.name ||
      !draft.startDate ||
      !draft.endDate ||
      !draft.baseMealPlanId
    ) {
      this.draftConfirmError.set('All fields are required.');
      return;
    }

    if (!isValidDateRange(draft.startDate, draft.endDate)) {
      this.draftConfirmError.set('End date must be after start date.');
      return;
    }

    this.draftConfirmError.set(null);
    this.localPeriods.update((periods) => [...periods, draft]);
    this.draftPeriods.update((drafts) =>
      drafts.filter((d) => d.tempId !== tempId)
    );
    this.periodStepError.set(false);
  }

  cancelDraftPeriod(tempId: string): void {
    this.draftPeriods.update((drafts) =>
      drafts.filter((d) => d.tempId !== tempId)
    );
    this.draftConfirmError.set(null);
  }

  removeConfirmedPeriod(tempId: string): void {
    this.localPeriods.update((periods) =>
      periods.filter((p) => p.tempId !== tempId)
    );
    this.localMealPlanSupplements.update((supplements) =>
      supplements.filter((s) => s.periodTempId !== tempId)
    );
    this.localStopSalesDates.update((dates) =>
      dates.filter((d) => d.periodTempId !== tempId)
    );
  }

  trackByTempId(_index: number, item: { tempId: string }): string {
    return item.tempId;
  }

  onRoomTypesSelected(roomTypeIds: string[]): void {
    this.selectedRoomTypeIds.set(roomTypeIds);
    this.syncRoomPriceMatrix();
  }

  private syncRoomPriceMatrix(): void {
    const periods = this.localPeriods();
    const roomTypeIds = this.selectedRoomTypeIds();

    this.localRoomPrices.update((existing) => {
      const kept = existing.filter(
        (rp) =>
          periods.some((p) => p.tempId === rp.periodTempId) &&
          roomTypeIds.includes(rp.roomTypeId)
      );

      const missing: LocalRoomPrice[] = [];
      for (const period of periods) {
        for (const roomTypeId of roomTypeIds) {
          const exists = kept.some(
            (rp) =>
              rp.periodTempId === period.tempId && rp.roomTypeId === roomTypeId
          );
          if (!exists) {
            missing.push({
              tempId: crypto.randomUUID(),
              periodTempId: period.tempId,
              roomTypeId,
              pricingMode: 'PER_ROOM',
              pricePerNight: null,
              baseRate: null,
              extraPersonAdult: null,
              extraPersonChild: null,
              extraPersonTeen: null,
            });
          }
        }
      }

      return [...kept, ...missing];
    });

    this.localAgePolicies.update((entries) =>
      entries.filter(
        (e) =>
          periods.some((p) => p.tempId === e.periodTempId) &&
          roomTypeIds.includes(e.roomTypeId)
      )
    );
  }

  updateRoomPriceField<K extends keyof LocalRoomPrice>(
    tempId: string,
    field: K,
    value: LocalRoomPrice[K]
  ): void {
    this.localRoomPrices.update((prices) =>
      prices.map((rp) =>
        rp.tempId === tempId ? { ...rp, [field]: value } : rp
      )
    );
  }

  onPricingModeChanged(tempId: string, newMode: PricingMode): void {
    const roomPrice = this.localRoomPrices().find((rp) => rp.tempId === tempId);

    this.localRoomPrices.update((prices) =>
      prices.map((rp) => {
        if (rp.tempId !== tempId) return rp;
        return {
          ...rp,
          pricingMode: newMode,
          pricePerNight: newMode === 'PER_OCCUPANCY' ? null : rp.pricePerNight,
          baseRate:
            newMode === 'PER_OCCUPANCY'
              ? (rp.baseRate ?? emptyBaseRate())
              : null,
          extraPersonAdult:
            newMode === 'PER_OCCUPANCY' ? null : rp.extraPersonAdult,
          extraPersonChild:
            newMode === 'PER_OCCUPANCY' ? null : rp.extraPersonChild,
          extraPersonTeen:
            newMode === 'PER_OCCUPANCY' ? null : rp.extraPersonTeen,
        };
      })
    );

    if (newMode === 'PER_ROOM' && roomPrice) {
      this.localAgePolicies.update((entries) =>
        entries.filter(
          (e) =>
            !(
              e.periodTempId === roomPrice.periodTempId &&
              e.roomTypeId === roomPrice.roomTypeId
            )
        )
      );
    }
  }

  updateBaseRateField<K extends keyof LocalBaseRate>(
    roomPriceTempId: string,
    field: K,
    value: LocalBaseRate[K]
  ): void {
    const roomPrice = this.localRoomPrices().find(
      (rp) => rp.tempId === roomPriceTempId
    );
    if (!roomPrice?.baseRate) return;

    this.updateRoomPriceField(roomPriceTempId, 'baseRate', {
      ...roomPrice.baseRate,
      [field]: value,
    });
  }

  addAgePolicyOccurrence(
    periodTempId: string,
    roomTypeId: string,
    ageCategoryId: string,
    sharingType: SharingType
  ): void {
    const siblingCount = this.localAgePolicies().filter(
      (e) =>
        e.periodTempId === periodTempId &&
        e.roomTypeId === roomTypeId &&
        e.ageCategoryId === ageCategoryId &&
        e.sharingType === sharingType
    ).length;

    this.localAgePolicies.update((entries) => [
      ...entries,
      {
        tempId: crypto.randomUUID(),
        periodTempId,
        roomTypeId,
        ageCategoryId,
        sharingType,
        occurrenceIndex: siblingCount + 1,
        baseRateReference: 'single',
        value: null,
      },
    ]);
  }

  removeAgePolicyOccurrence(tempId: string): void {
    const removed = this.localAgePolicies().find((e) => e.tempId === tempId);
    if (!removed) return;

    this.localAgePolicies.update((entries) =>
      entries
        .filter((e) => e.tempId !== tempId)
        .map((e) => {
          const isSibling =
            e.periodTempId === removed.periodTempId &&
            e.roomTypeId === removed.roomTypeId &&
            e.ageCategoryId === removed.ageCategoryId &&
            e.sharingType === removed.sharingType;

          return isSibling && e.occurrenceIndex > removed.occurrenceIndex
            ? { ...e, occurrenceIndex: e.occurrenceIndex - 1 }
            : e;
        })
    );
  }

  updateAgePolicyField<K extends keyof LocalAgePolicyEntry>(
    tempId: string,
    field: K,
    value: LocalAgePolicyEntry[K]
  ): void {
    this.localAgePolicies.update((entries) =>
      entries.map((e) => (e.tempId === tempId ? { ...e, [field]: value } : e))
    );
  }

  /** baseRateReference exclut thirdPersonAdult — filtre juste par capacité de chambre. */
  getBaseRateReferenceOptions(
    roomTypeId: string
  ): { label: string; value: BaseRateReference }[] {
    return this.baseRateReferenceOptionsAll.filter((opt) =>
      this.isBaseRateFieldVisible(roomTypeId, opt.value)
    );
  }

  getRoomTypeMaxCapacity(roomTypeId: string): number {
    const roomType = this.roomTypes().find((rt) => rt.id === roomTypeId);
    if (!roomType?.capacities || roomType.capacities.length === 0) {
      return 4;
    }
    return roomType.capacities.reduce((sum, c) => sum + (c.maxPax || 0), 0);
  }

  isBaseRateFieldVisible(
    roomTypeId: string,
    field: 'single' | 'halfDouble' | 'thirdAdult' | 'triple' | 'quadruple'
  ): boolean {
    const maxPax = this.getRoomTypeMaxCapacity(roomTypeId);

    switch (field) {
      case 'single':
        return maxPax >= 1;
      case 'halfDouble':
        return maxPax >= 2;
      case 'thirdAdult':
        return maxPax === 2;
      case 'triple':
        return maxPax >= 3;
      case 'quadruple':
        return maxPax >= 4;
      default:
        return true;
    }
  }

  availableMealPlansForPeriod(
    periodTempId: string
  ): { id: string; name: string; code: string }[] {
    const usedMealPlanIds = new Set(
      this.localMealPlanSupplements()
        .filter((s) => s.periodTempId === periodTempId)
        .map((s) => s.mealPlanId)
    );
    return this.mealPlans().filter((mp) => !usedMealPlanIds.has(mp.id));
  }

  addMealPlanSupplement(periodTempId: string, mealPlanId: string): void {
    const ratesByAgeCategory: Record<string, number> = {};
    for (const category of this.ageCategories()) {
      ratesByAgeCategory[category.id] = 0;
    }

    this.localMealPlanSupplements.update((supplements) => [
      ...supplements,
      {
        tempId: crypto.randomUUID(),
        periodTempId,
        mealPlanId,
        billingUnit: null,
        ratesByAgeCategory,
      },
    ]);
  }

  removeMealPlanSupplement(tempId: string): void {
    this.localMealPlanSupplements.update((supplements) =>
      supplements.filter((s) => s.tempId !== tempId)
    );
  }

  updateMealPlanSupplementField<K extends keyof LocalMealPlanSupplement>(
    tempId: string,
    field: K,
    value: LocalMealPlanSupplement[K]
  ): void {
    this.localMealPlanSupplements.update((supplements) =>
      supplements.map((s) =>
        s.tempId === tempId ? { ...s, [field]: value } : s
      )
    );
  }

  updateMealPlanSupplementRate(
    tempId: string,
    ageCategoryId: string,
    value: number
  ): void {
    this.localMealPlanSupplements.update((supplements) =>
      supplements.map((s) =>
        s.tempId === tempId
          ? {
              ...s,
              ratesByAgeCategory: {
                ...s.ratesByAgeCategory,
                [ageCategoryId]: value,
              },
            }
          : s
      )
    );
  }

  getStopSalesDateRange(period: LocalContractPeriod): {
    minDate: Date | undefined;
    maxDate: Date | undefined;
  } {
    return {
      minDate: period.startDate ?? undefined,
      maxDate: period.endDate ?? undefined,
    };
  }

  addStopSalesDate(periodTempId: string, date: Date): void {
    this.localStopSalesDates.update((dates) => [
      ...dates,
      {
        tempId: crypto.randomUUID(),
        periodTempId,
        date,
      },
    ]);
  }

  removeStopSalesDate(tempId: string): void {
    this.localStopSalesDates.update((dates) =>
      dates.filter((d) => d.tempId !== tempId)
    );
  }
}
