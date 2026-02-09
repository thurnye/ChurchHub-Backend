import { Injectable, NotFoundException } from '@nestjs/common';
import { ProgramRepository } from '../repositories/program.repository';
import {
  CreateCommunityProgramDto,
  CreateVolunteerProgramDto,
  UpdateProgramDto,
  QueryProgramDto,
} from '../dtos/create-program.dto';
import { PaginationUtil } from '@common/utils';
import { ProgramType } from '../entities/program.entity';

@Injectable()
export class CommunityService {
  constructor(private readonly programRepository: ProgramRepository) {}

  // Create a community program (matches ICommunityProgram)
  async createCommunityProgram(tenantId: string, userId: string, dto: CreateCommunityProgramDto) {
    return this.programRepository.create({
      tenantId,
      createdBy: userId,
      type: ProgramType.COMMUNITY,
      title: dto.title,
      category: dto.category,
      description: dto.description,
      image: dto.image || '',
      contact: dto.contact,
      skillsNeeded: [],
      isActive: true,
    } as any);
  }

  // Create a volunteer program (matches IVolunteerProgram)
  async createVolunteerProgram(tenantId: string, userId: string, dto: CreateVolunteerProgramDto) {
    return this.programRepository.create({
      tenantId,
      createdBy: userId,
      type: ProgramType.VOLUNTEER,
      title: dto.title,
      church: dto.church,
      description: dto.description,
      image: dto.image || '',
      timeCommitment: dto.timeCommitment,
      skillsNeeded: dto.skillsNeeded,
      coordinator: dto.coordinator,
      category: dto.category,
      isActive: true,
    } as any);
  }

  // Get all programs (both community and volunteer)
  async getPrograms(tenantId: string, query: QueryProgramDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = PaginationUtil.getSkip(page, limit);

    const filter: any = {};
    if (query.type) {
      filter.type = query.type;
    }
    if (query.category) {
      filter.category = query.category;
    }

    const [data, total] = tenantId
  ? await Promise.all([
      this.programRepository.findByTenant(tenantId, skip, limit, filter),
      this.programRepository.countByTenant(tenantId, filter),
    ])
  : await Promise.all([
      this.programRepository.findAll(skip, limit, filter),
      this.programRepository.countAll(filter),
    ]);



    return PaginationUtil.paginate(data, total, { page, limit });
  }

  // Get only community programs
  async getCommunityPrograms(tenantId: string, page: number = 1, limit: number = 20) {
    const skip = PaginationUtil.getSkip(page, limit);
    const filter = { type: ProgramType.COMMUNITY };

    const [data, total] = await Promise.all([
      this.programRepository.findByTenant(tenantId, skip, limit, filter),
      this.programRepository.countByTenant(tenantId, filter),
    ]);

    return PaginationUtil.paginate(data, total, { page, limit });
  }

  // Get only volunteer programs
  async getVolunteerPrograms(tenantId: string, page: number = 1, limit: number = 20) {
    const skip = PaginationUtil.getSkip(page, limit);
    const filter = { type: ProgramType.VOLUNTEER };

    const [data, total] = await Promise.all([
      this.programRepository.findByTenant(tenantId, skip, limit, filter),
      this.programRepository.countByTenant(tenantId, filter),
    ]);

    return PaginationUtil.paginate(data, total, { page, limit });
  }

  async getProgramById(tenantId: string, programId: string) {
    const program = await this.programRepository.findById(programId);
    return program;
  }

  async updateProgram(tenantId: string, programId: string, dto: UpdateProgramDto) {
    await this.getProgramById(tenantId, programId);
    return this.programRepository.update(programId, dto as any);
  }

  async deleteProgram(tenantId: string, programId: string) {
    await this.getProgramById(tenantId, programId);
    // Soft delete
    await this.programRepository.update(programId, { isActive: false } as any);
  }

  async getCategories(tenantId: string) {
    return this.programRepository.getCategories(tenantId);
  }
}
