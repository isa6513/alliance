import 'dotenv/config';
import { AppTypeOrmLogger } from 'src/typeorm-logger';
import { DataSource } from 'typeorm';
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
    maxQueryExecutionTime: 200,
    logging: ['error', 'warn'],
    logger: new AppTypeOrmLogger(),
  };

  return process.env.NODE_ENV === 'production'
    ? {
        ...shared,
        ssl: { rejectUnauthorized: false },
        extra: { ssl: { rejectUnauthorized: false } }, //TODO
      }
    : {
        ...shared,
      };
};

// verison used for migrations only
const dataSource = new DataSource({
  ...connectionOptions(),
  logger: undefined,
  migrations: ['dist/migrations/*{.ts,.js}'],
});
export default dataSource;
