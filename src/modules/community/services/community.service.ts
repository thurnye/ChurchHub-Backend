import { Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository';
import { CommentRepository } from '../repositories/comment.repository';
import { CreatePostDto } from '../dtos/create-post.dto';
import { CreateCommentDto } from '../dtos/create-comment.dto';
import { PaginationUtil } from '@common/utils';

@Injectable()
export class CommunityService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly commentRepository: CommentRepository,
  ) {}

  async createPost(tenantId: string, userId: string, createPostDto: CreatePostDto) {
    return this.postRepository.create({
      tenantId,
      authorId: userId,
      content: createPostDto.content,
      images: createPostDto.images || [],
      likes: [],
      commentsCount: 0,
      isPinned: false,
    } as any);
  }

  async getPosts(tenantId: string, page: number, limit: number) {
    const skip = PaginationUtil.getSkip(page, limit);
    const [data, total] = await Promise.all([
      this.postRepository.findByTenant(tenantId, skip, limit),
      this.postRepository.count({ tenantId } as any),
    ]);

    return PaginationUtil.paginate(data, total, { page, limit });
  }

  async likePost(postId: string, userId: string) {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const likes = post.likes || [];
    const index = likes.findIndex((id) => id.toString() === userId);

    if (index > -1) {
      likes.splice(index, 1);
    } else {
      likes.push(userId as any);
    }

    return this.postRepository.update(postId, { likes } as any);
  }

  async createComment(postId: string, userId: string, createCommentDto: CreateCommentDto) {
    const comment = await this.commentRepository.create({
      postId,
      authorId: userId,
      content: createCommentDto.content,
    } as any);

    await this.postRepository.update(postId, {
      $inc: { commentsCount: 1 },
    } as any);

    return comment;
  }

  async getComments(postId: string) {
    return this.commentRepository.findByPost(postId);
  }

  async deletePost(postId: string, userId: string) {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId.toString() !== userId) {
      throw new NotFoundException('Unauthorized');
    }

    await this.postRepository.delete(postId);
  }
}
