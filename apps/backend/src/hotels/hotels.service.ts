import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AgeCategory, RoomType } from '@prisma/client';
import { CreateAgeCategoryDto } from './dto/create-age-category.dto';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateAgeCategoryDto } from './dto/update-age-category.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';
import { HOTEL_REPOSITORY } from './hotels.constants';
import { IHotelRepository } from './hotels.repository.interface';
import { IHotelsService } from './hotels.service.interface';
import {
  DeleteResult,
  HotelDetail,
  HotelQuery,
  PaginatedResult,
} from './hotels.types';

@Injectable()
export class HotelsService implements IHotelsService {
  private readonly MAX_LIMIT = 100;

  constructor(
    @Inject(HOTEL_REPOSITORY)
    private readonly hotelRepository: IHotelRepository,
  ) {}

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

    if (result === DeleteResult.NOT_FOUND)
      throw new NotFoundException(`Hotel ${id} not found`);

    if (result === DeleteResult.HAS_CONTRACTS)
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

    if (result === DeleteResult.NOT_FOUND)
      throw new NotFoundException(`Age Category ${id} not found`);

    if (result === DeleteResult.HAS_CONTRACTS)
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

    if (result === DeleteResult.NOT_FOUND)
      throw new NotFoundException(`Room type ${id} not found`);

    if (result === DeleteResult.HAS_CONTRACTS)
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
}
