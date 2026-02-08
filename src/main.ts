import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
const compression = require('compression');

import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';
import { TransformInterceptor } from '@common/interceptors/transform.interceptor';
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { WinstonModule } from 'nest-winston';
import { createLogger } from '@infrastructure/observability/logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(createLogger()),
  });

  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: configService.get('CORS_ORIGIN')?.split(',') || '*',
    credentials: configService.get('CORS_CREDENTIALS') === 'true',
  });

  // Compression
  const nodeEnv = configService.get<string>('NODE_ENV') ?? 'development';

  if (nodeEnv !== 'development') {
    app.use(compression());
  }

  // Versioning (keeps /v1 style available if you use it in controllers)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // ✅ Global prefix BEFORE Swagger so docs show correct paths
  const apiPrefix = configService.get('API_PREFIX') || 'api';
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['api/docs', 'api/docs-json', 'api/docs-yaml'],
  });

  // ✅ Swagger documentation (setup AFTER global prefix)
  if (configService.get('ENABLE_SWAGGER')) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('ChurchHub API')
      .setDescription('Multi-tenant Church SaaS Platform API')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'x-tenant-id',
          in: 'header',
          description: 'Tenant ID for multi-tenancy',
        },
        'tenant-id',
      )
      .addTag('Auth', 'Authentication endpoints')
      .addTag('Tenants', 'Church tenant management')
      .addTag('Profile', 'User profile management')
      .addTag('Bible', 'Bible content and study')
      .addTag('Community', 'Community posts and interactions')
      .addTag('Events', 'Church events and calendar')
      .addTag('Give', 'Donations and giving')
      .addTag('Groups', 'Small groups and ministries')
      .addTag('Notifications', 'Push and in-app notifications')
      .addTag('Prayer', 'Prayer requests and walls')
      .addTag('Sermons', 'Sermons and media')
      .addTag('Settings', 'User and church settings')
      .addTag('Worships', 'Worship songs and media')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    // Swagger UI at /api/docs
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  const env = configService.get('NODE_ENV') || 'development';

  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   ChurchHub API Server                                   ║
║   Version: 1.0.0                                         ║
║   Environment: ${String(env).padEnd(38)}║
║   Port: ${String(port).padEnd(45)}║
║   API:  http://localhost:${port}/${apiPrefix}            ║
║   Docs: http://localhost:${port}/api/docs                ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
