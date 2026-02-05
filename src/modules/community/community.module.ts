import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './entities/post.entity';
import { Comment, CommentSchema } from './entities/comment.entity';
import { PostRepository } from './repositories/post.repository';
import { CommentRepository } from './repositories/comment.repository';
import { CommunityService } from './services/community.service';
import { CommunityController } from './controllers/community.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  controllers: [CommunityController],
  providers: [CommunityService, PostRepository, CommentRepository],
  exports: [CommunityService],
})
export class CommunityModule {}
