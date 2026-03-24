import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import type { SignOptions } from 'jsonwebtoken';

const normalizeOrigin = (value: string): string => value.trim().replace(/\/$/, '');

// Carregar variáveis de ambiente
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = path.dirname(currentFilePath);
dotenv.config({ path: path.resolve(currentDirPath, '../../.env') });

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  frontendUrls: (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => normalizeOrigin(url))
    .filter(Boolean),

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  },

  // Google Drive
  googleDrive: {
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    privateKey: (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    rootFolderId: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || '',
  },

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // Resend (email)
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
  },
};

if (config.nodeEnv !== 'production') {
  console.log('[ENV] FRONTEND_URL:', config.frontendUrl);
  console.log('[ENV] FRONTEND_URLS:', config.frontendUrls);
}

// Em serverless, evitar crash no bootstrap e deixar a aplicação responder com erro legível.
if (config.nodeEnv === 'production') {
  const requiredEnvVars = [
    'JWT_SECRET',
    'DATABASE_URL',
    'GOOGLE_SERVICE_ACCOUNT_EMAIL',
    'GOOGLE_PRIVATE_KEY',
    'RESEND_API_KEY',
    'FRONTEND_URL',
  ];

  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  if (missingEnvVars.length > 0) {
    console.error(`Variáveis obrigatórias ausentes em produção: ${missingEnvVars.join(', ')}`);
  }
}
