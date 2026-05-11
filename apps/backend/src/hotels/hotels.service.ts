import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AgeCategory, RoomType, RoomTypeCapacity } from '@prisma/client';
import { CreateAgeCategoryDto } from './dto/create-age-category.dto';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { CreateRoomTypeCapacityDto } from './dto/create-room-type-capacity.dto';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateAgeCategoryDto } from './dto/update-age-category.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { UpdateRoomTypeCapacityDto } from './dto/update-room-type-capacity.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { IHotelsService } from './hotels.service.interface';
import { HotelDetail, HotelQuery } from './hotels.types';
import { RepositoryResult } from '@backend/common/repository.types';
import { PaginatedResult } from '@runner/shared/types';
import { HotelRepository } from './repositories/hotel.repository';

@Injectable()
export class HotelsService implements IHotelsService {
  private readonly MAX_LIMIT = 100;

  constructor(private readonly hotelRepository: HotelRepository) {}

  async create(
    dto: CreateHotelDto,
    tourOperatorId: string,
  ): Promise<HotelDetail> {
    return this.hotelRepository.create(dto, tourOperatorId);
  }

  async findAll(
    tourOperatorId: string,
    query: HotelQuery,
  ): Promise<PaginatedResult<HotelDetail>> {
    const sanitizedLimit = Math.min(query.limit ?? 50, this.MAX_LIMIT);

    return this.hotelRepository.findAll(tourOperatorId, {
      ...query,
      limit: sanitizedLimit,
    });
  }

  async findOne(id: string, tourOperatorId: string): Promise<HotelDetail> {
    const hotel = await this.hotelRepository.findById(id);

    if (!hotel || hotel.tourOperatorId !== tourOperatorId) {
      throw new NotFoundException(`Hotel ${id} not found`);
    }

    return hotel;
  }

  async update(
    id: string,
    dto: UpdateHotelDto,
    tourOperatorId: string,
  ): Promise<HotelDetail> {
    const hotel = await this.hotelRepository.update(id, tourOperatorId, dto);

    if (!hotel) {
      throw new NotFoundException(`Hotel ${id} not found`);
    }

    return hotel;
  }

  async remove(id: string, tourOperatorId: string): Promise<void> {
    const result = await this.hotelRepository.delete(id, tourOperatorId);
    if (result === RepositoryResult.NOT_FOUND)
      throw new NotFoundException(`Hotel ${id} not found`);
    if (result === RepositoryResult.HAS_CONTRACTS)
      throw new ConflictException(`Hotel ${id} has linked contracts`);
  }

  async findAllAgeCategories(
    tourOperatorId: string,
    hotelId: string,
  ): Promise<AgeCategory[]> {
    await this.findOne(hotelId, tourOperatorId);
    return this.hotelRepository.findAllAgeCategories(hotelId);
  }

  async createAgeCategory(
    dto: CreateAgeCategoryDto,
    tourOperatorId: string,
    hotelId: string,
  ): Promise<AgeCategory> {
    await this.findOne(hotelId, tourOperatorId);
    await this.validateAgeCategoryOverlap(hotelId, dto.minAge, dto.maxAge);
    return this.hotelRepository.createAgeCategory(hotelId, dto);
  }

  async updateAgeCategory(
    id: string,
    dto: UpdateAgeCategoryDto,
    tourOperatorId: string,
    hotelId: string,
  ): Promise<AgeCategory> {
    await this.findOne(hotelId, tourOperatorId);

    const existing = await this.hotelRepository.findAgeCategoryById(id);

    if (!existing) {
      throw new NotFoundException(`Age category ${id} not found`);
    }

    const minAge = dto.minAge ?? existing.minAge;
    const maxAge = dto.maxAge ?? existing.maxAge;

    await this.validateAgeCategoryOverlap(hotelId, minAge, maxAge, id);

    return this.hotelRepository.updateAgeCategory(id, dto);
  }

  async removeAgeCategory(
    id: string,
    tourOperatorId: string,
    hotelId: string,
  ): Promise<void> {
    await this.findOne(hotelId, tourOperatorId);
    const result = await this.hotelRepository.deleteAgeCategory(id);
    if (result === RepositoryResult.NOT_FOUND)
      throw new NotFoundException(`Age Category ${id} not found`);
    if (result === RepositoryResult.HAS_CONTRACTS)
      throw new ConflictException(`Age Category ${id} has linked contracts`);
  }

