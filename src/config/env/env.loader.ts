import { ConfigModule } from '@nestjs/config';
import { validate } from './env.schema';

export const EnvConfigModule = ConfigModule.forRoot({
  isGlobal: true,
  validate,
  envFilePath: ['.env.local', '.env'],
});
