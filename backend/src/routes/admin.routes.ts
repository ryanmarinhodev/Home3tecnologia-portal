import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, adminOnly } from '../middlewares/auth.middleware.js';
import { authService } from '../services/auth.service.js';
import { googleDriveService } from '../services/googleDrive.service.js';
import { prisma } from '../lib/prisma.js';
import { UserRole, ClientStatus } from '@prisma/client';

const router = Router();

// Aplicar autenticação e autorização admin em todas as rotas
router.use(authenticate, adminOnly);

// Schema para criar cliente
const createClientSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  name: z.string().min(2, 'Nome é obrigatório'),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  googleDriveFolderId: z.string().min(1, 'ID da pasta do Google Drive é obrigatório'),
  googleDriveFolderName: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
});

// Schema para atualizar cliente
const updateClientSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  googleDriveFolderId: z.string().optional(),
  googleDriveFolderName: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
});

/**
 * GET /api/admin/clients
 * Lista todos os clientes
 */
router.get('/clients', async (req: Request, res: Response) => {
  try {
    const clients = await prisma.user.findMany({
      where: { role: UserRole.CLIENT },
      include: {
        client: {
          include: {
            _count: {
              select: { accessLogs: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedClients = clients.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      client: user.client
        ? {
            id: user.client.id,
            companyName: user.client.companyName,
            phone: user.client.phone,
            googleDriveFolderId: user.client.googleDriveFolderId,
            googleDriveFolderName: user.client.googleDriveFolderName,
            accessCount: user.client._count.accessLogs,
          }
        : null,
    }));

    res.json(formattedClients);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro ao listar clientes' });
  }
});

/**
 * GET /api/admin/clients/:id
 * Obtém detalhes de um cliente
 */
router.get('/clients/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        client: {
          include: {
            accessLogs: {
              take: 50,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Cliente não encontrado' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      client: user.client
        ? {
            id: user.client.id,
            companyName: user.client.companyName,
            phone: user.client.phone,
            googleDriveFolderId: user.client.googleDriveFolderId,
            googleDriveFolderName: user.client.googleDriveFolderName,
            accessLogs: user.client.accessLogs,
          }
        : null,
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

/**
 * POST /api/admin/clients
 * Cria um novo cliente
 */
router.post('/clients', async (req: Request, res: Response) => {
  try {
    // Validar dados
    const validationResult = createClientSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Dados inválidos',
        details: validationResult.error.errors,
      });
      return;
    }

    const data = validationResult.data;

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      res.status(400).json({ error: 'Este e-mail já está cadastrado' });
      return;
    }

    // Verificar se a pasta do Google Drive existe
    const folderExists = await googleDriveService.verifyFolderAccess(data.googleDriveFolderId);
    if (!folderExists) {
      res.status(400).json({ 
        error: 'Pasta do Google Drive não encontrada ou sem acesso. Verifique se a pasta foi compartilhada com a conta de serviço.' 
      });
      return;
    }

    // Criar hash da senha
    const passwordHash = await authService.hashPassword(data.password);

    // Criar usuário e cliente
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        role: UserRole.CLIENT,
        status: (data.status as ClientStatus) || ClientStatus.ACTIVE,
        client: {
          create: {
            phone: data.phone,
            companyName: data.companyName,
            googleDriveFolderId: data.googleDriveFolderId,
            googleDriveFolderName: data.googleDriveFolderName,
          },
        },
      },
      include: { client: true },
    });

    res.status(201).json({
      message: 'Cliente criado com sucesso',
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      client: user.client,
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

/**
 * PATCH /api/admin/clients/:id
 * Atualiza dados de um cliente
 */
router.patch('/clients/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validar dados
    const validationResult = updateClientSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Dados inválidos',
        details: validationResult.error.errors,
      });
      return;
    }

    const data = validationResult.data;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!user) {
      res.status(404).json({ error: 'Cliente não encontrado' });
      return;
    }

    // Verificar pasta do Drive se foi alterada
    if (data.googleDriveFolderId) {
      const folderExists = await googleDriveService.verifyFolderAccess(data.googleDriveFolderId);
      if (!folderExists) {
        res.status(400).json({ 
          error: 'Pasta do Google Drive não encontrada ou sem acesso' 
        });
        return;
      }
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        status: data.status as ClientStatus,
        client: user.client
          ? {
              update: {
                phone: data.phone,
                companyName: data.companyName,
                googleDriveFolderId: data.googleDriveFolderId,
                googleDriveFolderName: data.googleDriveFolderName,
              },
            }
          : {
              create: {
                phone: data.phone,
                companyName: data.companyName,
                googleDriveFolderId: data.googleDriveFolderId || '',
                googleDriveFolderName: data.googleDriveFolderName,
              },
            },
      },
      include: { client: true },
    });

    res.json({
      message: 'Cliente atualizado com sucesso',
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      status: updatedUser.status,
      client: updatedUser.client,
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

/**
 * DELETE /api/admin/clients/:id
 * Remove um cliente
 */
router.delete('/clients/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar se existe
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'Cliente não encontrado' });
      return;
    }

    // Não permitir deletar admin
    if (user.role === UserRole.ADMIN) {
      res.status(400).json({ error: 'Não é possível remover um administrador' });
      return;
    }

    // Deletar (cascade remove client e logs)
    await prisma.user.delete({ where: { id } });

    res.json({ message: 'Cliente removido com sucesso' });
  } catch (error) {
    console.error('Erro ao remover cliente:', error);
    res.status(500).json({ error: 'Erro ao remover cliente' });
  }
});

/**
 * PATCH /api/admin/clients/:id/status
 * Altera status de um cliente (ativar/desativar)
 */
router.patch('/clients/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE', 'PENDING'].includes(status)) {
      res.status(400).json({ error: 'Status inválido' });
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status: status as ClientStatus },
    });

    res.json({
      message: `Status alterado para ${status}`,
      id: user.id,
      status: user.status,
    });
  } catch (error) {
    console.error('Erro ao alterar status:', error);
    res.status(500).json({ error: 'Erro ao alterar status' });
  }
});

/**
 * GET /api/admin/clients/:id/files
 * Lista arquivos de um cliente específico (para visualização admin)
 */
router.get('/clients/:id/files', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!user || !user.client) {
      res.status(404).json({ error: 'Cliente não encontrado' });
      return;
    }

    const folderId = user.client.googleDriveFolderId;
    const folderContents = await googleDriveService.listFolderContents(folderId, false);

    res.json({
      client: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      folder: {
        id: folderContents.id,
        name: user.client.googleDriveFolderName || folderContents.name,
      },
      files: folderContents.files,
      subfolders: folderContents.subfolders,
    });
  } catch (error) {
    console.error('Erro ao listar arquivos do cliente:', error);
    const message = error instanceof Error ? error.message : 'Erro ao listar arquivos';
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/admin/stats
 * Estatísticas gerais
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const [totalClients, activeClients, pendingClients, recentLogs] = await Promise.all([
      prisma.user.count({ where: { role: UserRole.CLIENT } }),
      prisma.user.count({ where: { role: UserRole.CLIENT, status: ClientStatus.ACTIVE } }),
      prisma.user.count({ where: { role: UserRole.CLIENT, status: ClientStatus.PENDING } }),
      prisma.accessLog.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // últimos 7 dias
        },
      }),
    ]);

    res.json({
      totalClients,
      activeClients,
      pendingClients,
      inactiveClients: totalClients - activeClients - pendingClients,
      recentAccessCount: recentLogs,
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

export default router;
