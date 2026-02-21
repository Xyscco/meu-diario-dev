import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success';

export interface ToastNotification {
    id: string;
    message: string;
    variant: ToastVariant;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private readonly defaultDurationMs = 3200;
    toasts = signal<ToastNotification[]>([]);

    showSuccess(message: string, durationMs: number = this.defaultDurationMs): void {
        this.pushToast({
            id: crypto.randomUUID(),
            message,
            variant: 'success'
        }, durationMs);
    }

    private pushToast(toast: ToastNotification, durationMs: number): void {
        this.toasts.update(current => [toast, ...current]);

        window.setTimeout(() => {
            this.toasts.update(current => current.filter(t => t.id !== toast.id));
        }, durationMs);
    }
}
