import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { UserRole } from '../common/types/user-role.enum';
import { MembershipRole, MembershipStatus } from '../modules/tenant/entities/membership.entity';
import { EventCategory } from '../modules/events/entities/event.entity';
import { GroupType } from '../modules/groups/entities/group.entity';
import { ProgramType } from '../modules/community/entities/program.entity';

// ========== MOCK DATA FROM FRONTEND ==========

const churches = [
  {
    id: '1',
    name: 'Grace Community Church',
    slug: 'grace-community',
    joinCode: 'GRACE2024',
    denomination: 'Pentecostal',
    description: 'A vibrant community of believers passionate about worship and serving our city.',
    mission: 'To glorify God by sharing the gospel and building a community of faith.',
    vision: 'A world where every person knows and loves Jesus Christ.',
    address: '123 Main Street, Downtown',
    phone: '+1 (555) 123-4567',
    email: 'info@gracecommunity.org',
    website: 'gracecommunity.org',
    logo: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800',
    coverImage: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800',
    hasLivestream: true,
    accentColor: '#8B5CF6',
    membersCount: 132,
    pastor: {
      firstName: 'James',
      lastName: 'Thompson',
      email: 'james.thompson@gracecommunity.org',
      role: 'Senior Pastor',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      bio: 'Rev. James Thompson has been serving as the Senior Pastor of Grace Community Church for over 10 years.',
    },
    clergy: [
      {
        firstName: 'Mary',
        lastName: 'Johnson',
        email: 'mary.johnson@gracecommunity.org',
        role: 'Associate Pastor',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      },
      {
        firstName: 'David',
        lastName: 'Lee',
        email: 'david.lee@gracecommunity.org',
        role: 'Youth Pastor',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      },
    ],
  },
  {
    id: '2',
    name: "St. Mary's Anglican Church",
    slug: 'st-marys-anglican',
    joinCode: 'STMARY2024',
    denomination: 'Anglican',
    description: 'A traditional Anglican parish with a warm, welcoming community.',
    mission: 'To glorify God and serve our neighbors through worship, prayer, and service.',
    vision: 'A community where faith and love are lived out in every aspect of life.',
    address: '456 Church Avenue, Midtown',
    phone: '+1 (555) 234-5678',
    email: 'contact@stmarys.org',
    website: 'stmarys.org',
    logo: 'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=800',
    coverImage: 'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=800',
    hasLivestream: false,
    accentColor: '#059669',
    membersCount: 98,
    pastor: {
      firstName: 'Michael',
      lastName: 'Roberts',
      email: 'michael.roberts@stmarys.org',
      role: 'Vicar',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      bio: "Fr. Michael Roberts has served as Vicar for 5 years, focusing on liturgy, pastoral care, and community outreach.",
    },
    clergy: [
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@stmarys.org',
        role: 'Deaconess',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      },
    ],
  },
  {
    id: '3',
    name: 'Sacred Heart Catholic Church',
    slug: 'sacred-heart',
    joinCode: 'SACRED2024',
    denomination: 'Catholic',
    description: 'A Catholic parish serving the community with faith, hope, and love.',
    mission: 'To proclaim the gospel of Jesus Christ and to serve the needs of our community.',
    vision: 'A community where faith and love are lived out in every aspect of life.',
    address: '789 Cathedral Lane, Westside',
    phone: '+1 (555) 345-6789',
    email: 'parish@sacredheart.org',
    website: 'sacredheart.org',
    logo: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800',
    coverImage: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800',
    hasLivestream: true,
    accentColor: '#DC2626',
    membersCount: 164,
    pastor: {
      firstName: 'David',
      lastName: 'Martinez',
      email: 'david.martinez@sacredheart.org',
      role: 'Parish Priest',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      bio: 'Fr. David Martinez has served for 8 years, teaching faithfully and shepherding the parish with compassion.',
    },
    clergy: [
      {
        firstName: 'Maria',
        lastName: 'Rodriguez',
        email: 'maria.rodriguez@sacredheart.org',
        role: 'Deaconess',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      },
    ],
  },
  {
    id: '4',
    name: 'New Life Baptist Church',
    slug: 'new-life-baptist',
    joinCode: 'NEWLIFE2024',
    denomination: 'Baptist',
    description: 'Building disciples and transforming lives through the gospel.',
    mission: 'To glorify God and serve our neighbors through worship, prayer, and service.',
    vision: 'A community where faith and love are lived out in every aspect of life.',
    address: '321 Hope Boulevard, Eastside',
    phone: '+1 (555) 456-7890',
    email: 'welcome@newlifebaptist.org',
    website: 'newlifebaptist.org',
    logo: 'https://images.unsplash.com/photo-1502014822147-1aedfb0676e0?w=800',
    coverImage: 'https://images.unsplash.com/photo-1502014822147-1aedfb0676e0?w=800',
    hasLivestream: true,
    accentColor: '#0891B2',
    membersCount: 121,
    pastor: {
      firstName: 'John',
      lastName: 'Williams',
      email: 'john.williams@newlifebaptist.org',
      role: 'Lead Pastor',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
      bio: 'John leads preaching and discipleship, with a heart for evangelism and practical teaching.',
    },
    clergy: [
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@newlifebaptist.org',
        role: 'Associate Pastor',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      },
    ],
  },
  {
    id: '5',
    name: 'Seventh-day Adventist Church',
    slug: 'seventh-day-adventist',
    joinCode: 'SDA2024',
    denomination: 'Adventist',
    description: "Keeping the Sabbath holy and sharing Christ's soon return.",
    mission: 'To glorify God and serve our neighbors through worship, prayer, and service.',
    vision: 'A community where faith and love are lived out in every aspect of life.',
    address: '555 Sabbath Street, Northside',
    phone: '+1 (555) 567-8901',
    email: 'info@sdachurch.org',
    website: 'sdachurch.org',
    logo: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
    coverImage: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
    hasLivestream: true,
    accentColor: '#7C3AED',
    membersCount: 109,
    pastor: {
      firstName: 'Samuel',
      lastName: 'Anderson',
      email: 'samuel.anderson@sdachurch.org',
      role: 'Senior Pastor',
      avatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400',
      bio: 'Samuel shepherds the church with a focus on Sabbath teaching, health ministry, and spiritual growth.',
    },
    clergy: [
      {
        firstName: 'Linda',
        lastName: 'Brown',
        email: 'linda.brown@sdachurch.org',
        role: 'Associate Pastor',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      },
    ],
  },
  {
    id: '6',
    name: 'Zion African Methodist Episcopal',
    slug: 'zion-ame',
    joinCode: 'ZION2024',
    denomination: 'African-initiated',
    description: 'An historic African-American church rooted in faith and community.',
    mission: 'To glorify God and serve our neighbors through worship, prayer, and service.',
    vision: 'A community where faith and love are lived out in every aspect of life.',
    address: '888 Freedom Way, Southside',
    phone: '+1 (555) 678-9012',
    email: 'contact@zionAME.org',
    website: 'zionAME.org',
    logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    coverImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    hasLivestream: true,
    accentColor: '#F59E0B',
    membersCount: 143,
    pastor: {
      firstName: 'Patricia',
      lastName: 'Johnson',
      email: 'patricia.johnson@zionAME.org',
      role: 'Presiding Elder',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
      bio: 'Patricia leads with a passion for worship, justice, and community transformation through faith.',
    },
    clergy: [
      {
        firstName: 'Mary',
        lastName: 'Davis',
        email: 'mary.davis@zionAME.org',
        role: 'Associate Pastor',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      },
    ],
  },
];

