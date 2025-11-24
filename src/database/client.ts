import 'dotenv/config';
import { Pool } from "pg";
import type { ClientConfig } from "pg";


const dbConfig: ClientConfig =
    process.env.DATABASE_URL
        ? { connectionString : process.env.DATABASE_URL }
        : {
            host: process.env.PGHOST,
            port: parseInt(process.env.PGPORT || '5432'),
            database: process.env.PGDATABASE,
            user: process.env.PGUSER,
            password: process.env.PGPASSWORD,
        };

export const poolDb = new Pool(dbConfig);
