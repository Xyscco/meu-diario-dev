export interface LogEntry {
    id?: number; // SQLite gera ID numérico auto-incremento geralmente, ou UUID string
    uuid?: string;
    created_at: string; // SQLite salva datas como string ISO
    project: string;
    last_task: string;
    next_steps: string;
    tags: string; // No SQLite, salvaremos array como string JSON "['bug','feature']"
}
