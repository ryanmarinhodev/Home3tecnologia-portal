import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import routes from './routes/index.js';

const app = express();
const normalizeOrigin = (value: string): string => value.trim().replace(/\/$/, '');

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Permite chamadas sem Origin (curl, Postman)
    if (!origin) {
      callback(null, true);
      return;
    }

    const normalizedOrigin = normalizeOrigin(origin);
    const allowedOrigins = new Set(config.frontendUrls);
    const isLocalhostDev =
      config.nodeEnv !== 'production' &&
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin);

    if (allowedOrigins.has(normalizedOrigin) || isLocalhostDev) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origem não permitida pelo CORS: ${normalizedOrigin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Base de Rotas da API
app.use('/api', routes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    name: 'Home3 Portal API',
    version: '1.0.0',
    status: 'running',
  });
});

// Handler de erros global
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
app.listen(config.port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${config.port}`);
  console.log(`📁 Ambiente: ${config.nodeEnv}`);
});

export default app;
