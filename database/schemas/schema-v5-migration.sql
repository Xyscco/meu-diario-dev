-- Migração v5: Adicionar coluna 'tags' à tabela tasks
-- Adiciona um array de texto para armazenar tags associadas a cada tarefa

ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::text[];

-- (Opcional) Criar índice GIN se desejar buscas por tags mais eficientes
-- CREATE INDEX IF NOT EXISTS idx_tasks_tags_gin ON tasks USING GIN (tags);

-- Atualizar versão do schema
INSERT INTO schema_versions (version, description) VALUES
    ('v5', 'Adicionada coluna tags (text[]) à tabela tasks')
ON CONFLICT (version) DO NOTHING;
