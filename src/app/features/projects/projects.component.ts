import { Component, signal, inject, OnInit, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProjectService } from '../../core/services/project.service';
import { Project, ProjectStatus, PROJECT_STATUS_LIST, PROJECT_STATUS_COLORS } from '../../core/models/project.model';

@Component({
    selector: 'app-projects',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './projects.component.html'
})
export class ProjectsComponent implements OnInit {
    private fb = inject(FormBuilder);
    projectService = inject(ProjectService);

    projectSelected = output<Project>();

    filterStatus = signal<ProjectStatus | null>('Em execução'); // Default: apenas ativos
    showCreateModal = signal(false);
    isCreating = signal(false);
    errorMessage = signal<string | null>(null);
    statusList = PROJECT_STATUS_LIST;

    createForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        description: ['']
    });

    filteredProjects = computed(() => {
        const allProjects = this.projectService.projects();
        const filter = this.filterStatus();
        
        if (filter === null) {
            return allProjects;
        }
        
        return allProjects.filter(p => p.status === filter);
    });

    ngOnInit(): void {
        this.projectService.loadProjects();
    }

    getStatusColor(status: ProjectStatus): string {
        return PROJECT_STATUS_COLORS[status];
    }

    async onCreateProject(): Promise<void> {
        if (this.createForm.invalid) return;

        this.isCreating.set(true);
        this.errorMessage.set(null);

        const { name, description } = this.createForm.value;
        const result = await this.projectService.createProject(name!, description || undefined);

        if (result.success) {
            this.createForm.reset();
            this.showCreateModal.set(false);
        } else {
            this.errorMessage.set(result.error || 'Erro ao criar projeto.');
        }

        this.isCreating.set(false);
    }

    async updateStatus(projectId: string, status: ProjectStatus): Promise<void> {
        await this.projectService.updateProjectStatus(projectId, status);
    }

    async deleteProject(projectId: string): Promise<void> {
        if (confirm('Tem certeza que deseja deletar este projeto?')) {
            await this.projectService.deleteProject(projectId);
        }
    }

    selectProject(project: Project): void {
        this.projectSelected.emit(project);
    }
}
