import { Injectable, signal, NgZone } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    isAuthenticated = signal<boolean>(false);
    isSetupRequired = signal<boolean>(false);

    constructor(private ngZone: NgZone) {
        this.checkSetup();
    }

    async checkSetup() {
        if (window.electronAPI) {
            const required = await window.electronAPI.isSetupRequired();
            this.ngZone.run(() => {
                this.isSetupRequired.set(required);
            });
        }
    }

    async login(password: string): Promise<boolean> {
        if (window.electronAPI) {
            const success = await window.electronAPI.login(password);
            this.ngZone.run(() => {
                if (success) {
                    this.isAuthenticated.set(true);
                }
            });
            return success;
        }
        // Mock for web
        if (password === 'admin') {
            this.isAuthenticated.set(true);
            return true;
        }
        return false;
    }

    async setupPassword(password: string): Promise<boolean> {
        if (window.electronAPI) {
            const success = await window.electronAPI.setupPassword(password);
            if (success) {
                this.ngZone.run(() => {
                    this.isSetupRequired.set(false);
                    this.isAuthenticated.set(true);
                });
            }
            return success;
        }
        return false;
    }

    async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
        if (window.electronAPI) {
            return await window.electronAPI.changePassword({ oldPassword, newPassword });
        }
        return false;
    }

    logout() {
        this.isAuthenticated.set(false);
    }

    validatePassword(password: string): boolean {
        const minLength = 6;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        return password.length >= minLength && hasUpper && hasLower && hasNumber;
    }
}
