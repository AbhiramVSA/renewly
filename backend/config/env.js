import {config} from 'dotenv';
import path from 'path';

// Load env file from current backend directory
config( {path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}.local`) });

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

