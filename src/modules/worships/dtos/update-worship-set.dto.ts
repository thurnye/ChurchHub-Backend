import { PartialType } from '@nestjs/swagger';
import { CreateWorshipSetDto } from './create-worship-set.dto';

export class UpdateWorshipSetDto extends PartialType(CreateWorshipSetDto) {}
