import { Router, Request, Response } from 'express';
import { authenticate, clientOnly } from '../middlewares/auth.middleware.js';
import { googleDriveService } from '../services/googleDrive.service.js';
import { prisma } from '../lib/prisma.js';
import { UserRole } from '@prisma/client';

const router = Router();

/**
 * GET /api/files
 * Lista os arquivos do cliente logado
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.user!;

    // Buscar dados do cliente
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { client: true },
    });

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    // Se for admin, retorna erro (admin usa outra rota)
    if (role === UserRole.ADMIN) {
      res.status(400).json({ error: 'Use a rota de admin para listar arquivos' });
      return;
    }

    if (!user.client) {
      res.status(400).json({ error: 'Dados do cliente não encontrados' });
      return;
    }

    const folderId = user.client.googleDriveFolderId;

    if (!folderId) {
      res.status(400).json({ error: 'Pasta do Google Drive não configurada' });
      return;
    }

    // Listar arquivos da pasta do cliente
    const folderContents = await googleDriveService.listFolderContents(folderId, false);

    // Registrar log de acesso
    await prisma.accessLog.create({
      data: {
        clientId: user.client.id,
        action: 'VIEW_FILES',
        details: JSON.stringify({ folderId }),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.json({
      folder: {
        id: folderContents.id,
        name: user.client.googleDriveFolderName || folderContents.name,
      },
      files: folderContents.files,
      subfolders: folderContents.subfolders,
    });
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    const message = error instanceof Error ? error.message : 'Erro ao listar arquivos';
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/files/folder/:folderId
 * Lista arquivos de uma subpasta específica
 */
router.get('/folder/:folderId', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.user!;
    const { folderId } = req.params;

    // Buscar dados do cliente
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { client: true },
    });

    if (!user || !user.client) {
      res.status(404).json({ error: 'Cliente não encontrado' });
      return;
    }

    const clientFolderId = user.client.googleDriveFolderId;

    // Verificar se a pasta solicitada pertence à pasta do cliente (segurança)
    // Para subpastas, precisamos verificar a hierarquia
    const isAllowed = await googleDriveService.verifyFileInFolder(folderId, clientFolderId);
    
    // Permitir também se for a pasta raiz do cliente
    if (!isAllowed && folderId !== clientFolderId) {
      res.status(403).json({ error: 'Acesso negado a esta pasta' });
      return;
    }

    // Listar arquivos da subpasta
    const folderContents = await googleDriveService.listFolderContents(folderId, false);

    // Registrar log de acesso
    await prisma.accessLog.create({
      data: {
        clientId: user.client.id,
        action: 'VIEW_SUBFOLDER',
        details: JSON.stringify({ folderId }),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    res.json({
      folder: {
        id: folderContents.id,
        name: folderContents.name,
      },
      files: folderContents.files,
      subfolders: folderContents.subfolders,
    });
  } catch (error) {
    console.error('Erro ao listar subpasta:', error);
    const message = error instanceof Error ? error.message : 'Erro ao listar subpasta';
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/files/:fileId/info
 * Obtém informações de um arquivo específico
 */
router.get('/:fileId/info', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!;
    const { fileId } = req.params;

    // Buscar dados do cliente
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { client: true },
    });

    if (!user || !user.client) {
      res.status(404).json({ error: 'Cliente não encontrado' });
      return;
    }

    const clientFolderId = user.client.googleDriveFolderId;

    // Verificar se o arquivo pertence à pasta do cliente
    const isAllowed = await googleDriveService.verifyFileInFolder(fileId, clientFolderId);
    
    if (!isAllowed) {
      res.status(403).json({ error: 'Acesso negado a este arquivo' });
      return;
    }

    // Obter informações do arquivo
    const fileInfo = await googleDriveService.getFileInfo(fileId);

    res.json(fileInfo);
  } catch (error) {
    console.error('Erro ao obter informações do arquivo:', error);
    const message = error instanceof Error ? error.message : 'Erro ao obter informações do arquivo';
    res.status(500).json({ error: message });
  }
});

/**
 * GET /api/files/:fileId/download
 * Faz download de um arquivo
 */
router.get('/:fileId/download', authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.user!;
    const { fileId } = req.params;

    // Buscar dados do cliente
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { client: true },
    });

    if (!user || !user.client) {
      res.status(404).json({ error: 'Cliente não encontrado' });
      return;
    }

    const clientFolderId = user.client.googleDriveFolderId;

    // Verificar se o arquivo pertence à pasta do cliente
    const isAllowed = await googleDriveService.verifyFileInFolder(fileId, clientFolderId);
    
    if (!isAllowed) {
      res.status(403).json({ error: 'Acesso negado a este arquivo' });
      return;
    }

    // Obter informações do arquivo
    const fileInfo = await googleDriveService.getFileInfo(fileId);

    // Registrar log de download
    await prisma.accessLog.create({
      data: {
        clientId: user.client.id,
        action: 'DOWNLOAD_FILE',
        details: JSON.stringify({ fileId, fileName: fileInfo.name }),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    // Obter stream de download
    const stream = await googleDriveService.getDownloadStream(fileId);

    // Configurar headers
    res.setHeader('Content-Type', fileInfo.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileInfo.name)}"`);
    
    if (fileInfo.size) {
      res.setHeader('Content-Length', fileInfo.size);
    }

    // Enviar arquivo
    stream.pipe(res);
  } catch (error) {
    console.error('Erro ao fazer download:', error);
    const message = error instanceof Error ? error.message : 'Erro ao fazer download';
    res.status(500).json({ error: message });
  }
});

export default router;
