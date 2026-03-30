#!/bin/bash

# =========================================================================
# Script de Inicialização - AI Interviewer
# =========================================================================

# Configuração de cores para o terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # Sem cor

# Função para exibir uso
show_help() {
    echo -e "${CYAN}Uso: ./start.sh [OPÇÕES]${NC}"
    echo ""
    echo -e "Opções:"
    echo -e "  -d, --dev       Inicia o servidor em modo de desenvolvimento (Padrão)"
    echo -e "  -b, --build     Realiza o build do projeto para produção"
    echo -e "  -p, --prod      Inicia o servidor em modo de produção (exige build prévio)"
    echo -e "  -c, --clean     Limpa as pastas .next e node_modules antes de rodar"
    echo -e "  -h, --help      Mostra esta mensagem de ajuda"
    echo ""
}

# Processa os argumentos da command line
MODE="dev"
CLEAN=0

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -d|--dev) MODE="dev" ;;
        -b|--build) MODE="build" ;;
        -p|--prod) MODE="prod" ;;
        -c|--clean) CLEAN=1 ;;
        -h|--help) show_help; exit 0 ;;
        *) echo -e "${RED}Opção desconhecida: $1${NC}"; show_help; exit 1 ;;
    esac
    shift
done

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}   AI Interviewer - Console de Operação  ${NC}"
echo -e "${GREEN}=========================================${NC}"

# Verifica NodeJS
if ! command -v node &> /dev/null; then
    echo -e "${RED}Erro: Node.js não está instalado. Instale o Node.js (v18+) para continuar.${NC}"
    exit 1
fi

# Verifica se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Aviso: Arquivo .env não encontrado.${NC}"
    echo -e "Criando um arquivo .env básico..."
    echo "OPENAI_API_KEY=sua_chave_aqui" > .env
    echo -e "${RED}Importante: Edite o arquivo .env e adicione suas chaves de API necessárias.${NC}"
fi

# Flag para limpar cache e modulos
if [ "$CLEAN" -eq 1 ]; then
    echo -e "${YELLOW}Limpando cache (.next) e dependências (node_modules)...${NC}"
    rm -rf .next node_modules package-lock.json
    echo -e "${GREEN}Limpeza concluída.${NC}"
fi

# Verifica se node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Instalando dependências do projeto via npm...${NC}"
    npm install
else
    echo -e "${GREEN}Dependências já instaladas.${NC}"
fi

echo -e "${GREEN}=========================================${NC}"

if [ "$MODE" = "dev" ]; then
    echo -e "  Iniciando o servidor em ${CYAN}MODO DESENVOLVIMENTO${NC}"
    echo -e "  Acesse: ${GREEN}http://localhost:3000${NC}"
    echo -e "${GREEN}=========================================${NC}"
    npm run dev
elif [ "$MODE" = "build" ]; then
    echo -e "  Executando o ${CYAN}BUILD DE PRODUÇÃO${NC}"
    echo -e "${GREEN}=========================================${NC}"
    npm run build
elif [ "$MODE" = "prod" ]; then
    if [ ! -d ".next" ]; then
        echo -e "${RED}Erro: Pasta .next não encontrada. Você precisa rodar o build primeiro (-b).${NC}"
        exit 1
    fi
    echo -e "  Iniciando o servidor em ${CYAN}MODO PRODUÇÃO${NC}"
    echo -e "  Acesse: ${GREEN}http://localhost:3000${NC}"
    echo -e "${GREEN}=========================================${NC}"
    npm run start
fi
