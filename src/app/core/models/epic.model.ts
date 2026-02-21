export interface Epic {
    id?: string;           // UUID
    created_at?: string;   // Timestamp ISO
    updated_at?: string;   // Timestamp ISO
    user_id?: string;      // UUID do usuário
    project_id: string;    // UUID do projeto (obrigatório)
    name: string;          // Nome do épico
    focus?: string;        // Foco/objetivo do épico
}
