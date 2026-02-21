import { Component, inject, OnInit, signal, computed, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LogService } from '../../../core/services/log.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectService } from '../../../core/services/project.service';
import { LogEntry } from '../../../core/models/log-entry.model';

@Component({
    selector: 'app-daily-report',
    standalone: true,
    imports: [CommonModule, DatePipe],
    templateUrl: './daily-report.component.html'
})
export class DailyReportComponent implements OnInit {
    logService = inject(LogService);
    authService = inject(AuthService);
    projectService = inject(ProjectService);

    backToDiary = output<void>();
    backToProjects = output<void>();

    readonly currentProject = this.projectService.currentProject;
    allEntries = signal<LogEntry[]>([]);
    currentTime = Date.now();

    // Computed properties para separar as entradas
    todayCompleted = computed(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return this.allEntries().filter(entry => {
            const entryDate = new Date(entry.created_at);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === today.getTime() && !entry.is_next_day_task;
        });
    });

    nextDayTasks = computed(() => {
        return this.allEntries().filter(entry => entry.is_next_day_task === true);
    });

    impediments = computed(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return this.allEntries().filter(entry => {
            const entryDate = new Date(entry.created_at);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === today.getTime() && entry.impediments && entry.impediments.trim() !== '';
        });
    });

    constructor() {
        setInterval(() => this.currentTime = Date.now(), 60000);
    }

    async ngOnInit() {
        const project = this.currentProject();
        const logs = await this.logService.getLogs(project?.id);
        this.allEntries.set(logs);
    }

    goBackToDiary() {
        this.backToDiary.emit();
    }

    goBackToProjects() {
        this.backToProjects.emit();
    }

    logout() {
        this.authService.logout();
    }

    copyReportToClipboard() {
        const report = this.generateTextReport();
        navigator.clipboard.writeText(report).then(() => {
            alert('Relatório copiado para a área de transferência!');
        });
    }

    private generateTextReport(): string {
        let report = '🗓️ Hoje (Realizado)\\n';
        
        this.todayCompleted().forEach(entry => {
            report += `${entry.project}: ${entry.last_task}\\n`;
        });

        report += '\\n➡️ Próximo Dia (Foco)\\n';
        
        this.nextDayTasks().forEach(entry => {
            report += `${entry.project}: ${entry.next_steps}\\n`;
        });

        report += '\\n🚫 Impedimentos\\n';
        
        if (this.impediments().length === 0) {
            report += 'Sem impedimentos.\\n';
        } else {
            this.impediments().forEach(entry => {
                report += `${entry.project}: ${entry.impediments}\\n`;
            });
        }

        return report;
    }
}
