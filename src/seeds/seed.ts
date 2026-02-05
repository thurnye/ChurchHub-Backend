import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { UserRole } from '../common/types/user-role.enum';
import { MembershipRole, MembershipStatus } from '../modules/tenant/entities/membership.entity';

async function seed() {
  const logger = new Logger('Seeder');
  logger.log('Starting database seed...');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // Get models
    const UserModel = app.get<Model<any>>(getModelToken('User'));
    const TenantModel = app.get<Model<any>>(getModelToken('Tenant'));
    const MembershipModel = app.get<Model<any>>(getModelToken('Membership'));
    const ProfileModel = app.get<Model<any>>(getModelToken('Profile'));
    const PostModel = app.get<Model<any>>(getModelToken('Post'));
    const EventModel = app.get<Model<any>>(getModelToken('Event'));
    const SermonModel = app.get<Model<any>>(getModelToken('Sermon'));
    const GroupModel = app.get<Model<any>>(getModelToken('Group'));
    const PrayerRequestModel = app.get<Model<any>>(getModelToken('PrayerRequest'));
    const NotificationModel = app.get<Model<any>>(getModelToken('Notification'));
    const JoinCodeModel = app.get<Model<any>>(getModelToken('JoinCode'));
    const TenantSettingsModel = app.get<Model<any>>(getModelToken('TenantSettings'));

    // Check if seed data already exists
    const existingAdmin = await UserModel.findOne({ email: 'superadmin@churchhub.com' });
    if (existingAdmin) {
      logger.warn('Seed data already exists. Skipping seed...');
      await app.close();
      return;
    }

    const passwordHash = await bcrypt.hash('Password123!', 10);

    // ========== CREATE TENANT FIRST ==========
    logger.log('Creating tenant...');

    const tenant = await TenantModel.create({
      name: 'Grace Community Church',
      slug: 'grace-community',
      joinCode: 'GRACE2024',
      description: 'A welcoming community of believers in downtown',
      status: 'active',
      subscriptionPlan: 'pro',
      settings: {
        allowPublicRegistration: true,
        requireEmailVerification: true,
        requirePhoneVerification: false,
        enableDonations: true,
        enableEvents: true,
        enableGroups: true,
        enablePrayer: true,
        enableSermons: true,
        enableBible: true,
        timezone: 'America/New_York',
        language: 'en',
      },
      branding: {
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        accentColor: '#F59E0B',
        fontFamily: 'Inter',
      },
    });

    const tenantId = tenant._id;
    logger.log('Tenant created successfully');

    // ========== CREATE USERS ==========
    logger.log('Creating users...');

    // Super admin (no tenantId - platform level)
    const superAdmin = await UserModel.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@churchhub.com',
      password: passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: 'active',
      emailVerified: true,
    });

    // Church admin
    const churchAdmin = await UserModel.create({
      firstName: 'John',
      lastName: 'Administrator',
      email: 'admin@gracechurch.com',
      password: passwordHash,
      tenantId,
      role: UserRole.CHURCH_ADMIN,
      status: 'active',
      emailVerified: true,
    });

    // Clergy (Pastor)
    const clergy = await UserModel.create({
      firstName: 'Michael',
      lastName: 'Smith',
      email: 'pastor@gracechurch.com',
      password: passwordHash,
      tenantId,
      role: UserRole.CLERGY,
      status: 'active',
      emailVerified: true,
    });

    // Leader
    const leader = await UserModel.create({
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'leader@gracechurch.com',
      password: passwordHash,
      tenantId,
      role: UserRole.LEADER,
      status: 'active',
      emailVerified: true,
    });

    // Member
    const member = await UserModel.create({
      firstName: 'David',
      lastName: 'Williams',
      email: 'member@gracechurch.com',
      password: passwordHash,
      tenantId,
      role: UserRole.MEMBER,
      status: 'active',
      emailVerified: true,
    });

    logger.log('Users created successfully');

    // ========== CREATE MEMBERSHIPS ==========
    logger.log('Creating memberships...');

    await MembershipModel.create([
      {
        tenantId,
        userId: churchAdmin._id,
        role: MembershipRole.CHURCH_ADMIN,
        status: MembershipStatus.ACTIVE,
        joinedAt: new Date(),
      },
      {
        tenantId,
        userId: clergy._id,
        role: MembershipRole.CLERGY,
        status: MembershipStatus.ACTIVE,
        joinedAt: new Date(),
      },
      {
        tenantId,
        userId: leader._id,
        role: MembershipRole.LEADER,
        status: MembershipStatus.ACTIVE,
        joinedAt: new Date(),
      },
      {
        tenantId,
        userId: member._id,
        role: MembershipRole.MEMBER,
        status: MembershipStatus.ACTIVE,
        joinedAt: new Date(),
      },
    ]);

    logger.log('Memberships created successfully');

    // ========== CREATE PROFILES ==========
    logger.log('Creating profiles...');

    await ProfileModel.create([
      {
        userId: churchAdmin._id,
        tenantId,
        displayName: 'John Administrator',
        bio: 'Church administrator and deacon',
      },
      {
        userId: clergy._id,
        tenantId,
        displayName: 'Pastor Michael Smith',
        bio: 'Senior Pastor at Grace Community Church',
      },
      {
        userId: leader._id,
        tenantId,
        displayName: 'Sarah Johnson',
        bio: 'Small group leader and worship team member',
      },
      {
        userId: member._id,
        tenantId,
        displayName: 'David Williams',
        bio: 'Member since 2020',
      },
    ]);

    logger.log('Profiles created successfully');

    // ========== CREATE TENANT SETTINGS ==========
    logger.log('Creating tenant settings...');

    await TenantSettingsModel.create({
      tenantId,
      defaultBibleTranslationId: 'de4e12af7f28f599-02', // ESV
      enablePostModeration: false,
      enableCommentModeration: false,
      allowMemberPrayerRequests: true,
      allowMemberPosts: true,
      notificationRetentionDays: 30,
      enableEmailNotifications: true,
      enablePushNotifications: true,
      timezone: 'America/New_York',
      currency: 'USD',
      enableOnlineGiving: true,
    });

    logger.log('Tenant settings created successfully');

    // ========== CREATE JOIN CODE ==========
    logger.log('Creating join codes...');

    await JoinCodeModel.create({
      tenantId,
      code: 'WELCOME2024',
      roleGranted: MembershipRole.MEMBER,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      maxUses: 100,
      usageCount: 0,
      isActive: true,
      description: 'Welcome new members',
      createdBy: churchAdmin._id,
    });

    logger.log('Join codes created successfully');

    // ========== CREATE POSTS ==========
    logger.log('Creating community posts...');

    await PostModel.create([
      {
        tenantId,
        authorId: clergy._id,
        content: 'Welcome to our new church community app! We are excited to connect with you all here. Feel free to share, pray, and grow together.',
        isPublished: true,
        likesCount: 12,
        commentsCount: 3,
      },
      {
        tenantId,
        authorId: leader._id,
        content: 'Reminder: Small group meets this Thursday at 7pm at the Johnson residence. Looking forward to seeing everyone!',
        isPublished: true,
        likesCount: 8,
        commentsCount: 2,
      },
      {
        tenantId,
        authorId: member._id,
        content: 'So grateful for this community. The sermon last Sunday really spoke to me about forgiveness.',
        isPublished: true,
        likesCount: 15,
        commentsCount: 5,
      },
    ]);

    logger.log('Posts created successfully');

    // ========== CREATE EVENTS ==========
    logger.log('Creating events...');

    const nextSunday = new Date();
    nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()));
    nextSunday.setHours(10, 0, 0, 0);

    await EventModel.create([
      {
        tenantId,
        title: 'Sunday Worship Service',
        description: 'Join us for our weekly worship service with praise, prayer, and a message from Pastor Michael.',
        startDate: nextSunday,
        endDate: new Date(nextSunday.getTime() + 90 * 60 * 1000),
        location: 'Main Sanctuary',
        isRecurring: true,
        recurrenceRule: 'FREQ=WEEKLY;BYDAY=SU',
        createdBy: churchAdmin._id,
      },
      {
        tenantId,
        title: 'Youth Night',
        description: 'Fun and fellowship for teens ages 13-18. Games, worship, and small group discussion.',
        startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        location: 'Youth Center',
        isRecurring: false,
        createdBy: leader._id,
      },
      {
        tenantId,
        title: 'Community Outreach Day',
        description: 'Serving our local community through various service projects. All ages welcome!',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        location: 'Church Parking Lot',
        isRecurring: false,
        createdBy: churchAdmin._id,
      },
    ]);

    logger.log('Events created successfully');

    // ========== CREATE SERMONS ==========
    logger.log('Creating sermons...');

    await SermonModel.create([
      {
        tenantId,
        title: 'The Power of Forgiveness',
        speaker: 'Pastor Michael Smith',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        description: 'Exploring what the Bible teaches about forgiveness and how to practice it in our daily lives.',
        notes: 'Key passages: Matthew 18:21-35, Ephesians 4:32',
        tags: ['forgiveness', 'grace', 'relationships'],
        scriptureReferences: ['Matthew 18:21-35', 'Ephesians 4:32', 'Colossians 3:13'],
        isPublished: true,
        publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        viewCount: 45,
        createdBy: clergy._id,
      },
      {
        tenantId,
        title: 'Walking in Faith',
        speaker: 'Pastor Michael Smith',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        description: 'How to trust God even when we cannot see the path ahead.',
        tags: ['faith', 'trust', 'guidance'],
        scriptureReferences: ['Hebrews 11:1', 'Proverbs 3:5-6', '2 Corinthians 5:7'],
        isPublished: true,
        publishedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000),
        viewCount: 62,
        createdBy: clergy._id,
      },
      {
        tenantId,
        title: 'Building Community',
        speaker: 'Guest Speaker: Rev. James Wilson',
        date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        description: 'The importance of Christian fellowship and building authentic relationships.',
        tags: ['community', 'fellowship', 'church'],
        scriptureReferences: ['Acts 2:42-47', 'Hebrews 10:24-25'],
        isPublished: true,
        publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        viewCount: 38,
        createdBy: clergy._id,
      },
    ]);

    logger.log('Sermons created successfully');

    // ========== CREATE GROUPS ==========
    logger.log('Creating groups...');

    await GroupModel.create([
      {
        tenantId,
        name: 'Young Adults Small Group',
        description: 'A community for young adults (20s-30s) to grow in faith together.',
        leaderId: leader._id,
        memberIds: [leader._id, member._id],
        meetingSchedule: 'Thursdays at 7pm',
        location: 'Various homes',
        isPublic: true,
        maxMembers: 15,
        createdBy: leader._id,
      },
      {
        tenantId,
        name: "Men's Bible Study",
        description: 'Weekly men\'s group focusing on Bible study and accountability.',
        leaderId: clergy._id,
        memberIds: [clergy._id],
        meetingSchedule: 'Saturdays at 8am',
        location: 'Church Fellowship Hall',
        isPublic: true,
        maxMembers: 20,
        createdBy: clergy._id,
      },
      {
        tenantId,
        name: 'Prayer Warriors',
        description: 'Dedicated prayer ministry interceding for our church and community.',
        leaderId: churchAdmin._id,
        memberIds: [churchAdmin._id, clergy._id, leader._id],
        meetingSchedule: 'Wednesdays at 6am',
        location: 'Prayer Room',
        isPublic: true,
        maxMembers: 30,
        createdBy: churchAdmin._id,
      },
    ]);

    logger.log('Groups created successfully');

    // ========== CREATE PRAYER REQUESTS ==========
    logger.log('Creating prayer requests...');

    await PrayerRequestModel.create([
      {
        tenantId,
        authorId: member._id,
        title: 'Prayer for healing',
        content: 'Please pray for my mother who is going through surgery next week. Pray for successful procedure and quick recovery.',
        visibility: 'church',
        isAnonymous: false,
        status: 'active',
        prayerCount: 8,
      },
      {
        tenantId,
        authorId: leader._id,
        title: 'Guidance for new job',
        content: "Seeking God's guidance as I consider a job change. Please pray for wisdom and clarity.",
        visibility: 'church',
        isAnonymous: false,
        status: 'active',
        prayerCount: 5,
      },
      {
        tenantId,
        authorId: clergy._id,
        title: 'Church Growth Initiative',
        content: 'Please pray for our upcoming outreach efforts and that we can effectively share the love of Christ with our community.',
        visibility: 'church',
        isAnonymous: false,
        status: 'active',
        prayerCount: 15,
      },
    ]);

    logger.log('Prayer requests created successfully');

    // ========== CREATE NOTIFICATIONS ==========
    logger.log('Creating sample notifications...');

    await NotificationModel.create([
      {
        tenantId,
        userId: member._id,
        type: 'event_reminder',
        title: 'Upcoming Event',
        body: 'Sunday Worship Service is tomorrow at 10:00 AM',
        data: { eventId: 'sample' },
        isRead: false,
      },
      {
        tenantId,
        userId: member._id,
        type: 'new_sermon',
        title: 'New Sermon Available',
        body: '"The Power of Forgiveness" by Pastor Michael Smith is now available',
        data: { sermonId: 'sample' },
        isRead: false,
      },
      {
        tenantId,
        userId: leader._id,
        type: 'prayer_request',
        title: 'New Prayer Request',
        body: 'David Williams has submitted a prayer request',
        data: { prayerId: 'sample' },
        isRead: true,
        readAt: new Date(),
      },
    ]);

    logger.log('Notifications created successfully');

    // Update tenant member count
    await TenantModel.updateOne({ _id: tenantId }, { $set: { memberCount: 4 } });

    // ========== SUMMARY ==========
    logger.log('='.repeat(50));
    logger.log('SEED COMPLETED SUCCESSFULLY!');
    logger.log('='.repeat(50));
    logger.log('');
    logger.log('Created:');
    logger.log('  - 5 Users (1 super_admin, 1 church_admin, 1 clergy, 1 leader, 1 member)');
    logger.log('  - 1 Tenant (Grace Community Church)');
    logger.log('  - 4 Memberships');
    logger.log('  - 4 Profiles');
    logger.log('  - 1 Tenant Settings');
    logger.log('  - 1 Join Code');
    logger.log('  - 3 Community Posts');
    logger.log('  - 3 Events');
    logger.log('  - 3 Sermons');
    logger.log('  - 3 Groups');
    logger.log('  - 3 Prayer Requests');
    logger.log('  - 3 Notifications');
    logger.log('');
    logger.log('Test Credentials:');
    logger.log('  Super Admin: superadmin@churchhub.com / Password123!');
    logger.log('  Church Admin: admin@gracechurch.com / Password123!');
    logger.log('  Pastor: pastor@gracechurch.com / Password123!');
    logger.log('  Leader: leader@gracechurch.com / Password123!');
    logger.log('  Member: member@gracechurch.com / Password123!');
    logger.log('');
    logger.log('Join Codes: GRACE2024 (tenant join), WELCOME2024 (new members)');
    logger.log('Tenant Slug: grace-community');
    logger.log('='.repeat(50));

  } catch (error) {
    logger.error('Seed failed:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  });
