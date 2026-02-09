import 'dotenv/config';
import { DataSource } from 'typeorm';
import { AppTypeOrmLogger } from '../utils/typeorm-logger';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

export const connectionOptions = (): PostgresConnectionOptions => {
  const shared: PostgresConnectionOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? +process.env.DB_PORT : 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ['dist/**/*.entity{.ts,.js}'],
    useUTC: true,
    maxQueryExecutionTime: 100,
    logging: ['error', 'warn'],
    logger: new AppTypeOrmLogger(),
  };

  return process.env.NODE_ENV === 'production' ||
    process.env.NODE_ENV === 'staging'
    ? {
      ...shared,
      ssl: {
        rejectUnauthorized: true,
        ca: process.env.DB_CA_CERT,
      },
      extra: { ssl: { rejectUnauthorized: true, ca: process.env.DB_CA_CERT } },
    }
    : {
      ...shared,
    };
};

// verison used for migrations only
const dataSource = new DataSource({
  ...connectionOptions(),
  logger: undefined,
  migrations: ['migrations/*{.ts,.js}'],
});
export default dataSource;
