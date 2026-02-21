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
- Autenticação completa com Supabase (email + senha)
- Signup e login com validação de credenciais
- Gerenciamento seguro de sessões com JWT tokens
- Validação de senha forte (conforme requisitos do Supabase)
- Persistência de preferência "lembrar email"
- Integração com Row-Level Security (RLS) do Supabase

### 📋 Registro de Trabalho
- Criação de entradas com timestamp automático (ISO 8601)
- Campos para projeto, tarefa realizada e próximos passos
- Associação automática com user_id e project_id
- Interface limpa e focada na produtividade
- Persistência automática no Supabase com isolamento por usuário

### 🎤 Ditado por Voz
- Integração de conversão de voz para texto (Speech-to-Text)
- Suporte ao idioma Português Brasileiro (pt-BR)
- Entrada hands-free para próximos passos

##Armazenamento nativo em PostgreSQL (array TEXT[])
- Categorização flexível de entradas
- Múltiplas tags por entrada com validação, Frontend, Database, Meeting, Bugfix, Deploy
- Categorização flexível de entradas
- Múltiplas tags por entrada

### 📚 Histórico de Entradas
- Visualização da entrada mais recente em destaque
- Barra lateral com histórico completo
- Modal de detalhes para visualização expandida
- Ordenação por data (mais recentes primeiro)

### 🗂️ Gerenciamento de Projetos
- Criação e gestão de múltiplos projetos
- Edição de nome e descrição de projetos existentes
- Status de projetos: Aguardando, Em execução, Pausado, Finalizado, Cancelado
- Descrição de projeto e timestamps de criação/atualização
- Isolamento de dados por projeto via user_id (RLS)
- Integração com sistema de logs e tarefas

### ✅ Gerenciamento de Tarefas
- Sistema completo de gerenciamento de tarefas por projeto
- Status de tarefas: Backlog, Fazendo, Concluída
- Criação, edição e exclusão de tarefas
- Tags para categorização de tarefas
- Visualização organizada por status (estilo Kanban)
- Filtro por status de tarefa
- Marca automática de data de conclusão
- Isolamento por usuário e projeto (RLS)

### 📊 Relatório Diário
- Visualização consolidada do trabalho do dia
- Seções organizadas:
  - **Hoje (Realizado)**: Tarefas completadas no dia atual
  - **Próximo Dia (Foco)**: Tarefas planejadas para o dia seguinte
  - **Impedimentos**: Obstáculos identificados
- Funcionalidade de copiar relatório formatado para área de transferência
- Ideal para standups e reuniões diárias

### 💾 Persistência de Dados
- **Supabase**: Backend-as-a-Service com PostgreSQL
- **Row-Level Security (RLS)**: Dados isolados por usuário
- Políticas de segurança em nível de linha no banco de dados
- Sincronização automática com Supabase em tempo real
- Suporte a offline detection (banner de status)
- Atualização otimista de entradas (prepend local)
- Sincronização automática com banco de dados em tempo real

### 📱 Progressive Web App (PWA)
- ✅ Instalável em dispositivos Android, iOS e desktop
- ✅ Funcionamento offline com caching automático
- ✅ Service Worker para sincronização em background
- ✅ Ícone na tela inicial e splash screen personalizada
- ✅ Atualizações automáticas com notificação ao usuário
- ✅ Funciona como aplicação nativa standalone
- 📖 [Guia completo de PWA](PWA-GUIDE.md)

## 🏗️ Arquitetura do Projeto

### Estrutura de Pastas

