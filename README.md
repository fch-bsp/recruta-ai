<div align="center">

# 🤖 Recruta.AI

**Plataforma inteligente de recrutamento com IA**

Automatize a triagem de candidatos, gere perguntas técnicas personalizadas e tome decisões baseadas em dados com GPT-4o.

[![Deploy](https://img.shields.io/badge/deploy-Cloud%20Run-4285F4?logo=google-cloud&logoColor=white)](https://ai-interviewer-911016951289.us-west1.run.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![GPT-4o](https://img.shields.io/badge/OpenAI-GPT--4o-412991?logo=openai&logoColor=white)](https://openai.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

</div>

---

## ✨ O que faz

O Recruta.AI permite que recrutadores gerenciem processos seletivos completos com inteligência artificial:

- **📄 Upload em massa** — Suba múltiplos currículos (PDF/DOCX) por vaga
- **🤖 Análise automática** — GPT-4o avalia compatibilidade CV × Vaga com score de 0-100
- **❓ Perguntas personalizadas** — IA gera 3 perguntas técnicas cruzando currículo com requisitos
- **📝 Entrevista guiada** — Anote respostas e impressões durante a entrevista
- **📊 Dashboard** — Ranking Top 5, métricas de FIT e probabilidade de contratação
- **🗂️ Multi-processos** — Gerencie várias vagas simultaneamente com dados persistentes
- **🔐 Acesso controlado** — Login Google com aprovação manual de usuários

---

## 🏗️ Arquitetura

<div align="center">

![Arquitetura](./generated-diagrams/recruta-ai-architecture.png)

</div>

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16 · React 19 · Tailwind CSS 4 · Recharts |
| Backend | Next.js API Routes · Server Actions |
| IA | OpenAI GPT-4o |
| Auth | Firebase Authentication (Google OAuth) |
| Database | Cloud Firestore |
| PDF/DOCX | pdf-parse · pdfjs-dist · mammoth |
| Deploy | Cloud Run · Artifact Registry · GitHub Actions |

---

## 🚀 Quick Start

### Pré-requisitos

- Node.js 20+
- Conta Firebase com Auth e Firestore
- API Key da OpenAI

### Instalação

```bash
git clone https://github.com/fch-bsp/recruta-ai.git
cd recruta-ai
npm install
```

### Configuração

Crie o arquivo `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_chave
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

Crie o arquivo `.env`:

```env
OPENAI_API_KEY=sk-...
```

### Executar

```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 📂 Estrutura

```
src/
├── app/
│   ├── api/extract-text/    # Extração de texto (PDF/DOCX)
│   ├── app/                 # Área logada
│   ├── page.tsx             # Landing page
│   └── layout.tsx           # Layout global
├── components/
│   ├── RecruiterInterview   # Fluxo principal (vagas + candidatos)
│   ├── CandidateCard        # Card do candidato
│   ├── CandidateDetail      # Modal de entrevista (fullscreen)
│   ├── Dashboard            # Métricas e Top 5
│   └── ProtectedRoute       # Auth guard + aprovação
├── contexts/
│   └── AuthContext           # Firebase Auth + Firestore approval
└── lib/
    ├── ai.ts                # OpenAI GPT-4o (3 funções)
    ├── types.ts             # Tipos TypeScript
    └── firebase/            # Config + CRUD Firestore
```

---

## 🔄 Workflow de Deploy

```
Código → Teste Local → Validação → git push main → Deploy Automático
```

O pipeline GitHub Actions faz automaticamente:
1. Build da imagem Docker (multi-stage, node:20-alpine)
2. Push para Google Artifact Registry
3. Deploy no Cloud Run (us-west1)

Detalhes em: [WORKFLOW.md](./WORKFLOW.md)

---

## 📖 Documentação

| Documento | Conteúdo |
|-----------|----------|
| [DOCUMENTATION.md](./DOCUMENTATION.md) | Documentação completa (features, arquitetura, infra) |
| [WORKFLOW.md](./WORKFLOW.md) | Workflow de desenvolvimento e deploy |
| [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) | Guia passo a passo para deploy do zero |

---

## 👤 Aprovar Usuários

1. Acesse o [Firebase Console → Firestore](https://console.firebase.google.com)
2. Coleção `users` → documento do usuário
3. Altere `approved` para `true`

---

<div align="center">

2026 © All rights reserved. Fernando Horas

</div>
