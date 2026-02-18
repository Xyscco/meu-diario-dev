import { Component, inject, signal } from '@angular/core';
import { DiaryComponent } from './features/diary/diary.component';
import { ProjectsComponent } from './features/projects/projects.component';
import { LoginComponent } from './features/auth/login/login.component';
import { OfflineBannerComponent } from './shared/components/offline-banner.component';
import { AuthService } from './core/services/auth.service';
import { ProjectService } from './core/services/project.service';
import { CommonModule } from '@angular/common';
import { Project } from './core/models/project.model';

export type PageState = 'projects' | 'diary';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DiaryComponent, ProjectsComponent, LoginComponent, OfflineBannerComponent],
  templateUrl: './app.html',
})
export class App {
  authService = inject(AuthService);
  projectService = inject(ProjectService);

  currentPage = signal<PageState>('projects');

  navigateToDiary(project: Project) {
    this.projectService.setCurrentProject(project);
    this.currentPage.set('diary');
  }

  navigateToProjects() {
    this.projectService.setCurrentProject(null);
    this.currentPage.set('projects');
  }
}
