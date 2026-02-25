export type ProjectStatus = 'Aguardando' | 'Em execução' | 'Pausado' | 'Finalizado' | 'Cancelado';
export type ProjectEnvironment = 'Syncode' | 'Adaptei' | 'Kodasys' | 'Pessoal';

export interface Project {
    id?: string;           // UUID
    created_at?: string;   // Timestamp ISO
    updated_at?: string;   // Timestamp ISO
    user_id?: string;      // UUID do usuário
    name: string;          // Nome do projeto
    description?: string;  // Descrição do projeto
    status: ProjectStatus; // Status do projeto
    environment?: ProjectEnvironment; // Ambiente do projeto
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

export const PROJECT_ENVIRONMENT_LIST: ProjectEnvironment[] = [
    'Syncode',
    'Adaptei',
    'Kodasys',
    'Pessoal'
];

export const PROJECT_ENVIRONMENT_COLORS: Record<ProjectEnvironment, string> = {
    'Syncode': '#89b4fa',       // Blue
    'Adaptei': '#cba6f7',       // Mauve
    'Kodasys': '#f38ba8',       // Red
    'Pessoal': '#a6e3a1'        // Green
};
