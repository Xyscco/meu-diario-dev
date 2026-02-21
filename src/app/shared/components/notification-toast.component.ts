import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';

@Component({
    selector: 'app-notification-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-container" aria-live="polite" aria-atomic="true">
        @for (toast of notificationService.toasts(); track toast.id) {
            <div class="toast toast-success" role="status">
                <span class="toast-icon" aria-hidden="true">✓</span>
                <span class="toast-message">{{ toast.message }}</span>
            </div>
        }
    </div>
  `,
    styles: [`
    .toast-container {
        position: fixed;
        right: 20px;
        bottom: 20px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        z-index: 1000;
        pointer-events: none;
    }

    .toast {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        min-width: 220px;
        max-width: 320px;
        border-radius: 10px;
        background: #1f2937;
        color: #f9fafb;
        box-shadow: 0 14px 28px rgba(0, 0, 0, 0.22);
        transform: translateY(14px);
        opacity: 0;
        animation: toast-in 220ms ease-out forwards;
    }

    .toast-success {
        border-left: 4px solid #22c55e;
    }

    .toast-icon {
        display: inline-flex;
        width: 22px;
        height: 22px;
        align-items: center;
        justify-content: center;
        background: rgba(34, 197, 94, 0.18);
        color: #86efac;
        border-radius: 999px;
        font-weight: 700;
    }

    .toast-message {
        font-size: 0.92rem;
        line-height: 1.2rem;
    }

    @keyframes toast-in {
        from {
            transform: translateY(18px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    @media (max-width: 640px) {
        .toast-container {
            right: 12px;
            left: 12px;
        }

        .toast {
            max-width: none;
            width: 100%;
        }
    }
  `]
})
export class NotificationToastComponent {
    notificationService = inject(NotificationService);
}
