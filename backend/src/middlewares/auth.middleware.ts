import { Request, Response, NextFunction } from 'express';
import { authService, TokenPayload } from '../services/auth.service.js';
import { UserRole } from '@prisma/client';

// Extender tipo Request do Express
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware de autenticação
 * Verifica se o token JWT é válido
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'Token de autenticação não fornecido' });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ error: 'Formato de token inválido' });
    return;
  }

  const token = parts[1];

  try {
    const payload = authService.verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado' });
    return;
  }
};

/**
 * Middleware de autorização por role
 * Verifica se o usuário tem a role necessária
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Acesso negado' });
      return;
    }

    next();
  };
};

/**
 * Middleware para apenas admins
 */
export const adminOnly = authorize(UserRole.ADMIN);

/**
 * Middleware para apenas clientes
 */
export const clientOnly = authorize(UserRole.CLIENT);
