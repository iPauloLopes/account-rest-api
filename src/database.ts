import {knex as setUpKnex, Knex} from 'knex'
import { env } from './env/index.js';

export const knexConfig:Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: env.DATABASE_CLIENT === 'sqlite3' ? {filename: env.DATABASE_URL} : env.DATABASE_URL, //pg uses a string as connection and sqlite uses an object
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './database/migrations'
  }
};

export const knex = setUpKnex(knexConfig)