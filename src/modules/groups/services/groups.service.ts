import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { GroupRepository } from '../repositories/group.repository';
import { CreateGroupDto } from '../dtos/create-group.dto';
import { PaginationUtil } from '@common/utils';

@Injectable()
export class GroupsService {
  constructor(private readonly groupRepository: GroupRepository) {}

  async create(tenantId: string, leaderId: string, createGroupDto: CreateGroupDto) {
    return this.groupRepository.create({
      tenantId,
      leaderId,
      ...createGroupDto,
      members: [leaderId],
    } as any);
  }

  async findAll(tenantId: string, page: number, limit: number) {
    const skip = PaginationUtil.getSkip(page, limit);
    const [data, total] = await Promise.all([
      this.groupRepository.findByTenant(tenantId, skip, limit),
      this.groupRepository.count({ tenantId } as any),
    ]);

    return PaginationUtil.paginate(data, total, { page, limit });
  }

  async findOne(id: string) {
    const group = await this.groupRepository.findById(id);
    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }

  async joinGroup(groupId: string, userId: string) {
    const group = await this.findOne(groupId);

    if (!group.isOpen) {
      throw new BadRequestException('This group is not open for new members');
    }

    const members = group.members || [];

    if (members.some((id) => id.toString() === userId)) {
      throw new BadRequestException('Already a member of this group');
    }

    if (group.maxMembers && members.length >= group.maxMembers) {
      throw new BadRequestException('Group is full');
    }

    members.push(userId as any);
    return this.groupRepository.update(groupId, { members } as any);
  }

  async leaveGroup(groupId: string, userId: string) {
    const group = await this.findOne(groupId);

    if (group.leaderId.toString() === userId) {
      throw new BadRequestException('Group leader cannot leave the group');
    }

    const members = group.members || [];
    const filtered = members.filter((id) => id.toString() !== userId);

    return this.groupRepository.update(groupId, { members: filtered } as any);
  }

  async getMyGroups(userId: string) {
    return this.groupRepository.findByMember(userId);
  }
}
