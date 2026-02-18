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
import { LogDetailModalComponent } from './components/log-detail-modal/log-detail-modal.component';

@Component({
    selector: 'app-diary',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, IconMic, IconSave, IconDatabase, LogDetailModalComponent],
    templateUrl: './diary.component.html',
    styles: [`
    /* Custom Scrollbar for dark theme */
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #181825; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #45475a; border-radius: 3px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #585b70; }
    
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

    backToProjects = output<void>();

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

    openDetail(entry: LogEntry) {
        this.selectedEntryForModal.set(entry);
    }

    closeDetail() {
        this.selectedEntryForModal.set(null);
    }

    // Computed
    latestEntry = computed(() => this.entries().length > 0 ? this.entries()[0] : null);
    history = computed(() => this.entries().slice(1));

    availableTags = ['Backend', 'Frontend', 'Database', 'Meeting', 'Bugfix', 'Deploy'];
    selectedTags: string[] = [];

    recognition: any;

    logForm: FormGroup = this.fb.group({
        project: ['', Validators.required],
        last_task: ['', Validators.required],
        next_steps: ['', Validators.required]
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

        // Carregar logs do projeto
        const logs = await this.logService.getLogs(project?.id);
        this.entries.set(logs);

        // Add online/offline listeners
        window.addEventListener('online', this.updateOnlineStatus);
        window.addEventListener('offline', this.updateOnlineStatus);
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
            tags: [...this.selectedTags]
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
