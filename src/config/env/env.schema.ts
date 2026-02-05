import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  validateSync,
  IsUrl,
  Min,
  Max,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Staging = 'staging',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Min(1000)
  @Max(65535)
  PORT: number = 3000;

  @IsString()
  API_PREFIX: string = 'api/v1';

  @IsString()
  MONGO_URI: string;

  @IsString()
  REDIS_URL: string;

  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  JWT_ACCESS_EXPIRY: string = '15m';

  @IsString()
  JWT_REFRESH_EXPIRY: string = '7d';

  @IsString()
  BIBLE_API_KEY: string;

  @IsUrl()
  BIBLE_API_BASE_URL: string;

  @IsNumber()
  THROTTLE_TTL: number = 60;

  @IsNumber()
  THROTTLE_LIMIT: number = 10;

  @IsNumber()
  NOTIFICATION_RETENTION_DAYS: number = 30;

  @IsString()
  CORS_ORIGIN: string = 'http://localhost:3001';

  @IsEnum(['error', 'warn', 'info', 'debug', 'verbose'])
  LOG_LEVEL: string = 'info';
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
