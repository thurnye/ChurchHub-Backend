import { Connection } from 'mongoose';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

export const mongoProviders = [
  {
    provide: DATABASE_CONNECTION,
    useFactory: (connection: Connection) => connection,
    inject: ['DatabaseConnection'],
  },
];
