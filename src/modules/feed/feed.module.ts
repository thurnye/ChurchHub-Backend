import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { Post, PostSchema } from '@modules/community/entities/post.entity';
import { Sermon, SermonSchema } from '@modules/sermons/entities/sermon.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Sermon.name, schema: SermonSchema },
    ]),
  ],
  controllers: [FeedController],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
