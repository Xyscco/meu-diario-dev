import { Epic } from './epic.model';

export type TaskStatus = 'backlog' | 'fazendo' | 'concluida';

export interface Task {
    id?: string;           // UUID
    created_at?: string;   // Timestamp ISO
    updated_at?: string;   // Timestamp ISO
    user_id?: string;      // UUID do usuário
    project_id: string;    // UUID do projeto (obrigatório)
    title: string;         // Título da tarefa
    description?: string;  // Descrição da tarefa
    status: TaskStatus;    // Status: backlog, fazendo ou concluida
    completed_at?: string | null; // Data de conclusão (quando status = concluida)
    tags?: string[];       // Tags associadas à tarefa
    epic_id?: string;      // UUID do épico (opcional)
    epic?: Epic;           // Dados do épico (quando incluído via join)
}

export const TASK_STATUS_LIST: TaskStatus[] = [
    'backlog',
    'fazendo',
    'concluida'
];

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
    'backlog': '#f5c2e7',     // Pink
    'fazendo': '#a6e3a1',     // Green
    'concluida': '#94e2d5'    // Cyan
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
    'backlog': 'Backlog',
    'fazendo': 'Fazendo',
    'concluida': 'Concluída'
};
