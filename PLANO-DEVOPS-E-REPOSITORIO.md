# Plano de Execucao: Supabase, Container e Repositorio

Data: 18 de marco de 2026
Projeto: home3-site-2026

## Objetivo
Organizar tres frentes de trabalho:
- Banco hospedado no Supabase com Prisma funcionando em producao.
- API preparada para rodar com ou sem container, mantendo fluxo simples de desenvolvimento.
- Migracao do codigo para um repositorio na sua conta, com historico preservado.

## Recomendacao Rapida
- Banco: nao containerizar. Use Supabase gerenciado.
- API: vale a pena containerizar para padronizar deploy e evitar problema de ambiente.
- Frontend: continuar local, como voce decidiu.
- GitHub: criar repositorio na sua conta e trocar remote origin local.

## Fase 1 - Banco no Supabase (Prisma)

### 1. Criar projeto no Supabase
- Criar um novo projeto no Supabase.
- Anotar os dados de conexao PostgreSQL:
  - Host
  - Port
  - Database
  - User
  - Password
  - SSL mode

### 2. Configurar variaveis de ambiente no backend
- Arquivo alvo: backend/.env
- Definir, no minimo:
  - DATABASE_URL
  - JWT_SECRET
  - ADMIN_EMAIL
  - ADMIN_PASSWORD
  - GOOGLE credentials (se necessario no fluxo atual)

Exemplo de DATABASE_URL para Prisma:
postgresql://USER:PASSWORD@HOST:6543/postgres?schema=public&sslmode=require

### 3. Ajustar Prisma para Supabase
- Confirmar provider no schema Prisma em backend/prisma/schema.prisma.
- Rodar migracoes no banco hospedado:
  - npx prisma migrate deploy
- Rodar seed se necessario:
  - npx prisma db seed

### 4. Validar conexao
- Subir backend local e validar endpoints de auth e admin.
- Conferir criacao/leitura no banco real do Supabase.

## Fase 2 - API com e sem container

### Decisao tecnica
- Desenvolvimento diario: pode rodar sem container (mais rapido para debug).
- Build e deploy: usar container para previsibilidade.

### 1. Criar Dockerfile da API
Arquivo alvo: backend/Dockerfile

Objetivo do Dockerfile:
- Instalar dependencias.
- Buildar TypeScript.
- Rodar Prisma generate.
- Iniciar servidor em modo producao.

### 2. Criar .dockerignore da API
Arquivo alvo: backend/.dockerignore

Incluir:
- node_modules
- dist
- .env
- logs
- coverage

### 3. Criar compose apenas para API
Arquivo alvo: backend/docker-compose.yml

Servico sugerido:
- api

Observacoes:
- Nao incluir banco local no compose, pois o banco sera Supabase.
- Passar DATABASE_URL e demais env vars por .env ou variaveis do ambiente.

### 4. Validar fluxo local
- Build da imagem:
  - docker build -t home3-api ./backend
- Subir container:
  - docker compose -f backend/docker-compose.yml up -d
- Ver logs:
  - docker compose -f backend/docker-compose.yml logs -f api

### 5. Padronizar scripts no backend/package.json
Adicionar scripts como:
- dev
- build
- start
- prisma:migrate:deploy
- prisma:seed
- docker:build
- docker:up
- docker:down

## Fase 3 - Repositorio na sua conta

### Estrategia recomendada
Trocar o remote origin local para um repositorio novo na sua conta. Isso preserva todo o historico do projeto.

### 1. Criar repositorio vazio na sua conta
- No GitHub, criar repo sem README, sem .gitignore, sem license.

### 2. Conferir remoto atual
- git remote -v

### 3. Trocar origin para seu repo
- git remote set-url origin URL_DO_SEU_REPO

### 4. Enviar branch principal
- git push -u origin main

Se branch principal for master:
- git push -u origin master

### 5. Ajustar autoria futura
- git config user.name "Seu Nome"
- git config user.email "seu-email@exemplo.com"

### 6. Sobre contribuicao antiga do seu amigo
- Os commits antigos continuam com autoria original.
- Seus novos commits vao aparecer na sua conta, no seu repositorio.
- Se voce quiser reescrever autoria historica, isso exige rebase/filter-repo e pode complicar o historico. Em geral, nao recomendo.

## Ordem ideal de execucao
1. Fase 1 (Supabase) primeiro.
2. Fase 2 (container da API) depois que o banco estiver validado.
3. Fase 3 (migracao de repositorio) ao final ou em paralelo.

## Checklist de conclusao
- [ ] API conectando no Supabase em ambiente local.
- [ ] Migracoes Prisma aplicadas no Supabase.
- [ ] Seed executado com sucesso.
- [ ] Dockerfile da API funcional.
- [ ] docker compose da API funcional.
- [ ] Repositorio na sua conta com push da branch principal.
- [ ] README atualizado com instrucoes de setup.

## Riscos comuns e mitigacao
- Risco: DATABASE_URL sem sslmode=require.
  - Mitigacao: validar string de conexao do Supabase.
- Risco: usar migrate dev em ambiente remoto.
  - Mitigacao: em producao usar migrate deploy.
- Risco: segredos versionados por engano.
  - Mitigacao: revisar .gitignore e nunca commitar .env.
- Risco: deploy quebra por diferenca de ambiente.
  - Mitigacao: usar container da API para build e runtime.

## Proximo passo pratico
Executar Fase 1 imediatamente e validar login/admin com banco Supabase. Em seguida, criar Dockerfile e compose da API.
