# 📝 Meu Diário Dev - DevContext

## Visão Geral

**Meu Diário Dev** (também conhecido como **DevContext**) é uma aplicação de diário/log para desenvolvedores, projetada para ajudar a rastrear o contexto diário de trabalho. A aplicação permite registrar o que foi feito, os próximos passos e organizar tudo com tags, facilitando a retomada do trabalho após pausas ou intervalos.

A aplicação é uma **aplicação web moderna** que funciona em navegadores, com suporte a PWA (Progressive Web App) e persistência de dados em Supabase.

## 🎯 Propósito

DevContext é uma ferramenta de preservação de contexto que ajuda desenvolvedores a:
- Registrar rapidamente o que foi realizado em cada sessão de trabalho
- Documentar os próximos passos críticos antes de pausar
- Organizar o trabalho por projetos e tags
- Recuperar rapidamente o contexto ao retomar o trabalho
- Manter um histórico completo de atividades de desenvolvimento

## ✨ Principais Funcionalidades

### 🔐 Autenticação
- Sistema de login baseado em senha
- Assistente de configuração inicial de senha
- Capacidade de alteração de senha
- Validação de senha forte (mínimo 6 caracteres, com maiúsculas, minúsculas e números)

### 📋 Registro de Trabalho
- Criação de entradas com timestamp automático
- Campos para contexto do projeto, tarefa realizada e próximos passos
- Interface limpa e focada na produtividade

### 🎤 Ditado por Voz
- Integração de conversão de voz para texto (Speech-to-Text)
- Suporte ao idioma Português Brasileiro (pt-BR)
- Entrada hands-free para próximos passos

### 🏷️ Sistema de Tags
- Tags predefinidas: Backend, Frontend, Database, Meeting, Bugfix, Deploy
- Categorização flexível de entradas
- Múltiplas tags por entrada

### 📚 Histórico de Entradas
- Visualização da entrada mais recente em destaque
- Barra lateral com histórico completo
- Modal de detalhes para visualização expandida
- Ordenação por data (mais recentes primeiro)

### 💾 Persistência de Dados
- **Supabase**: Backend-as-a-Service com PostgreSQL
- **Row-Level Security (RLS)**: Dados isolados por usuário
- Sincronização automática com banco de dados em tempo real

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas

```
src/app/
├── core/                          # Funcionalidades principais
│   ├── models/
│   │   └── log-entry.model.ts    # Interface LogEntry
│   ├── services/
│   │   ├── auth.service.ts       # Gerenciamento de autenticação
│   │   └── log.service.ts        # Persistência de dados
└── config/
       └── supabase.config.ts     # Configuração do cliente Supabase
├── features/                      # Módulos de funcionalidades
│   ├── auth/
│   │   └── login/
│   │       ├── login.component.ts     # UI de Login/Configuração
│   │       └── login.component.html
│   └── diary/
│       ├── diary.component.ts          # Interface principal do diário
│       ├── diary.component.html
│       └── components/
│           └── log-detail-modal/       # Modal de detalhes da entrada
├── shared/                        # Componentes compartilhados
│   └── icons/                     # Componentes de ícones SVG
│       ├── icon-mic.component.ts
│       ├── icon-save.component.ts
│       └── icon-database.component.ts
├── app.ts                         # Componente raiz (roteamento de autenticação)
├── app.html                       # Template de renderização condicional
└── app.config.ts                 # Configuração de locale (pt-BR)
```

### Separação de Responsabilidades

#### **Core Layer (Núcleo)**
- **Modelos**: Definições de tipos e interfaces de dados
- **Serviços**: Lógica de negócio e acesso a dados
- **Types**: Definições TypeScript para APIs externas

#### **Features Layer (Funcionalidades)**
- **Auth**: Gerenciamento de autenticação e configuração
- **Diary**: Funcionalidade principal de registro de trabalho

#### **Shared Layer (Compartilhado)**
- Componentes reutilizáveis (ícones, utilitários)

## 🛠️ Tecnologias e Frameworks

### Frontend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| **Angular** | 20.3.0 | Framework principal (Standalone Components) |
| **TypeScript** | 5.9.2 | Linguagem de programação |
| **Tailwind CSS** | 4.1.18 | Framework de estilos utilitários |
| **PostCSS** | 8.5.6 | Processamento de CSS |

