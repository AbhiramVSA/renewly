import {config} from 'dotenv';
import path from 'path';

// Load env file from current backend directory
config( {path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}.local`) });

// Server configuration that adapts to serverless vs traditional hosting
export const getServerConfig = () => {
    const isServerless = !!process.env.VERCEL;
    const isProduction = process.env.NODE_ENV === 'production';
    const port = isServerless ? null : (process.env.PORT || 8001);
    
    return {
        port,
        isServerless,
        isProduction,
        baseUrl: isServerless 
            ? `https://${process.env.VERCEL_URL}` 
            : `http://localhost:${port}`,
        shouldListen: !isServerless && process.env.NODE_ENV !== 'test'
    };
};

// Export individual environment variables (except PORT for serverless compatibility)
export const {
    NODE_ENV,
    DB_URI,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES_IN,
    ARCJET_KEY,
    ARCJET_ENV
}  = process.env;

// Export PORT only for local development (not used in serverless)
export const PORT = process.env.PORT || 8001;

