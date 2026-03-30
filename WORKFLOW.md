# 🔄 Workflow de Desenvolvimento — Recruta.AI

## Regra de Ouro

> **Toda alteração é testada LOCAL primeiro. Só sobe para produção após validação.**

---

## Fluxo Padrão

```
Código → Teste Local → Validação → Git Push → Deploy Automático
```

### 1. Desenvolver e Testar Local

```bash
cd "/home/fernando/Documentos/Antigravity | Kiro/Antigravity/Projeto-07/ai-interviewer"
npm run dev
```

Acesse: **http://localhost:3000**

### 2. Validar

- [ ] Funcionalidade nova funciona
- [ ] Não quebrou nada existente
- [ ] Login funciona
- [ ] Upload de PDFs funciona
- [ ] Dados persistem ao navegar/relogar

### 3. Subir para Produção

```bash
git add -A
git commit -m "feat: descrição da mudança"
git push
```

O pipeline do GitHub Actions faz o resto automaticamente:
- Build da imagem Docker
- Push para Artifact Registry
- Deploy no Cloud Run

Acompanhe em: https://github.com/fch-bsp/recruta-ai/actions

### 4. Verificar em Produção

URL: **https://ai-interviewer-911016951289.us-west1.run.app**

---

## Comandos Úteis

```bash
# Rodar local
npm run dev

# Ver logs de produção
gcloud run services logs read ai-interviewer --region us-west1 --project homol-489313 --limit 50

# Ver status do deploy
gcloud run services describe ai-interviewer --region us-west1 --project homol-489313

# Atualizar só a API key da OpenAI (sem rebuild)
gcloud run services update ai-interviewer --region us-west1 --project homol-489313 \
  --set-env-vars "OPENAI_API_KEY=nova_chave"

# Deploy das regras do Firestore
firebase deploy --only firestore:rules --project ai-interviewer-ag2025
```

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── api/extract-text/   → API de extração de PDF/DOCX
│   ├── app/                → Área logada (entrevista + histórico)
│   ├── login/              → Página de login (legado)
│   ├── page.tsx            → Landing page
│   └── layout.tsx          → Layout global + footer
├── components/
│   ├── RecruiterInterview   → Fluxo principal (vagas + candidatos)
│   ├── CandidateCard        → Card individual do candidato
│   ├── CandidateDetail      → Modal de entrevista (tela cheia)
│   ├── Dashboard            → Métricas e Top 5
│   ├── Navbar               → Navegação
│   └── ProtectedRoute       → Guard de autenticação + aprovação
├── contexts/
│   └── AuthContext          → Firebase Auth + aprovação Firestore
└── lib/
    ├── ai.ts               → Chamadas OpenAI (GPT-4o)
    ├── types.ts             → Tipos compartilhados
    └── firebase/
        ├── client.ts        → Config Firebase
        └── firestore.ts     → CRUD processos + entrevistas
```

---

## Infraestrutura

| Serviço | Projeto | Região |
|---------|---------|--------|
| Cloud Run | homol-489313 | us-west1 |
| Artifact Registry | homol-489313 | southamerica-east1 |
| Firebase Auth | ai-interviewer-ag2025 | — |
| Firestore | ai-interviewer-ag2025 | southamerica-east1 |

---

## Secrets (GitHub Actions)

Configurados em: https://github.com/fch-bsp/recruta-ai/settings/secrets/actions

| Secret | Descrição |
|--------|-----------|
| GCP_SA_KEY | Service Account JSON para deploy |
| OPENAI_API_KEY | Chave da API OpenAI |
| NEXT_PUBLIC_FIREBASE_* | Credenciais Firebase (7 secrets) |

---

## Aprovar Novos Usuários

1. Acesse: https://console.firebase.google.com/project/ai-interviewer-ag2025/firestore
2. Coleção `users` → clique no doc do usuário
3. Mude `approved` de `false` para `true`
