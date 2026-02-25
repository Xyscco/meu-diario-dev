import { Injectable, signal, NgZone } from '@angular/core';
import { supabase } from '../config/supabase.config';
import { Project, ProjectStatus, ProjectEnvironment } from '../models/project.model';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    projects = signal<Project[]>([]);
    currentProject = signal<Project | null>(null);
    isLoading = signal<boolean>(false);

    constructor(private ngZone: NgZone) {
        this.loadProjects();
    }

    async loadProjects(): Promise<void> {
        try {
            this.isLoading.set(true);
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.ngZone.run(() => {
                this.projects.set(data || []);
            });
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
        } finally {
            this.isLoading.set(false);
        }
    }

    async createProject(
        name: string,
        description?: string,
        status: ProjectStatus = 'Aguardando',
        environment?: ProjectEnvironment
    ): Promise<{ success: boolean; error?: string; project?: Project }> {
        try {
            // Obter o user_id do usuário autenticado
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user?.id) {
                throw new Error('Usuário não autenticado');
            }

            const { data, error } = await supabase
                .from('projects')
                .insert({
                    name,
                    description,
                    status,
                    environment,
                    user_id: user.id
                })
                .select()
                .single();

            if (error) throw error;

            this.ngZone.run(() => {
                this.projects.update(projects => [data, ...projects]);
            });

            return { success: true, project: data };
        } catch (error: any) {
            const errorMessage = error?.message || 'Erro ao criar projeto.';
            console.error('Erro ao criar projeto:', errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    async updateProjectStatus(projectId: string, status: ProjectStatus): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await supabase
                .from('projects')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', projectId);

            if (error) throw error;

            this.ngZone.run(() => {
                this.projects.update(projects =>
                    projects.map(p => p.id === projectId ? { ...p, status } : p)
                );
            });

            return { success: true };
        } catch (error: any) {
            const errorMessage = error?.message || 'Erro ao atualizar status.';
            console.error('Erro ao atualizar status:', errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    async updateProject(projectId: string, updates: Partial<Project>): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await supabase
                .from('projects')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', projectId);

            if (error) throw error;

            this.ngZone.run(() => {
                this.projects.update(projects =>
                    projects.map(p => p.id === projectId ? { ...p, ...updates } : p)
                );
            });

            return { success: true };
        } catch (error: any) {
            const errorMessage = error?.message || 'Erro ao atualizar projeto.';
            console.error('Erro ao atualizar projeto:', errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    async deleteProject(projectId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId);

            if (error) throw error;

            this.ngZone.run(() => {
                this.projects.update(projects => projects.filter(p => p.id !== projectId));
                if (this.currentProject()?.id === projectId) {
                    this.currentProject.set(null);
                }
            });

            return { success: true };
        } catch (error: any) {
            const errorMessage = error?.message || 'Erro ao deletar projeto.';
            console.error('Erro ao deletar projeto:', errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    setCurrentProject(project: Project | null): void {
        this.currentProject.set(project);
    }

    getActiveProjects(): Project[] {
        return this.projects().filter(p => 
            p.status === 'Aguardando' || p.status === 'Em execução'
        );
    }
}
