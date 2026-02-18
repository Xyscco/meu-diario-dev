import { Injectable, signal, computed, inject, NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private ngZone = inject(NgZone);

  // Signals para gerenciar estado do PWA
  isInstallPromptReady = signal(false);
  isAppInstalled = signal(false);
  isOnline = signal(navigator.onLine);
  updateAvailable = signal(false);

  // Variável para armazenar o prompt de instalação
  private installPrompt: any = null;

  constructor() {
    this._setupOnlineDetection();
    this._setupInstallPrompt();
    this._setupServiceWorkerUpdates();
  }

  /**
   * Detecta mudanças no status de conectividade
   */
  private _setupOnlineDetection(): void {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('online', () => {
        this.ngZone.run(() => this.isOnline.set(true));
        console.log('🌐 Aplicação online');
      });

      window.addEventListener('offline', () => {
        this.ngZone.run(() => this.isOnline.set(false));
        console.log('📴 Aplicação offline');
      });
    });
  }

  /**
   * Prepara o prompt de instalação para PWA
   */
  private _setupInstallPrompt(): void {
    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('beforeinstallprompt', (event: any) => {
        event.preventDefault();
        this.installPrompt = event;
        this.ngZone.run(() => this.isInstallPromptReady.set(true));
        console.log('📦 Prompt de instalação disponível');
      });

      window.addEventListener('appinstalled', () => {
        this.ngZone.run(() => this.isAppInstalled.set(true));
        this.installPrompt = null;
        console.log('✅ Aplicação instalada com sucesso');
      });
    });
  }

  /**
   * Monitora atualizações do Service Worker
   */
  private _setupServiceWorkerUpdates(): void {
    if ('serviceWorker' in navigator) {
      this.ngZone.runOutsideAngular(() => {
        navigator.serviceWorker.ready.then((registration) => {
          // Verificar atualizações periodicamente (a cada 30 minutos)
          setInterval(() => {
            registration.update().catch(() => {
              // Erro ao verificar atualizações é ignorado
            });
          }, 30 * 60 * 1000);

          // Detectar quando há atualização do controller
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            this.ngZone.run(() => {
              this.updateAvailable.set(true);
              console.log('🔄 Atualização disponível');
            });
          });
        });
      });
    }
  }

  /**
   * Dispara o prompt de instalação
   */
  promptInstall(): void {
    if (this.installPrompt) {
      this.installPrompt.prompt();
      this.installPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('✅ Usuário aceitou instalar');
        } else {
          console.log('❌ Usuário rejeitou instalação');
        }
        this.installPrompt = null;
        this.isInstallPromptReady.set(false);
      });
    }
  }

  /**
   * Atualiza a aplicação para a versão mais recente
   */
  updateApp(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
        // Recarregar a página para obter a versão mais recente
        window.location.reload();
      });
    }
  }

  /**
   * Verifica se o PWA está disponível
   */
  isPwaAvailable(): boolean {
    return 'serviceWorker' in navigator && 'caches' in window;
  }

  /**
   * Retorna um sinal computado indicando se há atualizações disponíveis e o app está online
   */
  shouldPromptUpdate = computed(() => {
    return this.updateAvailable() && this.isOnline();
  });
}
