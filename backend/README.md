# Backend - Portal do Cliente Home3

## Setup

1. **Instalar dependências:**
```bash
cd backend
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
# Editar .env com suas configurações
```

3. **Configurar banco de dados PostgreSQL:**
```bash
# Criar banco de dados
createdb home3_portal

# Gerar cliente Prisma
npm run db:generate

# Aplicar schema ao banco
npm run db:push

# (Opcional) Criar dados iniciais
npm run db:seed
```

4. **Iniciar servidor de desenvolvimento:**
```bash
npm run dev
```

5. **Testar se a API está no ar:**
```bash
curl http://localhost:3001/api/ping
```

Resposta esperada:
```json
{"status":"pong","timestamp":"..."}
```

## Integração com Frontend

No frontend, configure a URL da API:

```env
VITE_API_URL=http://localhost:3001/api
```

Observações:
- Se `VITE_API_URL` não existir, o frontend já usa `http://localhost:3001/api` como fallback.
- O backend precisa estar rodando em paralelo ao frontend.

## Próximos Passos Recomendados

1. Validar autenticação no Postman (`/auth/login`, `/auth/me`, `/auth/verify`)
2. Testar fluxo admin (listar/criar cliente)
3. Configurar Google Drive Service Account
4. Compartilhar pasta de cada cliente com a Service Account
5. Definir `googleDriveFolderId` para cada cliente
6. Testar `/api/files` com token de cliente ativo
7. (Opcional) Migrar de `db:push` para `db:migrate` para versionamento do banco

## Configuração do Google Drive

### 1. Criar Conta de Serviço no Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google Drive API**:
   - Vá em "APIs & Services" > "Enable APIs and Services"
   - Pesquise "Google Drive API" e ative

4. Crie uma **Service Account**:
   - Vá em "IAM & Admin" > "Service Accounts"
   - Clique em "Create Service Account"
   - Dê um nome (ex: "home3-portal-drive")
   - Clique em "Create and Continue"
   - Pule a etapa de roles e clique em "Done"

5. Gere uma **chave JSON**:
   - Clique na conta de serviço criada
   - Vá na aba "Keys"
   - Clique em "Add Key" > "Create new key" > "JSON"
   - Salve o arquivo JSON gerado

6. Copie os valores do JSON para o `.env`:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: campo `client_email`
   - `GOOGLE_PRIVATE_KEY`: campo `private_key` (incluir aspas e \n)

### 2. Compartilhar Pastas com a Conta de Serviço

Para cada pasta de cliente no Google Drive:

1. No Google Drive, clique com botão direito na pasta
2. Selecione "Compartilhar"
3. Adicione o email da conta de serviço (ex: `home3-portal@projeto.iam.gserviceaccount.com`)
4. Dê permissão de "Leitor" (ou "Editor" se precisar de escrita)
5. Copie o ID da pasta (parte da URL após `/folders/`)

### 3. Obter ID da Pasta

O ID da pasta está na URL do Google Drive:
```
https://drive.google.com/drive/folders/ESTE_E_O_ID_DA_PASTA
```

## Endpoints da API

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login do usuário |
| POST | `/api/auth/register` | Registro de novo cliente |
| GET | `/api/auth/me` | Dados do usuário atual |
| POST | `/api/auth/verify` | Verificar token |

### Arquivos (Clientes)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/files` | Listar arquivos do cliente |
| GET | `/api/files/folder/:folderId` | Listar subpasta |
| GET | `/api/files/:fileId/info` | Info de um arquivo |
| GET | `/api/files/:fileId/download` | Download de arquivo |

