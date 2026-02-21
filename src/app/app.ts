import { Component, inject, signal, effect } from '@angular/core';
import { DiaryComponent } from './features/diary/diary.component';
import { ProjectsComponent } from './features/projects/projects.component';
import { LoginComponent } from './features/auth/login/login.component';
import { DailyReportComponent } from './features/diary/daily-report/daily-report.component';
import { OfflineBannerComponent } from './shared/components/offline-banner.component';
import { PwaPromptComponent } from './shared/components/pwa-prompt.component';
import { AuthService } from './core/services/auth.service';
import { ProjectService } from './core/services/project.service';
import { PwaService } from './core/services/pwa.service';
import { CommonModule } from '@angular/common';
import { Project } from './core/models/project.model';

export type PageState = 'projects' | 'diary' | 'daily-report';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    DiaryComponent,
    ProjectsComponent,
    LoginComponent,
    DailyReportComponent,
    OfflineBannerComponent,
    PwaPromptComponent
  ],
  templateUrl: './app.html',
})
export class App {
  authService = inject(AuthService);
  projectService = inject(ProjectService);
  pwaService = inject(PwaService);

  currentPage = signal<PageState>('projects');

  constructor() {
    // Reseta o estado quando o usuário faz logout ou login
    effect(() => {
      if (!this.authService.isAuthenticated()) {
        // Quando usuário faz logout, reseta o estado
        this.currentPage.set('projects');
        this.projectService.setCurrentProject(null);
      } else {
        // Quando usuário faz login, garante que começa na lista de projetos
        this.currentPage.set('projects');
        this.projectService.setCurrentProject(null);
      }
    });
  }

  navigateToDiary(project: Project) {
    this.projectService.setCurrentProject(project);
    this.currentPage.set('diary');
  }

  navigateToProjects() {
    this.projectService.setCurrentProject(null);
    this.currentPage.set('projects');
  }

  navigateToDailyReport() {
    this.currentPage.set('daily-report');
  }
}

