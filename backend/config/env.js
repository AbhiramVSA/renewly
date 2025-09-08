import { config } from 'dotenv';
import path from 'path';

const envName = process.env.NODE_ENV || 'development';
// Try loading env from current working dir (repo root case)
config({ path: path.resolve(process.cwd(), `.env.${envName}.local`) });
// Also try parent dir (when running from backend/ as cwd)
config({ path: path.resolve(process.cwd(), `../.env.${envName}.local`) });

export const {
    PORT,
    NODE_ENV,
    DB_URI,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN,
    ARCJET_KEY,
    ARCJET_ENV
}  = process.env;

