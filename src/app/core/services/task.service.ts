import { Injectable, signal, NgZone } from '@angular/core';
import { supabase } from '../config/supabase.config';
import { Task, TaskStatus } from '../models/task.model';

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    tasks = signal<Task[]>([]);
    isLoading = signal<boolean>(false);

    constructor(private ngZone: NgZone) {}

    private normalizeStatus(raw?: string | null): TaskStatus {
        if (!raw) return 'backlog';
        const s = String(raw).toLowerCase();
        if (s === 'concluída' || s === 'concluida' || s === 'finalizado' || s === 'finalizada') return 'concluida';
        if (s === 'fazendo' || s === 'em execução' || s === 'em execucao') return 'fazendo';
        return 'backlog';
    }

    async loadProjectTasks(projectId: string): Promise<Task[]> {
        try {
            this.isLoading.set(true);
            const { data, error } = await supabase
                .from('tasks')
                .select('*, epic:epics(id, name)')
                .eq('project_id', projectId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            this.ngZone.run(() => {
                // Normaliza o status vindo do banco para os valores esperados pelo frontend
                const normalized = (data || []).map((t: any) => ({
                    ...t,
                    status: this.normalizeStatus(t.status),
                }));
                this.tasks.set(normalized as Task[]);
            });

            return data || [];
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
            return [];
        } finally {
            this.isLoading.set(false);
        }
    }

    async createTask(
        projectId: string,
        title: string,
        description?: string,
        status: TaskStatus = 'backlog',
        tags: string[] = [],
        epic_id?: string
    ): Promise<{ success: boolean; error?: string; task?: Task }> {
        try {
            // Obter o user_id do usuário autenticado
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user?.id) {
                throw new Error('Usuário não autenticado');
            }

            const { data, error } = await supabase
                .from('tasks')
                .insert({
                    project_id: projectId,
                    title,
                    description,
                    status,
                    tags,
                    epic_id: epic_id || null,
                    user_id: user.id
                })
                .select('*, epic:epics(id, name)')
                .single();

            if (error) throw error;

            this.ngZone.run(() => {
                const task = { ...data, status: this.normalizeStatus((data as any)?.status), tags: (data as any)?.tags || [] } as Task;
                this.tasks.update(tasks => [task, ...tasks]);
            });

            return { success: true, task: data };
        } catch (error: any) {
            const errorMessage = error?.message || 'Erro ao criar tarefa.';
            console.error('Erro ao criar tarefa:', errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    async updateTaskStatus(taskId: string, status: TaskStatus): Promise<{ success: boolean; error?: string }> {
        try {
            const completed_at = status === 'concluida' ? new Date().toISOString() : null;

            // Tenta atualizar com o status fornecido
            let res = await supabase
                .from('tasks')
                .update({ status, updated_at: new Date().toISOString(), completed_at })
                .eq('id', taskId);

            if (res.error) {
                // Se o erro for relacionado ao enum do Postgres, tentamos um fallback (ex.: variantes com acento)
                const msg: string = String(res.error.message || '');
                if (msg.includes('invalid input value for enum task_status')) {
                    // Apenas um fallback conhecido: 'concluida' -> 'concluída'
                    if (status === 'concluida') {
                        const altStatus = 'concluída' as unknown as TaskStatus;
                        const completedAtAlt = new Date().toISOString();
                        const altRes = await supabase
                            .from('tasks')
                            .update({ status: altStatus, updated_at: new Date().toISOString(), completed_at: completedAtAlt })
                            .eq('id', taskId);

                        if (altRes.error) throw altRes.error;

                        // Atualiza o estado local com o status normalizado (frontend usa 'concluida')
                        this.ngZone.run(() => {
                            this.tasks.update(tasks =>
                                tasks.map(t => t.id === taskId ? { ...t, status: this.normalizeStatus(altStatus), completed_at: completedAtAlt } : t)
                            );
                        });

                        return { success: true };
                    }
                }

                throw res.error;
            }


            this.ngZone.run(() => {
                const canonical = this.normalizeStatus(status as string);
                this.tasks.update(tasks =>
                    tasks.map(t => t.id === taskId ? { ...t, status: canonical, completed_at } : t)
                );
            });

            return { success: true };
        } catch (error: any) {
            const errorMessage = error?.message || 'Erro ao atualizar status da tarefa.';
            console.error('Erro ao atualizar tarefa:', errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    async updateTask(taskId: string, updates: Partial<Task>): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await supabase
                .from('tasks')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', taskId);

            if (error) throw error;

            this.ngZone.run(() => {
                const sanitizedUpdates = updates.status ? { ...updates, status: this.normalizeStatus(updates.status as string) } : updates;
                this.tasks.update(tasks =>
                    tasks.map(t => t.id === taskId ? { ...t, ...sanitizedUpdates } : t)
                );
            });

            return { success: true };
        } catch (error: any) {
            const errorMessage = error?.message || 'Erro ao atualizar tarefa.';
            console.error('Erro ao atualizar tarefa:', errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    async deleteTask(taskId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId);

            if (error) throw error;

            this.ngZone.run(() => {
                this.tasks.update(tasks => tasks.filter(t => t.id !== taskId));
            });

            return { success: true };
        } catch (error: any) {
            const errorMessage = error?.message || 'Erro ao deletar tarefa.';
            console.error('Erro ao deletar tarefa:', errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    getCompletedTasks(projectId: string): Task[] {
        return this.tasks().filter(t => t.project_id === projectId && t.status === 'concluida');
    }

    getTasksByStatus(projectId: string, status: TaskStatus): Task[] {
        return this.tasks().filter(t => t.project_id === projectId && t.status === status);
    }
}