const events = [
  {
    churchId: '1',
    title: 'Youth Revival Night',
    description: 'A special night of worship and teaching for youth and young adults.',
    date: new Date('2026-01-25T19:00:00'),
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
    category: EventCategory.YOUTH,
  },
  {
    churchId: '3',
    title: 'Community Food Drive',
    description: 'Join us in serving our community by collecting and distributing food.',
    date: new Date('2026-01-27T10:00:00'),
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
    category: EventCategory.OUTREACH,
  },
  {
    churchId: '2',
    title: 'Easter Choir Practice',
    description: 'Preparing for Easter Sunday with weekly choir rehearsals.',
    date: new Date('2026-01-28T18:30:00'),
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    category: EventCategory.WORSHIP,
  },
  {
    churchId: '4',
    title: 'Marriage Enrichment Workshop',
    description: 'A day-long workshop for couples to strengthen their marriages.',
    date: new Date('2026-02-01T09:00:00'),
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    category: EventCategory.OTHER,
  },
];

const sermons = [
  // Grace Community Church (churchId: '1') - Multiple sermons for testing
  {
    churchId: '1',
    title: 'Walking in Faith',
    speaker: 'Rev. James Thompson',
    date: new Date('2026-01-21'),
    duration: 45 * 60, // 45 min in seconds
    thumbnailUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800',
    mediaUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    isLive: true,
    tags: ['Faith'],
  },
  {
    churchId: '1',
    title: 'The Power of Prayer',
    speaker: 'Rev. James Thompson',
    date: new Date('2026-01-19'),
    duration: 38 * 60,
    thumbnailUrl: 'https://images.unsplash.com/photo-1502014822147-1aedfb0676e0?w=800',
    mediaUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    tags: ['Prayer'],
  },
  {
    churchId: '1',
    title: 'Living in Community',
    speaker: 'Mary Johnson',
    date: new Date('2026-01-17'),
    duration: 32 * 60,
    thumbnailUrl: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800',
    mediaUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    tags: ['Community'],
  },
  {
    churchId: '1',
    title: 'Hope for Tomorrow',
    speaker: 'Rev. James Thompson',
    date: new Date('2026-01-15'),
    duration: 50 * 60,
    thumbnailUrl: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
    tags: ['Hope'],
  },
  {
    churchId: '1',
    title: "God's Love for All",
    speaker: 'David Lee',
    date: new Date('2026-01-12'),
    duration: 28 * 60,
    thumbnailUrl: 'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=800',
    mediaUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    tags: ['Love'],
  },
  {
    churchId: '1',
    title: 'Justice and Mercy',
    speaker: 'Rev. James Thompson',
    date: new Date('2026-01-10'),
    duration: 42 * 60,
    thumbnailUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    tags: ['Justice'],
  },
  {
    churchId: '1',
    title: 'Finding Peace in Chaos',
    speaker: 'Mary Johnson',
    date: new Date('2026-01-08'),
    duration: 35 * 60,
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    mediaUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    tags: ['Faith', 'Hope'],
  },
  {
    churchId: '1',
    title: 'Building Strong Families',
    speaker: 'David Lee',
    date: new Date('2026-01-05'),
    duration: 40 * 60,
    thumbnailUrl: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800',
    tags: ['Community', 'Love'],
  },
  // Other churches keep one sermon each
  {
    churchId: '4',
    title: 'The Power of Forgiveness',
    speaker: 'Pastor John Williams',
    date: new Date('2026-01-21'),
    duration: 38 * 60,
    thumbnailUrl: 'https://images.unsplash.com/photo-1502014822147-1aedfb0676e0?w=800',
    mediaUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    tags: ['Prayer'],
  },
  {
    churchId: '3',
    title: 'The Eucharist: Source and Summit',
    speaker: 'Fr. David Martinez',
    date: new Date('2026-01-20'),
    duration: 32 * 60,
    thumbnailUrl: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800',
    mediaUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    tags: ['Community'],
  },
  {
    churchId: '5',
    title: 'Sabbath Rest',
    speaker: 'Pastor Samuel Anderson',
    date: new Date('2026-01-18'),
    duration: 50 * 60,
    thumbnailUrl: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
    tags: ['Hope'],
  },
  {
    churchId: '2',
    title: 'Anglican Traditions',
    speaker: 'Fr. Michael Roberts',
    date: new Date('2026-01-14'),
    duration: 28 * 60,
    thumbnailUrl: 'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=800',
    mediaUrl: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    tags: ['Love'],
  },
  {
    churchId: '6',
    title: 'Standing for Justice',
    speaker: 'Rev. Dr. Patricia Johnson',
    date: new Date('2026-01-14'),
    duration: 42 * 60,
    thumbnailUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    tags: ['Justice'],
  },
];

