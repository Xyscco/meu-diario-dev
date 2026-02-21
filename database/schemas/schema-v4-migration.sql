-- Migração v4: Adicionar tabela de tarefas (tasks)
-- Cria a tabela tasks para gerenciar TODOs por projeto

-- ==========================================
-- 1. Criar Enum para status de tarefa
-- ==========================================
CREATE TYPE task_status AS ENUM (
    'backlog',
    'fazendo',
    'concluida'
);

-- ==========================================
-- 2. Criar tabela de tarefas
-- ==========================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status task_status DEFAULT 'backlog',
    completed_at TIMESTAMPTZ
);

-- Índices para performance
CREATE INDEX idx_tasks_project_id 
ON tasks(project_id, status, created_at DESC);

CREATE INDEX idx_tasks_user_project 
ON tasks(user_id, project_id);

CREATE INDEX idx_tasks_completed 
ON tasks(project_id, status) 
WHERE status = 'concluida';

-- Habilitar RLS (Row Level Security)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: usuários só veem suas próprias tarefas
CREATE POLICY "Users can view own tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id);

-- Policy: usuários só inserem com seu próprio user_id
CREATE POLICY "Users can insert own tasks"
ON tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: usuários podem atualizar suas próprias tarefas
CREATE POLICY "Users can update own tasks"
ON tasks FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: usuários podem deletar suas próprias tarefas
CREATE POLICY "Users can delete own tasks"
ON tasks FOR DELETE
USING (auth.uid() = user_id);

-- ==========================================
-- 3. Atualizar versão do schema
-- ==========================================
INSERT INTO schema_versions (version, description) VALUES
    ('v4', 'Adicionada tabela de tarefas (tasks) para gerenciar TODOs por projeto')
ON CONFLICT (version) DO NOTHING;
