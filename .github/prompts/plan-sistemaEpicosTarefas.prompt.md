# Plan: Sistema de Épicos para Tarefas de Projetos

Esta feature adiciona gestão de épicos como uma camada organizacional superior às tarefas. Cada projeto terá seus próprios épicos (com nome e foco), e tarefas serão vinculadas a eles. A interface incluirá CRUD de épicos, visualização de tags nos cards, filtro por épico no Kanban, e correção da ordenação das tarefas para mostrar as mais antigas primeiro. As decisões arquiteturais seguem os padrões Angular 20+ já estabelecidos no projeto (Signals, Standalone Components, Services reactivos).

## Steps

### 1. Criar schema do banco de dados para épicos

- Adicionar arquivo [database/schemas/schema-v6-migration.sql](database/schemas/schema-v6-migration.sql)
- Criar tabela `epics` com campos: `id` (UUID), `created_at`, `updated_at`, `user_id`, `project_id` (FK para `projects`), `name` (TEXT NOT NULL), `focus` (TEXT)
- Adicionar coluna `epic_id` (UUID nullable) na tabela `tasks` com FK para `epics` ON DELETE SET NULL
- Criar índice `idx_epics_project_id` em `epics(project_id, created_at DESC)`
- Criar índice `idx_tasks_epic_id` em `tasks(epic_id)`
- Configurar RLS policies para `epics` (SELECT, INSERT, UPDATE, DELETE filtrados por `user_id`)
- Adicionar trigger para atualizar `updated_at` em `epics`

### 2. Criar modelos TypeScript para épicos

- Criar [src/app/core/models/epic.model.ts](src/app/core/models/epic.model.ts)
- Definir interface `Epic` com campos: `id?`, `created_at?`, `updated_at?`, `user_id?`, `project_id`, `name`, `focus?`
- Atualizar [src/app/core/models/task.model.ts](src/app/core/models/task.model.ts) adicionando campo `epic_id?: string` e `epic?: Epic` (para joins)

### 3. Implementar Epic Service

- Criar [src/app/core/services/epic.service.ts](src/app/core/services/epic.service.ts)
- Seguir padrão de [task.service.ts](src/app/core/services/task.service.ts): Signals (`epics = signal<Epic[]>([])`, `isLoading`), NgZone, operações com retorno `{success, error?}`
- Implementar métodos: `loadProjectEpics(projectId)`, `createEpic(...)`, `updateEpic(...)`, `deleteEpic(epicId)`
- Adicionar computed signal `epicsByProject` para agrupamento
- Ordenação: `.order('created_at', { ascending: false })`

### 4. Atualizar Task Service para suportar épicos

- Modificar [src/app/core/services/task.service.ts](src/app/core/services/task.service.ts)
- Atualizar query `loadProjectTasks` para fazer `.select('*, epic:epics(id, name)')` (join com tabela epics)
- Adicionar parâmetro `epic_id` aos métodos `createTask` e `updateTask`
- **Inverter ordenação**: mudar `.order('created_at', { ascending: false })` para `{ ascending: true }` (mais antiga primeiro)

### 5. Criar componente de modal de épicos

- Criar [src/app/features/projects/components/epics-modal/epics-modal.component.ts](src/app/features/projects/components/epics-modal/epics-modal.component.ts)
- Criar [src/app/features/projects/components/epics-modal/epics-modal.component.html](src/app/features/projects/components/epics-modal/epics-modal.component.html)
- Seguir estrutura de [tasks-modal.component.ts](src/app/features/projects/components/tasks-modal/tasks-modal.component.ts): Standalone, Input/Output API moderna, Signals
- Input: `project` signal
- Output: `closeEvent`
- Layout: lista de épicos com cards, botão "Novo Épico", formulário inline para criar/editar
- Exibir campos: nome (required), foco (textarea opcional)
- Ações: editar, deletar (com confirmação)
- Mostrar contador de tarefas vinculadas a cada épico

### 6. Adicionar gestão de épicos ao Projects Component

- Atualizar [src/app/features/projects/projects.component.ts](src/app/features/projects/projects.component.ts)
- Injetar `EpicService`
- Adicionar signal `showEpicsModal = signal(false)`
- Adicionar método `openEpicsModal(project: Project)` que carrega épicos e abre modal
- Atualizar [src/app/features/projects/projects.component.html](src/app/features/projects/projects.component.html)
- Adicionar botão "Gerenciar Épicos" nos cards de projeto (ao lado de "Ver Tarefas")
- Adicionar `<app-epics-modal>` no template com binding condicional `@if`

### 7. Adicionar exibição de tags nos cards de tarefas

- Atualizar [src/app/features/projects/components/tasks-modal/tasks-modal.component.html](src/app/features/projects/components/tasks-modal/tasks-modal.component.html)
- Localizar os cards de tarefa em cada coluna do Kanban (backlog, fazendo, concluída)
- Adicionar abaixo do título/descrição: `@if (task.tags && task.tags.length > 0) { <div class="flex flex-wrap gap-1 mt-2"> @for (tag of task.tags; track tag) { <span class="text-xs px-2 py-0.5 rounded-full bg-[#313244] text-[#cba6f7]">{{ tag }}</span> } </div> }`
- Usar cores do tema Catppuccin: background `#313244`, texto `#cba6f7`

