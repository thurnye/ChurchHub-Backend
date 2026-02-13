import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';

// ========== DENOMINATION DATA ==========
const denominations = [
  {
    name: 'Pentecostal',
    slug: 'pentecostal',
    description:
      'Churches emphasizing the baptism of the Holy Spirit, spiritual gifts, and dynamic worship.',
    beliefs: [
      'Baptism in the Holy Spirit',
      'Speaking in tongues',
      'Divine healing',
      'Biblical authority',
    ],
    churchCount: 0,
    image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800',
  },
  {
    name: 'Anglican',
    slug: 'anglican',
    description:
      'Part of the worldwide Anglican Communion, blending Catholic and Reformed traditions.',
    beliefs: [
      'Scripture, Tradition, and Reason',
      'Sacramental worship',
      'Episcopal governance',
      'Book of Common Prayer',
    ],
    churchCount: 0,
    image: 'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=800',
  },
  {
    name: 'Catholic',
    slug: 'catholic',
    description:
      'The Roman Catholic Church, led by the Pope and rooted in ancient Christian tradition.',
    beliefs: [
      'Seven Sacraments',
      'Apostolic succession',
      'Sacred Tradition',
      'Communion of Saints',
    ],
    churchCount: 0,
    image: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800',
  },
  {
    name: 'Baptist',
    slug: 'baptist',
    description:
      "Churches emphasizing believer's baptism, congregational governance, and soul liberty.",
    beliefs: [
      "Believer's baptism by immersion",
      'Autonomy of local church',
      'Priesthood of all believers',
      'Separation of church and state',
    ],
    churchCount: 0,
    image: 'https://images.unsplash.com/photo-1502014822147-1aedfb0676e0?w=800',
  },
  {
    name: 'Adventist',
    slug: 'adventist',
    description:
      "Seventh-day Adventist churches observing Saturday Sabbath and Christ's return.",
    beliefs: [
      'Seventh-day Sabbath',
      'Second Coming of Christ',
      'State of the dead',
      'Health message',
    ],
    churchCount: 0,
    image: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
  },
  {
    name: 'African-initiated',
    slug: 'african-initiated',
    description:
      'Churches founded within African communities, blending Christian faith with cultural context.',
    beliefs: [
      'Contextual theology',
      'Community emphasis',
      'Prophetic ministry',
      'Social justice',
    ],
    churchCount: 0,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
  },
  {
    name: 'Methodist',
    slug: 'methodist',
    description:
      'Churches rooted in the Wesleyan tradition emphasizing holiness, grace, and social action.',
    beliefs: [
      'Prevenient grace',
      'Sanctification',
      'Connectional governance',
      'Social holiness',
    ],
    churchCount: 0,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
  },
  {
    name: 'Presbyterian',
    slug: 'presbyterian',
    description:
      'Reformed churches governed by elders, emphasizing covenant theology and biblical preaching.',
    beliefs: [
      'Sovereignty of God',
      'Elder leadership',
      'Covenant theology',
      'Authority of Scripture',
    ],
    churchCount: 0,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800',
  },
  {
    name: 'Orthodox',
    slug: 'orthodox',
    description:
      'Eastern Orthodox churches preserving ancient liturgy, apostolic succession, and tradition.',
    beliefs: [
      'Holy Tradition',
      'Divine Liturgy',
      'Theosis',
      'Apostolic succession',
    ],
    churchCount: 0,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800',
  },
  {
    name: 'Evangelical',
    slug: 'evangelical',
    description:
      'Churches emphasizing personal conversion, biblical authority, and evangelism.',
    beliefs: [
      'Born-again experience',
      'Biblical inerrancy',
      'Evangelism',
      'Personal faith in Christ',
    ],
    churchCount: 0,
    image: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800',
  },
  {
    name: 'Non-Denominational',
    slug: 'non-denominational',
    description:
      'Independent churches not formally aligned with a larger denominational structure.',
    beliefs: [
      'Biblical authority',
      'Independent governance',
      'Contemporary worship',
      'Local leadership autonomy',
    ],
    churchCount: 0,
    image: 'https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=800',
  },
  {
    name: 'Lutheran',
    slug: 'lutheran',
    description:
      'Churches rooted in the teachings of Martin Luther, emphasizing justification by faith.',
    beliefs: [
      'Justification by faith',
      'Law and Gospel distinction',
      'Sacramental theology',
      'Authority of Scripture',
    ],
    churchCount: 0,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800',
  },
  {
    name: 'Others',
    slug: 'others',
    description:
      'Churches or Christian communities not listed under the major denominations above.',
    beliefs: [
      'Varied theological traditions',
      'Independent or emerging movements',
      'Localized expressions of Christianity',
      'Mixed denominational influences',
    ],
    churchCount: 0,
    image: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800',
  },
];

async function prodSeed() {
  const logger = new Logger('ProdSeeder');
  logger.log('Starting production seed for denominations...');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const DenominationModel = app.get<Model<any>>(getModelToken('Denomination'));
    const TenantModel = app.get<Model<any>>(getModelToken('Tenant'));

    // Check if denominations already exist
    const existingCount = await DenominationModel.countDocuments();
    if (existingCount > 0) {
      logger.warn(`Found ${existingCount} existing denominations. Skipping seed to avoid duplicates.`);
      logger.log('If you want to re-seed, delete existing denominations first.');

      // Still update church counts
      logger.log('Updating church counts for existing denominations...');
      const allDenominations = await DenominationModel.find();
      for (const denom of allDenominations) {
        const count = await TenantModel.countDocuments({ denomination: denom.name });
        await DenominationModel.findByIdAndUpdate(denom._id, { churchCount: count });
        logger.log(`  ${denom.name}: ${count} churches`);
      }

      return;
    }

    // Create denominations
    logger.log('Creating denominations...');
    const denominationMap = new Map<string, any>();

    for (const denom of denominations) {
      const created = await DenominationModel.create({
        ...denom,
        isActive: true,
      });
      denominationMap.set(denom.name, created);
      logger.log(`  Created: ${denom.name}`);
    }

    // Update existing tenants with denomination references
    logger.log('Updating existing churches with denomination references...');
    const tenants = await TenantModel.find();

    for (const tenant of tenants) {
      // Try to find a matching denomination by name
      const denomName = tenant.denomination;
      if (denomName) {
        const denom = denominationMap.get(denomName);
        if (denom) {
          await TenantModel.findByIdAndUpdate(tenant._id, {
            denominationId: denom._id,
          });
          // Increment church count
          await DenominationModel.findByIdAndUpdate(denom._id, {
            $inc: { churchCount: 1 },
          });
          logger.log(`  Updated: ${tenant.name} -> ${denomName}`);
        }
      }
    }

    // Summary
    const finalCount = await DenominationModel.countDocuments();
    logger.log('='.repeat(60));
    logger.log('PRODUCTION SEED COMPLETED SUCCESSFULLY!');
    logger.log('='.repeat(60));
    logger.log(`Created ${finalCount} denominations:`);
    for (const denom of denominations) {
      const doc = await DenominationModel.findOne({ slug: denom.slug });
      logger.log(`  - ${denom.name} (${doc?.churchCount || 0} churches)`);
    }
    logger.log('='.repeat(60));

  } catch (error) {
    logger.error('Production seed failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

prodSeed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Production seed error:', error);
    process.exit(1);
  });
