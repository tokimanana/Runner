import { PartialType } from '@nestjs/mapped-types';
import { CreateRoomTypeDto } from './create-room-type.dto';

export class UpdateRoomTypeDto extends PartialType(CreateRoomTypeDto) {}