const individualUsers = [
  {
    id: 'user-101',
    firstName: 'Daniel',
    lastName: 'Okafor',
    email: 'daniel.okafor@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800',
    bio: 'Learning, building, and sharing faith-filled moments.',
    posts: [
      {
        content: '"Peace I leave with you; my peace I give you." A reminder to breathe, pray, and trust the process.',
        images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
      },
      {
        content: 'Sunday reflections. Grateful for community, worship, and a fresh week.',
        images: ['https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800'],
      },
      {
        content: 'Grateful for church family and community.',
        images: ['https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=1200'],
      },
    ],
  },
  {
    id: 'user-102',
    firstName: 'Amina',
    lastName: 'Bello',
    email: 'amina.bello@example.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800',
    bio: 'Faith, service, and small acts of kindness.',
    posts: [
      {
        content: 'A short prayer for your week. If you\'re overwhelmed, pause—God is with you.',
        images: ['https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800'],
      },
      {
        content: 'Community day. Serving together is worship too.',
        images: ['https://images.unsplash.com/photo-1520975958225-1a1fbd7f6d10?w=800'],
      },
      {
        content: "Today's devotional hit differently.",
        images: ['https://images.unsplash.com/photo-1520974735194-6f64a33d6b49?w=1200'],
      },
    ],
  },
];

