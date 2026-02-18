# Guia de PWA - Meu Diário Dev

## 📱 Progressive Web App (PWA)

O **Meu Diário Dev** agora é uma Progressive Web App completa, permitindo que você instale a aplicação como um app nativo para melhor experiência!

## ✨ Recursos PWA Habilitados

### 1. **Instalação em Dispositivos**
- ✅ Instalável em Android, iOS e desktop
- ✅ Ícone na tela inicial
- ✅ Execução em modo standalone (sem barra de navegação do navegador)
- ✅ Splash screen personalizada

### 2. **Funcionamento Offline**
- ✅ Cache automático de assets e dados
- ✅ Carregamento offline de páginas já visitadas
- ✅ Sincronização automática quando volta online
- ✅ Banner de status de conexão

### 3. **Atualizações Automáticas**
- ✅ Verificação periódica de novas versões
- ✅ Prompt de atualização para o usuário
- ✅ Atualização sem recarregar manualmente

### 4. **Service Worker**
- ✅ Execução em background
- ✅ Gerenciamento de cache inteligente
- ✅ Sincronização de dados background

## 🚀 Como Instalar

### Android (Chrome)
1. Abra a aplicação no Chrome
2. Toque no menu ⋮ (três pontos)
3. Selecione "Instalar aplicativo" ou "Adicionar à tela inicial"
4. Confirme a instalação

### iOS (Safari)
1. Abra a aplicação no Safari
2. Toque no botão de compartilhamento ⬆️
3. Selecione "Adicionar à tela inicial"
4. Confirme

### Desktop (Windows/Mac/Linux)
1. **Chrome/Edge:**
   - Abra o app no navegador
   - Clique na opção "Instalar" no endereço ou no menu
   - Confirme

2. **Firefox:**
   - Abra o app
   - Clique no menu ≡
   - Selecione "Instalar aplicativo"

## 🔧 Como Compilar com PWA

A PWA é habilitada automaticamente no build de produção:

```bash
# Build com PWA habilitada
npm run build
```

O build incluirá:
- ✅ Service Worker (`ngsw-worker.js`)
- ✅ Manifest (`manifest.json`)
- ✅ Ícones no diretório `assets/icons/`

## 📦 Configuração de Ícones

Os ícones PWA devem ser adicionados em `public/assets/icons/`:

### Tamanhos Requeridos
- 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
- Versões "maskable" para 192x192 e 512x512 (design adaptável)

### Gerar Ícones
Para gerar os ícones automaticamente:

```bash
# Instalar sharp (se não tiver)
npm install --save-dev sharp

# Executar o gerador
node public/assets/icons/generate-icons.js
```

Ou use uma ferramenta online:
- 🔗 [PWA Builder](https://www.pwabuilder.com)
- 🔗 [Real Favicon Generator](https://realfavicongenerator.net)

## 🔔 Gerenciar Atualizações

### PwaService

O `PwaService` gerencia todo o ciclo de vida do PWA:

```typescript
import { inject } from '@angular/core';
import { PwaService } from './core/services/pwa.service';

export class MyComponent {
  pwaService = inject(PwaService);

  // Verificar status
  isOnline = this.pwaService.isOnline;
  isAppInstalled = this.pwaService.isAppInstalled;
  updateAvailable = this.pwaService.updateAvailable;

  // Ações
  installApp() {
    this.pwaService.promptInstall();
  }

  updateApp() {
    this.pwaService.updateApp();
  }
}
```

### Sinais Disponíveis

| Sinal | Tipo | Descrição |
|-------|------|-----------|
| `isOnline()` | boolean | Aplicação está online |
| `isAppInstalled()` | boolean | App está instalado no dispositivo |
| `isInstallPromptReady()` | boolean | Prompt de instalação disponível |
| `updateAvailable()` | boolean | Nova versão disponível |
| `shouldPromptUpdate()` | boolean | Mostrar prompt de atualização |

## 🔒 Segurança PWA

### Row-Level Security (RLS)
Os dados do Supabase continuam protegidos:
- Dados offline são cacheados apenas localmente
- Sincronização ocorre apenas com o usuário autenticado
- Políticas RLS no banco garantem isolamento

### Armazenamento Local
- ✅ Senhas NUNCA são armazenadas localmente
- ✅ Apenas preferências de usuário em localStorage
- ✅ Sessão Supabase gerenciada automaticamente

## 📊 Verificar Status da PWA

### Chrome DevTools
1. Abra Developer Tools (F12)
2. Vá para aba **Application**
3. Seção **Service Workers** - mostra registro
4. Seção **Manifest** - valida manifest.json
5. Seção **Cache Storage** - visualiza cache

### Lighthouse
1. Chrome DevTools → Lighthouse
2. Selecione "PWA"
3. Rode a auditoria
4. Verifique score e recomendações

### Validadores Online
- 🔗 [PWA Builder](https://www.pwabuilder.com)
- 🔗 [Localhost PWA Test](http://localhost:4200 + Chrome Lighthouse)

## 🐛 Troubleshooting

### "Prompt de instalação não aparece"
- ✅ Use HTTPS (localmente funciona com localhost)
- ✅ Aguarde 2 minutos no primeiro acesso
- ✅ Verifique manifest.json em DevTools
- ✅ Limpe cache: DevTools → Application → Clear storage

### "App não funciona offline"
- ✅ Acesse a página online primeiro para cachear
- ✅ Verifique ngsw-config.json
- ✅ Inspecione "Cache Storage" em DevTools
- ✅ Veja Console por erros do Service Worker

### "Atualização não aparece"
- ✅ Service Worker precisa de ~30 segundos para detectar
- ✅ Abra em outra aba para forçar detecção
- ✅ Verifique DevTools → Service Workers → "check for updates"

## 📚 Recursos Adicionais

- 🔗 [MDN - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- 🔗 [Angular Service Worker](https://angular.io/guide/service-worker-intro)
- 🔗 [Web Dev - PWA Checklist](https://web.dev/pwa-checklist/)

## 🎯 Objetivo PWA

Permitir que desenvolvedores usem **DevContext** como uma aplicação nativa, podendo:

1. ✅ Acessar offline durante reuniões/viagens
2. ✅ Registrar trabalho sem preocupação com conexão
3. ✅ Sincronizar automaticamente ao voltar online
4. ✅ Receber atualizações rapidamente
5. ✅ Melhor performance e experiência nativa

---

**A PWA melhora significativamente a experiência em dispositivos móveis e contextos offline!** 📱✨
