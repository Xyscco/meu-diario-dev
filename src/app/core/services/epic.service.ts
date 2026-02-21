import { Injectable, signal, NgZone } from '@angular/core';
import { supabase } from '../config/supabase.config';
import { Epic } from '../models/epic.model';

@Injectable({
    providedIn: 'root'
})
export class EpicService {
    epics = signal<Epic[]>([]);
    isLoading = signal<boolean>(false);

    constructor(private ngZone: NgZone) {}

    async loadProjectEpics(projectId: string): Promise<Epic[]> {
        try {
            this.isLoading.set(true);
            const { data, error } = await supabase
                .from('epics')
                .select('*')
                .eq('project_id', projectId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.ngZone.run(() => {
                this.epics.set(data || []);
            });

            return data || [];
        } catch (error) {
            console.error('Erro ao carregar épicos:', error);
            return [];
        } finally {
            this.isLoading.set(false);
        }
    }

    async createEpic(
        projectId: string,
        name: string,
        focus?: string
    ): Promise<{ success: boolean; error?: string; epic?: Epic }> {
        try {
            // Obter o user_id do usuário autenticado
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user?.id) {
                throw new Error('Usuário não autenticado');
            }

            const { data, error } = await supabase
                .from('epics')
                .insert({
                    project_id: projectId,
                    name,
                    focus,
                    user_id: user.id
                })
                .select()
                .single();

            if (error) throw error;

            this.ngZone.run(() => {
                this.epics.update(epics => [data, ...epics]);
            });

            return { success: true, epic: data };
        } catch (error: any) {
            const errorMessage = error?.message || 'Erro ao criar épico.';
            console.error('Erro ao criar épico:', errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    async updateEpic(epicId: string, updates: Partial<Epic>): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await supabase
                .from('epics')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', epicId);

            if (error) throw error;

            this.ngZone.run(() => {
                this.epics.update(epics =>
                    epics.map(e => e.id === epicId ? { ...e, ...updates } : e)
                );
            });

            return { success: true };
        } catch (error: any) {
            const errorMessage = error?.message || 'Erro ao atualizar épico.';
            console.error('Erro ao atualizar épico:', errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    async deleteEpic(epicId: string): Promise<{ success: boolean; error?: string }> {
        try {
            const { error } = await supabase
                .from('epics')
                .delete()
                .eq('id', epicId);

            if (error) throw error;

            this.ngZone.run(() => {
                this.epics.update(epics => epics.filter(e => e.id !== epicId));
            });

            return { success: true };
        } catch (error: any) {
            const errorMessage = error?.message || 'Erro ao deletar épico.';
            console.error('Erro ao deletar épico:', errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    getProjectEpics(projectId: string): Epic[] {
        return this.epics().filter(e => e.project_id === projectId);
    }
}
