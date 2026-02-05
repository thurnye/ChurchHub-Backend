import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  APP_NAME: Joi.string().default('ChurchHub'),
  API_PREFIX: Joi.string().default('api/v1'),

  // Database
  MONGODB_URI: Joi.string().required(),
  MONGODB_MAX_POOL_SIZE: Joi.number().default(10),
  MONGODB_MIN_POOL_SIZE: Joi.number().default(5),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  REDIS_DB: Joi.number().default(0),
  REDIS_TTL: Joi.number().default(3600),

  // JWT
  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),

  // AWS
  AWS_REGION: Joi.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: Joi.string().optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional(),
  AWS_S3_BUCKET: Joi.string().optional(),

  // Email
  EMAIL_PROVIDER: Joi.string().valid('sendgrid', 'ses', 'smtp').default('sendgrid'),
  SENDGRID_API_KEY: Joi.string().optional(),
  EMAIL_FROM: Joi.string().email().optional(),
  EMAIL_FROM_NAME: Joi.string().optional(),

  // SMS
  TWILIO_ACCOUNT_SID: Joi.string().optional(),
  TWILIO_AUTH_TOKEN: Joi.string().optional(),
  TWILIO_PHONE_NUMBER: Joi.string().optional(),

  // Firebase
  FIREBASE_PROJECT_ID: Joi.string().optional(),
  FIREBASE_PRIVATE_KEY: Joi.string().optional(),
  FIREBASE_CLIENT_EMAIL: Joi.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: Joi.string().optional(),
  STRIPE_PUBLISHABLE_KEY: Joi.string().optional(),
  STRIPE_WEBHOOK_SECRET: Joi.string().optional(),

  // Rate Limiting
  THROTTLE_TTL: Joi.number().default(60),
  THROTTLE_LIMIT: Joi.number().default(100),

  // CORS
  CORS_ORIGIN: Joi.string().optional(),
  CORS_CREDENTIALS: Joi.boolean().default(true),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),
  LOG_FILE_ENABLED: Joi.boolean().default(true),
  LOG_FILE_PATH: Joi.string().default('./logs'),

  // Feature Flags
  ENABLE_SWAGGER: Joi.boolean().default(true),
  ENABLE_METRICS: Joi.boolean().default(true),
  ENABLE_HEALTH_CHECK: Joi.boolean().default(true),

  // Bible API
  BIBLE_API_KEY: Joi.string().optional(),
  BIBLE_API_URL: Joi.string().optional(),

  // Super Admin
  SUPER_ADMIN_EMAIL: Joi.string().email().optional(),
  SUPER_ADMIN_PASSWORD: Joi.string().optional(),
});
