# Church Platform Backend

Production-ready NestJS backend for a multi-tenant SaaS church platform.

## Features

- 🏢 **Multi-tenancy** - Complete tenant isolation with x-tenant-id header
- 🔐 **Authentication** - JWT access + refresh tokens with rotation
- 👥 **RBAC** - Role-based access control (super_admin, church_admin, clergy, leader, member)
- 🎫 **Join Codes** - QR code / invite code based church membership
- 📡 **Event-Driven** - BullMQ for async processing and notifications
- 📊 **Swagger** - Auto-generated API documentation
- 🔒 **Security** - Helmet, CORS, rate limiting, input validation
- 📝 **Logging** - Structured logging with request IDs
- ✅ **Testing** - Unit and integration tests

## Tech Stack

- **Framework**: NestJS + TypeScript
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Queue**: BullMQ
- **Auth**: JWT with Passport
- **Validation**: class-validator + class-transformer
- **Docs**: Swagger UI

## Prerequisites

- Node.js >= 18.x
- MongoDB >= 6.x (running locally or remote)
- Redis >= 7.x (running locally or remote)

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
```

## Configuration

Update `.env` with your settings:

```env
MONGO_URI=mongodb://localhost:27017/church-platform
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
BIBLE_API_KEY=your-bible-api-key
```

## Running the App

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

## Seeding Database

```bash
# Run seed script to create demo data
npm run seed
```

This creates:
- A super_admin user
- A demo church tenant
- Sample users (church_admin, clergy, leader, member)
- Sample posts, events, sermons, groups, prayers, notifications

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:3000/api/docs
- JSON spec: http://localhost:3000/api/docs-json

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Project Structure

```
src/
├── main.ts                      # Application entry point
├── app.module.ts                # Root module
├── config/                      # Configuration
│   └── env/                     # Environment validation
├── common/                      # Shared utilities
│   ├── constants/               # App constants
│   ├── decorators/              # Custom decorators
│   ├── guards/                  # Auth & tenant guards
│   ├── interceptors/            # Logging & response mapping
│   ├── filters/                 # Exception filters
│   ├── pipes/                   # Validation pipes
│   ├── middleware/              # Request context
│   └── utils/                   # Helper functions
├── infrastructure/              # Infrastructure layer
│   ├── database/                # MongoDB setup
│   ├── cache/                   # Redis client
│   ├── queue/                   # BullMQ setup
│   ├── storage/                 # File storage
│   ├── notifications/           # Push, email, SMS
│   └── observability/           # Logging & metrics
└── modules/                     # Feature modules
    ├── auth/                    # Authentication
    ├── tenant/                  # Church management
    ├── profile/                 # User profiles
    ├── bible/                   # Bible API integration
    ├── community/               # Posts & feed
    ├── events/                  # Church events
    ├── give/                    # Donations
    ├── groups/                  # Small groups
    ├── notifications/           # In-app notifications
    ├── prayer/                  # Prayer requests
    ├── sermons/                 # Sermon library
    ├── settings/                # Tenant & user settings
    └── worships/                # Worship resources
```

## Multi-Tenancy

### Tenant Resolution

Tenants are identified via `x-tenant-id` header:

```bash
curl -H "Authorization: Bearer <token>" \
     -H "x-tenant-id: <tenant-id>" \
     http://localhost:3000/api/v1/community/posts
```

### Join Church via Code

```bash
# Create join code (church_admin)
POST /api/v1/tenant/join-codes
{
  "roleGranted": "member",
  "expiresAt": "2024-12-31T23:59:59Z",
  "maxUses": 100
}

# Join church with code (any user)
POST /api/v1/tenant/join
{
  "code": "ABC123XYZ"
}
```

## Authentication

### Register

```bash
POST /api/v1/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "displayName": "John Doe"
}
```

### Login

```bash
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response:
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": { ... }
}
```

### Refresh Token

```bash
POST /api/v1/auth/refresh
{
  "refreshToken": "eyJ..."
}
```

### Logout

```bash
POST /api/v1/auth/logout
Authorization: Bearer <access-token>
```

## Roles & Permissions

- **super_admin**: Platform owner, manages all tenants
- **church_admin**: Church administrator, full church management
- **clergy**: Church clergy, sermon/worship/prayer management
- **leader**: Group leaders, group management
- **member**: Regular church member

## Event-Driven Architecture

The platform uses BullMQ for event processing:

### Events Published

- `CommunityPostCreated`
- `EventCreated`
- `PrayerRequestCreated`
- `SermonPublished`
- `WorshipSetScheduled`
- `MemberJoinedTenant`
- `DonationStatusUpdated`

### Event Consumers

Each event triggers notification fanout to relevant users based on visibility rules.

## API Examples

### Community Posts

```bash
# Create post
POST /api/v1/community/posts
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
{
  "content": "God is good!",
  "mediaUrl": "https://..."
}

# Get feed
GET /api/v1/community/posts?page=1&limit=20
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
```

### Events

```bash
# Create event
POST /api/v1/events
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
{
  "title": "Youth Night",
  "description": "...",
  "startDate": "2024-02-15T18:00:00Z",
  "location": "Main Hall"
}

# RSVP
POST /api/v1/events/:id/rsvp
{
  "response": "yes"
}
```

### Prayer Requests

```bash
# Create prayer
POST /api/v1/prayer/requests
Authorization: Bearer <token>
x-tenant-id: <tenant-id>
{
  "title": "Healing",
  "description": "...",
  "visibility": "everyone"
}
```

## Security

- Helmet for HTTP headers
- CORS configured
- Rate limiting (10 req/min by default)
- Input validation on all DTOs
- JWT token rotation
- Secure password hashing (bcrypt)
- Tenant isolation enforced

## Performance

- Redis caching for Bible API responses
- MongoDB indexes on frequently queried fields
- Pagination on all list endpoints
- Lazy loading of relations

## Scale Considerations

For future scaling:
- Implement database sharding by tenantId
- Split notification service into microservice
- Use CDN for media files
- Implement read replicas for MongoDB
- Consider event sourcing for audit log

## License

Proprietary - All rights reserved
