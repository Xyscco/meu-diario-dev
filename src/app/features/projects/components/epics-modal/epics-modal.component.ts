import { Component, signal, inject, OnInit, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Project } from '../../../../core/models/project.model';
import { Epic } from '../../../../core/models/epic.model';
import { EpicService } from '../../../../core/services/epic.service';
import { TaskService } from '../../../../core/services/task.service';
import { Task } from '../../../../core/models/task.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
    selector: 'app-epics-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './epics-modal.component.html'
})
export class EpicsModalComponent implements OnInit {
    private fb = inject(FormBuilder);
    epicService = inject(EpicService);
    taskService = inject(TaskService);
    notificationService = inject(NotificationService);

    project = input<Project | null>(null);
    closeModal = output<void>();

    showCreateForm = signal(false);
    isCreating = signal(false);
    isDeleting = signal(false);
    errorMessage = signal<string | null>(null);
    selectedEpicForEdit = signal<Epic | null>(null);
    expandedEpicId = signal<string | null>(null);

    createEpicForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        focus: ['']
    });

    editEpicForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        focus: ['']
    });

    projectEpics = computed(() => {
        const proj = this.project();
        if (!proj?.id) return [];
        return this.epicService.epics().filter(e => e.project_id === proj.id);
    });

    getEpicTaskCount(epicId: string | undefined): number {
        if (!epicId) return 0;
        return this.taskService.tasks().filter(t => t.epic_id === epicId).length;
    }

    getEpicTasks(epicId: string | undefined): Task[] {
        if (!epicId) return [];
        return this.taskService.tasks().filter(t => t.epic_id === epicId);
    }

    getEpicCompletedCount(epicId: string | undefined): number {
        if (!epicId) return 0;
        return this.taskService.tasks().filter(t => t.epic_id === epicId && t.status === 'concluida').length;
    }

    async ngOnInit() {
        const proj = this.project();
        if (proj?.id) {
            await this.epicService.loadProjectEpics(proj.id);
            await this.taskService.loadProjectTasks(proj.id);
        }
    }

    async onCreateEpic(): Promise<void> {
        if (this.createEpicForm.invalid || !this.project()?.id) return;

        this.isCreating.set(true);
        this.errorMessage.set(null);

        const { name, focus } = this.createEpicForm.value;
        const result = await this.epicService.createEpic(
            this.project()!.id!,
            name!,
            focus || undefined
        );

        if (result.success) {
            this.createEpicForm.reset();
            this.showCreateForm.set(false);
            this.notificationService.showSuccess('Épico criado com sucesso.');
        } else {
            this.errorMessage.set(result.error || 'Erro ao criar épico.');
        }

        this.isCreating.set(false);
    }

    openEditEpic(epic: Epic) {
        this.selectedEpicForEdit.set(epic);
        this.editEpicForm.patchValue({ name: epic.name, focus: epic.focus || '' });
    }

    async onSaveEditEpic(): Promise<void> {
        const epic = this.selectedEpicForEdit();
        if (!epic) return;
        if (this.editEpicForm.invalid) return;

        const { name, focus } = this.editEpicForm.value;
        const updates: Partial<Epic> = {};
        if (name != null) updates.name = name;
        if (focus != null) updates.focus = focus;

        const result = await this.epicService.updateEpic(epic.id!, updates);
        if (!result.success) {
            this.errorMessage.set(result.error || 'Erro ao atualizar épico.');
            return;
        }

        this.selectedEpicForEdit.set(null);
        this.notificationService.showSuccess('Épico atualizado com sucesso.');
    }

    async onDeleteEpic(epicId: string): Promise<void> {
        const taskCount = this.getEpicTaskCount(epicId);
        const message = taskCount > 0 
            ? `Este épico possui ${taskCount} tarefa(s) vinculada(s). As tarefas não serão deletadas, apenas desvinculadas. Tem certeza que deseja deletar este épico?`
            : 'Tem certeza que deseja deletar este épico?';

        if (!confirm(message)) return;

        this.isDeleting.set(true);
        const result = await this.epicService.deleteEpic(epicId);

        if (!result.success) {
            this.errorMessage.set(result.error || 'Erro ao deletar épico.');
        } else {
            this.notificationService.showSuccess('Épico deletado com sucesso.');
        }

        this.isDeleting.set(false);
    }

    toggleExpandEpic(epicId: string | undefined) {
        if (!epicId) return;
        this.expandedEpicId.set(this.expandedEpicId() === epicId ? null : epicId);
    }

    onClose(): void {
        this.closeModal.emit();
    }
}
