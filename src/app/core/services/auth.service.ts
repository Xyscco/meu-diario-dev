import { Injectable, signal, NgZone } from '@angular/core';
import { supabase } from '../config/supabase.config';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    isAuthenticated = signal<boolean>(false);
    isSetupRequired = signal<boolean>(false);

    private readonly DUMMY_EMAIL_DOMAIN = '@devcontext.local';

    constructor(private ngZone: NgZone) {
        this.initSession();
    }

    async initSession() {
        try {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                this.ngZone.run(() => {
                    this.isAuthenticated.set(true);
                });
            }
        } catch (error) {
            console.error('Erro ao inicializar sessão:', error);
        }
    }

    async checkSetup() {
        try {
            const { data } = await supabase.auth.getSession();

            this.ngZone.run(() => {
                if (data.session) {
                    this.isAuthenticated.set(true);
                    this.isSetupRequired.set(false);
                } else {
                    // Verificar se já existe algum usuário cadastrado
                    const hasExistingUser = localStorage.getItem('devcontext_user_email');
                    this.isSetupRequired.set(!hasExistingUser);
                }
            });
        } catch (error) {
            console.error('Erro ao verificar setup:', error);
            this.ngZone.run(() => {
                this.isSetupRequired.set(true);
            });
        }
    }

    async login(password: string): Promise<boolean> {
        try {
            // Recuperar email armazenado
            const email = localStorage.getItem('devcontext_user_email');
            if (!email) {
                console.error('Email não encontrado. Setup necessário.');
                return false;
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;

            this.ngZone.run(() => {
                this.isAuthenticated.set(true);
            });

            return true;
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            return false;
        }
    }

    async setupPassword(password: string): Promise<boolean> {
        try {
            // Gerar email dummy único
            const dummyEmail = `user-${crypto.randomUUID()}${this.DUMMY_EMAIL_DOMAIN}`;

            const { data, error } = await supabase.auth.signUp({
                email: dummyEmail,
                password: password,
            });

            if (error) throw error;

            // Armazenar email para futuros logins
            localStorage.setItem('devcontext_user_email', dummyEmail);

            this.ngZone.run(() => {
                this.isSetupRequired.set(false);
                this.isAuthenticated.set(true);
            });

            return true;
        } catch (error) {
            console.error('Erro ao configurar senha:', error);
            return false;
        }
    }

    async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
        try {
            // Validar senha antiga fazendo login novamente
            const email = localStorage.getItem('devcontext_user_email');
            if (!email) return false;

            // Verificar senha atual
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email,
                password: oldPassword,
            });

            if (loginError) {
                console.error('Senha antiga incorreta');
                return false;
            }

            // Atualizar para nova senha
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) throw updateError;

            return true;
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            return false;
        }
    }

    async logout(): Promise<void> {
        try {
            await supabase.auth.signOut();
            this.ngZone.run(() => {
                this.isAuthenticated.set(false);
            });
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    }

    validatePassword(password: string): boolean {
        const minLength = 6;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        return password.length >= minLength && hasUpper && hasLower && hasNumber;
    }
}
