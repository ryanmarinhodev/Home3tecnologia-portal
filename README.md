# Home3 Portal (Monorepo)

Portal web com frontend em React/Vite e backend em Node/Express + Prisma, com banco PostgreSQL (Supabase).

## Estrutura do projeto

```text
.
├── src/                    # Frontend (React + Vite)
├── backend/                # API (Express + Prisma)
│   ├── prisma/
│   └── src/
├── .github/workflows/      # CI
└── README.md
```

## Stack

- Frontend: React, Vite, TypeScript, Tailwind, shadcn/ui
- Backend: Node.js, Express, TypeScript
- Banco: PostgreSQL (Supabase)
- ORM: Prisma
- CI: GitHub Actions

## Requisitos

- Node.js 20+
- npm 10+
- Conta Supabase (para banco remoto)

## Setup local

### 1) Clonar e instalar frontend

```bash
git clone <URL_DO_REPOSITORIO>
cd home3-site-2026
npm ci
```

### 2) Instalar backend

```bash
cd backend
npm ci
```

### 3) Configurar variaveis do backend

Use [backend/.env.example](backend/.env.example) como base e crie [backend/.env](backend/.env).

Com Supabase + Prisma, configure assim:

```env
# Runtime (pooler)
DATABASE_URL="postgresql://postgres.<project-ref>:<PASSWORD>@aws-0-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Migracoes Prisma (conexao direta/session)
DIRECT_URL="postgresql://postgres.<project-ref>:<PASSWORD>@aws-0-us-west-2.pooler.supabase.com:5432/postgres"

JWT_SECRET="troque-por-um-segredo-forte"
JWT_EXPIRES_IN="7d"

GOOGLE_SERVICE_ACCOUNT_EMAIL="..."
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
GOOGLE_DRIVE_ROOT_FOLDER_ID="..."

PORT=3001
NODE_ENV="development"
FRONTEND_URLS="http://localhost:5173"
```

### 4) Prisma (migracao + client)

No diretório [backend](backend):

```bash
npx prisma migrate dev
npx prisma generate
npm run db:seed
```

Observacao:
- `migrate dev` cria/aplica migracoes em desenvolvimento.
- Em producao, use `npx prisma migrate deploy`.

### 5) Rodar o projeto

Terminal 1 (frontend, na raiz):

```bash
npm run dev
```

Terminal 2 (backend):

```bash
cd backend
npm run dev
```

Frontend: `http://localhost:5173`
API: `http://localhost:3001/api`

## Comandos principais

### Frontend (raiz)

```bash
npm run dev
npm run lint
npm run test
npm run build
```

### Backend ([backend](backend))

```bash
npm run dev
npm run build
npm run start
npm run db:generate
npm run db:migrate
npm run db:seed
```

## CI

Pipeline em [\.github/workflows/ci-monorepo.yml](.github/workflows/ci-monorepo.yml).

Executa em `push`/`pull_request` para `main` e `master`:

1. Frontend: install, lint, test, build
2. Backend: install, prisma generate, build

## Deploy (monorepo)

Voce pode fazer deploy de front e back separadamente, apontando para o mesmo repositorio.

### Frontend (servico estatico)

- Root directory: raiz do repositorio
- Build command: `npm ci && npm run build`
- Output/public directory: `dist`
- Env: `VITE_API_URL=https://sua-api.com/api`

### Backend (servico Node)

- Root directory: `backend`
- Build command: `npm ci && npx prisma generate && npm run build`
- Start command: `npm run start`
- Release command (se suportado): `npx prisma migrate deploy`
- Env obrigatorias: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `GOOGLE_*`, `FRONTEND_URLS`

## Seguranca

- Nao versione [backend/.env](backend/.env).
- Nao compartilhe tokens/chaves em issue, chat ou commit.
- Se alguma credencial foi exposta, rotacione imediatamente:
	- senha do banco
	- chave da service account
	- JWT secret

## Endpoints principais da API

- Base URL local: `http://localhost:3001`

### Auth

| Metodo | Rota | Descricao |
|---|---|---|
| POST | `/api/auth/login` | Login do usuario |
| POST | `/api/auth/register` | Registro de cliente |
| GET | `/api/auth/me` | Usuario autenticado |
| POST | `/api/auth/verify` | Validar token |

### Arquivos (cliente)

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/api/files` | Lista raiz de arquivos do cliente |
| GET | `/api/files/folder/:folderId` | Lista conteudo de subpasta |
| GET | `/api/files/:fileId/info` | Metadados do arquivo |
| GET | `/api/files/:fileId/download` | Download do arquivo |

### Admin

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/api/admin/clients` | Listar clientes |
| GET | `/api/admin/clients/:id` | Detalhes de um cliente |
| POST | `/api/admin/clients` | Criar cliente |
| PATCH | `/api/admin/clients/:id` | Atualizar cliente |
| DELETE | `/api/admin/clients/:id` | Remover cliente |
| PATCH | `/api/admin/clients/:id/status` | Alterar status |
| GET | `/api/admin/clients/:id/files` | Listar arquivos do cliente |
| GET | `/api/admin/stats` | Estatisticas gerais |

Para detalhes de backend, consulte [backend/README.md](backend/README.md).
