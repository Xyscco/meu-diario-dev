-- Schema do Supabase para DevContext
-- Execute este SQL no SQL Editor do Supabase Dashboard

-- Tabela de entradas de log
CREATE TABLE log_entries (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project TEXT NOT NULL,
    last_task TEXT NOT NULL,
    next_steps TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Índice para performance
CREATE INDEX idx_log_entries_user_created 
ON log_entries(user_id, created_at DESC);

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
