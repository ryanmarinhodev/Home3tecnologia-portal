import { Router } from 'express';
import authRoutes from './auth.routes.js';
import filesRoutes from './files.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

// ping check
router.get('/ping', (req, res) => {
  res.json({ status: 'pong', timestamp: new Date().toISOString() });
});

// Rotas de autenticação
router.use('/auth', authRoutes);

// Rotas de arquivos (clientes)
router.use('/files', filesRoutes);

// Rotas administrativas
router.use('/admin', adminRoutes);

export default router;
