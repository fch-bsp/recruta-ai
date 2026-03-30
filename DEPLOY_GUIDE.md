# 🚀 Guia Completo: Deploy em Produção — Firebase + Cloud Run

> Siga cada passo na ordem. Marque com [x] conforme for concluindo.

---

## FASE 1 — Configurar o Firebase Console

### Passo 1.1 — Acessar o projeto Firebase
- [ ] Acesse: https://console.firebase.google.com
- [ ] Faça login com sua conta Google
- [ ] Clique no projeto **"intervieweria"** (já existe)

### Passo 1.2 — Verificar Authentication
- [ ] No menu lateral esquerdo, clique em **"Authentication"**
- [ ] Clique na aba **"Sign-in method"**
- [ ] Verifique se **"Google"** está com status **"Ativado"**
- [ ] Se NÃO estiver:
  - Clique em **"Google"**
  - Ative o toggle
  - Preencha o "Nome público do projeto" (ex: "AI Interviewer")
  - Selecione um e-mail de suporte
  - Clique em **"Salvar"**

### Passo 1.3 — Verificar Firestore Database
- [ ] No menu lateral, clique em **"Firestore Database"**
- [ ] Se aparecer um botão **"Criar banco de dados"**:
  - Clique nele
  - Selecione **"Iniciar no modo de produção"**
  - Escolha a localização: **"southamerica-east1 (São Paulo)"**
  - Clique em **"Criar"**
- [ ] Se já existir, siga para o próximo passo

### Passo 1.4 — Configurar regras de segurança do Firestore
- [ ] Dentro do Firestore, clique na aba **"Regras"**
- [ ] Substitua TODO o conteúdo por:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários só podem ler/escrever suas próprias entrevistas
    match /interviews/{interviewId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null 
        && request.auth.uid == request.resource.data.userId;
    }
    
    // Bloqueia todo o resto
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

- [ ] Clique em **"Publicar"**

### Passo 1.5 — Criar índice do Firestore (necessário para queries)
- [ ] Clique na aba **"Índices"**
- [ ] Clique em **"Criar índice"**
- [ ] Preencha:
  - Coleção: `interviews`
  - Campo 1: `userId` — Crescente
  - Campo 2: `createdAt` — Decrescente
- [ ] Clique em **"Criar"**
- [ ] Aguarde o status mudar para ✅ (pode levar 2-3 minutos)

---

## FASE 2 — Instalar Google Cloud CLI

### Passo 2.1 — Instalar o gcloud CLI
- [ ] Abra o terminal e execute:

```bash
# Ubuntu/Debian
curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-linux-x86_64.tar.gz
tar -xf google-cloud-cli-linux-x86_64.tar.gz
./google-cloud-sdk/install.sh
```

- [ ] Feche e reabra o terminal
- [ ] Verifique a instalação:

```bash
gcloud --version
```

### Passo 2.2 — Fazer login e configurar o projeto
- [ ] Execute:

```bash
gcloud auth login
```

- [ ] Vai abrir o navegador — faça login com a mesma conta do Firebase
- [ ] Configure o projeto:

```bash
gcloud config set project intervieweria
```

### Passo 2.3 — Ativar as APIs necessárias
- [ ] Execute estes comandos (um por vez):

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

### Passo 2.4 — Criar repositório no Artifact Registry
- [ ] Execute:

```bash
gcloud artifacts repositories create ai-interviewer \
  --repository-format=docker \
  --location=southamerica-east1 \
  --description="AI Interviewer Docker images"
```

---

## FASE 3 — Preparar o Código para Produção

### Passo 3.1 — Criar o Dockerfile
- [ ] Já vou criar este arquivo automaticamente (me peça depois deste guia)

### Passo 3.2 — Criar o .dockerignore
- [ ] Já vou criar este arquivo automaticamente

### Passo 3.3 — Regenerar a API Key da OpenAI
> ⚠️ IMPORTANTE: Sua chave atual foi exposta no código. Precisa gerar uma nova.

- [ ] Acesse: https://platform.openai.com/api-keys
- [ ] Clique em **"Create new secret key"**
- [ ] Dê um nome: "ai-interviewer-prod"
- [ ] Copie a chave (começa com `sk-...`)
- [ ] **NÃO cole em nenhum arquivo do projeto** — vamos usar como variável de ambiente no Cloud Run

### Passo 3.4 — Atualizar o .gitignore
- [ ] Verifique se o `.gitignore` contém:

```
.env
.env.local
.env.production
```

---

## FASE 4 — Build e Deploy no Cloud Run

### Passo 4.1 — Buildar a imagem Docker
- [ ] No terminal, na pasta do projeto, execute:

```bash
cd "/home/fernando/Documentos/Antigravity | Kiro/Antigravity/Projeto-07/ai-interviewer"

gcloud builds submit \
  --tag southamerica-east1-docker.pkg.dev/intervieweria/ai-interviewer/app:latest \
  --timeout=1200
```

- [ ] Aguarde o build terminar (pode levar 5-10 minutos na primeira vez)
- [ ] Deve terminar com: `SUCCESS`

### Passo 4.2 — Deploy no Cloud Run
- [ ] Execute (substitua `SUA_NOVA_CHAVE_OPENAI` pela chave do Passo 3.3):

