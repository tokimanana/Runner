import { Roles } from '@backend/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@backend/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@backend/auth/guards/roles.guard';
import { RequestWithUser } from '@backend/auth/types/jwt-user.type';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Supplement } from '@runner/shared/types';
import { CreateSupplementDto } from './dto/create-supplement.dto';
import { UpdateSupplementDto } from './dto/update-supplement.dto';
import { SupplementsService } from './supplements.service';
import { SupplementQuery } from './supplements.types';

@Controller('supplements')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class SupplementsController {
  constructor(private readonly supplementsService: SupplementsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createSupplementDto: CreateSupplementDto,
    @Req() req: RequestWithUser,
  ): Promise<Supplement> {
    const tourOperatorId = req.user.tourOperatorId;
    return this.supplementsService.create(createSupplementDto, tourOperatorId);
  }

  @Get()
  findAll(
    @Req() req: RequestWithUser,
    @Query() { limit, offset, unit }: SupplementQuery,
  ) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.supplementsService.findAll(tourOperatorId, {
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      unit,
    });
  }

  @Get(':id')
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.supplementsService.findOne(id, tourOperatorId);
  }

  @Patch(':id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateSupplementDto: UpdateSupplementDto,
  ) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.supplementsService.update(
      id,
      updateSupplementDto,
      tourOperatorId,
    );
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const tourOperatorId = req.user.tourOperatorId;
    return this.supplementsService.remove(id, tourOperatorId);
  }
}
