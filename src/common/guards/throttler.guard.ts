import { ThrottlerGuard as NestThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ThrottlerGuard extends NestThrottlerGuard {}
