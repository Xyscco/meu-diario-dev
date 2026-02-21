export interface LogEntry {
    uuid?: string;         // UUID do PostgreSQL
    created_at: string;    // Timestamp ISO compatível com TIMESTAMPTZ
    user_id?: string;      // UUID do usuário (auth.users)
    project_id?: string;   // UUID do projeto
    project: string;       // Nome do projeto/contexto (legado, para compatibilidade)
    last_task: string;     // Descrição do trabalho realizado
    next_steps: string;    // Próximas ações críticas
    tags: string[];        // Array nativo (compatível com PostgreSQL TEXT[])
    is_next_day_task?: boolean; // Indica se é uma tarefa para o próximo dia
    impediments?: string;  // Impedimentos encontrados
}
