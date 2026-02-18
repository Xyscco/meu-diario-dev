import { Component, signal, inject, OnInit } from '@angular/core';
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
export class LoginComponent implements OnInit {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);

    isSignupMode = signal<boolean>(false);
    errorMessage = signal<string | null>(null);
    showChangePasswordModal = signal(false);
    isLoading = signal(false);

    loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        saveEmail: [false]
    });

    signupForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required],
        confirmPassword: ['', Validators.required],
        saveEmail: [true]
    });

    changePasswordForm = this.fb.group({
        oldPassword: ['', Validators.required],
        newPassword: ['', Validators.required],
        confirmNewPassword: ['', Validators.required]
    });

    ngOnInit() {
        const lastEmail = this.authService.getLastEmail();
        const shouldRemember = this.authService.shouldRememberEmail();
        
        if (lastEmail && shouldRemember) {
            this.loginForm.patchValue({
                email: lastEmail,
                saveEmail: true
            });
        }
    }

    toggleMode() {
        this.isSignupMode.update(mode => !mode);
        this.errorMessage.set(null);
    }

    async onLogin() {
        if (this.loginForm.invalid) return;
        
        this.isLoading.set(true);
        const { email, password, saveEmail } = this.loginForm.value;
        const result = await this.authService.login(email!, password!, saveEmail ?? false);
        
        if (!result.success) {
            this.errorMessage.set(result.error || 'Email ou senha incorretos. Verifique seus dados.');
        }
        this.isLoading.set(false);
    }

    async onSignup() {
        if (this.signupForm.invalid) return;
        
        const { email, password, confirmPassword, saveEmail } = this.signupForm.value;

        if (password !== confirmPassword) {
            this.errorMessage.set('As senhas não coincidem.');
            return;
        }

        if (!this.authService.validatePassword(password!)) {
            this.errorMessage.set('A senha deve ter pelo menos uma letra maiúscula, uma minúscula e um número.');
            return;
        }

        this.isLoading.set(true);
        const result = await this.authService.signup(email!, password!, saveEmail ?? false);
        
        if (!result.success) {
            this.errorMessage.set(result.error || 'Erro ao criar conta. Verifique seu email ou tente outro.');
        }
        this.isLoading.set(false);
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
