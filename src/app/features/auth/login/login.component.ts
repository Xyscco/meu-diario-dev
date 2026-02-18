import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { IconDatabase } from '../../../shared/icons/icon-database.component';
import { IconSave } from '../../../shared/icons/icon-save.component';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, IconDatabase, IconSave],
    templateUrl: './login.component.html'
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);

    isSetupMode = this.authService.isSetupRequired;
    errorMessage = signal<string | null>(null);
    showChangePasswordModal = signal(false);

    loginForm = this.fb.group({
        password: ['', Validators.required]
    });

    setupForm = this.fb.group({
        password: ['', [Validators.required]],
        confirmPassword: ['', Validators.required]
    });

    changePasswordForm = this.fb.group({
        oldPassword: ['', Validators.required],
        newPassword: ['', Validators.required],
        confirmNewPassword: ['', Validators.required]
    });

    async onLogin() {
        if (this.loginForm.invalid) return;
        const { password } = this.loginForm.value;
        const success = await this.authService.login(password!);
        if (!success) {
            this.errorMessage.set('Senha incorreta ou problema de conexão. Verifique sua internet.');
        }
    }

    async onSetup() {
        if (this.setupForm.invalid) return;
        const { password, confirmPassword } = this.setupForm.value;

        if (password !== confirmPassword) {
            this.errorMessage.set('As senhas não coincidem.');
            return;
        }

        if (!this.authService.validatePassword(password!)) {
            this.errorMessage.set('A senha deve ter pelo menos uma letra maiúscula, uma minúscula e um número.');
            return;
        }

        const success = await this.authService.setupPassword(password!);
        if (!success) {
            this.errorMessage.set('Erro ao definir senha. Verifique sua conexão com internet.');
        }
    }

    async onChangePassword() {
        if (this.changePasswordForm.invalid) return;
        const { oldPassword, newPassword, confirmNewPassword } = this.changePasswordForm.value;

        if (newPassword !== confirmNewPassword) {
            alert('A nova senha e a confirmação não coincidem.');
            return;
        }

        if (!this.authService.validatePassword(newPassword!)) {
            alert('A nova senha deve ter pelo menos uma letra maiúscula, uma minúscula e um número.');
            return;
        }

        const success = await this.authService.changePassword(oldPassword!, newPassword!);
        if (success) {
            alert('Senha alterada com sucesso!');
            this.showChangePasswordModal.set(false);
            this.changePasswordForm.reset();
        } else {
            alert('Senha atual incorreta ou erro ao alterar.');
        }
    }
}
