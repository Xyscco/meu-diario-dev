-- Migração v6: Adicionar sistema de épicos
-- Cria tabela de épicos e vincula tasks aos épicos para melhor organização

-- 1. Criar tabela de épicos
CREATE TABLE IF NOT EXISTS epics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    focus TEXT
);

-- 2. Adicionar coluna epic_id à tabela tasks
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS epic_id UUID REFERENCES epics(id) ON DELETE SET NULL;

-- 3. Criar índices para otimizar queries
CREATE INDEX IF NOT EXISTS idx_epics_project_id ON epics(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_epics_user_project ON epics(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_epic_id ON tasks(epic_id);

-- 4. Configurar Row-Level Security (RLS) para épicos
ALTER TABLE epics ENABLE ROW LEVEL SECURITY;

-- Policy para SELECT
CREATE POLICY "Users can view their own epics"
    ON epics FOR SELECT
    USING (auth.uid() = user_id);

-- Policy para INSERT
CREATE POLICY "Users can insert their own epics"
    ON epics FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy para UPDATE
CREATE POLICY "Users can update their own epics"
    ON epics FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy para DELETE
CREATE POLICY "Users can delete their own epics"
    ON epics FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Adicionar trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_epics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_epics_updated_at
    BEFORE UPDATE ON epics
    FOR EACH ROW
    EXECUTE FUNCTION update_epics_updated_at();

-- 6. Atualizar versão do schema
INSERT INTO schema_versions (version, description) VALUES
    ('v6', 'Adicionada tabela epics e coluna epic_id em tasks para sistema de épicos')
ON CONFLICT (version) DO NOTHING;
