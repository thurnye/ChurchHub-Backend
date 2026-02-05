import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
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
  app.use(compression());

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Versioning
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
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger documentation
  if (configService.get('ENABLE_SWAGGER') === 'true') {
    const config = new DocumentBuilder()
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

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(`
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║   ChurchHub API Server                               ║
    ║   Version: 1.0.0                                     ║
    ║   Environment: ${configService.get('NODE_ENV')?.padEnd(38)}║
    ║   Port: ${String(port).padEnd(45)}║
    ║   API Docs: http://localhost:${port}/api/docs${' '.repeat(13)}║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝
  `);
}

bootstrap();
