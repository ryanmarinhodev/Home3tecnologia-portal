import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Schema de validação para login
const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// Schema de validação para registro
const registerSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  name: z.string().min(2, 'Nome é obrigatório'),
  phone: z.string().optional(),
  companyName: z.string().optional(),
});

/**
 * POST /api/auth/login
 * Login do usuário
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Validar dados de entrada
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Dados inválidos',
        details: validationResult.error.errors,
      });
      return;
    }

    const { email, password } = validationResult.data;

    // Fazer login
    const result = await authService.login(email, password);

    res.json({
      message: 'Login realizado com sucesso',
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao fazer login';
    res.status(401).json({ error: message });
  }
});

/**
 * POST /api/auth/register
 * Registro de novo cliente
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    // Validar dados de entrada
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Dados inválidos',
        details: validationResult.error.errors,
      });
      return;
    }

    // Registrar cliente
    const result = await authService.registerClient(validationResult.data);

    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao registrar';
    res.status(400).json({ error: message });
  }
});

/**
 * GET /api/auth/me
 * Obtém dados do usuário atual
 */
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await authService.getCurrentUser(req.user!.userId);
    res.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar usuário';
    res.status(400).json({ error: message });
  }
});

/**
 * POST /api/auth/verify
 * Verifica se o token é válido
 */
router.post('/verify', authenticate, (req: Request, res: Response) => {
  res.json({
    valid: true,
    user: req.user,
  });
});

// Schema de validação para recuperação de senha
const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
});

/**
 * POST /api/auth/forgot-password
 * Solicita recuperação de senha (envia email com token)
 */
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const validationResult = forgotPasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({ error: 'Dados inválidos', details: validationResult.error.errors });
      return;
    }

    await authService.requestPasswordReset(validationResult.data.email);

    // Sempre retorna 200 para não revelar se o email existe
    res.json({ message: 'Se este e-mail estiver cadastrado, você receberá as instruções em breve.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao processar solicitação';
    res.status(500).json({ error: message });
  }
});

/**
 * POST /api/auth/reset-password
 * Redefine a senha usando o token recebido por email
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const validationResult = resetPasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({ error: 'Dados inválidos', details: validationResult.error.errors });
      return;
    }

    const { token, password } = validationResult.data;
    await authService.resetPassword(token, password);

    res.json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao redefinir senha';
    res.status(400).json({ error: message });
  }
});

export default router;
