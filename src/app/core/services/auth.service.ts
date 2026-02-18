import { Injectable, signal, NgZone } from '@angular/core';
import { supabase } from '../config/supabase.config';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    isAuthenticated = signal<boolean>(false);
    isSetupRequired = signal<boolean>(false);

    private readonly LAST_EMAIL_KEY = 'devcontext_last_email';
    private readonly SAVE_EMAIL_KEY = 'devcontext_save_email';

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
            } else {
                // Se não tem sessão ativa, mostrar tela de login
                this.ngZone.run(() => {
                    this.isSetupRequired.set(false);
                    this.isAuthenticated.set(false);
                });
            }
        } catch (error) {
            console.error('Erro ao inicializar sessão:', error);
        }
    }

    getLastEmail(): string {
        return localStorage.getItem(this.LAST_EMAIL_KEY) || '';
    }

    shouldRememberEmail(): boolean {
        return localStorage.getItem(this.SAVE_EMAIL_KEY) === 'true';
    }

    async signup(email: string, password: string, saveEmail: boolean = false): Promise<{ success: boolean; error?: string }> {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
            });

            if (error) {
                // Tratamento de erros específicos
                if (error.message.includes('rate limit')) {
                    return { success: false, error: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.' };
                }
                if (error.message.includes('already registered')) {
                    return { success: false, error: 'Este email já está registrado.' };
                }
                if (error.message.includes('invalid email')) {
                    return { success: false, error: 'Email inválido.' };
                }
                if (error.message.includes('password')) {
                    return { success: false, error: 'Senha não atende aos requisitos.' };
                }
                throw error;
            }

            // Salvar preferências de email
            if (saveEmail) {
                localStorage.setItem(this.LAST_EMAIL_KEY, email);
                localStorage.setItem(this.SAVE_EMAIL_KEY, 'true');
            } else {
                localStorage.removeItem(this.SAVE_EMAIL_KEY);
            }

            this.ngZone.run(() => {
                this.isAuthenticated.set(true);
            });

            return { success: true };
        } catch (error: any) {
            const errorMessage = error?.message || 'Erro desconhecido ao criar conta.';
            console.error('Erro ao cadastrar:', errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    async login(email: string, password: string, saveEmail: boolean = false): Promise<{ success: boolean; error?: string }> {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                // Tratamento de erros específicos
                if (error.message.includes('Invalid login')) {
                    return { success: false, error: 'Email ou senha incorretos.' };
                }
                throw error;
            }

            // Salvar preferências de email
            if (saveEmail) {
                localStorage.setItem(this.LAST_EMAIL_KEY, email);
                localStorage.setItem(this.SAVE_EMAIL_KEY, 'true');
            } else {
                localStorage.removeItem(this.SAVE_EMAIL_KEY);
            }

            this.ngZone.run(() => {
                this.isAuthenticated.set(true);
            });

            return { success: true };
        } catch (error: any) {
            const errorMessage = error?.message || 'Erro desconhecido ao fazer login.';
            console.error('Erro ao fazer login:', errorMessage);
            return { success: false, error: errorMessage };
        }
    }

    async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user?.email) return false;

            // Verificar senha atual
            const { error: loginError } = await supabase.auth.signInWithPassword({
                email: user.email,
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