  private async validateAgeCategoryOverlap(
    hotelId: string,
    minAge: number,
    maxAge: number,
    excludedId?: string,
  ): Promise<void> {
    if (maxAge <= minAge) {
      throw new BadRequestException('maxAge must be greater than minAge');
    }

    const overlapping = await this.hotelRepository.findOverlappingAgeCategory(
      hotelId,
      minAge,
      maxAge,
      excludedId,
    );

    if (overlapping) {
      throw new BadRequestException('Ages must not overlap');
    }
  }

  async findAllRoomTypes(
    tourOperatorId: string,
    hotelId: string,
  ): Promise<RoomType[]> {
    await this.findOne(hotelId, tourOperatorId);
    return this.hotelRepository.findAllRoomTypes(hotelId);
  }

  async createRoomType(
    dto: CreateRoomTypeDto,
    tourOperatorId: string,
    hotelId: string,
  ): Promise<RoomType> {
    await this.findOne(hotelId, tourOperatorId);
    await this.validateRoomTypeCode(hotelId, dto.code);
    return this.hotelRepository.createRoomType(hotelId, dto);
  }

  async updateRoomType(
    id: string,
    dto: UpdateRoomTypeDto,
    tourOperatorId: string,
    hotelId: string,
  ): Promise<RoomType> {
    await this.findOne(hotelId, tourOperatorId);

    const existing = await this.hotelRepository.findRoomTypeById(id);

    if (!existing) {
      throw new NotFoundException(`Room type ${id} not found`);
    }

    const adults = dto.maxAdults ?? existing.maxAdults;
    const children = dto.maxChildren ?? existing.maxChildren;
    if (adults + children < 1) {
      throw new BadRequestException(
        'maxAdults + maxChildren must be at least 1',
      );
    }

    if (dto.code) {
      await this.validateRoomTypeCode(hotelId, dto.code, id);
    }

    return this.hotelRepository.updateRoomType(id, dto);
  }

  async removeRoomType(
    id: string,
    tourOperatorId: string,
    hotelId: string,
  ): Promise<void> {
    await this.findOne(hotelId, tourOperatorId);
    const result = await this.hotelRepository.deleteRoomType(id);
    if (result === RepositoryResult.NOT_FOUND)
      throw new NotFoundException(`Room type ${id} not found`);
    if (result === RepositoryResult.HAS_CONTRACTS)
      throw new ConflictException(`Room type ${id} has linked contracts`);
  }

  private async validateRoomTypeCode(
    hotelId: string,
    code: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.hotelRepository.findRoomTypeByCode(
      hotelId,
      code,
      excludeId,
    );

    if (existing) {
      throw new ConflictException(
        `Room type code "${code}" already exists in this hotel`,
      );
    }
  }

  async createRoomTypeCapacity(
    data: CreateRoomTypeCapacityDto,
    roomTypeId: string,
    tourOperatorId: string,
    hotelId: string,
  ): Promise<RoomTypeCapacity> {
    await this.findOne(hotelId, tourOperatorId);

    const ageCategory = await this.hotelRepository.findAgeCategoryById(
      data.ageCategoryId,
    );
    if (!ageCategory || ageCategory.hotelId !== hotelId) {
      throw new ConflictException(
        `Age category ${data.ageCategoryId} does not belong to hotel ${hotelId}`,
      );
    }

    const result = await this.hotelRepository.createRoomTypeCapacity(
      roomTypeId,
      data,
    );
    if (result === RepositoryResult.CONFLICT) {
      throw new ConflictException(
        `Capacity already exists for this age category`,
      );
    }
    return result as RoomTypeCapacity;
  }

  async updateRoomTypeCapacity(
    id: string,
    data: UpdateRoomTypeCapacityDto,
    tourOperatorId: string,
    hotelId: string,
  ): Promise<RoomTypeCapacity> {
    await this.findOne(hotelId, tourOperatorId);

    const existing = await this.hotelRepository.findRoomTypeCapacityById(id);

    if (!existing) {
      throw new NotFoundException(`Room type Capacity ${id} not found`);
    }

    return this.hotelRepository.updateRoomTypeCapacity(id, data);
  }

  async removeRoomTypeCapacity(
    id: string,
    tourOperatorId: string,
    hotelId: string,
  ): Promise<void> {
    await this.findOne(hotelId, tourOperatorId);
    const result = await this.hotelRepository.deleteRoomTypeCapacity(id);
    if (result === RepositoryResult.NOT_FOUND)
      throw new NotFoundException(`Room type Capacity ${id} not found`);
    if (result === RepositoryResult.HAS_CONTRACTS)
      throw new ConflictException(
        `Room type Capacity ${id} has linked contracts`,
      );
  }
}
