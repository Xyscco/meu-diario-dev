import { Injectable, NgZone, inject } from '@angular/core';
import { LogEntry } from '../models/log-entry.model';
import { supabase } from '../config/supabase.config';

@Injectable({
    providedIn: 'root'
})
export class LogService {
    private ngZone = inject(NgZone);

    async getLogs(projectId?: string): Promise<LogEntry[]> {
        try {
            let query = supabase
                .from('log_entries')
                .select('*');

            // Se projectId foi fornecido, filtrar por ele
            if (projectId) {
                query = query.eq('project_id', projectId);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) throw error;

            return new Promise((resolve) => {
                this.ngZone.run(() => {
                    resolve(data || []);
                });
            });
        } catch (error) {
            console.error('Erro ao carregar logs do Supabase:', error);
            this.handleOffline(error);
            return [];
        }
    }

    async saveLog(entry: LogEntry, currentEntries: LogEntry[], projectId?: string): Promise<LogEntry[]> {
        try {
            // Adicionar user_id automaticamente
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) throw new Error('Usuário não autenticado');

            const entryWithUser: any = {
                ...entry,
                user_id: user.id
            };

            // Adicionar project_id se fornecido
            if (projectId) {
                entryWithUser.project_id = projectId;
            }

            const { data, error } = await supabase
                .from('log_entries')
                .insert(entryWithUser)
                .select()
                .single();

            if (error) throw error;

            // Atualização otimista - prepend local
            return new Promise((resolve) => {
                this.ngZone.run(() => {
                    resolve([data, ...currentEntries]);
                });
            });
        } catch (error) {
            console.error('Erro ao salvar log:', error);
            this.handleOffline(error);
            throw error;
        }
    }

    private handleOffline(error: any): void {
        if (error.message?.includes('Failed to fetch') || !navigator.onLine) {
            // Emitir evento ou signal para exibir banner de offline
            console.error('Aplicação requer conexão com internet');
        }
    }
}
