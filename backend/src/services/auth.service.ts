import jwt from 'jsonwebtoken';
import type { Secret } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { config } from '../config/index.js';
import { prisma } from '../lib/prisma.js';
import { UserRole, ClientStatus } from '@prisma/client';
import { emailService } from './email.service.js';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface LoginResult {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    status: ClientStatus;
  };
  token: string;
  client?: {
    id: string;
    companyName: string | null;
    googleDriveFolderId: string;
  };
}

class AuthService {
  /**
   * Gera hash da senha
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Verifica senha
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Gera token JWT
   */
  generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, config.jwt.secret as Secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Verifica token JWT
   */
  verifyToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.secret as Secret) as TokenPayload;
  }

  /**
   * Login do usuário
   */
  async login(email: string, password: string): Promise<LoginResult> {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        client: true,
      },
    });

    if (!user) {
      throw new Error('E-mail ou senha inválidos');
    }

    // Verificar senha
    const isValidPassword = await this.verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('E-mail ou senha inválidos');
    }

    // Verificar status
    if (user.status === ClientStatus.INACTIVE) {
      throw new Error('Sua conta está desativada. Entre em contato com o suporte.');
    }

    if (user.status === ClientStatus.PENDING) {
      throw new Error('Sua conta está pendente de aprovação.');
    }

    // Atualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Gerar token
    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
      },
      token,
      client: user.client
        ? {
            id: user.client.id,
            companyName: user.client.companyName,
            googleDriveFolderId: user.client.googleDriveFolderId,
          }
        : undefined,
    };
  }

  /**
   * Registro de novo cliente
   */
  async registerClient(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    companyName?: string;
  }) {
    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingUser) {
      throw new Error('Este e-mail já está cadastrado');
    }

    // Criar hash da senha
    const passwordHash = await this.hashPassword(data.password);

    // Criar usuário (status PENDING até admin aprovar e atribuir pasta)
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        role: UserRole.CLIENT,
        status: ClientStatus.PENDING,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      message: 'Cadastro realizado! Aguarde a aprovação do administrador.',
    };
  }

  /**
   * Solicita recuperação de senha — gera token, salva no banco e envia email
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Resposta genérica para não revelar se o email existe
    if (!user) return;

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        resetTokenExpiresAt: expiresAt,
      },
    });

    await emailService.sendPasswordResetEmail(user.email, user.name, token);
  }

  /**
   * Redefine a senha usando o token recebido por email
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        resetTokenExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      throw new Error('Token inválido ou expirado.');
    }

    const passwordHash = await this.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        resetTokenExpiresAt: null,
      },
    });
  }

  /**
   * Obtém dados do usuário atual
   */
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        client: true,
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      client: user.client
        ? {
            id: user.client.id,
            companyName: user.client.companyName,
            phone: user.client.phone,
            googleDriveFolderId: user.client.googleDriveFolderId,
            googleDriveFolderName: user.client.googleDriveFolderName,
          }
        : undefined,
    };
  }
}

export const authService = new AuthService();