### Admin

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/admin/clients` | Listar todos os clientes |
| GET | `/api/admin/clients/:id` | Detalhes de um cliente |
| POST | `/api/admin/clients` | Criar novo cliente |
| PATCH | `/api/admin/clients/:id` | Atualizar cliente |
| DELETE | `/api/admin/clients/:id` | Remover cliente |
| PATCH | `/api/admin/clients/:id/status` | Alterar status |
| GET | `/api/admin/clients/:id/files` | Ver arquivos do cliente |
| GET | `/api/admin/stats` | Estatísticas gerais |

## Fluxo de Acesso do Cliente

1. Cliente faz login em `/api/auth/login`
2. Backend retorna JWT
3. Frontend envia `Authorization: Bearer <token>`
4. Backend valida usuário e status (`ACTIVE`)
5. Backend busca `googleDriveFolderId` do cliente
6. Backend lista somente arquivos da pasta atribuída

## Troubleshooting (Erros Comuns)

### 1) CORS bloqueando login/register

Sintoma: erro de CORS no navegador para `/api/auth/login` ou `/api/auth/register`.

Verifique no `.env` do backend:

```env
FRONTEND_URL="http://localhost:5173"
```

Se seu frontend estiver em outra porta (ex: `8080`), ajuste esse valor e reinicie o backend.

### 2) `Formato de token inválido`

Causa: header Authorization sem prefixo Bearer.

Correto:

```http
Authorization: Bearer <token>
```

### 3) `Cannot POST /api/auth/me`

Causa: método HTTP incorreto.

Correto:
- `/api/auth/me` é `GET`
- `/api/auth/verify` é `POST`

### 4) Cliente não vê arquivos

Checklist:
- usuário com status `ACTIVE`
- `googleDriveFolderId` preenchido
- pasta compartilhada com a Service Account
- token enviado corretamente no header

## Estrutura de Pastas

```
backend/
├── prisma/
│   ├── schema.prisma      # Schema do banco de dados
│   └── seed.ts            # Dados iniciais
├── src/
│   ├── config/
│   │   └── index.ts       # Configurações
│   ├── lib/
│   │   └── prisma.ts      # Cliente Prisma
│   ├── middlewares/
│   │   └── auth.middleware.ts
│   ├── routes/
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── files.routes.ts
│   │   └── admin.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── googleDrive.service.ts
│   └── server.ts          # Entrada da aplicação
├── .env.example
├── package.json
└── tsconfig.json
```

## Credenciais de Teste (após seed)

**Admin:**
- Email: admin@home3.com.br
- Senha: admin123

**Cliente exemplo:**
- Email: cliente@exemplo.com
- Senha: cliente123

## Pendências Finais (Checklist)

### 1) Integração Google Drive (Obrigatório para produção)

- [ ] Criar/confirmar Service Account no Google Cloud
- [ ] Ativar Google Drive API no projeto
- [ ] Preencher no `.env`:
   - [ ] `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - [ ] `GOOGLE_PRIVATE_KEY`
- [ ] Compartilhar cada pasta de cliente com o e-mail da Service Account
- [ ] Garantir `googleDriveFolderId` preenchido para todos os clientes ativos
- [ ] Validar fluxo cliente:
   - [ ] Login cliente
   - [ ] `GET /api/files` retornando somente arquivos da pasta do cliente
   - [ ] Download funcionando em `/api/files/:fileId/download`

### 2) Fluxo "Esqueci minha senha" (Ainda não implementado)

Status atual:
- O botão "Esqueceu a senha?" existe no frontend, mas ainda não há backend para recuperação.

Tarefas recomendadas:
- [ ] Criar endpoint `POST /api/auth/forgot-password` (recebe e-mail)
- [ ] Criar endpoint `POST /api/auth/reset-password` (token + nova senha)
- [ ] Criar tabela para tokens de recuperação (com expiração e uso único)
- [ ] Enviar e-mail com link/token de redefinição
- [ ] Implementar tela de redefinição no frontend
- [ ] Invalidar token após uso
- [ ] Adicionar rate limit no endpoint de recuperação

### 3) Hardening antes de deploy

- [ ] Trocar `JWT_SECRET` por valor forte e único
- [ ] Revisar CORS (`FRONTEND_URL`) para domínio real
- [ ] Validar logs e tratamento de erro sem expor dados sensíveis
