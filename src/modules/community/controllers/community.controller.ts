import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { CommunityService } from '../services/community.service';
import { CreatePostDto } from '../dtos/create-post.dto';
import { CreateCommentDto } from '../dtos/create-comment.dto';
import { JwtAuthGuard } from '@common/guards';
import { CurrentUser, TenantId } from '@common/decorators';
import { PaginationDto } from '@common/dtos';
import { ParseObjectIdPipe } from '@common/pipes';

@ApiTags('Community')
@Controller('community')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiSecurity('tenant-id')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Post('posts')
  @ApiOperation({ summary: 'Create a post' })
  async createPost(
    @TenantId() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.communityService.createPost(tenantId, userId, createPostDto);
  }

  @Get('posts')
  @ApiOperation({ summary: 'Get all posts' })
  async getPosts(@TenantId() tenantId: string, @Query() paginationDto: PaginationDto) {
    return this.communityService.getPosts(tenantId, paginationDto.page, paginationDto.limit);
  }

  @Post('posts/:id/like')
  @ApiOperation({ summary: 'Like/Unlike a post' })
  async likePost(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.communityService.likePost(id, userId);
  }

  @Post('posts/:id/comments')
  @ApiOperation({ summary: 'Comment on a post' })
  async createComment(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser('userId') userId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.communityService.createComment(id, userId, createCommentDto);
  }

  @Get('posts/:id/comments')
  @ApiOperation({ summary: 'Get post comments' })
  async getComments(@Param('id', ParseObjectIdPipe) id: string) {
    return this.communityService.getComments(id);
  }

  @Delete('posts/:id')
  @ApiOperation({ summary: 'Delete a post' })
  async deletePost(
    @Param('id', ParseObjectIdPipe) id: string,
    @CurrentUser('userId') userId: string,
  ) {
    await this.communityService.deletePost(id, userId);
    return { message: 'Post deleted successfully' };
  }
}
