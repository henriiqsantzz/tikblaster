# TikBlaster - Guia de Setup Completo

## Pré-requisitos
- Node.js 18+
- Conta no Supabase (gratuito)
- Conta no Vercel (gratuito)
- TikTok for Business Developer Account

---

## 1. Configurar Supabase

### 1.1 Criar projeto
1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Anote a **Project URL** e a **anon key** (em Settings > API)
3. Anote a **service_role key** (mesmo local)

### 1.2 Executar o schema SQL
1. No Supabase, vá em **SQL Editor**
2. Cole o conteúdo do arquivo `supabase-schema.sql`
3. Execute

### 1.3 Configurar Auth
1. Em **Authentication > Settings**, ative Email/Password
2. Desative "Confirm email" para desenvolvimento (opcional)

---

## 2. Criar App TikTok for Business

### 2.1 Registrar app
1. Acesse [ads.tiktok.com/marketing_api/](https://ads.tiktok.com/marketing_api/)
2. Vá em **My Apps > Create App**
3. Selecione **Marketing API**
4. Preencha:
   - App Name: TikBlaster
   - Description: Ferramenta de gestão de campanhas
   - App Icon: qualquer imagem
5. Anote o **App ID** e **App Secret**

### 2.2 Configurar Redirect URI
1. Na configuração do app, adicione o redirect URI:
   - Desenvolvimento: `http://localhost:3000/api/tiktok/callback`
   - Produção: `https://seu-dominio.vercel.app/api/tiktok/callback`

### 2.3 Solicitar permissões
Solicite acesso às seguintes scopes:
- `advertiser_management`
- `campaign_management`
- `ad_management`
- `creative_management`
- `reporting`
- `audience_management`
- `business_center_management`
- `billing`

---

## 3. Gerar VAPID Keys (Push Notifications)

Execute no terminal:
```bash
npx web-push generate-vapid-keys
```

Anote o **Public Key** e o **Private Key**.

---

## 4. Configurar Variáveis de Ambiente

### 4.1 Desenvolvimento local
Copie `.env.local.example` para `.env.local`:
```bash
cp .env.local.example .env.local
```

Preencha os valores:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

TIKTOK_APP_ID=seu_app_id
TIKTOK_APP_SECRET=seu_app_secret
NEXT_PUBLIC_TIKTOK_APP_ID=seu_app_id

NEXT_PUBLIC_VAPID_PUBLIC_KEY=sua_chave_publica
VAPID_PRIVATE_KEY=sua_chave_privada
VAPID_EMAIL=mailto:seu@email.com

NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=gere_uma_string_aleatoria_aqui
```

### 4.2 Vercel (Produção)
Adicione as mesmas variáveis em **Vercel > Settings > Environment Variables**.
Mude `NEXT_PUBLIC_APP_URL` para seu domínio.

---

## 5. Instalar e Rodar

```bash
cd tikblaster
npm install
npm run dev
```

Acesse: http://localhost:3000

---

## 6. Deploy na Vercel

### 6.1 Via CLI
```bash
npm install -g vercel
vercel login
vercel
```

### 6.2 Via GitHub
1. Faça push do código para um repositório GitHub
2. No Vercel, importe o repositório
3. Adicione as variáveis de ambiente
4. Deploy automático

---

## 7. Conectar Business Center

1. Faça login no TikBlaster
2. Vá em **Configurações > Integrações TikTok**
3. Clique em **Conectar TikTok**
4. Autorize o app no TikTok
5. Selecione o Business Center
6. Pronto! Suas contas serão sincronizadas

---

## 8. Configurar Cron Job (Monitoramento)

O arquivo `vercel.json` já configura um cron job a cada 5 minutos.
Na Vercel, o cron roda automaticamente.

Para desenvolvimento local, use:
```bash
curl http://localhost:3000/api/cron/monitor -H "Authorization: Bearer SEU_CRON_SECRET"
```

---

## 9. PWA no Celular

### Android
1. Abra o site no Chrome
2. Toque nos 3 pontinhos > "Adicionar à tela inicial"
3. As notificações push funcionam nativamente

### iOS
1. Abra o site no Safari
2. Toque em "Compartilhar" > "Adicionar à Tela de Início"
3. Nota: push notifications no iOS requerem iOS 16.4+

---

## Estrutura do Projeto

```
tikblaster/
├── public/                  # Arquivos estáticos + PWA
│   ├── icons/              # Ícones PWA
│   ├── manifest.json       # PWA manifest
│   ├── sw.js              # Service Worker
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── (auth)/        # Páginas de autenticação
│   │   ├── (dashboard)/   # Páginas do app
│   │   │   ├── dashboard/ # Dashboard analytics
│   │   │   ├── campaigns/ # Criação de campanhas em massa
│   │   │   ├── manager/   # Gerenciador de campanhas
│   │   │   ├── history/   # Histórico de jobs
│   │   │   ├── accounts/  # Provisionamento de contas
│   │   │   ├── pixels/    # Gerenciamento de pixels
│   │   │   └── settings/  # Configurações
│   │   └── api/           # API Routes
│   │       ├── tiktok/    # OAuth + API TikTok
│   │       ├── campaigns/ # CRUD campanhas
│   │       ├── accounts/  # Provisionamento
│   │       ├── pixels/    # Pixels
│   │       ├── notifications/ # Push notifications
│   │       ├── cron/      # Jobs agendados
│   │       └── webhooks/  # Webhooks TikTok
│   ├── components/        # Componentes React
│   │   ├── ui/           # Componentes base
│   │   └── layout/       # Sidebar, Topbar
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Libs (Supabase, TikTok API, etc)
│   ├── store/            # Zustand stores
│   └── types/            # TypeScript types
├── supabase-schema.sql   # Schema do banco
├── vercel.json           # Config Vercel (cron)
└── .env.local.example    # Template de variáveis
```

---

## Funcionalidades

### Dashboard
- Métricas em tempo real (Faturamento, Gastos, CPA, CPM, CTR, ROAS)
- Gráfico de vendas por hora
- Saldo das Business Centers
- Contas ativas

### Campanhas em Massa
- Criar até 100 campanhas por conta simultaneamente
- Selecionar múltiplas contas de anúncio
- Configurar campanha, ad group e criativo
- Templates salvos (modelos)
- Tipos: Manual e Smart+

### Gerenciador
- Visualizar todas campanhas/conjuntos/anúncios
- Filtros por status, conta, produto
- Ações em massa (pausar, ativar, excluir)
- Métricas detalhadas por campanha

### Provisionamento de Contas
- Criar sub-contas em lote
- Dados fiscais e de contato
- Integração direta com API v1.3

### Pixels
- Visão consolidada de pixels por conta
- Status de saúde dos pixels
- Sincronização automática

### Notificações Push (PWA)
- Anúncio aprovado/reprovado
- Conta suspensa
- Venda aprovada (com valor)
- Alertas de orçamento
- Funciona no celular como app nativo