### Estado e Reatividade
- **Angular Signals**: Gerenciamento de estado reativo
- **Reactive Forms**: Formulários reativos com validação
- **RxJS** | 7.8.0 | Programação reativa

### Backend e Persistência
- **Supabase**: Backend-as-a-Service (PostgreSQL + Auth)
- **Supabase Auth**: Autenticação de usuários com email dummy
- **PostgreSQL**: Banco de dados relacional via Supabase

### APIs do Navegador
- **Web Speech API**: Reconhecimento de voz (webkitSpeechRecognition)

### Desenvolvimento
- **Jasmine/Karma**: Framework de testes
- **Angular CLI** | 20.3.8 | Ferramentas de desenvolvimento

### Localização
- **Idioma**: Português Brasileiro (pt-BR)

## 📦 Modelo de Dados

### Interface LogEntry

```typescript
export interface LogEntry {
    uuid?: string;          // UUID do PostgreSQL         // Identificador UUID único
    created_at: string;    // Timestamp ISO (e.g., "2026-02-18T12:00:00.000Z")
    project: string;       // Nome do projeto/contexto
    last_task: string;     // Descrição do trabalho realizado
    next_steps: string;    // Próximas ações críticas
    tags: string;          // Array JSON stringificado (e.g., '["Backend","Bugfix"]')
}
```

### Fluxo de Dados

```
┌─────────────────┐
│  DiaryComponent │
└────────┬────────┘
         │
         ├──► LogService.saveLog(entry) ──► Supabase (PostgreSQL)
         │
         └──► LogService.getLogs() ──────► Retorna LogEntry[]
```

## 🎨 Design UI/UX

### Tema Visual
- **Paleta de Cores**: Tema escuro Catppuccin
  - Fundo: `#1e1e2e` (cinza escuro profundo)
  - Acentos: Roxo/lilás para elementos interativos
  - Texto: Tons claros para contraste

### Layout
- **Grid Responsivo**: Formulário principal + barra lateral de histórico
- **Barra de título**: Cabeçalho com relógio e status de conexão
- **Scrollbar Customizada**: Estilo minimalista para área de histórico

### Interações
- Efeitos de hover suaves
- Transições animadas
- Botões com ícones SVG
- Feedback visual para reconhecimento de voz (ícone pulsante)

### Acessibilidade
- Labels semânticos em formulários
- Atalhos de teclado (Escape para fechar modais)
- Foco visível em elementos interativos

## 🔑 Componentes Principais

### 1. **AuthService** (`core/services/auth.service.ts`)

**Responsabilidades:**
- Gerencia estado de autenticação via signals (`isAuthenticated`, `isSetupRequired`)
- Valida força da senha (6+ caracteres, maiúscula, minúscula, número)
- Comunica com Supabase Auth para autenticação segura
- Email dummy interno (`user-xxxxx@devcontext.local`)
- Implementa login, configuração e alteração de senha

**Principais Métodos:**
```typescript
login(password: string): Promise<boolean>
setupPassword(password: string): Promise<boolean>
changePassword(oldPassword: string, newPassword: string): Promise<boolean>
validatePassword(password: string): boolean
logout(): void
```

### 2. **LogService** (`core/services/log.service.ts`)

**Responsabilidades:**
- Abstrai persistência de dados via Supabase com RLS policies
- Carrega histórico de logs
- Salva novas entradas
- Coordena NgZone para atualizações reativas

**Principais Métodos:**
```typescript
getLogs(): Promise<LogEntry[]>
saveLog(entry: LogEntry, currentEntries: LogEntry[]): Promise<LogEntry[]>
```

### 3. **DiaryComponent** (`features/diary/diary.component.ts`)

**Responsabilidades:**
- Componente principal de funcionalidade
- Gerencia formulário reativo (project, last_task, next_steps)
- Implementa reconhecimento de voz em Português
- Exibe última entrada + histórico lateral
- Seleção e filtragem de tags
- Trigger de modal para visualização detalhada

**Propriedades Computadas:**
```typescript
latestEntry = computed(() => this.entries()[0] || null)
history = computed(() => this.entries().slice(1))
```