```bash
gcloud run deploy ai-interviewer \
  --image southamerica-east1-docker.pkg.dev/intervieweria/ai-interviewer/app:latest \
  --region southamerica-east1 \
  --platform managed \
  --allow-unauthenticated \
  --port 3000 \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --set-env-vars "OPENAI_API_KEY=SUA_NOVA_CHAVE_OPENAI" \
  --set-env-vars "NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBVICrn77RirXL4ieemwqs8F72hZaTvksw" \
  --set-env-vars "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=intervieweria.firebaseapp.com" \
  --set-env-vars "NEXT_PUBLIC_FIREBASE_PROJECT_ID=intervieweria" \
  --set-env-vars "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=intervieweria.firebasestorage.app" \
  --set-env-vars "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=402896717326" \
  --set-env-vars "NEXT_PUBLIC_FIREBASE_APP_ID=1:402896717326:web:32ce2e070a2baebb0b1e5f" \
  --set-env-vars "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-3HDKHKBRVN"
```

- [ ] Aguarde o deploy (2-5 minutos)
- [ ] No final vai aparecer a URL, algo como:
  ```
  Service URL: https://ai-interviewer-xxxxx-rj.a.run.app
  ```
- [ ] **Copie essa URL** — vamos precisar no próximo passo

### Passo 4.3 — Testar se o deploy funcionou
- [ ] Abra a URL do Cloud Run no navegador
- [ ] Deve aparecer a landing page do AI Interviewer
- [ ] **NÃO tente fazer login ainda** — precisa configurar o domínio no Firebase primeiro

---

## FASE 5 — Configurar Domínio no Firebase Auth

### Passo 5.1 — Adicionar domínio autorizado
- [ ] Volte ao Firebase Console: https://console.firebase.google.com
- [ ] Vá em **"Authentication"** → **"Settings"** (aba Configurações)
- [ ] Clique em **"Domínios autorizados"**
- [ ] Clique em **"Adicionar domínio"**
- [ ] Cole o domínio do Cloud Run (sem https://), exemplo:
  ```
  ai-interviewer-xxxxx-rj.a.run.app
  ```
- [ ] Clique em **"Adicionar"**

### Passo 5.2 — Testar o login
- [ ] Abra a URL do Cloud Run novamente
- [ ] Clique em **"Entrar com Google"**
- [ ] Faça login com sua conta
- [ ] Deve redirecionar para `/app`
- [ ] Teste subir uma vaga + currículos
- [ ] Teste o fluxo completo de análise

---

## FASE 6 — Domínio Customizado (Opcional)

> Se quiser usar um domínio próprio (ex: interviewer.suaempresa.com)

### Passo 6.1 — Mapear domínio no Cloud Run
- [ ] Execute:

```bash
gcloud run domain-mappings create \
  --service ai-interviewer \
  --domain SEU_DOMINIO \
  --region southamerica-east1
```

### Passo 6.2 — Configurar DNS
- [ ] O comando acima vai mostrar registros DNS (tipo CNAME)
- [ ] Adicione esses registros no painel do seu provedor de domínio
- [ ] Aguarde propagação DNS (pode levar até 24h, geralmente 30min)

### Passo 6.3 — Adicionar domínio no Firebase Auth
- [ ] Repita o Passo 5.1 com o novo domínio

---

## 📋 Checklist Final

- [ ] Firebase Auth funcionando com Google login
- [ ] Firestore com regras de segurança configuradas
- [ ] Índice do Firestore criado
- [ ] API Key da OpenAI regenerada (antiga revogada)
- [ ] App rodando no Cloud Run
- [ ] Domínio autorizado no Firebase Auth
- [ ] Login funcionando em produção
- [ ] Upload de CVs funcionando
- [ ] Análise de IA funcionando
- [ ] Histórico salvando no Firestore

---

## 🔧 Comandos Úteis Pós-Deploy

```bash
# Ver logs do Cloud Run em tempo real
gcloud run services logs read ai-interviewer --region southamerica-east1 --limit 50

# Atualizar o app (após mudanças no código)
gcloud builds submit \
  --tag southamerica-east1-docker.pkg.dev/intervieweria/ai-interviewer/app:latest
gcloud run deploy ai-interviewer \
  --image southamerica-east1-docker.pkg.dev/intervieweria/ai-interviewer/app:latest \
  --region southamerica-east1

# Ver status do serviço
gcloud run services describe ai-interviewer --region southamerica-east1

# Atualizar apenas uma variável de ambiente (ex: trocar API key)
gcloud run services update ai-interviewer \
  --region southamerica-east1 \
  --set-env-vars "OPENAI_API_KEY=nova_chave_aqui"
```

---

## ⚠️ Troubleshooting

| Problema | Solução |
|----------|---------|
| Login Google não funciona | Verifique se o domínio está em "Domínios autorizados" no Firebase Auth |
| Erro 500 ao subir PDF | Verifique os logs: `gcloud run services logs read ai-interviewer` |
| Build falha | Verifique se o Dockerfile está correto e se o `.dockerignore` existe |
| App lento na primeira vez | Normal — Cloud Run "acorda" a instância (cold start ~3s). Depois fica rápido |
| Firestore permission denied | Verifique as regras de segurança (Passo 1.4) |

---

*Guia criado para o projeto AI Interviewer. Última atualização: Julho 2025.*
