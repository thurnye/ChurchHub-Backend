import { PartialType } from '@nestjs/swagger';
import { CreateWorshipResourceDto } from './create-worship-resource.dto';

export class UpdateWorshipResourceDto extends PartialType(CreateWorshipResourceDto) {}