const churchPosts = [
  {
    churchId: '1',
    content: 'Choir rehearsal moments — praise night warmup.',
    images: ['https://images.unsplash.com/photo-1542395975-1913c290082f?w=1200'],
  },
  {
    churchId: '2',
    content: 'Choir rehearsal moments — praise night warmup.',
    images: ['https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200'],
  },
  {
    churchId: '2',
    content: 'Community outreach — food drive and prayer.',
    images: ['https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1200'],
  },
  {
    churchId: '3',
    content: 'Community outreach — food drive and prayer.',
    images: ['https://images.unsplash.com/photo-1542395975-1913c290082f?w=1200'],
  },
  {
    churchId: '5',
    content: 'Youth fellowship energy — faith and fun.',
    images: ['https://images.unsplash.com/photo-1520975958221-7087e3edb3c2?w=1200'],
  },
  {
    churchId: '5',
    content: 'Upcoming service reminder — join us live.',
    images: ['https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=1200'],
  },
];

const communityPrograms = [
  {
    title: 'Community Food Bank',
    category: 'Outreach & Charity',
    description: 'Providing food assistance to families in need every Wednesday and Saturday.',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
    contact: 'foodbank@community.org',
  },
  {
    title: 'Free Health Clinic',
    category: 'Health & Counseling',
    description: 'Free medical screenings and health consultations every first Saturday.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    contact: 'health@community.org',
  },
  {
    title: 'Refugee Support Services',
    category: 'Outreach & Charity',
    description: 'Supporting refugees and immigrants with resettlement, language classes, and job placement.',
    image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800',
    contact: 'refugee@community.org',
  },
  {
    title: 'Youth Mentorship Program',
    category: 'Community Programs',
    description: 'Connecting young people with mentors for guidance and support.',
    image: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800',
    contact: 'youth@community.org',
  },
  {
    title: 'Counseling Services',
    category: 'Health & Counseling',
    description: 'Free pastoral counseling and mental health support for individuals and families.',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800',
    contact: 'counseling@community.org',
  },
  {
    title: 'Volunteer Network',
    category: 'Volunteer Opportunities',
    description: 'Join our community of volunteers serving in various ministries and programs.',
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800',
    contact: 'volunteer@community.org',
  },
  {
    title: 'Drop-in Center',
    category: 'Outreach & Charity',
    description: 'A safe space offering hot meals, showers, and support services for the homeless.',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
    contact: 'dropin@community.org',
  },
  {
    title: 'Social Justice Initiatives',
    category: 'Charity & Justice',
    description: 'Advocating for justice, equality, and human rights in our community.',
    image: 'https://images.unsplash.com/photo-1528642474498-1af0c17fd8c3?w=800',
    contact: 'justice@community.org',
  },
  {
    title: 'Literacy Program',
    category: 'Education',
    description: 'A community-focused literacy initiative aimed at improving reading and writing skills for children and adults through guided learning, tutoring, and faith-based education support.',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200',
    contact: 'literacy@churchhub.org',
  },
  {
    title: 'After School Care',
    category: 'Youth & Family',
    description: 'A safe and nurturing after-school environment for children, offering homework assistance, creative activities, mentorship, and spiritual growth programs.',
    image: 'https://images.unsplash.com/photo-1522661067900-ab829854a57f?w=1200',
    contact: 'afterschool@churchhub.org',
  },
  {
    title: 'Senior Support',
    category: 'Community Care',
    description: 'A compassionate support program for seniors, providing regular check-ins, companionship, transportation assistance, wellness activities, and access to community resources.',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=1200',
    contact: 'seniors@churchhub.org',
  },
  {
    title: 'Job Training',
    category: 'Career Development',
    description: 'A practical job training and skills development program designed to equip participants with employability skills, career guidance, resume support, and interview preparation.',
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200',
    contact: 'jobs@churchhub.org',
  },
];

