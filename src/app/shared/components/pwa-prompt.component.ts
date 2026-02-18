import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../core/services/pwa.service';

@Component({
  selector: 'app-pwa-prompt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="pwaService.isInstallPromptReady()" class="pwa-prompt install">
      <div class="pwa-content">
        <span>📱 Instale DevContext para melhor experiência!</span>
        <div class="pwa-actions">
          <button (click)="installApp()" class="btn-primary">Instalar</button>
          <button (click)="dismissInstall()" class="btn-secondary">Depois</button>
        </div>
      </div>
    </div>

    <div *ngIf="pwaService.shouldPromptUpdate()" class="pwa-prompt update">
      <div class="pwa-content">
        <span>🔄 Nova versão disponível!</span>
        <div class="pwa-actions">
          <button (click)="updateApp()" class="btn-primary">Atualizar</button>
          <button (click)="dismissUpdate()" class="btn-secondary">Depois</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pwa-prompt {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 16px;
      background-color: #313244;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      font-size: 14px;
      color: #cdd6f4;
      animation: slideIn 0.3s ease-out;
      max-width: 350px;
      z-index: 1000;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .pwa-prompt.install {
      border-left: 4px solid #a6e3a1;
    }

    .pwa-prompt.update {
      border-left: 4px solid #f38ba8;
    }

    .pwa-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }

    .pwa-actions {
      display: flex;
      gap: 8px;
    }

    button {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background-color: #cba6f7;
      color: #1e1e2e;
      font-weight: 500;
    }

    .btn-primary:hover {
      background-color: #b8a6f7;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background-color: transparent;
      color: #cdd6f4;
      border: 1px solid #4c4f69;
    }

    .btn-secondary:hover {
      background-color: rgba(76, 79, 105, 0.3);
    }

    @media (max-width: 480px) {
      .pwa-prompt {
        bottom: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }

      .pwa-content {
        flex-direction: column;
        align-items: stretch;
      }

      .pwa-actions {
        width: 100%;
      }

      button {
        flex: 1;
      }
    }
  `]
})
export class PwaPromptComponent {
  pwaService = inject(PwaService);
  dismissedInstall = signal(false);
  dismissedUpdate = signal(false);

  installApp(): void {
    this.pwaService.promptInstall();
  }

  dismissInstall(): void {
    this.dismissedInstall.set(true);
    setTimeout(() => {
      this.dismissedInstall.set(false);
    }, 24 * 60 * 60 * 1000); // Mostrar novamente em 24 horas
  }

  updateApp(): void {
    this.pwaService.updateApp();
  }

  dismissUpdate(): void {
    this.dismissedUpdate.set(true);
  }
}