### 8. Adicionar vínculo de épico ao criar/editar tarefas

- Atualizar [tasks-modal.component.ts](src/app/features/projects/components/tasks-modal/tasks-modal.component.ts)
- Injetar `EpicService` e criar signal `projectEpics = signal<Epic[]>([])`
- Carregar épicos do projeto ao abrir modal (método `loadEpics`)
- Adicionar campo `epic_id` aos FormGroups (`createTaskForm`, `editTaskForm`) como FormControl opcional
- Atualizar [tasks-modal.component.html](src/app/features/projects/components/tasks-modal/tasks-modal.component.html)
- Adicionar `<select>` para seleção de épico nos formulários de criar/editar (após campo de descrição)
- Options: `<option value="">Sem épico</option>` + loop de épicos disponíveis
- Passar `epic_id` ao chamar `taskService.createTask` e `updateTask`

### 9. Implementar filtro por épico no Kanban

- Atualizar [tasks-modal.component.ts](src/app/features/projects/components/tasks-modal/tasks-modal.component.ts)
- Adicionar signal `selectedEpicFilter = signal<string | null>(null)` (string vazia = "Sem épico", null = todos)
- Modificar computed `filteredTasks` para aplicar filtro adicional: `filter(t => !this.selectedEpicFilter() || t.epic_id === this.selectedEpicFilter() || (!t.epic_id && this.selectedEpicFilter() === ''))`
- Atualizar [tasks-modal.component.html](src/app/features/projects/components/tasks-modal/tasks-modal.component.html)
- Adicionar row de botões de filtro por épico acima do Kanban (ao lado dos filtros de status)
- Botões: "Todos os épicos" (null), "Sem épico" (''), e um botão por cada épico do projeto
- Visual: botão ativo com background `#cba6f7`, inativos com `#313244`

### 10. Adicionar visualização de épico com lista de tarefas

- Atualizar cards de épicos em [epics-modal.component.html](src/app/features/projects/components/epics-modal/epics-modal.component.html)
- Cada card épico deve ser expansível/colapsável (signal `expandedEpicId`)
- Ao expandir: carregar tarefas vinculadas através de computed signal que filtra `tasks()` por `epic_id`
- Exibir lista simples: apenas `task.title` em `<li>` com bullet points e cor por status
- Mostrar métricas básicas: total de tarefas, concluídas vs em andamento

## Verification

- **Banco de dados**: Executar `schema-v6-migration.sql` no Supabase e verificar tabelas/colunas criadas
- **Interface**: Abrir projeto → "Gerenciar Épicos" → criar épico → "Ver Tarefas" → vincular task ao épico → verificar tag de épico no card
- **Filtro**: Clicar em filtro de épico e verificar que apenas tarefas daquele épico aparecem
- **Ordenação**: Verificar que tarefas aparecem da mais antiga para a mais nova no Kanban
- **Tags visuais**: Confirmar que tags aparecem como pills coloridos nos cards de tarefas
- **RLS**: Testar com diferentes usuários para garantir isolamento de dados

## Decisions

- **Épicos por projeto**: Cada projeto tem seus próprios épicos (não são compartilhados) - permite contextos isolados e flexibilidade
- **Vínculo opcional**: Tasks podem existir sem épico (epic_id nullable) - não força adoção imediata
- **Modal separada para CRUD de épicos**: Interface dedicada facilita gestão antes de criar tasks
- **Filtro no Kanban**: Solução mais integrada ao fluxo atual, evita navegação adicional
- **Ordenação ascending**: Inversão para `ascending: true` mostra as tasks mais antigas primeiro (FIFO), priorizando trabalho pendente mais antigo
- **Join otimizado**: Query com `.select('*, epic:epics(id, name)')` traz dados do épico sem queries adicionais

## Contexto Técnico

### Estrutura Atual do Projeto

**Modelos:**
- `Task`: `id`, `created_at`, `updated_at`, `user_id`, `project_id`, `title`, `description`, `status`, `completed_at`, `tags[]`
- `Project`: Sistema existente de projetos com RLS

**Padrões Arquiteturais:**
- Angular 20+ com Signals API
- Standalone Components (sem NgModules)
- Reactive Forms com FormBuilder
- Dependency Injection via `inject()`
- Control Flow Syntax (`@if`, `@for`)
- Design System: Catppuccin Mocha theme

**Services Existentes:**
- `task.service.ts`: CRUD com Signals reactivos, NgZone, ordenação por `created_at DESC`
- `project.service.ts`: Gestão de projetos

**Componentes:**
- `projects.component`: Lista de projetos com filtros
- `tasks-modal.component`: Kanban de 3 colunas (backlog, fazendo, concluída)

### Melhorias Identificadas

1. **Tags não exibidas nos cards**: Apesar de existirem no modelo e serem editáveis, tags não aparecem visualmente no Kanban
2. **Ordenação invertida**: Requisito pede mais antigas primeiro (FIFO), mas atual é DESC (mais recentes primeiro)
3. **Necessidade de agrupamento**: Épicos permitirão organização hierárquica das tasks

### Considerações de Performance

- Usar joins do Supabase para evitar N+1 queries
- Índices otimizados para queries frequentes (`project_id`, `epic_id`)
- Computed signals para evitar recálculos desnecessários
- RLS no banco garante segurança sem lógica adicional no frontend
