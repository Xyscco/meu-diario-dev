import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-offline-banner',
    standalone: true,
    imports: [CommonModule],
    template: `
        @if (!isOnline()) {
            <div class="fixed top-0 left-0 right-0 bg-red-600 text-white px-4 py-3 flex items-center justify-center gap-2 z-50 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <span class="font-medium">⚠️ Sem conexão com internet - DevContext requer conexão para funcionar</span>
            </div>
        }
    `,
    styles: []
})
export class OfflineBannerComponent implements OnInit, OnDestroy {
    isOnline = signal(navigator.onLine);

    ngOnInit() {
        window.addEventListener('online', this.updateOnlineStatus);
        window.addEventListener('offline', this.updateOnlineStatus);
    }

    ngOnDestroy() {
        window.removeEventListener('online', this.updateOnlineStatus);
        window.removeEventListener('offline', this.updateOnlineStatus);
    }

    private updateOnlineStatus = () => {
        this.isOnline.set(navigator.onLine);
    };
}
