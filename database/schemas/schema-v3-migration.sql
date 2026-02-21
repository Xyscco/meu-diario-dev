-- Migração v3: Adicionar campos para relatório diário
-- Adiciona campos is_next_day_task e impediments à tabela log_entries

-- Adicionar coluna is_next_day_task
ALTER TABLE log_entries 
ADD COLUMN IF NOT EXISTS is_next_day_task BOOLEAN DEFAULT false;

-- Adicionar coluna impediments
ALTER TABLE log_entries 
ADD COLUMN IF NOT EXISTS impediments TEXT;

-- Criar índice para facilitar queries de relatórios diários
CREATE INDEX IF NOT EXISTS idx_log_entries_next_day 
ON log_entries(user_id, is_next_day_task, created_at DESC) 
WHERE is_next_day_task = true;

-- Atualizar versão do schema
INSERT INTO schema_versions (version, description) VALUES
    ('v3', 'Adicionado campos para relatório diário: is_next_day_task e impediments')
ON CONFLICT (version) DO NOTHING;
