import { Component, inject } from '@angular/core';
import { DiaryComponent } from './features/diary/diary.component';
import { LoginComponent } from './features/auth/login/login.component';
import { OfflineBannerComponent } from './shared/components/offline-banner.component';
import { AuthService } from './core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DiaryComponent, LoginComponent, OfflineBannerComponent],
  templateUrl: './app.html',
})
export class App {
  authService = inject(AuthService);
}
