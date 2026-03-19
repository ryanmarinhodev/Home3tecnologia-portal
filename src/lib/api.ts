// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Tipos
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CLIENT';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
}

export interface Client {
  id: string;
  companyName: string | null;
  phone: string | null;
  googleDriveFolderId: string;
  googleDriveFolderName: string | null;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
  client?: Client;
}

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
}

export interface DriveFolder {
  id: string;
  name: string;
}

export interface FolderContents {
  folder: DriveFolder;
  files: DriveFile[];
  subfolders: DriveFolder[];
  iconLink?: string;
  thumbnailLink?: string;
}

export interface ClientWithDetails extends User {
  client: Client | null;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AdminStats {
  totalClients: number;
  activeClients: number;
  pendingClients: number;
  inactiveClients: number;
  recentAccessCount: number;
}

// Helper para fazer requisições
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `Erro ${response.status}`);
  }

  return response.json();
}

// API de Autenticação
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    companyName?: string;
  }) =>
    apiRequest<{ id: string; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => apiRequest<User & { client?: Client }>('/auth/me'),

  verify: () => apiRequest<{ valid: boolean; user: User }>('/auth/verify', {
    method: 'POST',
  }),
};

// API de Arquivos
export const filesApi = {
  list: () => apiRequest<FolderContents>('/files'),

  listFolder: (folderId: string) =>
    apiRequest<FolderContents>(`/files/folder/${folderId}`),

  getFileInfo: (fileId: string) =>
    apiRequest<DriveFile>(`/files/${fileId}/info`),

  getDownloadUrl: (fileId: string) =>
    `${API_BASE_URL}/files/${fileId}/download`,
};

// API Admin
export const adminApi = {
  getClients: () => apiRequest<ClientWithDetails[]>('/admin/clients'),

  getClient: (id: string) => apiRequest<ClientWithDetails>(`/admin/clients/${id}`),

  createClient: (data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    companyName?: string;
    googleDriveFolderId: string;
    googleDriveFolderName?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  }) =>
    apiRequest<{ id: string; message: string }>('/admin/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateClient: (
    id: string,
    data: {
      name?: string;
      phone?: string;
      companyName?: string;
      googleDriveFolderId?: string;
      googleDriveFolderName?: string;
      status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
    }
  ) =>
    apiRequest<{ message: string }>(`/admin/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteClient: (id: string) =>
    apiRequest<{ message: string }>(`/admin/clients/${id}`, {
      method: 'DELETE',
    }),

  updateClientStatus: (id: string, status: 'ACTIVE' | 'INACTIVE' | 'PENDING') =>
    apiRequest<{ message: string }>(`/admin/clients/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getClientFiles: (id: string) =>
    apiRequest<FolderContents & { client: { id: string; name: string; email: string } }>(
      `/admin/clients/${id}/files`
    ),

  getStats: () => apiRequest<AdminStats>('/admin/stats'),
};
