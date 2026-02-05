import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

export const createLogger = () => {
  const logLevel = process.env.LOG_LEVEL || 'info';
  const logFileEnabled = process.env.LOG_FILE_ENABLED === 'true';
  const logFilePath = process.env.LOG_FILE_PATH || './logs';

  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('ChurchHub', {
          colors: true,
          prettyPrint: true,
        }),
      ),
    }),
  ];

  if (logFileEnabled) {
    transports.push(
      new winston.transports.File({
        filename: `${logFilePath}/error.log`,
        level: 'error',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
      new winston.transports.File({
        filename: `${logFilePath}/combined.log`,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
        ),
      }),
    );
  }

  return {
    level: logLevel,
    transports,
  };
};
