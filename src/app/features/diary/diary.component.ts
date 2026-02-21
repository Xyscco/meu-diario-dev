import { Component, signal, computed, inject, OnInit, OnDestroy, NgZone, output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IconMic } from '../../shared/icons/icon-mic.component';
import { IconSave } from '../../shared/icons/icon-save.component';
import { IconDatabase } from '../../shared/icons/icon-database.component';
import { LogService } from '../../core/services/log.service';
import { LogEntry } from '../../core/models/log-entry.model';
import { AuthService } from '../../core/services/auth.service';
import { ProjectService } from '../../core/services/project.service';
import { TaskService } from '../../core/services/task.service';
import { LogDetailModalComponent } from './components/log-detail-modal/log-detail-modal.component';

@Component({
    selector: 'app-diary',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, IconMic, IconSave, IconDatabase, LogDetailModalComponent],
    templateUrl: './diary.component.html',
    styles: [`
    .draggable-region {
      -webkit-app-region: drag; /* Electron specific: makes div draggable */
    }
  `]
})
export class DiaryComponent implements OnInit, OnDestroy {
    fb = inject(FormBuilder);
    ngZone = inject(NgZone);
    logService = inject(LogService);
    authService = inject(AuthService);
    projectService = inject(ProjectService);
    taskService = inject(TaskService);

    backToProjects = output<void>();
    goToDailyReport = output<void>();

    // State
    entries = signal<LogEntry[]>([]);
    isListening = signal<boolean>(false);
    isOnline = signal<boolean>(navigator.onLine);
    isSaving = signal<boolean>(false);
    currentTime = Date.now();

    selectedEntryForModal = signal<LogEntry | null>(null);

    readonly currentProject = this.projectService.currentProject;

    logout() {
        this.authService.logout();
    }

    goBackToProjects() {
        this.backToProjects.emit();
    }

    navigateToDailyReport() {
        this.goToDailyReport.emit();
    }

    openDetail(entry: LogEntry) {
        this.selectedEntryForModal.set(entry);
    }

    closeDetail() {
        this.selectedEntryForModal.set(null);
    }

    // Computed
    latestEntry = computed(() => this.entries().length > 0 ? this.entries()[0] : null);
    history = computed(() => this.entries().slice(1));
    completedTasks = computed(() => {
        const project = this.currentProject();
        if (!project?.id) return [];
        return this.taskService.getCompletedTasks(project.id);
    });

    availableTags = ['Backend', 'Frontend', 'Database', 'Meeting', 'Bugfix', 'Deploy', 'Conversão de dados', 'Suporte'];
    selectedTags: string[] = [];

    recognition: any;

    logForm: FormGroup = this.fb.group({
        project: ['', Validators.required],
        last_task: ['', Validators.required],
        next_steps: ['', Validators.required],
        is_next_day_task: [false],
        impediments: ['']
    });

    constructor() {
        setInterval(() => this.currentTime = Date.now(), 60000);
        this.initSpeechRecognition();
    }

    async ngOnInit() {
        // Se há um projeto selecionado, preenchê-lo no formulário
        const project = this.currentProject();
        if (project?.name) {
            this.logForm.patchValue({ project: project.name });
        }

        // Carregar tarefas do projeto
        if (project?.id) {
            await this.taskService.loadProjectTasks(project.id);
            // Pré-preencher o campo last_task com tarefas concluídas
            this.populateLastTaskWithCompletedTasks(project.id);
        }

        // Carregar logs do projeto
        const logs = await this.logService.getLogs(project?.id);
        this.entries.set(logs);

        // Add online/offline listeners
        window.addEventListener('online', this.updateOnlineStatus);
        window.addEventListener('offline', this.updateOnlineStatus);
    }

    private populateLastTaskWithCompletedTasks(projectId: string) {
        const completedTasks = this.taskService.getCompletedTasks(projectId);
        if (completedTasks.length > 0) {
            const taskTitles = completedTasks.map(t => `✓ ${t.title}`).join(', ');
            this.logForm.patchValue({ last_task: taskTitles });
        }
    }

    ngOnDestroy() {
        if (this.recognition) this.recognition.abort();
        window.removeEventListener('online', this.updateOnlineStatus);
        window.removeEventListener('offline', this.updateOnlineStatus);
    }

    private updateOnlineStatus = () => {
        this.ngZone.run(() => {
            this.isOnline.set(navigator.onLine);
        });
    };

    async onSubmit() {
        if (this.logForm.invalid || !this.isOnline()) return;

        this.isSaving.set(true);
        const formVal = this.logForm.value;
        const projectId = this.currentProject()?.id;

        const newEntry: LogEntry = {
            uuid: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            project_id: projectId,
            project: formVal.project,
            last_task: formVal.last_task,
            next_steps: formVal.next_steps,
            tags: [...this.selectedTags],
            is_next_day_task: formVal.is_next_day_task || false,
            impediments: formVal.impediments || ''
        };

        try {
            const updatedLogs = await this.logService.saveLog(newEntry, this.entries(), projectId);
            this.entries.set(updatedLogs);
            this.logForm.reset();
            this.selectedTags = [];
        } catch (error) {
            console.error('Falha ao salvar. Verifique sua conexão com internet.');
        } finally {
            this.isSaving.set(false);
        }

        this.logForm.patchValue({
            is_next_day_task: false,
            impediments: '',
            last_task: '',
            next_steps: ''
        });
    }

    parseTags(tags: string[]): string[] {
        return tags || [];
    }

    toggleTag(tag: string) {
        if (this.selectedTags.includes(tag)) {
            this.selectedTags = this.selectedTags.filter(t => t !== tag);
        } else {
            this.selectedTags.push(tag);
        }
    }

    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            // @ts-ignore
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.lang = 'pt-BR';

            this.recognition.onstart = () => this.ngZone.run(() => this.isListening.set(true));
            this.recognition.onend = () => this.ngZone.run(() => this.isListening.set(false));

            this.recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                this.ngZone.run(() => {
                    const currentVal = this.logForm.get('next_steps')?.value || '';
                    this.logForm.patchValue({ next_steps: currentVal ? `${currentVal} ${transcript}` : transcript });
                });
            };
        }
    }

    toggleListening() {
        if (!this.recognition) return alert('Reconhecimento de voz não suportado neste ambiente.');
        this.isListening() ? this.recognition.stop() : this.recognition.start();
    }
}
