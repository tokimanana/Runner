import {
  RepositoryException,
  RepositoryResult,
} from '@backend/common/repository.types';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  AgePolicy,
  BaseRate,
  ContractPeriod,
  MealPlanSupplement,
  OccupancyGuidance,
  RoomPrice,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Contract as SharedContract } from '@runner/shared/types';
import { ContractsService } from './contracts.service';
import { CreateAgePolicyDto } from './dto/create-age-policy.dto';
import { CreateBaseRateDto } from './dto/create-base-rate.dto';
import { CreateContractPeriodDto } from './dto/create-contract-period.dto';
import { CreateContractDto } from './dto/create-contract.dto';
import { CreateMealPlanSupplementDto } from './dto/create-meal-plan-supplement.dto';
import { CreateOccupancyGuidanceDto } from './dto/create-occupancy-guidance.dto';
import { CreateRoomPriceDto } from './dto/create-room-price.dto';
import { CreateStopSalesDateDto } from './dto/create-stop-sales-date.dto';
import { UpdateBaseRateDto } from './dto/update-base-rate.dto';
import { UpdateMealPlanSupplementDto } from './dto/update-meal-plan-supplement.dto';
import { UpdateRoomPriceDto } from './dto/update-room-price.dto';
import { ContractRepository } from './repositories/contract.repository';