```
src/app/
├── core/                          # Funcionalidades principais
│   ├── config/
│   │   └── supabase.config.ts     # Cliente Supabase singleton
│   ├── models/
│   │   ├── log-entry.model.ts    # Interface LogEntry
│   │   └── project.model.ts       # Interface Project e tipos
│   ├── services/
│   │   ├── auth.service.ts        # Gerenciamento de autenticação Supabase
│   │   ├── log.service.ts         # Persistência de logs com RLS
│   │   └── project.service.ts     # Gerenciamento de projetos
│   └── types/
├── features/                      # Módulos de funcionalidades
│   ├── auth/
│   │   └── login/
│   │       ├── login.component.ts      # UI de Login/Signup
│   │       └── login.component.html
│   ├── diary/
│   │   ├── diary.component.ts          # Interface principal do diário
│   │   ├── diary.component.html
│   │   └── components/
│   │       └── log-detail-modal/       # Modal de detalhes da entrada
│   └── projects/
│       ├── projects.component.ts       # Gestão de projetos
│       └── projects.component.html
├── shared/                        # Componentes compartilhados
│   ├── components/
│   │   └── offline-banner.component.ts # Banner de status de conexão
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
- **Service Worker**: PWA offline e sincronização background

### PWA
- **@angular/service-worker**: Gerenciamento de Service Worker
- **Web App Manifest**: Instalação e metadados da PWA
- **Cache API**: Caching automático de assets

### Desenvolvimento
- **Jasmine/Karma**: Framework de testes
- **Angular CLI** | 20.3.8 | Ferramentas de desenvolvimento

### Localização
- **Idioma**: Português Brasileiro (pt-BR)

## 📦 Modelo de Dados

### Interface LogEntry

```typescript
export interface LogEntry {
    uuid?: string;         // UUID do PostgreSQL
    created_at: string;    // Timestamp ISO compatível com TIMESTAMPTZ
    user_id?: string;      // UUID do usuário (auth.users)
    project_id?: string;   // UUID do projeto (projects table)
    project: string;       // Nome do projeto/contexto (legado, para compatibilidade)
    last_task: string;     // Descrição do trabalho realizado
    next_steps: string;    // Próximas ações críticas
    tags: string[];        // Array nativo (compatível com PostgreSQL TEXT[])
}
```

### Interface Project

```typescript
export interface Project {
    id?: string;           // UUID do PostgreSQL
    created_at?: string;   // Timestamp ISO
    updated_at?: string;   // Timestamp ISO
    user_id?: string;      // UUID do usuário (auth.users)
    name: string;          // Nome do projeto
    description?: string;  // Descrição do projeto
    status: ProjectStatus; // Status do projeto
}
```

### Interface Task

```typescript
export interface Task {
    id?: string;           // UUID do PostgreSQL
    created_at?: string;   // Timestamp ISO
    updated_at?: string;   // Timestamp ISO
    user_id?: string;      // UUID do usuário (auth.users)
    project_id: string;    // UUID do projeto (obrigatório)
    title: string;         // Título da tarefa
    description?: string;  // Descrição da tarefa
    status: TaskStatus;    // Status: backlog, fazendo ou concluida
    completed_at?: string | null; // Data de conclusão
    tags?: string[];       // Tags associadas à tarefa
}

export type TaskStatus = 'backlog' | 'fazendo' | 'concluida';
```

### Fluxo de Dados

```
┌─────────────────────┐
│ ProjectsComponent   │
└──────────┬──────────┘
           │
           ├──► ProjectService.createProject() ──► Supabase (projects table)
           ├──► ProjectService.updateProject() ──► Atualiza projeto
           ├──► ProjectService.loadProjects() ──► Carrega lista de projetos
           └──► Abre TasksModal ──────────────┐
                                                │
┌──────────────────────┐                       │
│  DiaryComponent      │                       │
└──────────┬───────────┘                       │
           │                                   ▼
           ├──► LogService.saveLog(entry) ──► Supabase (log_entries table)
           │    └─► RLS Policy: usuario == auth.uid()
           │                                   ┌──────────────────────┐
           └──► LogService.getLogs(projectId?) │  TasksModal          │
                 └─► Filtrado por projeto      └──────────┬───────────┘
                                                           │
                                 ┌─────────────────────────┼──────────────────────────┐
                                 │                         │                          │
                                 ▼                         ▼                          ▼
                       TaskService.createTask()  TaskService.updateTask()  TaskService.deleteTask()
                                 │                         │                          │
                                 └─────────────────────────┴──────────────────────────┘
                                                           │
                                                           ▼
                                                  Supabase (tasks table)
                                                  └─► RLS Policy: user_id == auth.uid()