const volunteerPrograms = [
  {
    title: 'Sunday School Teacher',
    church: 'Grace Community Church',
    description: "Teach children ages 5-10 about God's love through engaging lessons and activities.",
    image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
    timeCommitment: 'Sundays 9:00-10:30 AM',
    skillsNeeded: ['Passion for children', 'Patience', 'Basic Bible knowledge'],
    coordinator: 'sarah.mitchell@gracecommunity.org',
    category: "Children's Ministry",
  },
  {
    title: 'Worship Team Musician',
    church: 'Grace Community Church',
    description: 'Join our worship band and use your musical gifts to lead the congregation in praise.',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
    timeCommitment: 'Sundays + Weekly practice',
    skillsNeeded: ['Musical ability', 'Team player', 'Heart for worship'],
    coordinator: 'worship@gracecommunity.org',
    category: 'Music Ministry',
  },
  {
    title: 'Food Bank Coordinator',
    church: 'Sacred Heart Catholic Church',
    description: 'Help organize and distribute food to families in need.',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
    timeCommitment: 'Saturdays 9:00 AM - 1:00 PM',
    skillsNeeded: ['Organization', 'Compassion', 'Physical ability'],
    coordinator: 'foodbank@sacredheart.org',
    category: 'Outreach',
  },
  {
    title: 'Worship Team',
    church: 'Grace Community Church',
    category: 'Worship & Arts',
    description: 'Serve in leading the congregation into meaningful worship through music, vocals, and instrumental support. This team works closely with pastors and service leaders to create an atmosphere of praise and spiritual reflection.',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200',
    timeCommitment: 'Weekly rehearsals + Sunday services',
    skillsNeeded: ['Singing', 'Instrumental skills', 'Team collaboration', 'Musical timing'],
    coordinator: 'Michael Johnson',
  },
  {
    title: "Children's Ministry",
    church: 'Grace Community Church',
    category: 'Children & Youth',
    description: 'Support the spiritual and personal growth of children by assisting with lessons, activities, and care during services and events in a safe, nurturing environment.',
    image: 'https://images.unsplash.com/photo-1503457574465-8f947a8faec8?w=1200',
    timeCommitment: 'Bi-weekly or weekly during services',
    skillsNeeded: ['Patience', 'Teaching', 'Child care', 'Communication'],
    coordinator: 'Sarah Williams',
  },
  {
    title: 'Hospitality',
    church: 'Grace Community Church',
    category: 'Service & Care',
    description: 'Create a welcoming experience for members and visitors by greeting guests, assisting with seating, providing information, and helping foster a warm church atmosphere.',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200',
    timeCommitment: 'Flexible — before and after services',
    skillsNeeded: ['Friendliness', 'Organization', 'Customer service', 'Teamwork'],
    coordinator: 'Daniel Okoye',
  },
  {
    title: 'Media Team',
    church: 'Grace Community Church',
    category: 'Technology & Media',
    description: 'Help manage audio, video, live streaming, photography, and visual presentations to support worship services and church events both in-person and online.',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200',
    timeCommitment: 'Weekly services + occasional events',
    skillsNeeded: ['Audio/Visual equipment', 'Live streaming', 'Photography', 'Basic editing'],
    coordinator: 'Joshua Lee',
  },
  {
    title: 'Outreach',
    church: 'Grace Community Church',
    category: 'Community Engagement',
    description: 'Serve the wider community through outreach initiatives such as food drives, neighborhood support programs, evangelism events, and partnerships with local organizations.',
    image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200',
    timeCommitment: 'Monthly events + planning sessions',
    skillsNeeded: ['Compassion', 'Event coordination', 'Public engagement'],
    coordinator: 'Rebecca Martinez',
  },
  {
    title: 'Prayer Ministry',
    church: 'Grace Community Church',
    category: 'Spiritual Care',
    description: 'Provide prayer support to individuals and families through confidential prayer sessions, follow-ups, and intercessory prayer during services and throughout the week.',
    image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1200',
    timeCommitment: 'Flexible — as needed or scheduled times',
    skillsNeeded: ['Listening', 'Empathy', 'Spiritual discernment', 'Confidentiality'],
    coordinator: 'Pastor Emmanuel Adeyemi',
  },
];

