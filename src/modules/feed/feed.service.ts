import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from '@modules/community/entities/post.entity';
import {
  Sermon,
  SermonDocument,
} from '@modules/sermons/entities/sermon.entity';
import { Event, EventDocument } from '@modules/events/entities/event.entity';
import { PaginationDto } from '@common/dtos';
import {
  CommunityProgram,
  CommunityProgramDocument,
} from '@modules/community/entities/program.entity';

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
  sourceType: 'Tenant' | 'individual';
  sourceId: string;
  feedSource: 'community' | 'post' | 'sermon' | 'event';
  primaryRoute: { pathname: string; params: Record<string, any> };
  hasAudio?: boolean;
  createdAt: Date;
}

@Injectable()
export class FeedService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Sermon.name) private sermonModel: Model<SermonDocument>,
    @InjectModel(Event.name) private EventModel: Model<EventDocument>,
    @InjectModel(CommunityProgram.name)
    private CommunityProgramModel: Model<CommunityProgramDocument>,
  ) {}

 async getFeed(paginationDto: PaginationDto) {
  const { page = 1, limit = 20 } = paginationDto;
  const skip = (page - 1) * limit;

  const window = limit * 5; // fetch deeper to avoid sparse-type gaps

  const [
    posts,
    sermons,
    events,
    programs,
    postsTotal,
    sermonsTotal,
    eventsTotal,
    programsTotal,
  ] = await Promise.all([
    this.postModel
      .find()
      .populate('authorId', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(window)
      .exec(),

    this.sermonModel
      .find({ isPublished: true })
      .sort({ date: -1 })
      .limit(window)
      .exec(),

    this.EventModel
      .find({ isPublic: true })
      .sort({ createdAt: -1 }) // match what you use in createdAt below
      .limit(window)
      .exec(),

    this.CommunityProgramModel
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(window)
      .exec(),

    this.postModel.countDocuments(),
    this.sermonModel.countDocuments({ isPublished: true }),
    this.EventModel.countDocuments({ isPublic: true }),
    this.CommunityProgramModel.countDocuments({ isActive: true }),
  ]);

  // Transform posts to feed items
    const postItems: FeedItem[] = posts.map((post) => {
      const author = post.authorId as any;
      const authorName = author
        ? `${author.firstName} ${author.lastName}`
        : 'Unknown';
      const hasMedia = post.images && post.images.length > 0;
      const firstMedia = hasMedia ? post.images[0] : null;

      return {
        id: `post-${post._id}`,
        kind: hasMedia ? 'image' : 'quote',
        thumbnail:
          firstMedia ||
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        postOwner: authorName,
        description: post.content,
        sourceType: 'individual',
        feedSource: 'post',
        sourceId: post.authorId?.toString() || '',
        primaryRoute: {
          pathname: '/community/post/[id]',
          params: { id: post._id.toString() },
        },
        hasAudio: false,
        createdAt: post.createdAt,
      };
    });

    // Transform sermons to feed items
    const sermonItems: FeedItem[] = sermons.map((sermon) => ({
      id: `sermon-${sermon._id}`,
      kind: sermon.mediaUrl ? 'video' : 'image',
      thumbnail:
        sermon.thumbnailUrl ||
        'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=800',
      videoUrl: sermon.mediaUrl,
      postOwner: 'Church',
      speaker: sermon.speaker,
      title: sermon.title,
      description:
        `${sermon.tags?.join(' • ') || ''} • ${sermon.duration ? `${Math.floor(sermon.duration / 60)} min` : ''}`.trim(),
      sourceType: 'Tenant',
      feedSource: 'sermon',
      sourceId: sermon.tenantId?.toString() || '',
      primaryRoute: {
        pathname: '/media-player/[id]',
        params: { id: sermon._id.toString() },
      },
      hasAudio: !!sermon.mediaUrl,
      createdAt: sermon.date,
    }));

    //Transform events to feed items
    const eventItems: FeedItem[] = events.map((event) => ({
      id: `event-${event._id}`,
      kind: 'image',
      thumbnail:
        event.image ||
        'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=800',
      postOwner: 'Church', //change to the owner of the post
      title: event.title,
      description:
        `${event.description} • ${event.location} • ${event.startDate ? `${event.startDate} to ${event.endDate}` : ''}`.trim(),
      sourceType: 'Tenant',
      sourceId: event.tenantId?.toString() || '',
      feedSource:'event',
      primaryRoute: {
        pathname: '/events/[eventId]',
        params: { eventId: event._id.toString() },
      },
      hasAudio: false,
      createdAt: event.createdAt,
    }));

    //Transform events to feed items
    const programItems: FeedItem[] = programs.map((program) => ({
      id: `program-${program._id}`,
      kind: 'image',
      thumbnail:
        program.image ||
        'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=800',
      postOwner: 'Church', //change to the owner of the post
      title: program.title,
      description: `${program.description} • ${program.contact}`.trim(),
      sourceType: 'Tenant',
      sourceId: program.tenantId?.toString() || '',
      feedSource:'community',
      primaryRoute: {
        pathname: '/community/[id]',
        params: { id: program._id.toString() },
      },
      hasAudio: false,
      createdAt: program.createdAt,
    }));


  const allItems = [...postItems, ...sermonItems, ...eventItems, ...programItems]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  const data = allItems.slice(skip, skip + limit);

  const total = postsTotal + sermonsTotal + eventsTotal + programsTotal;

  return {
    data,
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
      const authorName = author
        ? `${author.firstName} ${author.lastName}`
        : 'Unknown';
      const hasMedia = post.images && post.images.length > 0;
      const firstMedia = hasMedia ? post.images[0] : null;

      return {
        id: `post-${post._id}`,
        kind: hasMedia ? 'image' : 'quote',
        thumbnail:
          firstMedia ||
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        postOwner: authorName,
        title: post.content.substring(0, 100),
        description: post.content,
        sourceType: 'individual',
        sourceId: post.authorId?.toString() || '',
        feedSource: 'post',
        primaryRoute: {
          pathname: '/community/post/[id]',
          params: { id: post._id.toString() },
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
        thumbnail:
          sermon.thumbnailUrl ||
          'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=800',
        videoUrl: sermon.mediaUrl,
        postOwner: 'Church',
        speaker: sermon.speaker,
        title: sermon.title,
        description:
          `${sermon.tags?.join(' • ') || ''} • ${sermon.duration ? `${Math.floor(sermon.duration / 60)} min` : ''}`.trim(),
        sourceType: 'Tenant',
        sourceId: sermon.tenantId?.toString() || '',
        feedSource: 'sermon',
        primaryRoute: {
          pathname: '/media-player/[id]',
          params: { id: sermon._id.toString() },
        },
        hasAudio: !!sermon.mediaUrl,
        createdAt: sermon.date,
      };
    }

    throw new NotFoundException('Feed item not found');
  }
}
