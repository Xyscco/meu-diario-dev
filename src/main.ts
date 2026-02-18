import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/ngsw-worker.js').then(
    (registration) => {
      console.log('Service Worker registrado com sucesso:', registration);
      // Verificar atualizações a cada 30 segundos em desenvolvimento
      if (!registration.scope.includes('dist')) {
        setInterval(() => {
          registration.update();
        }, 30000);
      }
    },
    (error) => {
      console.log('Falha ao registrar Service Worker:', error);
    }
  );
}
