export type ProjectStatus = 'Aguardando' | 'Em execução' | 'Pausado' | 'Finalizado' | 'Cancelado';

export interface Project {
    id?: string;           // UUID
    created_at?: string;   // Timestamp ISO
    updated_at?: string;   // Timestamp ISO
    user_id?: string;      // UUID do usuário
    name: string;          // Nome do projeto
    description?: string;  // Descrição do projeto
    status: ProjectStatus; // Status do projeto
}

export const PROJECT_STATUS_LIST: ProjectStatus[] = [
    'Aguardando',
    'Em execução',
    'Pausado',
    'Finalizado',
    'Cancelado'
];

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
    'Aguardando': '#f5c2e7',    // Pink
    'Em execução': '#a6e3a1',   // Green
    'Pausado': '#f9e2af',       // Yellow
    'Finalizado': '#94e2d5',    // Cyan
    'Cancelado': '#f38ba8'      // Red
};
