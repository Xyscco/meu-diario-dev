import { Component, signal, inject, OnInit, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Project } from '../../../../core/models/project.model';
import { Task, TaskStatus, TASK_STATUS_LIST, TASK_STATUS_COLORS, TASK_STATUS_LABELS } from '../../../../core/models/task.model';
import { TaskService } from '../../../../core/services/task.service';

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

    project = input<Project | null>(null);
    closeModal = output<void>();

    showCreateTaskForm = signal(false);
    isCreating = signal(false);
    isDeleting = signal(false);
    errorMessage = signal<string | null>(null);
    filterStatus = signal<TaskStatus | null>(null);
    selectedTaskForEdit = signal<Task | null>(null);

    taskStatusList = TASK_STATUS_LIST;
    taskStatusColors = TASK_STATUS_COLORS;
    taskStatusLabels = TASK_STATUS_LABELS;

    // Tags (reusing the same available tags from diary)
    availableTags = ['Backend', 'Frontend', 'Database', 'Meeting', 'Bugfix', 'Deploy', 'Conversão de dados', 'Suporte'];
    createSelectedTags: string[] = [];
    editSelectedTags: string[] = [];

    createTaskForm = this.fb.group({
        title: ['', [Validators.required, Validators.minLength(3)]],
        description: ['']
    });

    editTaskForm = this.fb.group({
        title: ['', [Validators.required, Validators.minLength(3)]],
        description: ['']
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

        const allTasks = this.taskService.tasks().filter(t => t.project_id === proj.id);
        const filter = this.filterStatus();

        if (filter === null) {
            return allTasks;
        }

        return allTasks.filter(t => t.status === filter);
    });

    tasksByStatus = computed(() => {
        const proj = this.project();
        if (!proj?.id) return { backlog: [], fazendo: [], concluida: [] };

        const tasks = this.taskService.tasks().filter(t => t.project_id === proj.id);
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
        }
    }

    async onCreateTask(): Promise<void> {
        if (this.createTaskForm.invalid || !this.project()?.id) return;

        this.isCreating.set(true);
        this.errorMessage.set(null);

        const { title, description } = this.createTaskForm.value;
        const result = await this.taskService.createTask(
            this.project()!.id!,
            title!,
            description || undefined,
            'backlog',
            this.createSelectedTags
        );

        if (result.success) {
            this.createTaskForm.reset();
            this.showCreateTaskForm.set(false);
        } else {
            this.errorMessage.set(result.error || 'Erro ao criar tarefa.');
        }

        this.isCreating.set(false);
    }

    openEditTask(task: Task) {
        this.selectedTaskForEdit.set(task);
        this.editTaskForm.patchValue({ title: task.title, description: task.description || '' });
        this.editSelectedTags = task.tags ? [...task.tags] : [];
    }

    async onSaveEditTask(): Promise<void> {
        const task = this.selectedTaskForEdit();
        if (!task) return;
        if (this.editTaskForm.invalid) return;

        const { title, description } = this.editTaskForm.value;
        const updates: Partial<Task> = {};
        if (title != null) updates.title = title;
        if (description != null) updates.description = description;
        updates.tags = [...this.editSelectedTags];

        const result = await this.taskService.updateTask(task.id!, updates);
        if (!result.success) {
            this.errorMessage.set(result.error || 'Erro ao atualizar tarefa.');
            return;
        }

        this.selectedTaskForEdit.set(null);
    }

    async onUpdateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
        const result = await this.taskService.updateTaskStatus(taskId, status);
        if (!result.success) {
            this.errorMessage.set(result.error || 'Erro ao atualizar tarefa.');
        }
    }

    async onDeleteTask(taskId: string): Promise<void> {
        if (!confirm('Tem certeza que deseja deletar esta tarefa?')) return;

        this.isDeleting.set(true);
        const result = await this.taskService.deleteTask(taskId);

        if (!result.success) {
            this.errorMessage.set(result.error || 'Erro ao deletar tarefa.');
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
