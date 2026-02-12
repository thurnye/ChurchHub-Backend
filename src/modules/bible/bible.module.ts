import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BibleController } from './controllers/bible.controller';
import { BibleService } from './services/bible.service';
import {
  BibleTranslation,
  BibleTranslationSchema,
} from './entities/bible-translation.entity';
import { BibleBook, BibleBookSchema } from './entities/bible-book.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BibleTranslation.name, schema: BibleTranslationSchema },
      { name: BibleBook.name, schema: BibleBookSchema },
    ]),
  ],
  controllers: [BibleController],
  providers: [BibleService],
  exports: [BibleService],
})
export class BibleModule {}
