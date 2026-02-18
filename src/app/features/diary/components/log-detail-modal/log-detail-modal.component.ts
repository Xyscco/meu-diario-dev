import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogEntry } from '../../../../core/models/log-entry.model';

@Component({
    selector: 'app-log-detail-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './log-detail-modal.component.html'
})
export class LogDetailModalComponent {
    @Input({ required: true }) log!: LogEntry;
    @Output() close = new EventEmitter<void>();

    @HostListener('document:keydown.escape')
    onKeydownHandler() {
        this.onClose();
    }

    parseTags(tags: string | string[]): string[] {
        if (Array.isArray(tags)) return tags;
        try {
            return JSON.parse(tags);
        } catch {
            return [];
        }
    }

    onClose() {
        this.close.emit();
    }
}
