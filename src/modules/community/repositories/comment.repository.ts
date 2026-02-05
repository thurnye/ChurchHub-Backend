import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../entities/comment.entity';
import { BaseRepository } from '@infrastructure/database/base.repository';

@Injectable()
export class CommentRepository extends BaseRepository<CommentDocument> {
  constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) {
    super(commentModel);
  }

  async findByPost(postId: string): Promise<CommentDocument[]> {
    return this.commentModel
      .find({ postId })
      .sort({ createdAt: -1 })
      .populate('authorId', 'firstName lastName avatar')
      .exec();
  }
}
