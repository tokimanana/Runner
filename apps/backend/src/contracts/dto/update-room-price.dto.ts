import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomPriceDto } from './create-room-price.dto';

export class UpdateRoomPriceDto extends PartialType(CreateRoomPriceDto) {}