describe('ContractsService', () => {
  let service: ContractsService;
  let mockRepository: jest.Mocked<ContractRepository>;

  const contractId = 'contract-1';
  const tourOperatorId = 'to-1';
  const periodId = 'period-1';
  const roomTypeId = 'room-type-1';
  const ageCategoryId = 'age-category-1';

  const mockPeriod: ContractPeriod = {
    id: periodId,
    contractId,
    seasonPeriodId: null,
    name: 'Winter 26/27',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    baseMealPlanId: 'meal-plan-1',
    minStay: null,
  };

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      createPeriod: jest.fn(),
      findSeasonPeriod: jest.fn(),
      findContractPeriod: jest.fn(),
      updatePeriod: jest.fn(),
      removePeriod: jest.fn(),
      validateNoOverlap: jest.fn(),
      createRoomPrice: jest.fn(),
      findRoomTypeWithCapacities: jest.fn(),
      updateRoomPrice: jest.fn(),
      removeRoomPrice: jest.fn(),
      createMealPlanSupplement: jest.fn(),
      updateMealPlanSupplement: jest.fn(),
      removeMealPlanSupplement: jest.fn(),
      createStopSalesDate: jest.fn(),
      removeStopSalesDate: jest.fn(),
      createBaseRate: jest.fn(),
      findBaseRatesByPeriod: jest.fn(),
      updateBaseRate: jest.fn(),
      removeBaseRate: jest.fn(),
      createAgePolicy: jest.fn(),
      findAgePoliciesByPeriod: jest.fn(),
      updateAgePolicy: jest.fn(),
      removeAgePolicy: jest.fn(),
      createOccupancyGuidance: jest.fn(),
      findOccupancyGuidanceByRoomType: jest.fn(),
      updateOccupancyGuidance: jest.fn(),
      removeOccupancyGuidance: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContractsService,
        { provide: ContractRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get(ContractsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    const dto = {
      hotelId: 'hotel-1',
      marketId: 'market-1',
      currencyId: 'currency-1',
    } as CreateContractDto;

    it('delegates creation to the repository and returns its result', async () => {
      const created = { id: 'contract-1' } as SharedContract;
      mockRepository.create.mockResolvedValue(created);

      const result = await service.create(dto, tourOperatorId);

      expect(result).toEqual(created);
      expect(mockRepository.create).toHaveBeenCalledWith(dto, tourOperatorId);
    });

    it('propagates repository errors as-is (no try/catch wrapping in create())', async () => {
      mockRepository.create.mockRejectedValue(
        new RepositoryException(RepositoryResult.NOT_FOUND),
      );

      await expect(service.create(dto, tourOperatorId)).rejects.toThrow(
        RepositoryException,
      );
    });
  });

  // ─── ContractPeriod ─────────────────────────────────────────────

  describe('createPeriod', () => {
    const seasonPeriod = {
      id: 'season-1',
      name: 'Summer 2026',
      seasonId: 'season-parent-1',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-09-30'),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('throws BadRequestException when neither seasonPeriodId nor startDate/endDate are provided', async () => {
      const dto = {} as CreateContractPeriodDto;

      await expect(service.createPeriod(dto, contractId)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRepository.createPeriod).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when seasonPeriodId does not resolve to a SeasonPeriod', async () => {
      mockRepository.findSeasonPeriod.mockResolvedValue(null);
      const dto = { seasonPeriodId: 'season-x' } as CreateContractPeriodDto;

      await expect(service.createPeriod(dto, contractId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('auto-fills startDate/endDate from the SeasonPeriod when not provided', async () => {
      mockRepository.findSeasonPeriod.mockResolvedValue(seasonPeriod);
      mockRepository.validateNoOverlap.mockResolvedValue(null);
      mockRepository.createPeriod.mockResolvedValue(mockPeriod);
      const dto = { seasonPeriodId: 'season-1' } as CreateContractPeriodDto;

      await service.createPeriod(dto, contractId);

      const [payload] = mockRepository.createPeriod.mock.calls[0];
      expect(payload.startDate).toEqual(seasonPeriod.startDate);
      expect(payload.endDate).toEqual(seasonPeriod.endDate);
    });

    it('keeps explicitly provided startDate/endDate even when seasonPeriodId is set', async () => {
      mockRepository.findSeasonPeriod.mockResolvedValue(seasonPeriod);
      mockRepository.validateNoOverlap.mockResolvedValue(null);
      mockRepository.createPeriod.mockResolvedValue(mockPeriod);
      const ownStart = '2026-07-01';
      const ownEnd = '2026-08-15';
      const dto = {
        seasonPeriodId: 'season-1',
        startDate: ownStart,
        endDate: ownEnd,
      } as CreateContractPeriodDto;

      await service.createPeriod(dto, contractId);

      const [payload] = mockRepository.createPeriod.mock.calls[0];
      expect(payload.startDate).toEqual(new Date(ownStart));
      expect(payload.endDate).toEqual(new Date(ownEnd));
    });

    it('throws ConflictException when the period overlaps an existing one in the same contract', async () => {
      mockRepository.validateNoOverlap.mockResolvedValue({
        ...mockPeriod,
        name: 'Summer 26',
      });
      const dto = {
        startDate: '2026-06-01',
        endDate: '2026-06-30',
      } as CreateContractPeriodDto;

      await expect(service.createPeriod(dto, contractId)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.createPeriod).not.toHaveBeenCalled();
    });

    it('does not throw and creates the period when there is no overlap', async () => {
      mockRepository.validateNoOverlap.mockResolvedValue(null);
      mockRepository.createPeriod.mockResolvedValue(mockPeriod);
      const dto = {
        startDate: '2026-06-01',
        endDate: '2026-06-30',
      } as CreateContractPeriodDto;

      await expect(service.createPeriod(dto, contractId)).resolves.toEqual(
        mockPeriod,
      );
    });
  });

  // ─── BaseRate ────────────────────────────────────────────────

  describe('createBaseRate', () => {
    const dto: CreateBaseRateDto = {
      roomTypeId,
      single: 100,
      halfDouble: 80,
      thirdPersonAdult: null,
      triple: null,
      quadruple: null,
    };

    const created: BaseRate = {
      id: 'br-1',
      contractPeriodId: periodId,
      roomTypeId,
      single: new Decimal(100),
      halfDouble: new Decimal(80),
      thirdPersonAdult: null,
      triple: null,
      quadruple: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('creates a BaseRate when the period exists', async () => {
      mockRepository.findContractPeriod.mockResolvedValue(mockPeriod);
      mockRepository.createBaseRate.mockResolvedValue(created);

      const result = await service.createBaseRate(dto, periodId, contractId);

      expect(result).toEqual(created);
      expect(mockRepository.createBaseRate).toHaveBeenCalledWith(dto, periodId);
    });

    it('throws NotFoundException when the period does not exist', async () => {
      mockRepository.findContractPeriod.mockResolvedValue(null);

      await expect(
        service.createBaseRate(dto, periodId, contractId),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepository.createBaseRate).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when roomTypeId does not exist', async () => {
      mockRepository.findContractPeriod.mockResolvedValue(mockPeriod);
      mockRepository.createBaseRate.mockRejectedValue(
        new RepositoryException(RepositoryResult.NOT_FOUND),
      );

      await expect(
        service.createBaseRate(dto, periodId, contractId),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when a BaseRate already exists for this room type/period', async () => {
      mockRepository.findContractPeriod.mockResolvedValue(mockPeriod);
      mockRepository.createBaseRate.mockRejectedValue(
        new RepositoryException(RepositoryResult.CONFLICT),
      );

      await expect(
        service.createBaseRate(dto, periodId, contractId),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateBaseRate / removeBaseRate', () => {
    it('updates a BaseRate successfully', async () => {
      const dto: UpdateBaseRateDto = { single: 110 };
      const updated: BaseRate = {
        id: 'br-1',
        contractPeriodId: periodId,
        roomTypeId,
        single: new Decimal(110),
        halfDouble: new Decimal(80),
        thirdPersonAdult: null,
        triple: null,
        quadruple: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.updateBaseRate.mockResolvedValue(updated);

      const result = await service.updateBaseRate('br-1', dto);

      expect(result).toEqual(updated);
    });

    it('throws NotFoundException when updating a non-existent BaseRate', async () => {
      mockRepository.updateBaseRate.mockRejectedValue(
        new RepositoryException(RepositoryResult.NOT_FOUND),
      );

      await expect(
        service.updateBaseRate('missing', { single: 110 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when removing a non-existent BaseRate', async () => {
      mockRepository.removeBaseRate.mockResolvedValue(
        RepositoryResult.NOT_FOUND,
      );

      await expect(service.removeBaseRate('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── AgePolicy ───────────────────────────────────────────────

  describe('createAgePolicy', () => {
    const dto: CreateAgePolicyDto = {
      roomTypeId,
      ageCategoryId,
      sharingType: 'WITH_PARENTS',
      occurrenceIndex: 1,
      baseRateReference: 'single',
      value: 80,
    };

    const created: AgePolicy = {
      id: 'ap-1',
      contractPeriodId: periodId,
      roomTypeId,
      ageCategoryId,
      sharingType: 'WITH_PARENTS',
      occurrenceIndex: 1,
      baseRateReference: 'single',
      value: new Decimal(80),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('creates an AgePolicy and forwards occurrenceIndex/baseRateReference as-is', async () => {
      mockRepository.findContractPeriod.mockResolvedValue(mockPeriod);
      mockRepository.createAgePolicy.mockResolvedValue(created);

      const result = await service.createAgePolicy(dto, periodId, contractId);

      expect(result).toEqual(created);
      expect(mockRepository.createAgePolicy).toHaveBeenCalledWith(
        dto,
        periodId,
      );
    });

    it('accepts value = 0 (free Infant/Child WITH_PARENTS case)', async () => {
      mockRepository.findContractPeriod.mockResolvedValue(mockPeriod);
      const freeDto: CreateAgePolicyDto = { ...dto, value: 0 };
      mockRepository.createAgePolicy.mockResolvedValue({
        ...created,
        value: new Decimal(0),
      });

      const result = await service.createAgePolicy(
        freeDto,
        periodId,
        contractId,
      );

      expect(result.value.toNumber()).toBe(0);
    });

    it('throws ConflictException when (period, roomType, ageCategory, sharingType, occurrenceIndex) already exists', async () => {
      mockRepository.findContractPeriod.mockResolvedValue(mockPeriod);
      mockRepository.createAgePolicy.mockRejectedValue(
        new RepositoryException(RepositoryResult.CONFLICT),
      );

      await expect(
        service.createAgePolicy(dto, periodId, contractId),
      ).rejects.toThrow(ConflictException);
    });

    it('treats 1st and 2nd occurrence as independent, non-conflicting calls', async () => {
      mockRepository.findContractPeriod.mockResolvedValue(mockPeriod);
      const secondDto: CreateAgePolicyDto = {
        ...dto,
        occurrenceIndex: 2,
        value: 60,
      };
      mockRepository.createAgePolicy
        .mockResolvedValueOnce(created)
        .mockResolvedValueOnce({
          ...created,
          id: 'ap-2',
          occurrenceIndex: 2,
          value: new Decimal(60),
        });

      const first = await service.createAgePolicy(dto, periodId, contractId);
      const second = await service.createAgePolicy(
        secondDto,
        periodId,
        contractId,
      );

      expect(first.value.toNumber()).toBe(80);
      expect(second.value.toNumber()).toBe(60);
      expect(mockRepository.createAgePolicy).toHaveBeenCalledTimes(2);
    });
  });

  // ─── OccupancyGuidance ───────────────────────────────────────

  describe('createOccupancyGuidance', () => {
    it('creates a guidance without checking the period first', async () => {
      const dto: CreateOccupancyGuidanceDto = {
        roomTypeId,
        description: 'Standard occupancy',
      };
      const created: OccupancyGuidance = {
        id: 'og-1',
        roomTypeId,
        description: dto.description,
        maxAdults: 0,
        maxTeens: 0,
        maxChildren: 0,
        maxInfants: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockRepository.createOccupancyGuidance.mockResolvedValue(created);

      const result = await service.createOccupancyGuidance(dto);

      expect(result).toEqual(created);
      expect(mockRepository.findContractPeriod).not.toHaveBeenCalled();
    });

    it('defaults maxAdults/maxTeens/maxChildren/maxInfants to 0 when omitted', async () => {
      const dto: CreateOccupancyGuidanceDto = {
        roomTypeId,
        description: 'No caps specified',
      };
      mockRepository.createOccupancyGuidance.mockResolvedValue({
        id: 'og-2',
        roomTypeId,
        description: dto.description,
        maxAdults: 0,
        maxTeens: 0,
        maxChildren: 0,
        maxInfants: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createOccupancyGuidance(dto);

      expect(result.maxAdults).toBe(0);
      expect(result.maxTeens).toBe(0);
      expect(result.maxChildren).toBe(0);
      expect(result.maxInfants).toBe(0);
    });
  });

  // ─── RoomPrice (régression, y compris extra-person) ───────────

  describe('createRoomPrice', () => {
    it('creates a PER_ROOM RoomPrice and forwards extraPersonAdult/Child/Teen to the repository', async () => {
      mockRepository.findContractPeriod.mockResolvedValue(mockPeriod);
      const dto: CreateRoomPriceDto = {
        roomTypeId,
        pricingMode: 'PER_ROOM',
        pricePerNight: 200,
        extraPersonAdult: 40,
        extraPersonChild: 20,
        extraPersonTeen: 30,
      };
      const created: RoomPrice = {
        id: 'rp-1',
        contractPeriodId: periodId,
        roomTypeId,
        pricingMode: 'PER_ROOM',
        pricePerNight: new Decimal(200),
        extraPersonAdult: new Decimal(40),
        extraPersonChild: new Decimal(20),
        extraPersonTeen: new Decimal(30),
      };
      mockRepository.createRoomPrice.mockResolvedValue(created);

      await service.createRoomPrice(dto, periodId, contractId);

      expect(mockRepository.createRoomPrice).toHaveBeenCalledWith(
        {
          roomTypeId,
          pricingMode: 'PER_ROOM',
          pricePerNight: 200,
          extraPersonAdult: 40,
          extraPersonChild: 20,
          extraPersonTeen: 30,
        },
        periodId,
        undefined,
      );
    });

    it('nulls out pricePerNight/extraPersonAdult/Child/Teen when pricingMode is PER_OCCUPANCY', async () => {
      mockRepository.findContractPeriod.mockResolvedValue(mockPeriod);
      mockRepository.findRoomTypeWithCapacities.mockResolvedValue({
        id: roomTypeId,
        name: 'Junior Suite',
        code: 'JS',
        hotelId: 'hotel-1',
        capacities: [{ id: 'cap-1', roomTypeId, ageCategoryId, maxPax: 4 }],
      });
      const dto: CreateRoomPriceDto = {
        roomTypeId,
        pricingMode: 'PER_OCCUPANCY',
        occupancyRates: [
          { numAdults: 2, numChildren: 0, ratesPerAge: { adult: 100 } },
        ],
      };
      mockRepository.createRoomPrice.mockResolvedValue({
        id: 'rp-2',
        contractPeriodId: periodId,
        roomTypeId,
        pricingMode: 'PER_OCCUPANCY',
        pricePerNight: null,
        extraPersonAdult: null,
        extraPersonChild: null,
        extraPersonTeen: null,
      });

      await service.createRoomPrice(dto, periodId, contractId);

      const [callData] = mockRepository.createRoomPrice.mock.calls[0];
      expect(callData.pricePerNight).toBeNull();
      expect(callData.extraPersonAdult).toBeNull();
      expect(callData.extraPersonChild).toBeNull();
      expect(callData.extraPersonTeen).toBeNull();
    });

    it('computes totalRate as the sum of ratesPerAge and forwards it to the repository', async () => {
      mockRepository.findContractPeriod.mockResolvedValue(mockPeriod);
      mockRepository.findRoomTypeWithCapacities.mockResolvedValue({
        id: roomTypeId,
        name: 'Junior Suite',
        code: 'JS',
        hotelId: 'hotel-1',
        capacities: [{ id: 'cap-1', roomTypeId, ageCategoryId, maxPax: 4 }],
      });
      const dto: CreateRoomPriceDto = {
        roomTypeId,
        pricingMode: 'PER_OCCUPANCY',
        occupancyRates: [
          {
            numAdults: 2,
            numChildren: 1,
            ratesPerAge: { adult: 100, child: 40 },
          },
        ],
      };
      mockRepository.createRoomPrice.mockResolvedValue({
        id: 'rp-3',
        contractPeriodId: periodId,
        roomTypeId,
        pricingMode: 'PER_OCCUPANCY',
        pricePerNight: null,
        extraPersonAdult: null,
        extraPersonChild: null,
        extraPersonTeen: null,
      });

      await service.createRoomPrice(dto, periodId, contractId);

      const [, , occupancyRatesData] =
        mockRepository.createRoomPrice.mock.calls[0];
      expect(occupancyRatesData?.[0].totalRate).toBe(140);
    });

    it('throws BadRequestException when PER_OCCUPANCY occupancyRates is empty', async () => {
      mockRepository.findContractPeriod.mockResolvedValue(mockPeriod);
      const dto: CreateRoomPriceDto = {
        roomTypeId,
        pricingMode: 'PER_OCCUPANCY',
        occupancyRates: [],
      };

      await expect(
        service.createRoomPrice(dto, periodId, contractId),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when occupancy exceeds room capacity', async () => {
      mockRepository.findContractPeriod.mockResolvedValue(mockPeriod);
      mockRepository.findRoomTypeWithCapacities.mockResolvedValue({
        id: roomTypeId,
        name: 'Standard',
        code: 'STD',
        hotelId: 'hotel-1',
        capacities: [{ id: 'cap-1', roomTypeId, ageCategoryId, maxPax: 2 }],
      });
      const dto: CreateRoomPriceDto = {
        roomTypeId,
        pricingMode: 'PER_OCCUPANCY',
        occupancyRates: [
          { numAdults: 3, numChildren: 0, ratesPerAge: { adult: 100 } },
        ],
      };

      await expect(
        service.createRoomPrice(dto, periodId, contractId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateRoomPrice', () => {
    it('forwards extraPersonAdult/Child/Teen to the repository', async () => {
      const dto: UpdateRoomPriceDto = {
        pricePerNight: 220,
        extraPersonAdult: 45,
        extraPersonChild: 25,
        extraPersonTeen: 35,
      };
      mockRepository.updateRoomPrice.mockResolvedValue({
        id: 'rp-1',
        contractPeriodId: periodId,
        roomTypeId,
        pricingMode: 'PER_ROOM',
        pricePerNight: new Decimal(220),
        extraPersonAdult: new Decimal(45),
        extraPersonChild: new Decimal(25),
        extraPersonTeen: new Decimal(35),
      });

      await service.updateRoomPrice('rp-1', dto);

      expect(mockRepository.updateRoomPrice).toHaveBeenCalledWith('rp-1', {
        roomTypeId: undefined,
        pricingMode: undefined,
        pricePerNight: 220,
        extraPersonAdult: 45,
        extraPersonChild: 25,
        extraPersonTeen: 35,
      });
    });
  });

  // ─── MealPlanSupplement (régression billingUnit) ──────────────

  describe('createMealPlanSupplement / updateMealPlanSupplement', () => {
    it('forwards billingUnit on create', async () => {
      mockRepository.findContractPeriod.mockResolvedValue(mockPeriod);
      const dto: CreateMealPlanSupplementDto = {
        mealPlanId: 'mp-1',
        occupancyRates: { adult: 50 },
        billingUnit: 'PER_STAY',
      };
      const created: MealPlanSupplement = {
        id: 'mps-1',
        contractPeriodId: periodId,
        mealPlanId: dto.mealPlanId,
        occupancyRates: dto.occupancyRates,
        billingUnit: 'PER_STAY',
      };
      mockRepository.createMealPlanSupplement.mockResolvedValue(created);

      await service.createMealPlanSupplement(dto, periodId, contractId);

      expect(mockRepository.createMealPlanSupplement).toHaveBeenCalledWith(
        dto,
        periodId,
      );
    });

    it('forwards billingUnit on update', async () => {
      const dto: UpdateMealPlanSupplementDto = { billingUnit: 'PER_NIGHT' };
      mockRepository.updateMealPlanSupplement.mockResolvedValue({
        id: 'mps-1',
        contractPeriodId: periodId,
        mealPlanId: 'mp-1',
        occupancyRates: { adult: 50 },
        billingUnit: 'PER_NIGHT',
      });

      await service.updateMealPlanSupplement('mps-1', dto);

      expect(mockRepository.updateMealPlanSupplement).toHaveBeenCalledWith(
        'mps-1',
        {
          mealPlanId: undefined,
          occupancyRates: undefined,
          billingUnit: 'PER_NIGHT',
        },
      );
    });
  });

  // ─── StopSalesDate ──────────────────────────────────────────────

  describe('createStopSalesDate', () => {
    const dto: CreateStopSalesDateDto = { date: '2026-06-15' };

    it('creates a StopSalesDate when the date falls within the ContractPeriod range', async () => {
      mockRepository.findContractPeriod.mockResolvedValue(mockPeriod);
      mockRepository.createStopSalesDate.mockResolvedValue({
        id: 'ssd-1',
        contractPeriodId: periodId,
        date: new Date(dto.date),
      });

      const result = await service.createStopSalesDate(
        dto,
        periodId,
        contractId,
      );

      expect(result.id).toBe('ssd-1');
      expect(mockRepository.createStopSalesDate).toHaveBeenCalledWith(
        { date: new Date(dto.date) },
        periodId,
      );
    });

    it('throws BadRequestException when the date is before the ContractPeriod startDate', async () => {
      mockRepository.findContractPeriod.mockResolvedValue(mockPeriod);
      const beforeDto: CreateStopSalesDateDto = { date: '2025-12-31' };

      await expect(
        service.createStopSalesDate(beforeDto, periodId, contractId),
      ).rejects.toThrow(BadRequestException);
      expect(mockRepository.createStopSalesDate).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the date is after the ContractPeriod endDate', async () => {
      mockRepository.findContractPeriod.mockResolvedValue(mockPeriod);
      const afterDto: CreateStopSalesDateDto = { date: '2027-01-01' };

      await expect(
        service.createStopSalesDate(afterDto, periodId, contractId),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when the ContractPeriod does not exist', async () => {
      mockRepository.findContractPeriod.mockResolvedValue(null);

      await expect(
        service.createStopSalesDate(dto, periodId, contractId),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when a StopSalesDate already exists for this date', async () => {
      mockRepository.findContractPeriod.mockResolvedValue(mockPeriod);
      mockRepository.createStopSalesDate.mockRejectedValue(
        new RepositoryException(RepositoryResult.CONFLICT),
      );

      await expect(
        service.createStopSalesDate(dto, periodId, contractId),
      ).rejects.toThrow(ConflictException);
    });
  });
});
