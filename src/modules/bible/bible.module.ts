import { Module } from '@nestjs/common';
import { BibleController } from './controllers/bible.controller';
import { BibleService } from './services/bible.service';

@Module({
  controllers: [BibleController],
  providers: [BibleService],
  exports: [BibleService],
})
export class BibleModule {}