┌──────────────────────────┐
│  DailyReportComponent    │
└──────────┬───────────────┘
           │
           └──► LogService.getLogs(projectId?) ──► Filtra e organiza por:
                 ├─► Hoje (Realizado) - is_next_day_task = false
                 ├─► Próximo Dia (Foco) - is_next_day_task = true
                 └─► Impedimentos - entries com campo impediments preenchido
```

### Modelo de Tabelas Supabase

#### Tabela: `projects`
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'Aguardando',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Tabela: `log_entries`
```sql
CREATE TABLE log_entries (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    project VARCHAR(255) NOT NULL,
    last_task TEXT NOT NULL,
    next_steps TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_next_day_task BOOLEAN DEFAULT false,
    impediments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Tabela: `tasks`
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'backlog',
    tags TEXT[] DEFAULT '{}',
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Políticas RLS (Row Level Security)

**Projects - Acesso de Leitura e Escrita:**
```sql
CREATE POLICY "Users can only read their own projects"
ON projects FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

**Log Entries - Acesso de Leitura e Escrita:**
```sql
CREATE POLICY "Users can only read their own logs"
ON log_entries FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

**Tasks - Acesso de Leitura e Escrita:**
```sql
CREATE POLICY "Users can only read their own tasks"
ON tasks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can only create their own tasks"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
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
- Comunica com Supabase Auth para autenticação segura
- Implementa signup com validação de email único
- Implementa login com email e senha
- Gerencia sessões via JWT tokens
- Armazena preferência "lembrar email" em localStorage
- Inicializa sessão ao carregar a aplicação

**Principais Métodos:**
```typescript
signup(email: string, password: string, saveEmail?: boolean): Promise<{success: boolean; error?: string}>
login(email: string, password: string, saveEmail?: boolean): Promise<{success: boolean; error?: string}>
logout(): void
initSession(): Promise<void>
```

### 2. **ProjectService** (`core/services/project.service.ts`)

**Responsabilidades:**
- Gerencia lista de projetos com signals (`projects`, `currentProject`)
- Abstrai persistência de dados via Supabase com RLS policies
- Carrega projetos do usuário autenticado
- Cria novos projetos com validação
- Atualiza status de projetos
- Atualiza dados do projeto
- Delete de projetos com isolamento por usuário

**Principais Métodos:**
```typescript
loadProjects(): Promise<void>
createProject(name: string, description?: string, status?: ProjectStatus): Promise<{success: boolean; error?: string; project?: Project}>
updateProjectStatus(projectId: string, status: ProjectStatus): Promise<{success: boolean; error?: string}>
updateProject(projectId: string, updates: Partial<Project>): Promise<{success: boolean; error?: string}>
deleteProject(projectId: string): Promise<{success: boolean; error?: string}>
selectProject(project: Project): void
```

### 3. **LogService** (`core/services/log.service.ts`)

**Responsabilidades:**
- Abstrai persistência de dados via Supabase com RLS policies
- Carrega histórico de logs do usuário e do projeto (opcional)
- Salva novas entradas com relatório de usuário automático
- Coordena NgZone para atualizações reativas
- Detecta offline e emite eventos apropriados
- Implementa atualização otimista (prepend local)

**Principais Métodos:**
```typescript
getLogs(projectId?: string): Promise<LogEntry[]>
saveLog(entry: LogEntry, currentEntries: LogEntry[], projectId?: string): Promise<LogEntry[]>
```

### 4. **ProjectsComponent** (`features/projects/projects.component.ts`)

**Responsabilidades:**
- Componente de gerenciamento de projetos
- Exibe lista de projetos com status visual
- Permite criar novo projeto
- Permite editar nome e descrição de projetos existentes
- Permite selecionar projeto para abrir diário
- Permite deletar projeto
- Permite abrir modal de tarefas do projeto
- Indica projeto atualmente selecionado

**Principais Métodos:**
```typescript
openEditModal(project: Project, event?: Event): void
onEditProject(): Promise<void>
openTasksModal(project: Project, event?: Event): void
deleteProject(projectId: string): Promise<void>
selectProject(project: Project): void
```

### 5. **DiaryComponent** (`features/diary/diary.component.ts`)

**Responsabilidades:**
- Componente principal de funcionalidade
- Gerencia formulário reativo (project, last_task, next_steps)
- Implementa reconhecimento de voz em Português
- Exibe última entrada + histórico lateral
- Seleção e filtragem de tags
- Trigger de modal para visualização detalhada
- Botão de voltar para tela de projetos
- Detecção de status de conexão (online/offline)

**Propriedades Computadas:**
```typescript
latestEntry = computed(() => this.entries()[0] || null)
history = computed(() => this.entries().slice(1))
```

**Principais Funcionalidades:**
- Reconhecimento de voz contínuo em pt-BR
- Validação de formulário reativo
- Gestão de tags (toggle selection)
- Integração com LogService e ProjectService
- Sincronização com Supabase em tempo real

### 6. **LoginComponent** (`features/auth/login/login.component.ts`)

**Responsabilidades:**
- Renderização condicional: modo signup vs. modo login
- Validação de credenciais
- Opção de lembrar email
- Mensagens de erro detalhadas para falhas de autenticação
- Integração com Supabase Auth

### 7. **LogDetailModalComponent** (`features/diary/components/log-detail-modal`)

**Responsabilidades:**
- Modal overlay para visualização de detalhes completos da entrada
- Listener de teclado (Escape para fechar)
- Parsing de tags (array → visualização)
- Visualização somente leitura
- Formatação de timestamps

### 8. **OfflineBannerComponent** (`shared/components/offline-banner.component.ts`)

**Responsabilidades:**
- Exibe banner de aviso quando offline
- Monitora status de conexão (online/offline)
- Interface visual clara para experiência do usuário

### 9. **TasksModalComponent** (`features/projects/components/tasks-modal`)

**Responsabilidades:**
- Modal de gerenciamento de tarefas de um projeto
- Visualização organizada por status (Backlog, Fazendo, Concluída)
- Criação de novas tarefas com título, descrição e tags
- Edição de tarefas existentes
- Alteração de status de tarefas (drag-and-drop style)
- Filtro por status de tarefa
- Exclusão de tarefas
- Integração com TaskService

**Principais Métodos:**
```typescript
onCreateTask(): Promise<void>
openEditTask(task: Task): void
onSaveEditTask(): Promise<void>
onDeleteTask(taskId: string): Promise<void>
updateTaskStatus(taskId: string, status: TaskStatus): Promise<void>
```

### 10. **TaskService** (`core/services/task.service.ts`)

**Responsabilidades:**
- Abstrai persistência de tarefas via Supabase com RLS policies
- Carrega tarefas de um projeto específico
- Cria novas tarefas com associação automática de user_id
- Atualiza status e dados de tarefas
- Deleta tarefas com isolamento por usuário
- Marca automaticamente data de conclusão quando status = concluída
- Normalização de status para compatibilidade frontend/backend

**Principais Métodos:**
```typescript
loadProjectTasks(projectId: string): Promise<Task[]>
createTask(projectId: string, title: string, description?: string, status?: TaskStatus, tags?: string[]): Promise<{success: boolean; error?: string; task?: Task}>
updateTaskStatus(taskId: string, status: TaskStatus): Promise<{success: boolean; error?: string}>
updateTask(taskId: string, updates: Partial<Task>): Promise<{success: boolean; error?: string}>
deleteTask(taskId: string): Promise<{success: boolean; error?: string}>
```

### 11. **DailyReportComponent** (`features/diary/daily-report`)

**Responsabilidades:**
- Exibe relatório consolidado do trabalho do dia
- Organiza entradas em três seções:
  - **Hoje (Realizado)**: Tarefas completadas no dia atual
  - **Próximo Dia (Foco)**: Tarefas planejadas para o dia seguinte (is_next_day_task = true)
  - **Impedimentos**: Entradas com campo impediments preenchido
- Gera relatório formatado em texto para cópia
- Funcionalidade de copiar para área de transferência
- Navegação de volta para diário ou projetos

**Propriedades Computadas:**
```typescript
todayCompleted = computed(() => // Filtra entradas de hoje com is_next_day_task = false
nextDayTasks = computed(() => // Filtra entradas com is_next_day_task = true
impediments = computed(() => // Filtra entradas de hoje com impediments preenchido
```

**Principais Métodos:**
```typescript
copyReportToClipboard(): void
goBackToDiary(): void
goBackToProjects(): void
```

### 12. **App (Root Component)** (`app.ts`)

**Responsabilidades:**
- Roteamento condicional:
  - Não autenticado → LoginComponent
  - Autenticado + sem projeto → ProjectsComponent
  - Autenticado + com projeto → DiaryComponent ou DailyReportComponent
- Injeta AuthService e ProjectService para verificar signals

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão recomendada: 18+)
- npm ou yarn
- Conta Supabase (criada em https://supabase.com)

### Configuração do Supabase

1. **Criar projeto Supabase:**
   - Acesse https://supabase.com
   - Crie uma nova organização/projeto
   - Anote a URL do projeto e a chave pública (anon key)

2. **Configurar variáveis de ambiente:**
   - Copie `src/environments/environment.ts.example` para `src/environments/environment.ts`
   - Adicione suas credenciais Supabase:
   ```typescript
   export const environment = {
       production: false,
       supabase: {
           url: 'sua_url_supabase',
           publishableKey: 'sua_chave_publica'
       }
   };
   ```

3. **Criar tabelas no Supabase:**
   - Execute os SQLs em `database/schemas/schema-v2.sql` no editor SQL do Supabase
   - Ative o Row-Level Security (RLS) nas tabelas `projects` e `log_entries`
   - Aplique as políticas de segurança (veja seção "Fluxo de Dados" para exemplos)

4. **Habilitar Autenticação:**
   - No Supabase, vá para Authentication > Providers
   - Certifique-se de que "Email" está habilitado
   - Configure as URLs de redirecionamento (ex: http://localhost:4200)

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
ng serve
```

A aplicação estará disponível em `http://localhost:4200/`

### Build para Produção

```bash
# Build otimizado para produção
npm run build

# Arquivos gerados em: dist/meu-diario-dev
```

**Nota:** O build de produção inclui automaticamente a PWA com Service Worker habilitado!

### 📱 PWA e Ícones

Para funcionalidade PWA completa, você deve adicionar os ícones:

```bash
# Instalar sharp (para gerar ícones)
npm install --save-dev sharp

# Gerar ícones automaticamente
node public/assets/icons/generate-icons.js
```

Ou gere os ícones usando uma ferramenta online como [PWA Builder](https://www.pwabuilder.com).

Para mais detalhes, veja [PWA-GUIDE.md](PWA-GUIDE.md)

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

## 🗄️ Banco de Dados

### Migrations Supabase

Utilize os arquivos em `database/schemas/` para setup:

- **schema-v1.sql**: Versão inicial (deprecated)
- **schema-v2.sql**: Versão atual com tabelas `projects` e `log_entries`
- **schema-v2-migration.sql**: Script de migração (se necessário)

Para aplicar migrations:
1. Copie o conteúdo do arquivo SQL
2. Abra o editor SQL do Supabase
3. Cole e execute o script

## 🔒 Segurança

### Autenticação
- **Supabase Auth**: Sistema de autenticação com email e senha
- **JWT Tokens**: Sessões seguras com tokens JWT
- **PKCE Flow**: Proteção contra ataques de autorização
- **Password Reset**: Fluxo de recuperação de senha via email (Supabase)

### Dados do Usuário
- **Row-Level Security (RLS)**: Cada usuário só pode ver seus próprios dados
- **Políticas de Banco**: Isolamento em nível de banco de dados (não apenas aplicação)
- **UUID do usuário**: Associação segura entre usuário e dados

### Armazenamento Local
- **localStorage**: Apenas preferências não sensíveis (lembrar email)
- **Sessão Supabase**: Gerenciada automaticamente pelo Supabase Auth
- **Sem armazenamento de senhas**: Autenticação delegada ao Supabase

## 📝 Notas de Desenvolvimento

### Padrões Supabase

#### Client Singleton
O cliente Supabase é exportado como singleton em `core/config/supabase.config.ts`, garantindo uma única instância em toda a aplicação:

```typescript
export const supabase: SupabaseClient = createClient(url, key);
```

#### RLS (Row-Level Security)
Todas as operações respeitam as políticas RLS do banco de dados:
- Usuários só podem ver seus próprios dados
- Isolamento em nível de banco (não apenas aplicação)
- Validação ocorre no servidor

#### Signals para State Management
Os serviços usam Angular Signals para estado reativo:
```typescript
projects = signal<Project[]>([]);
currentProject = signal<Project | null>(null);
isAuthenticated = signal<boolean>(false);
```

#### NgZone para Atualizações Unidirecionais
Operações assíncronas coordenam com NgZone para manter Change Detection fluido:
```typescript
this.ngZone.run(() => {
    this.projects.set(data);
});
```

#### Atualização Otimista
LogService implementa atualização otimista (prepend local) para melhor UX:
```typescript
return new Promise((resolve) => {
    this.ngZone.run(() => {
        resolve([data, ...currentEntries]);
    });
});
```

### Padrões de Código
- Configuração Prettier: 100 caracteres por linha, aspas simples
- Parser especial para templates Angular
- EditorConfig incluído para consistência entre IDEs

### Desabilitação de Testes
- Schematics configurado para `skipTests: true` em todos os geradores
- Ideal para prototipagem rápida

### Configuração de Build
- Output path: `dist/meu-diario-dev`
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

### Cenário 1: Primeiro Acesso
1. Acessar DevContext
2. Criar conta com email e senha (Supabase)
3. Criar novo projeto
4. Iniciar registro de trabalho

### Cenário 2: Fim do Dia de Trabalho
1. Abrir DevContext (fazer login se necessário)
2. Selecionar projeto atual (se não estiver selecionado)
3. Descrever o que foi feito hoje
4. Usar ditado por voz para próximos passos
5. Adicionar tags relevantes (e.g., Frontend, Bugfix)
6. Salvar entrada

### Cenário 3: Retomando Trabalho Após Férias
1. Abrir DevContext (fazer login)
2. Selecionar o projeto desejado na tela de projetos
3. Visualizar histórico na barra lateral
4. Clicar na última entrada antes das férias
5. Ler "próximos passos" para retomar contexto rapidamente

### Cenário 4: Gerenciamento de Múltiplos Projetos
1. Abrir DevContext
2. Navegar até tela de projetos
3. Criar novo projeto com nome e descrição
4. Alternar status do projeto (Aguardando, Em execução, Pausado, etc.)
5. Selecionar projeto para começar a registrar logs
6. Visualizar logs apenas do projeto selecionado

### Cenário 5: Standup/Reunião Diária
1. Abrir DevContext
2. Acessar o Relatório Diário
3. Visualizar seções organizadas:
   - **Hoje (Realizado)**: O que foi completado
   - **Próximo Dia (Foco)**: Próximos passos
   - **Impedimentos**: Bloqueios identificados
4. Copiar relatório formatado para área de transferência
5. Compartilhar em reunião ou chat da equipe

### Cenário 6: Gerenciamento de Tarefas do Projeto
1. Abrir DevContext e ir para a tela de projetos
2. Selecionar projeto e clicar em "Gerenciar Tarefas"
3. Visualizar tarefas organizadas por status (Backlog, Fazendo, Concluída)
4. Criar nova tarefa com título, descrição e tags
5. Mover tarefas entre status conforme progresso
6. Editar ou deletar tarefas conforme necessário
7. Filtrar tarefas por status específico

### Cenário 7: Edição de Informações do Projeto
1. Abrir DevContext
2. Na tela de projetos, clicar no botão de editar do projeto desejado
3. Atualizar nome ou descrição do projeto
4. Salvar alterações
5. Visualizar projeto atualizado na lista

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
