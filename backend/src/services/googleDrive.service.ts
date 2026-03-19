import { google, drive_v3 } from 'googleapis';
import { config } from '../config/index.js';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  parents?: string[];
}

export interface DriveFolder {
  id: string;
  name: string;
  files: DriveFile[];
  subfolders: DriveFolder[];
}

class GoogleDriveService {
  private drive: drive_v3.Drive | null = null;

  /**
   * Inicializa o cliente do Google Drive com Service Account
   */
  private async getClient(): Promise<drive_v3.Drive> {
    if (this.drive) {
      return this.drive;
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: config.googleDrive.serviceAccountEmail,
        private_key: config.googleDrive.privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    this.drive = google.drive({ version: 'v3', auth });
    return this.drive;
  }

  /**
   * Lista arquivos dentro de uma pasta específica
   */
  async listFilesInFolder(folderId: string): Promise<DriveFile[]> {
    try {
      const drive = await this.getClient();

      const response = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, iconLink, thumbnailLink, parents)',
        orderBy: 'folder, name',
        pageSize: 100,
      });

      const files = response.data.files || [];

      return files.map((file) => ({
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        size: file.size || undefined,
        createdTime: file.createdTime || undefined,
        modifiedTime: file.modifiedTime || undefined,
        webViewLink: file.webViewLink || undefined,
        webContentLink: file.webContentLink || undefined,
        iconLink: file.iconLink || undefined,
        thumbnailLink: file.thumbnailLink || undefined,
        parents: file.parents || undefined,
      }));
    } catch (error) {
      console.error('Erro ao listar arquivos do Google Drive:', error);
      throw new Error('Não foi possível acessar os arquivos do Google Drive');
    }
  }

  /**
   * Lista arquivos e subpastas recursivamente
   */
  async listFolderContents(folderId: string, recursive = false): Promise<DriveFolder> {
    try {
      const drive = await this.getClient();

      // Obter informações da pasta
      const folderInfo = await drive.files.get({
        fileId: folderId,
        fields: 'id, name',
      });

      const files = await this.listFilesInFolder(folderId);

      // Separar arquivos e pastas
      const regularFiles = files.filter(
        (f) => f.mimeType !== 'application/vnd.google-apps.folder'
      );
      const folders = files.filter(
        (f) => f.mimeType === 'application/vnd.google-apps.folder'
      );

      // Se recursivo, buscar conteúdo das subpastas
      let subfolders: DriveFolder[] = [];
      if (recursive) {
        subfolders = await Promise.all(
          folders.map((folder) => this.listFolderContents(folder.id, true))
        );
      } else {
        subfolders = folders.map((folder) => ({
          id: folder.id,
          name: folder.name,
          files: [],
          subfolders: [],
        }));
      }

      return {
        id: folderInfo.data.id || folderId,
        name: folderInfo.data.name || 'Pasta',
        files: regularFiles,
        subfolders,
      };
    } catch (error) {
      console.error('Erro ao listar conteúdo da pasta:', error);
      throw new Error('Não foi possível acessar o conteúdo da pasta');
    }
  }

  /**
   * Obtém informações de um arquivo específico
   */
  async getFileInfo(fileId: string): Promise<DriveFile> {
    try {
      const drive = await this.getClient();

      const response = await drive.files.get({
        fileId,
        fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, iconLink, thumbnailLink, parents',
      });

      const file = response.data;

      return {
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        size: file.size || undefined,
        createdTime: file.createdTime || undefined,
        modifiedTime: file.modifiedTime || undefined,
        webViewLink: file.webViewLink || undefined,
        webContentLink: file.webContentLink || undefined,
        iconLink: file.iconLink || undefined,
        thumbnailLink: file.thumbnailLink || undefined,
        parents: file.parents || undefined,
      };
    } catch (error) {
      console.error('Erro ao obter informações do arquivo:', error);
      throw new Error('Não foi possível obter informações do arquivo');
    }
  }

  /**
   * Gera um link de download temporário para um arquivo
   */
  async getDownloadStream(fileId: string): Promise<NodeJS.ReadableStream> {
    try {
      const drive = await this.getClient();

      const response = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      );

      return response.data as NodeJS.ReadableStream;
    } catch (error) {
      console.error('Erro ao obter stream de download:', error);
      throw new Error('Não foi possível baixar o arquivo');
    }
  }

  /**
   * Verifica se um arquivo pertence a uma pasta específica (segurança)
   */
  async verifyFileInFolder(fileId: string, folderId: string): Promise<boolean> {
    try {
      const file = await this.getFileInfo(fileId);
      
      if (!file.parents) {
        return false;
      }

      // Verifica diretamente
      if (file.parents.includes(folderId)) {
        return true;
      }

      // Verifica em subpastas (recursivo)
      for (const parentId of file.parents) {
        const parentFile = await this.getFileInfo(parentId);
        if (parentFile.parents?.includes(folderId)) {
          return true;
        }
        // Pode continuar verificando mais níveis se necessário
      }

      return false;
    } catch (error) {
      console.error('Erro ao verificar arquivo na pasta:', error);
      return false;
    }
  }

  /**
   * Verifica se a pasta existe e é acessível
   */
  async verifyFolderAccess(folderId: string): Promise<boolean> {
    try {
      const drive = await this.getClient();
      await drive.files.get({ fileId: folderId, fields: 'id' });
      return true;
    } catch (error) {
      console.error('Erro ao verificar acesso à pasta:', error);
      return false;
    }
  }
}

// Exportar instância singleton
export const googleDriveService = new GoogleDriveService();
