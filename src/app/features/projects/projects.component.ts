import { Component, signal, inject, OnInit, OnDestroy, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { EpicService } from '../../core/services/epic.service';
import { NotificationService } from '../../core/services/notification.service';
import { Project, ProjectStatus, PROJECT_STATUS_LIST, PROJECT_STATUS_COLORS, ProjectEnvironment, PROJECT_ENVIRONMENT_LIST, PROJECT_ENVIRONMENT_COLORS } from '../../core/models/project.model';
import { TasksModalComponent } from './components/tasks-modal/tasks-modal.component';
import { EpicsModalComponent } from './components/epics-modal/epics-modal.component';

@Component({
    selector: 'app-projects',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TasksModalComponent, EpicsModalComponent],
    templateUrl: './projects.component.html',
    styles: [`
    .draggable-region {
      -webkit-app-region: drag; /* Electron specific: makes div draggable */
    }
  `]
})
export class ProjectsComponent implements OnInit, OnDestroy {
    private fb = inject(FormBuilder);
    projectService = inject(ProjectService);
    private authService = inject(AuthService);
    epicService = inject(EpicService);
    notificationService = inject(NotificationService);

    projectSelected = output<Project>();

    filterStatus = signal<ProjectStatus | null>('Em execução'); // Default: apenas ativos
    filterEnvironment = signal<ProjectEnvironment | null>(null);
    showCreateModal = signal(false);
    showEditModal = signal(false);
    showTasksModal = signal(false);
    showEpicsModal = signal(false);
    projectWithTasks = signal<Project | null>(null);
    projectWithEpics = signal<Project | null>(null);
    projectToEdit = signal<Project | null>(null);
    isCreating = signal(false);
    isUpdating = signal(false);
    errorMessage = signal<string | null>(null);
    statusList = PROJECT_STATUS_LIST;
    environmentList = PROJECT_ENVIRONMENT_LIST;
    currentTime = Date.now();
    private timeInterval: any;

    createForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: [''],
        environment: ['']
    });

    editForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: [''],
        environment: ['']
    });

    filteredProjects = computed(() => {
        const allProjects = this.projectService.projects();
        const statusFilter = this.filterStatus();
        const environmentFilter = this.filterEnvironment();
        
        let filtered = allProjects;

        // Aplicar filtro de status
        if (statusFilter !== null) {
            filtered = filtered.filter((p: Project) => p.status === statusFilter);
        }

        // Aplicar filtro de ambiente
        if (environmentFilter !== null) {
            filtered = filtered.filter((p: Project) => p.environment === environmentFilter);
        }

        return filtered;
    });

    ngOnInit(): void {
        this.projectService.loadProjects();
        this.timeInterval = setInterval(() => {
            this.currentTime = Date.now();
        }, 1000);
    }

    ngOnDestroy(): void {
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
    }

    getStatusColor(status: ProjectStatus): string {
        return PROJECT_STATUS_COLORS[status];
    }

    getEnvironmentColor(environment: ProjectEnvironment): string {
        return PROJECT_ENVIRONMENT_COLORS[environment];
    }

    async onCreateProject(): Promise<void> {
        if (this.createForm.invalid) return;

        this.isCreating.set(true);
        this.errorMessage.set(null);

        const { name, description, environment } = this.createForm.value;
        const result = await this.projectService.createProject(
            name!,
            description || undefined,
            'Aguardando',
            (environment as ProjectEnvironment) || undefined
        );

        if (result.success) {
            this.createForm.reset();
            this.showCreateModal.set(false);
            this.notificationService.showSuccess('Projeto criado com sucesso.');
        } else {
            this.errorMessage.set(result.error || 'Erro ao criar projeto.');
        }

        this.isCreating.set(false);
    }

    async updateStatus(projectId: string, status: ProjectStatus): Promise<void> {
        const result = await this.projectService.updateProjectStatus(projectId, status);
        if (result.success) {
            this.notificationService.showSuccess('Status do projeto atualizado.');
        }
    }

    async deleteProject(projectId: string): Promise<void> {
        if (confirm('Tem certeza que deseja deletar este projeto?')) {
            const result = await this.projectService.deleteProject(projectId);
            if (result.success) {
                this.notificationService.showSuccess('Projeto deletado com sucesso.');
            }
        }
    }

    openEditModal(project: Project, event?: Event): void {
        if (event) event.stopPropagation();
        this.projectToEdit.set(project);
        this.editForm.patchValue({
            name: project.name,
            description: project.description || '',
            environment: project.environment || ''
        });
        this.showEditModal.set(true);
    }

    closeEditModal(): void {
        this.showEditModal.set(false);
        this.projectToEdit.set(null);
        this.editForm.reset();
        this.errorMessage.set(null);
    }

    async onEditProject(): Promise<void> {
        if (this.editForm.invalid) return;

        this.isUpdating.set(true);
        this.errorMessage.set(null);

        const project = this.projectToEdit();
        if (!project?.id) return;

        const { name, description, environment } = this.editForm.value;
        const result = await this.projectService.updateProject(project.id, {
            name: name!,
            description: description || undefined,
            environment: (environment as ProjectEnvironment) || undefined
        });

        if (result.success) {
            this.closeEditModal();
            this.notificationService.showSuccess('Projeto atualizado com sucesso.');
        } else {
            this.errorMessage.set(result.error || 'Erro ao editar projeto.');
        }

        this.isUpdating.set(false);
    }

    openTasksModal(project: Project, event?: Event): void {
        if (event) event.stopPropagation();
        this.projectWithTasks.set(project);
        this.showTasksModal.set(true);
    }

    closeTasksModal(): void {
        this.showTasksModal.set(false);
        this.projectWithTasks.set(null);
    }

    openEpicsModal(project: Project, event?: Event): void {
        if (event) event.stopPropagation();
        this.projectWithEpics.set(project);
        this.showEpicsModal.set(true);
    }

    closeEpicsModal(): void {
        this.showEpicsModal.set(false);
        this.projectWithEpics.set(null);
    }

    selectProject(project: Project): void {
        this.projectSelected.emit(project);
    }

    logout(): void {
        this.authService.logout();
    }
}
