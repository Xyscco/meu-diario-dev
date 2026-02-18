import { Injectable, NgZone, inject } from '@angular/core';
import { LogEntry } from '../models/log-entry.model';

@Injectable({
    providedIn: 'root'
})
export class LogService {
    private ngZone = inject(NgZone);
    private isElectron = !!window.electronAPI;

    async getLogs(): Promise<LogEntry[]> {
        console.log('LogService: getLogs called. isElectron:', this.isElectron, 'window.electronAPI:', !!window.electronAPI);
        if (this.isElectron && window.electronAPI) {
            try {
                const logs = await window.electronAPI.getLogs();
                console.log('LogService: Logs received from Electron:', logs);
                return new Promise((resolve) => {
                    this.ngZone.run(() => {
                        resolve(logs);
                    });
                });
            } catch (error) {
                console.error('Erro ao carregar do SQLite:', error);
                return [];
            }
        } else {
            // Fallback LocalStorage
            const saved = localStorage.getItem('sqlite_mock_logs');
            return saved ? JSON.parse(saved) : [];
        }
    }

    async saveLog(entry: LogEntry, currentEntries: LogEntry[]): Promise<LogEntry[]> {
        if (this.isElectron && window.electronAPI) {
            // Salva via IPC no SQLite
            await window.electronAPI.saveLog(entry);
            // Recarrega a lista
            return this.getLogs();
        } else {
            // Fallback
            const updated = [entry, ...currentEntries];
            localStorage.setItem('sqlite_mock_logs', JSON.stringify(updated));
            return updated;
        }
    }
}
