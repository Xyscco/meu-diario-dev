-- Schema do Supabase para DevContext - Migração V1 → V2
-- Execute este SQL apenas se você já tinha a V1 (log_entries) criada
-- Este arquivo adiciona suporte a múltiplos projetos

-- ==========================================
-- 1. Criar Enum para status do projeto
-- ==========================================
CREATE TYPE project_status AS ENUM (
    'Aguardando',
    'Em execução',
    'Pausado',
    'Finalizado',
    'Cancelado'
);

-- ==========================================
-- 2. Criar tabela de projetos
-- ==========================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status project_status DEFAULT 'Aguardando'
);

-- Índice para performance
CREATE INDEX idx_projects_user_created 
ON projects(user_id, created_at DESC);

-- Habilitar RLS para projetos
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: usuários só veem seus próprios projetos
CREATE POLICY "Users can view own projects"
ON projects FOR SELECT
USING (auth.uid() = user_id);

-- Policy: usuários só inserem com seu próprio user_id
CREATE POLICY "Users can insert own projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: usuários podem atualizar seus próprios projetos
CREATE POLICY "Users can update own projects"
ON projects FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: usuários podem deletar seus próprios projetos
CREATE POLICY "Users can delete own projects"
ON projects FOR DELETE
USING (auth.uid() = user_id);

-- ==========================================
-- 3. Alterar tabela log_entries para adicionar project_id
-- ==========================================
ALTER TABLE log_entries ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- Criar índice para project_id
CREATE INDEX idx_log_entries_project_id 
ON log_entries(project_id);

-- ==========================================
-- 4. Tabela de versionamento de schema (opcional)
-- ==========================================
CREATE TABLE schema_versions (
    id SERIAL PRIMARY KEY,
    version TEXT NOT NULL UNIQUE,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT
);

-- Inserir versões já aplicadas
INSERT INTO schema_versions (version, description) VALUES
    ('v1', 'Schema inicial com log_entries'),
    ('v2', 'Adicionado suporte a múltiplos projetos');
