export interface LogEntry {
    uuid?: string;         // UUID do PostgreSQL
    created_at: string;    // Timestamp ISO compatível com TIMESTAMPTZ
    user_id?: string;      // UUID do usuário (auth.users)
    project: string;       // Nome do projeto/contexto
    last_task: string;     // Descrição do trabalho realizado
    next_steps: string;    // Próximas ações críticas
    tags: string[];        // Array nativo (compatível com PostgreSQL TEXT[])
}