async function seed() {
  const logger = new Logger('Seeder');
  logger.log('Starting comprehensive database seed with all mock data...');

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
    const JoinCodeModel = app.get<Model<any>>(getModelToken('JoinCode'));
    const TenantSettingsModel = app.get<Model<any>>(getModelToken('TenantSettings'));
    const CommunityProgramModel = app.get<Model<any>>(getModelToken('CommunityProgram'));

    // Check if seed data already exists
    const existingAdmin = await UserModel.findOne({ email: 'superadmin@churchhub.com' });
    if (existingAdmin) {
      logger.warn('Seed data already exists. Clearing existing data...');
      // Clear existing data for fresh seed
      await Promise.all([
        UserModel.deleteMany({}),
        TenantModel.deleteMany({}),
        MembershipModel.deleteMany({}),
        ProfileModel.deleteMany({}),
        PostModel.deleteMany({}),
        EventModel.deleteMany({}),
        SermonModel.deleteMany({}),
        GroupModel.deleteMany({}),
        JoinCodeModel.deleteMany({}),
        TenantSettingsModel.deleteMany({}),
        CommunityProgramModel.deleteMany({}),
      ]);
      logger.log('Existing data cleared.');
    }

    const passwordHash = await bcrypt.hash('Password123!', 10);

    // ========== CREATE SUPER ADMIN ==========
    logger.log('Creating super admin...');
    const superAdmin = await UserModel.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: 'superadmin@churchhub.com',
      password: passwordHash,
      role: UserRole.SUPER_ADMIN,
      status: 'active',
      emailVerified: true,
    });

    // ========== CREATE TENANTS (CHURCHES) ==========
    logger.log('Creating tenants (churches)...');
    const tenantMap = new Map<string, any>(); // churchId -> tenant
    const pastorMap = new Map<string, any>(); // churchId -> pastor user

    for (const church of churches) {
      const tenant = await TenantModel.create({
        name: church.name,
        slug: church.slug,
        joinCode: church.joinCode,
        description: church.description,
        logo: church.logo,
        coverImage: church.coverImage,
        address: {
          street: church.address,
          city: 'New York',
          state: 'NY',
          country: 'USA',
          zipCode: '10001',
        },
        phone: church.phone,
        email: church.email,
        website: church.website,
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
          primaryColor: church.accentColor,
          secondaryColor: '#10B981',
          accentColor: church.accentColor,
          fontFamily: 'Inter',
        },
        memberCount: church.membersCount,
      });

      tenantMap.set(church.id, tenant);

      // Create pastor/priest for this church
      const pastor = await UserModel.create({
        firstName: church.pastor.firstName,
        lastName: church.pastor.lastName,
        email: church.pastor.email,
        password: passwordHash,
        tenantId: tenant._id,
        role: UserRole.CLERGY,
        status: 'active',
        emailVerified: true,
        avatar: church.pastor.avatar,
      });
      pastorMap.set(church.id, pastor);

      // Create membership for pastor
      await MembershipModel.create({
        tenantId: tenant._id,
        userId: pastor._id,
        role: MembershipRole.CLERGY,
        status: MembershipStatus.ACTIVE,
        joinedAt: new Date(),
      });

      // Create profile for pastor
      await ProfileModel.create({
        userId: pastor._id,
        tenantId: tenant._id,
        displayName: `${church.pastor.firstName} ${church.pastor.lastName}`,
        bio: church.pastor.bio || `${church.pastor.role} at ${church.name}`,
        avatar: church.pastor.avatar,
      });

      // Create clergy members
      for (const clergyMember of church.clergy) {
        const clergy = await UserModel.create({
          firstName: clergyMember.firstName,
          lastName: clergyMember.lastName,
          email: clergyMember.email,
          password: passwordHash,
          tenantId: tenant._id,
          role: UserRole.CLERGY,
          status: 'active',
          emailVerified: true,
          avatar: clergyMember.avatar,
        });

        await MembershipModel.create({
          tenantId: tenant._id,
          userId: clergy._id,
          role: MembershipRole.CLERGY,
          status: MembershipStatus.ACTIVE,
          joinedAt: new Date(),
        });

        await ProfileModel.create({
          userId: clergy._id,
          tenantId: tenant._id,
          displayName: `${clergyMember.firstName} ${clergyMember.lastName}`,
          bio: `${clergyMember.role} at ${church.name}`,
          avatar: clergyMember.avatar,
        });
      }

      // Create tenant settings
      await TenantSettingsModel.create({
        tenantId: tenant._id,
        defaultBibleTranslationId: 'de4e12af7f28f599-02',
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

      // Create welcome join code
      await JoinCodeModel.create({
        tenantId: tenant._id,
        code: `WELCOME${church.id}2024`,
        roleGranted: MembershipRole.MEMBER,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        maxUses: 100,
        usageCount: 0,
        isActive: true,
        description: 'Welcome new members',
        createdBy: pastor._id,
      });

      logger.log(`Created tenant: ${church.name}`);
    }

    // ========== CREATE INDIVIDUAL USERS ==========
    logger.log('Creating individual users...');
    const individualUserMap = new Map<string, any>();

    // Use the first tenant for individual users
    const defaultTenant = tenantMap.get('1');

    for (const user of individualUsers) {
      const createdUser = await UserModel.create({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: passwordHash,
        tenantId: defaultTenant._id,
        role: UserRole.MEMBER,
        status: 'active',
        emailVerified: true,
        avatar: user.avatar,
      });

      individualUserMap.set(user.id, createdUser);

      await MembershipModel.create({
        tenantId: defaultTenant._id,
        userId: createdUser._id,
        role: MembershipRole.MEMBER,
        status: MembershipStatus.ACTIVE,
        joinedAt: new Date(),
      });

      await ProfileModel.create({
        userId: createdUser._id,
        tenantId: defaultTenant._id,
        displayName: `${user.firstName} ${user.lastName}`,
        bio: user.bio,
        avatar: user.avatar,
      });

      // Create posts for this user
      for (const post of user.posts) {
        await PostModel.create({
          tenantId: defaultTenant._id,
          authorId: createdUser._id,
          content: post.content,
          images: post.images,
        });
      }

      logger.log(`Created individual user: ${user.firstName} ${user.lastName}`);
    }

    // ========== CREATE EVENTS ==========
    logger.log('Creating events...');

    for (const event of events) {
      const tenant = tenantMap.get(event.churchId);
      const pastor = pastorMap.get(event.churchId);

      if (tenant && pastor) {
        await EventModel.create({
          tenantId: tenant._id,
          title: event.title,
          description: event.description,
          category: event.category,
          startDate: event.date,
          endDate: new Date(event.date.getTime() + 2 * 60 * 60 * 1000), // +2 hours
          location: tenant.address?.street || 'Church Campus',
          image: event.image,
          requiresRegistration: false,
          isPublic: true,
        });
        logger.log(`Created event: ${event.title}`);
      }
    }

    // ========== CREATE SERMONS ==========
    logger.log('Creating sermons...');

    for (const sermon of sermons) {
      const tenant = tenantMap.get(sermon.churchId);
      const pastor = pastorMap.get(sermon.churchId);

      if (tenant && pastor) {
        await SermonModel.create({
          tenantId: tenant._id,
          title: sermon.title,
          speaker: sermon.speaker,
          date: sermon.date,
          duration: sermon.duration,
          thumbnailUrl: sermon.thumbnailUrl,
          mediaUrl: sermon.mediaUrl,
          tags: sermon.tags,
          isPublished: true,
          publishedAt: sermon.date,
          viewCount: Math.floor(Math.random() * 100) + 20,
          createdBy: pastor._id,
        });
        logger.log(`Created sermon: ${sermon.title}`);
      }
    }

    // ========== CREATE CHURCH POSTS ==========
    logger.log('Creating church posts...');

    for (const post of churchPosts) {
      const tenant = tenantMap.get(post.churchId);
      const pastor = pastorMap.get(post.churchId);

      if (tenant && pastor) {
        await PostModel.create({
          tenantId: tenant._id,
          authorId: pastor._id,
          content: post.content,
          images: post.images,
        });
      }
    }

    // ========== CREATE GROUPS ==========
    logger.log('Creating groups...');

    const groupsData = [
      {
        churchId: '1',
        name: 'Young Adults Fellowship',
        description: 'A community for young adults (18-35) to grow in faith together through fellowship, Bible study, and service.',
        meetingSchedule: 'Fridays at 7:00 PM',
        type: GroupType.SMALL_GROUP,
      },
      {
        churchId: '3',
        name: "Women's Prayer Circle",
        description: 'Join us for weekly prayer, encouragement, and spiritual growth.',
        meetingSchedule: 'Tuesdays at 10:00 AM',
        type: GroupType.PRAYER_GROUP,
      },
      {
        churchId: '4',
        name: "Men's Breakfast Club",
        description: 'Men gathering for fellowship, food, and faith-building discussions.',
        meetingSchedule: 'Saturdays at 8:00 AM',
        type: GroupType.SMALL_GROUP,
      },
      {
        churchId: '1',
        name: 'Youth Worship Band',
        description: 'For teens passionate about worship and music ministry.',
        meetingSchedule: 'Wednesdays at 6:00 PM',
        type: GroupType.YOUTH_GROUP,
      },
    ];

    for (const group of groupsData) {
      const tenant = tenantMap.get(group.churchId);
      const pastor = pastorMap.get(group.churchId);

      if (tenant && pastor) {
        await GroupModel.create({
          tenantId: tenant._id,
          name: group.name,
          description: group.description,
          leaderId: pastor._id,
          members: [pastor._id],
          meetingSchedule: group.meetingSchedule,
          meetingLocation: 'Church Campus',
          isOpen: true,
          maxMembers: 30,
          type: group.type,
        });
        logger.log(`Created group: ${group.name}`);
      }
    }

    // ========== CREATE COMMUNITY PROGRAMS ==========
    logger.log('Creating community programs...');

    const defaultTenantForPrograms = tenantMap.get('1');
    const defaultPastorForPrograms = pastorMap.get('1');

    for (const program of communityPrograms) {
      await CommunityProgramModel.create({
        tenantId: defaultTenantForPrograms._id,
        type: ProgramType.COMMUNITY,
        title: program.title,
        category: program.category,
        description: program.description,
        image: program.image,
        contact: program.contact,
        isActive: true,
        createdBy: defaultPastorForPrograms._id,
      });
      logger.log(`Created community program: ${program.title}`);
    }

    // ========== CREATE VOLUNTEER PROGRAMS ==========
    logger.log('Creating volunteer programs...');

    for (const program of volunteerPrograms) {
      // Find the tenant by church name
      let tenantForProgram = defaultTenantForPrograms;
      let pastorForProgram = defaultPastorForPrograms;

      for (const church of churches) {
        if (church.name === program.church) {
          tenantForProgram = tenantMap.get(church.id);
          pastorForProgram = pastorMap.get(church.id);
          break;
        }
      }

      await CommunityProgramModel.create({
        tenantId: tenantForProgram._id,
        type: ProgramType.VOLUNTEER,
        title: program.title,
        category: program.category,
        description: program.description,
        image: program.image,
        church: program.church,
        timeCommitment: program.timeCommitment,
        skillsNeeded: program.skillsNeeded,
        coordinator: program.coordinator,
        isActive: true,
        createdBy: pastorForProgram._id,
      });
      logger.log(`Created volunteer program: ${program.title}`);
    }

    // ========== SUMMARY ==========
    const tenantCount = await TenantModel.countDocuments();
    const userCount = await UserModel.countDocuments();
    const eventCount = await EventModel.countDocuments();
    const sermonCount = await SermonModel.countDocuments();
    const postCount = await PostModel.countDocuments();
    const groupCount = await GroupModel.countDocuments();
    const membershipCount = await MembershipModel.countDocuments();
    const communityProgramCount = await CommunityProgramModel.countDocuments();

    logger.log('='.repeat(60));
    logger.log('COMPREHENSIVE SEED COMPLETED SUCCESSFULLY!');
    logger.log('='.repeat(60));
    logger.log('');
    logger.log('Created:');
    logger.log(`  - ${tenantCount} Tenants (Churches)`);
    logger.log(`  - ${userCount} Users`);
    logger.log(`  - ${membershipCount} Memberships`);
    logger.log(`  - ${eventCount} Events`);
    logger.log(`  - ${sermonCount} Sermons`);
    logger.log(`  - ${postCount} Posts`);
    logger.log(`  - ${groupCount} Groups`);
    logger.log(`  - ${communityProgramCount} Community Programs`);
    logger.log('');
    logger.log('Churches Created:');
    for (const church of churches) {
      logger.log(`  - ${church.name} (Join Code: ${church.joinCode})`);
    }
    logger.log('');
    logger.log('Test Credentials (all passwords: Password123!):');
    logger.log('  Super Admin: superadmin@churchhub.com');
    logger.log('');
    logger.log('  Church Pastors/Leaders:');
    for (const church of churches) {
      logger.log(`    ${church.name}: ${church.pastor.email}`);
    }
    logger.log('');
    logger.log('  Individual Users:');
    for (const user of individualUsers) {
      logger.log(`    ${user.firstName} ${user.lastName}: ${user.email}`);
    }
    logger.log('='.repeat(60));

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
