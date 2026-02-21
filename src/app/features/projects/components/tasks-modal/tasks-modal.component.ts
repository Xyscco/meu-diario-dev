import { Component, signal, inject, OnInit, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Project } from '../../../../core/models/project.model';
import { Task, TaskStatus, TASK_STATUS_LIST, TASK_STATUS_COLORS, TASK_STATUS_LABELS } from '../../../../core/models/task.model';
import { Epic } from '../../../../core/models/epic.model';
import { TaskService } from '../../../../core/services/task.service';
import { EpicService } from '../../../../core/services/epic.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
    selector: 'app-tasks-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './tasks-modal.component.html',
    styles: [`
        .draggable-region {
            -webkit-app-region: drag;
        }
    `]
})
export class TasksModalComponent implements OnInit {
    private fb = inject(FormBuilder);
    taskService = inject(TaskService);
    epicService = inject(EpicService);
    notificationService = inject(NotificationService);

    project = input<Project | null>(null);
    closeModal = output<void>();

    showCreateTaskForm = signal(false);
    isCreating = signal(false);
    isDeleting = signal(false);
    errorMessage = signal<string | null>(null);
    filterStatus = signal<TaskStatus | null>(null);
    selectedEpicFilter = signal<string | null>(null);  // null = todos, '' = sem épico, ID = épico específico
    selectedTaskForEdit = signal<Task | null>(null);

    taskStatusList = TASK_STATUS_LIST;
    taskStatusColors = TASK_STATUS_COLORS;
    taskStatusLabels = TASK_STATUS_LABELS;

    projectEpics = signal<Epic[]>([]);

    // Tags (reusing the same available tags from diary)
    availableTags = ['Backend', 'Frontend', 'Database', 'Meeting', 'Bugfix', 'Deploy', 'Conversão de dados', 'Suporte'];
    createSelectedTags: string[] = [];
    editSelectedTags: string[] = [];

    createTaskForm = this.fb.group({
        title: ['', [Validators.required, Validators.minLength(3)]],
        description: [''],
        epic_id: ['']  // Campo para épico (opcional)
    });

    editTaskForm = this.fb.group({
        title: ['', [Validators.required, Validators.minLength(3)]],
        description: [''],
        epic_id: ['']  // Campo para épico (opcional)
    });

    toggleCreateTag(tag: string) {
        if (this.createSelectedTags.includes(tag)) {
            this.createSelectedTags = this.createSelectedTags.filter(t => t !== tag);
        } else {
            this.createSelectedTags.push(tag);
        }
    }

    toggleEditTag(tag: string) {
        if (this.editSelectedTags.includes(tag)) {
            this.editSelectedTags = this.editSelectedTags.filter(t => t !== tag);
        } else {
            this.editSelectedTags.push(tag);
        }
    }

    filteredTasks = computed(() => {
        const proj = this.project();
        if (!proj?.id) return [];

        let allTasks = this.taskService.tasks().filter(t => t.project_id === proj.id);
        const filter = this.filterStatus();
        const epicFilter = this.selectedEpicFilter();

        // Filtro por status
        if (filter !== null) {
            allTasks = allTasks.filter(t => t.status === filter);
        }

        // Filtro por épico
        if (epicFilter !== null) {
            if (epicFilter === '') {
                // Filtrar tarefas sem épico
                allTasks = allTasks.filter(t => !t.epic_id);
            } else {
                // Filtrar tarefas do épico específico
                allTasks = allTasks.filter(t => t.epic_id === epicFilter);
            }
        }

        return allTasks;
    });

    tasksByStatus = computed(() => {
        const proj = this.project();
        if (!proj?.id) return { backlog: [], fazendo: [], concluida: [] };

        let tasks = this.taskService.tasks().filter(t => t.project_id === proj.id);
        const epicFilter = this.selectedEpicFilter();

        // Aplicar filtro por épico
        if (epicFilter !== null) {
            if (epicFilter === '') {
                tasks = tasks.filter(t => !t.epic_id);
            } else {
                tasks = tasks.filter(t => t.epic_id === epicFilter);
            }
        }

        return {
            backlog: tasks.filter(t => t.status === 'backlog'),
            fazendo: tasks.filter(t => t.status === 'fazendo'),
            concluida: tasks.filter(t => t.status === 'concluida')
        };
    });

    async ngOnInit() {
        const proj = this.project();
        if (proj?.id) {
            await this.taskService.loadProjectTasks(proj.id);
            await this.loadEpics();
        }
    }

    async loadEpics() {
        const proj = this.project();
        if (proj?.id) {
            const epics = await this.epicService.loadProjectEpics(proj.id);
            this.projectEpics.set(epics);
        }
    }

    async onCreateTask(): Promise<void> {
        if (this.createTaskForm.invalid || !this.project()?.id) return;

        this.isCreating.set(true);
        this.errorMessage.set(null);

        const { title, description, epic_id } = this.createTaskForm.value;
        const result = await this.taskService.createTask(
            this.project()!.id!,
            title!,
            description || undefined,
            'backlog',
            this.createSelectedTags,
            epic_id || undefined
        );

        if (result.success) {
            this.createTaskForm.reset();
            this.showCreateTaskForm.set(false);
            this.notificationService.showSuccess('Tarefa criada com sucesso.');
        } else {
            this.errorMessage.set(result.error || 'Erro ao criar tarefa.');
        }

        this.isCreating.set(false);
    }

    openEditTask(task: Task) {
        this.selectedTaskForEdit.set(task);
        this.editTaskForm.patchValue({ 
            title: task.title, 
            description: task.description || '',
            epic_id: task.epic_id || ''
        });
        this.editSelectedTags = task.tags ? [...task.tags] : [];
    }

    async onSaveEditTask(): Promise<void> {
        const task = this.selectedTaskForEdit();
        if (!task) return;
        if (this.editTaskForm.invalid) return;

        const { title, description, epic_id } = this.editTaskForm.value;
        const updates: Partial<Task> = {};
        if (title != null) updates.title = title;
        if (description != null) updates.description = description;
        updates.tags = [...this.editSelectedTags];
        if (epic_id !== undefined) updates.epic_id = epic_id || undefined;

        const result = await this.taskService.updateTask(task.id!, updates);
        if (!result.success) {
            this.errorMessage.set(result.error || 'Erro ao atualizar tarefa.');
            return;
        }

        this.selectedTaskForEdit.set(null);
        this.notificationService.showSuccess('Tarefa atualizada com sucesso.');
    }

    async onUpdateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
        const result = await this.taskService.updateTaskStatus(taskId, status);
        if (!result.success) {
            this.errorMessage.set(result.error || 'Erro ao atualizar tarefa.');
            return;
        }

        this.notificationService.showSuccess('Status da tarefa atualizado.');
    }

    async onDeleteTask(taskId: string): Promise<void> {
        if (!confirm('Tem certeza que deseja deletar esta tarefa?')) return;

        this.isDeleting.set(true);
        const result = await this.taskService.deleteTask(taskId);

        if (!result.success) {
            this.errorMessage.set(result.error || 'Erro ao deletar tarefa.');
        } else {
            this.notificationService.showSuccess('Tarefa deletada com sucesso.');
        }

        this.isDeleting.set(false);
    }

    getStatusColor(status: TaskStatus): string {
        return TASK_STATUS_COLORS[status];
    }

    getStatusLabel(status: TaskStatus): string {
        return TASK_STATUS_LABELS[status];
    }

    onClose(): void {
        this.closeModal.emit();
    }
}
