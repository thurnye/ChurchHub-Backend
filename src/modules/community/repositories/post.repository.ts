import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '../entities/post.entity';
import { BaseRepository } from '@infrastructure/database/base.repository';

@Injectable()
export class PostRepository extends BaseRepository<PostDocument> {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {
    super(postModel);
  }

  async findByTenant(tenantId: string, skip: number, limit: number): Promise<PostDocument[]> {
    return this.postModel
      .find({ tenantId })
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('authorId', 'firstName lastName avatar')
      .exec();
  }
}
