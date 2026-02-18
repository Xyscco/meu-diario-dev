-- Schema do Supabase para DevContext - Versão 2 (Completa)
-- Use este arquivo como referência da estrutura final
-- Para projetos novos, execute schema-v1.sql + schema-v2-migration.sql
-- OU execute este arquivo completo de uma vez

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
-- 3. Tabela de entradas de log
-- ==========================================
CREATE TABLE log_entries (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    project TEXT NOT NULL,
    last_task TEXT NOT NULL,
    next_steps TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Índices para performance
CREATE INDEX idx_log_entries_user_created 
ON log_entries(user_id, created_at DESC);

CREATE INDEX idx_log_entries_project_id 
ON log_entries(project_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE log_entries ENABLE ROW LEVEL SECURITY;

-- Policy: usuários só veem seus próprios dados
CREATE POLICY "Users can view own logs"
ON log_entries FOR SELECT
USING (auth.uid() = user_id);

-- Policy: usuários só inserem com seu próprio user_id
CREATE POLICY "Users can insert own logs"
ON log_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: usuários podem atualizar seus próprios dados
CREATE POLICY "Users can update own logs"
ON log_entries FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: usuários podem deletar seus próprios dados
CREATE POLICY "Users can delete own logs"
ON log_entries FOR DELETE
USING (auth.uid() = user_id);

-- ==========================================
-- 4. Tabela de versionamento de schema
-- ==========================================
CREATE TABLE schema_versions (
    id SERIAL PRIMARY KEY,
    version TEXT NOT NULL UNIQUE,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT
);

-- Inserir versões
INSERT INTO schema_versions (version, description) VALUES
    ('v1', 'Schema inicial com log_entries'),
    ('v2', 'Adicionado suporte a múltiplos projetos');
