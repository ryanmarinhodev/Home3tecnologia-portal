import { Resend } from 'resend';
import { config } from '../config/index.js';

const resend = new Resend(config.resend.apiKey);

export const emailService = {
  async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}`;

    await resend.emails.send({
      from: 'Home3 Tecnologia <noreply@home3tecnologia.com>',
      to: email,
      subject: 'Recuperação de senha — Home3 Tecnologia',
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
          <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
          <body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
              <tr>
                <td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                    <tr>
                      <td style="background:#1a1a2e;padding:32px 40px;text-align:center;">
                        <h1 style="margin:0;color:#c9a84c;font-size:24px;letter-spacing:1px;">Home3 Tecnologia</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:40px 40px 24px;">
                        <p style="margin:0 0 8px;color:#374151;font-size:16px;">Olá, <strong>${name}</strong></p>
                        <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                          Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha.
                        </p>
                        <table cellpadding="0" cellspacing="0" width="100%">
                          <tr>
                            <td align="center">
                              <a href="${resetUrl}" style="display:inline-block;background:#c9a84c;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:15px;font-weight:bold;letter-spacing:0.5px;">
                                Redefinir senha
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;line-height:1.5;">
                          Este link expira em <strong>1 hora</strong>. Se você não solicitou a recuperação de senha, pode ignorar este e-mail com segurança.
                        </p>
                        <p style="margin:12px 0 0;color:#9ca3af;font-size:12px;word-break:break-all;">
                          Ou copie o link: ${resetUrl}
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
                        <p style="margin:0;color:#9ca3af;font-size:12px;">
                          © ${new Date().getFullYear()} Home3 Tecnologia — Todos os direitos reservados
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });
  },
};