**Principais Funcionalidades:**
- Reconhecimento de voz contínuo em pt-BR
- Validação de formulário
- Gestão de tags (toggle selection)
- Integração com LogService

### 4. **LoginComponent** (`features/auth/login/login.component.ts`)

**Responsabilidades:**
- Renderização condicional: modo login vs. modo configuração
- Validação de senha na configuração inicial
- Modal de alteração de senha (usuários autenticados)
- Mensagens de erro para falhas de autenticação

### 5. **LogDetailModalComponent** (`features/diary/components/log-detail-modal`)

**Responsabilidades:**
- Modal overlay para visualização de detalhes completos da entrada
- Listener de teclado (Escape para fechar)
- Parsing de tags (string JSON → array)
- Visualização somente leitura

### 6. **App (Root Component)** (`app.ts`)

**Responsabilidades:**
- Roteamento condicional:
  - Autenticado → DiaryComponent
  - Não autenticado → LoginComponent
- Injeta AuthService para verificar signal `isAuthenticated()`

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão recomendada: 18+)
- npm ou yarn

### Instalação

```bash
# Clonar o repositório
git clone <url-do-repositório>
cd meu-diario-dev

# Instalar dependências
npm install
```

### Executar em Modo Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento Angular
npm start

# Ou usar o comando ng diretamente
npm run ng serve
```

A aplicação estará disponível em `http://localhost:4200/`

### Build para Produção

```bash
# Build otimizado para produção
npm run build

# Arquivos gerados em: ../../dist/renderer
```

### Executar Testes

```bash
# Executar testes unitários com Karma
npm test
```

### Modo Watch (Desenvolvimento Contínuo)

```bash
# Build automático ao detectar mudanças
npm run watch
```

## 🔒 Segurança

### Validação de Senha
- Mínimo de 6 caracteres
- Deve conter pelo menos:
  - 1 letra maiúscula
  - 1 letra minúscula
  - 1 número

### Armazenamento de Credenciais
- **Supabase Auth**: Credenciais autenticadas via JWT tokens
- **Web**: Mock simples (não recomendado para produção)

### Dados do Diário
- **Electron**: Persistidos em banco SQLite local
- **Web**: LocalStorage (dados permanecem no navegador)

## 📝 Notas de Desenvolvimento

### Padrões de Código
- Configuração Prettier: 100 caracteres por linha, aspas simples
- Parser especial para templates Angular
- EditorConfig incluído para consistência entre IDEs

### Desabilitação de Testes
- Schematics configurado para `skipTests: true` em todos os geradores
- Ideal para prototipagem rápida

### Configuração de Build
- Output path: `../../dist/renderer`
- Budget máximo: 1MB (initial), 8kB (component styles)
- Source maps habilitados em desenvolvimento

## 🌐 Compatibilidade

### Navegadores Suportados
- Chrome/Edge (para Web Speech API)
- Firefox (funcionalidade de voz pode não estar disponível)
- Safari (funcionalidade de voz pode não estar disponível)

### Plataformas Electron
- Windows
- macOS
- Linux

## 🎯 Casos de Uso

### Cenário 1: Fim do Dia de Trabalho
1. Abrir DevContext
2. Selecionar projeto atual
3. Descrever o que foi feito hoje
4. Usar ditado por voz para próximos passos
5. Adicionar tags relevantes (e.g., Frontend, Bugfix)
6. Salvar entrada

### Cenário 2: Retomando Trabalho Após Férias
1. Abrir DevContext
2. Visualizar histórico na barra lateral
3. Clicar na última entrada antes das férias
4. Ler "próximos passos" para retomar contexto rapidamente

### Cenário 3: Standup/Reunião Diária
1. Abrir DevContext
2. Consultar entradas recentes
3. Usar informações de "last_task" para reportar progresso
4. Compartilhar "next_steps" como plano do dia

## 🤝 Contribuindo

Este é um projeto pessoal, mas sugestões e contribuições são bem-vindas!

### Estrutura de Commits
- Commits claros e descritivos em português
- Prefixos recomendados: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`

## 📄 Licença

[Especificar licença do projeto]

## 📧 Contato

[Informações de contato do mantenedor]

---

**Desenvolvido com ❤️ para ajudar desenvolvedores a manterem o foco e contexto no trabalho**
