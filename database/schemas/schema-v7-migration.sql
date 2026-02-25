-- Migração v7: Adicionar coluna 'environment' à tabela projects
-- Adiciona um campo para armazenar em qual ambiente o projeto está: Syncode, Adaptei, Kodasys ou Pessoal

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS environment VARCHAR(50);

-- Criar constraint para garantir valores válidos
ALTER TABLE projects
ADD CONSTRAINT check_valid_environment CHECK (
    environment IS NULL OR 
    environment IN ('Syncode', 'Adaptei', 'Kodasys', 'Pessoal')
);

-- Criar índice para otimizar queries por environment
CREATE INDEX IF NOT EXISTS idx_projects_environment ON projects(environment) WHERE environment IS NOT NULL;

-- Atualizar versão do schema
INSERT INTO schema_versions (version, description) VALUES
    ('v7', 'Adicionada coluna environment à tabela projects para classificação por ambiente')
ON CONFLICT (version) DO NOTHING;
