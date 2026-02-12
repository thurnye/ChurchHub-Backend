import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '@modules/community/entities/post.entity';
import { Sermon, SermonDocument } from '@modules/sermons/entities/sermon.entity';
import { PaginationDto } from '@common/dtos';

export interface FeedItem {
  id: string;
  kind: 'video' | 'image' | 'quote' | 'live';
  thumbnail: string;
  videoUrl?: string;
  postOwner: string;
  denomination?: string;
  title?: string;
  speaker?: string;
  description?: string;
  isLive?: boolean;
  viewerCount?: number;
  sourceType: 'church' | 'individual';
  sourceId: string;
  primaryRoute: { pathname: string; params: Record<string, any> };
  hasAudio?: boolean;
  createdAt: Date;
}

@Injectable()
export class FeedService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Sermon.name) private sermonModel: Model<SermonDocument>,
  ) {}

  async getFeed(tenantId: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 20 } = paginationDto;
    const skip = (page - 1) * limit;

    // Fetch posts and sermons in parallel
    const [posts, sermons] = await Promise.all([
      this.postModel
        .find()
        .populate('authorId', 'firstName lastName avatar')
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec(),
      this.sermonModel
        .find({  isPublished: true })
        .sort({ date: -1 })
        .limit(limit)
        .exec(),
    ]);
    
    // Transform posts to feed items
    const postItems: FeedItem[] = posts.map((post) => {
      const author = post.authorId as any;
      const authorName = author ? `${author.firstName} ${author.lastName}` : 'Unknown';
      const hasMedia = post.images && post.images.length > 0;
      const firstMedia = hasMedia ? post.images[0] : null;

      return {
        id: `post-${post._id}`,
        kind: hasMedia ? 'image' : 'quote',
        thumbnail: firstMedia || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        postOwner: authorName,
        title: post.content.substring(0, 100),
        description: post.content,
        sourceType: 'individual',
        sourceId: post.authorId?.toString() || '',
        primaryRoute: {
          pathname: '/community/post/[id]',
          params: { id: post._id.toString() }
        },
        hasAudio: false,
        createdAt: post.createdAt,
      };
    });

    // Transform sermons to feed items
    const sermonItems: FeedItem[] = sermons.map((sermon) => ({
      id: `sermon-${sermon._id}`,
      kind: sermon.mediaUrl ? 'video' : 'image',
      thumbnail: sermon.thumbnailUrl || 'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=800',
      videoUrl: sermon.mediaUrl,
      postOwner: 'Church',
      speaker: sermon.speaker,
      title: sermon.title,
      description: `${sermon.tags?.join(' • ') || ''} • ${sermon.duration ? `${Math.floor(sermon.duration / 60)} min` : ''}`.trim(),
      sourceType: 'church',
      sourceId: sermon.tenantId?.toString() || '',
      primaryRoute: {
        pathname: '/media-player/[id]',
        params: { id: sermon._id.toString() }
      },
      hasAudio: !!sermon.mediaUrl,
      createdAt: sermon.date,
    }));

    // Combine and sort by createdAt
    const allItems = [...postItems, ...sermonItems]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(skip, skip + limit);

    const total = posts.length + sermons.length;

    return {
      data: allItems,
      total,
      page,
      limit,
      hasNext: skip + limit < total,
    };
  }

  async getFeedItem(tenantId: string, id: string): Promise<FeedItem> {
    // Parse the ID to determine type (post-xxx or sermon-xxx)
    const parts = id.split('-');
    const type = parts[0];
    const itemId = parts.slice(1).join('-'); // Handle IDs that might contain dashes

    if (type === 'post') {
      const post = await this.postModel
        .findOne({ _id: itemId })
        .populate('authorId', 'firstName lastName avatar')
        .exec();

      if (!post) {
        throw new NotFoundException('Feed item not found');
      }

      const author = post.authorId as any;
      const authorName = author ? `${author.firstName} ${author.lastName}` : 'Unknown';
      const hasMedia = post.images && post.images.length > 0;
      const firstMedia = hasMedia ? post.images[0] : null;

      return {
        id: `post-${post._id}`,
        kind: hasMedia ? 'image' : 'quote',
        thumbnail: firstMedia || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        postOwner: authorName,
        title: post.content.substring(0, 100),
        description: post.content,
        sourceType: 'individual',
        sourceId: post.authorId?.toString() || '',
        primaryRoute: {
          pathname: '/community/post/[id]',
          params: { id: post._id.toString() }
        },
        hasAudio: false,
        createdAt: post.createdAt,
      };
    }

    if (type === 'sermon') {
      const sermon = await this.sermonModel
        .findOne({ _id: itemId, tenantId })
        .exec();

      if (!sermon) {
        throw new NotFoundException('Feed item not found');
      }

      return {
        id: `sermon-${sermon._id}`,
        kind: sermon.mediaUrl ? 'video' : 'image',
        thumbnail: sermon.thumbnailUrl || 'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=800',
        videoUrl: sermon.mediaUrl,
        postOwner: 'Church',
        speaker: sermon.speaker,
        title: sermon.title,
        description: `${sermon.tags?.join(' • ') || ''} • ${sermon.duration ? `${Math.floor(sermon.duration / 60)} min` : ''}`.trim(),
        sourceType: 'church',
        sourceId: sermon.tenantId?.toString() || '',
        primaryRoute: {
          pathname: '/media-player/[id]',
          params: { id: sermon._id.toString() }
        },
        hasAudio: !!sermon.mediaUrl,
        createdAt: sermon.date,
      };
    }

    throw new NotFoundException('Feed item not found');
  }
}
