import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Denomination, DenominationDocument } from './denomination.entity';

@Injectable()
export class DenominationService {
  constructor(
    @InjectModel(Denomination.name)
    private readonly denominationModel: Model<DenominationDocument>,
  ) {}

  async create(data: Partial<Denomination>): Promise<DenominationDocument> {
    const slug = this.generateSlug(data.name);

    const existing = await this.denominationModel.findOne({ slug });
    if (existing) {
      throw new ConflictException('Denomination already exists');
    }

    return this.denominationModel.create({
      ...data,
      slug,
    });
  }

  async findAll(): Promise<DenominationDocument[]> {
    return this.denominationModel.find({ isActive: true }).sort({ name: 1 });
  }

  async findById(id: string): Promise<DenominationDocument> {
    const denomination = await this.denominationModel.findById(id);
    if (!denomination) {
      throw new NotFoundException('Denomination not found');
    }
    return denomination;
  }

  async findBySlug(slug: string): Promise<DenominationDocument> {
    const denomination = await this.denominationModel.findOne({ slug });
    if (!denomination) {
      throw new NotFoundException('Denomination not found');
    }
    return denomination;
  }

  async findByName(name: string): Promise<DenominationDocument | null> {
    return this.denominationModel.findOne({ name });
  }

  async update(id: string, data: Partial<Denomination>): Promise<DenominationDocument> {
    const denomination = await this.findById(id);

    if (data.name && data.name !== denomination.name) {
      data['slug'] = this.generateSlug(data.name);
    }

    return this.denominationModel.findByIdAndUpdate(id, data, { new: true });
  }

  async incrementChurchCount(denominationId: string): Promise<void> {
    await this.denominationModel.findByIdAndUpdate(denominationId, {
      $inc: { churchCount: 1 },
    });
  }

  async decrementChurchCount(denominationId: string): Promise<void> {
    await this.denominationModel.findByIdAndUpdate(denominationId, {
      $inc: { churchCount: -1 },
    });
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.denominationModel.findByIdAndDelete(id);
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
