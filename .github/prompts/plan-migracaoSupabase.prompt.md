# Plano de Migração: Electron/SQLite → Supabase

## Visão Geral

Transformar aplicação híbrida Electron+SQLite em aplicação web pura com Supabase, mantendo UX atual (senha sem email visível) e eliminando dependências de desktop. Estratégia de email dummy preserva fluxo de autenticação existente enquanto integra Supabase Auth. Tags serão migradas de JSON string para array nativo PostgreSQL.

---

## Fase 1: Preparação e Configuração do Supabase

### 1.1 Criar Projeto Supabase
- Acessar [Supabase Dashboard](https://app.supabase.com)
- Criar novo projeto
- Copiar credenciais:
  - Project URL: `https://xxxxx.supabase.co`
  - Anon/Public Key: `eyJhbGci...`

### 1.2 Instalar Dependências
```bash
npm install @supabase/supabase-js
```

### 1.3 Criar Configuração do Cliente Supabase
Criar arquivo `src/app/core/config/supabase.config.ts`:
```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
```

### 1.4 Criar Schema no Supabase
Executar no **SQL Editor** do Supabase Dashboard:

```sql
-- Tabela de entradas de log
CREATE TABLE log_entries (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    project TEXT NOT NULL,
    last_task TEXT NOT NULL,
    next_steps TEXT NOT NULL,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[]
);

-- Índice para performance
CREATE INDEX idx_log_entries_user_created 
ON log_entries(user_id, created_at DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE log_entries ENABLE ROW LEVEL SECURITY;

-- Policy: usuários só veem seus próprios dados
CREATE POLICY "Users can view own logs"
ON log_entries FOR SELECT
USING (auth.uid() = user_id);

-- Policy: usuários só inserem com seu próprio user_id
CREATE POLICY "Users can insert own logs"
ON log_entries FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: usuários podem atualizar seus próprios dados
CREATE POLICY "Users can update own logs"
ON log_entries FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: usuários podem deletar seus próprios dados
CREATE POLICY "Users can delete own logs"
ON log_entries FOR DELETE
USING (auth.uid() = user_id);
```

### 1.5 Configurar Variáveis de Ambiente
Atualizar arquivos de environment (criar se não existirem):

`src/environments/environment.ts`:
```typescript
export const environment = {
  production: true,
  supabase: {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
  }
};
```

`src/environments/environment.development.ts`:
```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
  }
};
```

---

## Fase 2: Refatoração do LogService

### 2.1 Remover Dependências Electron
**Arquivo:** `src/app/core/services/log.service.ts`

**Ações:**
- Remover propriedade `private isElectron = !!window.electronAPI`
- Remover imports relacionados a Electron
- Remover toda lógica de fallback LocalStorage

### 2.2 Injetar Cliente Supabase
Adicionar import e injeção:
```typescript
import { supabase } from '../config/supabase.config';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
```

### 2.3 Reescrever `getLogs()`
```typescript
async getLogs(): Promise<LogEntry[]> {
  try {
    const { data, error } = await supabase
      .from('log_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return new Promise((resolve) => {
      this.ngZone.run(() => {
        resolve(data || []);
      });
    });
  } catch (error) {
    console.error('Erro ao carregar logs do Supabase:', error);
    this.handleOffline(error);
    return [];
  }
}
```

### 2.4 Reescrever `saveLog()`
```typescript
async saveLog(entry: LogEntry, currentEntries: LogEntry[]): Promise<LogEntry[]> {
  try {
    // Adicionar user_id automaticamente
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('Usuário não autenticado');

    const entryWithUser = {
      ...entry,
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('log_entries')
      .insert(entryWithUser)
      .select()
      .single();

    if (error) throw error;

    // Atualização otimista - prepend local
    return new Promise((resolve) => {
      this.ngZone.run(() => {
        resolve([data, ...currentEntries]);
      });
    });
  } catch (error) {
    console.error('Erro ao salvar log:', error);
    this.handleOffline(error);
    throw error;
  }
}
```

### 2.5 Adicionar Tratamento de Offline
```typescript
private handleOffline(error: any): void {
  if (error.message?.includes('Failed to fetch') || !navigator.onLine) {
    // Emitir evento ou signal para exibir banner de offline
    console.error('Aplicação requer conexão com internet');
  }
}
```

---

## Fase 3: Refatoração do AuthService

### 3.1 Injetar Cliente Supabase
**Arquivo:** `src/app/core/services/auth.service.ts`

Adicionar:
```typescript
import { supabase } from '../config/supabase.config';

// Constante para email dummy
private readonly DUMMY_EMAIL_DOMAIN = '@devcontext.local';
```

### 3.2 Implementar `checkSetup()`
```typescript
async checkSetup() {
  try {
    const { data } = await supabase.auth.getSession();
    
    this.ngZone.run(() => {
      if (data.session) {
        this.isAuthenticated.set(true);
        this.isSetupRequired.set(false);
      } else {
        // Verificar se já existe algum usuário cadastrado
        // (isso requer uma tabela auxiliar ou checagem via localStorage)
        const hasExistingUser = localStorage.getItem('devcontext_user_email');
        this.isSetupRequired.set(!hasExistingUser);
      }
    });
  } catch (error) {
    console.error('Erro ao verificar setup:', error);
    this.isSetupRequired.set(true);
  }
}
```

### 3.3 Reescrever `setupPassword()`
```typescript
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
```

### 3.4 Reescrever `login()`
```typescript
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
```

### 3.5 Reescrever `changePassword()`
```typescript
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
```

### 3.6 Adicionar `initSession()`
```typescript
async initSession() {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    this.isAuthenticated.set(true);
  }
}
```

### 3.7 Manter `validatePassword()` sem alterações
```typescript
validatePassword(password: string): boolean {
  const minLength = 6;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return password.length >= minLength && hasUpper && hasLower && hasNumber;
}
```

---

## Fase 4: Atualização do Modelo de Dados

### 4.1 Modificar LogEntry Interface
**Arquivo:** `src/app/core/models/log-entry.model.ts`

```typescript
export interface LogEntry {
    uuid?: string;         // UUID do PostgreSQL
    created_at: string;    // Timestamp ISO compatível com TIMESTAMPTZ
    user_id?: string;      // UUID do usuário (auth.users)
    project: string;       // Nome do projeto/contexto
    last_task: string;     // Descrição do trabalho realizado
    next_steps: string;    // Próximas ações críticas
    tags: string[];        // Array nativo (compatível com PostgreSQL TEXT[])
}
```

**Mudanças:**
- ❌ Remover `id?: number` (SQLite auto-increment)
- ✅ Manter `uuid?: string` 
- ✅ Adicionar `user_id?: string`
- 🔄 Alterar `tags: string` → `tags: string[]`

---

## Fase 5: Ajustes nos Componentes

### 5.1 DiaryComponent
**Arquivo:** `src/app/features/diary/diary.component.ts`

**Mudanças:**

1. **Remover flag `isElectron`:**
```typescript
// Remover: isElectron = !!window.electronAPI;
```

2. **Alterar badge de status:**
```html
<!-- De: -->
<div class="badge">
  {{ isElectron ? 'Conectado ao SQLite' : 'Modo Web (LocalStorage)' }}
</div>

<!-- Para: -->
<div class="badge">
  Conectado ao Supabase
</div>
```

3. **Alterar envio de tags (remover stringify):**
```typescript
// De:
tags: JSON.stringify(this.selectedTags)

// Para:
tags: [...this.selectedTags]  // Array direto
```

4. **Adicionar tratamento de erro de conexão:**
```typescript
async onSubmit() {
  try {
    const newEntry: LogEntry = {
      uuid: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      project: formVal.project,
      last_task: formVal.last_task,
      next_steps: formVal.next_steps,
      tags: [...this.selectedTags]
    };

    const updatedLogs = await this.logService.saveLog(newEntry, this.entries());
    this.entries.set(updatedLogs);
    this.entryForm.reset();
  } catch (error) {
    // Mostrar mensagem de erro na UI
    console.error('Falha ao salvar. Verifique sua conexão com internet.');
  }
}
```

### 5.2 LogDetailModalComponent
**Arquivo:** `src/app/features/diary/components/log-detail-modal/log-detail-modal.component.ts`

**Simplificar `parseTags()`:**
```typescript
// De:
parseTags(tags: string | string[]): string[] {
  if (Array.isArray(tags)) return tags;
  try {
    return JSON.parse(tags);
  } catch {
    return [];
  }
}

// Para:
parseTags(tags: string[]): string[] {
  return tags || [];
}
```

### 5.3 LoginComponent
**Arquivo:** `src/app/features/auth/login/login.component.ts`

**Melhorias:**

1. **Melhorar mensagens de erro:**
```typescript
async onLogin() {
  const { password } = this.loginForm.value;
  const success = await this.authService.login(password!);
  
  if (!success) {
    this.errorMessage.set(
      'Senha incorreta ou problema de conexão. Verifique sua internet.'
    );
  }
}
```

2. **Adicionar feedback de sucesso no setup:**
```typescript
async onSetup() {
  // ... validações existentes ...
  
  const success = await this.authService.setupPassword(password!);
  if (!success) {
    this.errorMessage.set(
      'Erro ao definir senha. Verifique sua conexão com internet.'
    );
  }
}
```

---

## Fase 6: Limpeza e Remoção de Código Legado

### 6.1 Deletar Arquivo Electron
❌ **Deletar:** `src/app/core/types/electron.d.ts`

### 6.2 Remover Referências a `window.electronAPI`
Buscar globalmente e remover todas as referências:
```bash
# Buscar no projeto
grep -r "window.electronAPI" src/
grep -r "electronAPI" src/
```

### 6.3 Atualizar README.md
**Arquivo:** `README.md`

**Mudanças:**

1. **Remover seção "Desktop e Persistência"** (linhas 115-117)

2. **Atualizar tabela de tecnologias:**
```markdown
### Desktop e Persistência
- **Supabase**: Backend-as-a-Service (PostgreSQL + Auth)
- **Supabase Auth**: Autenticação de usuários
- **PostgreSQL**: Banco de dados relacional via Supabase
```

3. **Adicionar seção "Configuração do Supabase":**
```markdown
## ⚙️ Configuração do Supabase

### Pré-requisitos
1. Criar conta gratuita em [supabase.com](https://supabase.com)
2. Criar novo projeto no Dashboard

### Setup
1. Copiar credenciais do projeto:
   - **Project URL**: Settings > API > Project URL
   - **Anon Key**: Settings > API > Project API keys > anon/public

2. Executar SQL para criar tabelas (ver seção "Schema" acima)

3. Configurar variáveis de ambiente:
   - Editar `src/environments/environment.ts`
   - Adicionar URL e anon key do projeto

### Variáveis de Ambiente
```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'https://xxxxx.supabase.co',
    anonKey: 'eyJhbGci...'
  }
};
```
```

4. **Atualizar seção "Como Executar":**
```markdown
### Pré-requisitos
- Node.js (versão recomendada: 18+)
- npm ou yarn
- Conta no Supabase (gratuita)
- Conexão com internet
```

5. **Atualizar "Compatibilidade":**
```markdown
### Navegadores Suportados
- Chrome/Edge (recomendado para Web Speech API)
- Firefox (funcionalidade de voz pode não estar disponível)
- Safari (funcionalidade de voz pode não estar disponível)

**Nota:** Aplicação requer conexão com internet para funcionar.
```

6. **Remover seções sobre Electron:**
   - Remover "Plataformas Electron"
   - Atualizar seção "Visão Geral" removendo menção a "aplicação desktop Electron"

### 6.4 Revisar package.json
Verificar e remover dependências relacionadas a Electron:
```json
// Se houver, remover:
"electron": "...",
"electron-builder": "...",
etc.
```

### 6.5 Limpar Imports Não Utilizados
Executar linter/formatter em todos os arquivos modificados:
```bash
npm run lint
```

---

## Fase 7: Melhorias de UX para Modo Online-Only

### 7.1 Criar Componente de Banner Offline
**Arquivo:** `src/app/shared/components/offline-banner.component.ts`

```typescript
import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-offline-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (!isOnline()) {
      <div class="offline-banner">
        ⚠️ Sem conexão com internet - DevContext requer conexão para funcionar
      </div>
    }
  `,
  styles: [`
    .offline-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: #ff6b6b;
      color: white;
      padding: 12px;
      text-align: center;
      font-weight: 600;
      z-index: 9999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
  `]
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
```

### 7.2 Adicionar Banner ao App
**Arquivo:** `src/app/app.html`

```html
<app-offline-banner />

@if (authService.isAuthenticated()) {
  <app-diary />
} @else {
  <app-login />
}
```

Adicionar import no `app.ts`:
```typescript
import { OfflineBannerComponent } from './shared/components/offline-banner.component';

@Component({
  // ...
  imports: [/* ... */, OfflineBannerComponent],
})
```

### 7.3 Desabilitar Formulário Quando Offline
**Arquivo:** `src/app/features/diary/diary.component.ts`

```typescript
isOnline = signal(navigator.onLine);

ngOnInit() {
  // ... código existente ...
  
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
```

No template:
```html
<form [formGroup]="entryForm" (ngSubmit)="onSubmit()" [class.disabled]="!isOnline()">
  <!-- ... campos ... -->
  
  <button type="submit" [disabled]="!isOnline() || entryForm.invalid">
    {{ isOnline() ? 'Salvar' : 'Offline - Não é possível salvar' }}
  </button>
</form>
```

### 7.4 Adicionar Loading States
**Arquivo:** `src/app/features/diary/diary.component.ts`

```typescript
isSaving = signal(false);

async onSubmit() {
  if (!this.isOnline()) return;
  
  this.isSaving.set(true);
  
  try {
    // ... lógica de salvamento ...
  } catch (error) {
    console.error('Erro ao salvar:', error);
  } finally {
    this.isSaving.set(false);
  }
}
```

Template do botão:
```html
<button type="submit" [disabled]="isSaving() || !isOnline()">
  @if (isSaving()) {
    <span class="spinner"></span> Salvando...
  } @else {
    <app-icon-save /> Salvar
  }
</button>
```

**Arquivo:** `src/app/features/auth/login/login.component.ts`

Similar loading state para botões de login/setup:
```typescript
isLoggingIn = signal(false);

async onLogin() {
  this.isLoggingIn.set(true);
  try {
    // ... lógica de login ...
  } finally {
    this.isLoggingIn.set(false);
  }
}
```

---

## Verificação e Testes

### Checklist de Verificação

#### ✅ Configuração
- [ ] Projeto Supabase criado
- [ ] Credenciais configuradas em `environment.ts`
- [ ] Schema SQL executado com sucesso
- [ ] RLS policies ativas e funcionando

#### ✅ Autenticação
- [ ] Criar conta via fluxo de setup
- [ ] Verificar usuário criado no Supabase Dashboard → Authentication
- [ ] Email dummy visível no formato `user-xxxxx@devcontext.local`
- [ ] Fazer logout e login com senha configurada
- [ ] Verificar session ativa após login
- [ ] Testar troca de senha com senha antiga correta
- [ ] Testar troca de senha com senha antiga incorreta (deve falhar)

#### ✅ Persistência de Dados
- [ ] Criar 3-5 entradas de log com diferentes projetos
- [ ] Adicionar diferentes combinações de tags
- [ ] Verificar no Supabase Dashboard → Table Editor:
  - [ ] Dados salvos corretamente
  - [ ] Campo `tags` aparece como array (ex: `{Backend,Frontend}`)
  - [ ] `user_id` corresponde ao usuário autenticado
  - [ ] Timestamps em ordem decrescente

#### ✅ Interface
- [ ] Badge exibe "Conectado ao Supabase"
- [ ] Histórico carrega corretamente na barra lateral
- [ ] Modal de detalhes exibe tags como lista (sem JSON stringificado)
- [ ] Formulário limpa após salvar

#### ✅ Funcionalidades Offline
- [ ] Banner de offline aparece ao desconectar (DevTools → Network → Offline)
- [ ] Formulário desabilitado quando offline
- [ ] Botão de salvar exibe mensagem apropriada quando offline
- [ ] Banner desaparece ao reconectar

#### ✅ Build e Deploy
- [ ] Executar `npm run build` sem erros
- [ ] Verificar bundle size aceitável (< 1MB inicial)
- [ ] Não há referências a `electronAPI` no código compilado:
  ```bash
  grep -r "electronAPI" dist/
  ```

### Testes Manuais de Edge Cases

1. **Perda de conexão durante salvamento:**
   - Iniciar salvamento de log
   - Desconectar internet antes de completar
   - Verificar mensagem de erro amigável

2. **Session expirada:**
   - Fazer login
   - Aguardar expiração de session (ou forçar no DevTools)
   - Tentar criar log
   - Verificar redirecionamento para login

3. **Múltiplas abas:**
   - Abrir app em 2 abas
   - Fazer login em uma
   - Verificar se outra aba também autentica (ou requer refresh)

4. **Dados vazios:**
   - Criar log sem selecionar tags
   - Verificar que campo `tags` salva como array vazio `[]`

---

## Decisões de Arquitetura

### 1. Email Dummy vs. Email Real
**Decisão:** Email dummy interno (`user-xxxxx@devcontext.local`)

**Justificativa:**
- Mantém UX atual (apenas senha, sem campo de email visível)
- Supabase Auth requer email, então usamos email transparente no backend
- Usuário não precisa lembrar de email adicional
- Simplicidade na interface

**Trade-offs:**
- Usuário não pode recuperar senha via email (feature futura se necessário)
- Migração entre dispositivos requer export/import manual

### 2. Array Nativo vs. JSON String para Tags
**Decisão:** Migrar para `TEXT[]` (array nativo do PostgreSQL)

**Justificativa:**
- Permite queries nativas: `WHERE 'Backend' = ANY(tags)`
- Indexação mais eficiente (GIN indexes)
- Remove necessidade de parsing JSON no frontend
- Compatível com tipagem TypeScript `string[]`

**Trade-offs:**
- Breaking change na interface (requer migração de dados existentes)
- Arrays PostgreSQL tem sintaxe específica em queries

### 3. Atualização Otimista vs. Reload Completo
**Decisão:** Atualização otimista (prepend local após insert)

**Justificativa:**
- Melhor UX - feedback imediato ao usuário
- Reduz chamadas ao banco (não recarrega lista inteira)
- Lista de logs tende a crescer - reload completo fica lento

**Trade-offs:**
- Possível inconsistência temporária se insert falhar
- Requer tratamento de erro para reverter UI

### 4. Online-Only vs. Offline com Sincronização
**Decisão:** Online-only com mensagens amigáveis

**Justificativa:**
- Simplifica arquitetura (sem lógica de sincronização dual)
- Elimina conflitos de merge
- Conforme preferência do usuário
- Aplicação web moderna (assume conectividade)

**Trade-offs:**
- Não funciona offline (limitação clara para usuário)
- Requer conexão constante
- Possível problema em áreas com internet instável

### 5. RLS Policies vs. Lógica de Filtro no Service
**Decisão:** Row Level Security (RLS) no Supabase

**Justificativa:**
- Segurança em camada de banco (não depende de código frontend)
- Impossível para usuário acessar dados de outro via API
- Reduz lógica de filtro no frontend

**Trade-offs:**
- Configuração inicial mais complexa
- Debugging de policies pode ser desafiador

---

## Próximos Passos Após Implementação

### Melhorias Futuras (Backlog)

1. **Recuperação de Senha:**
   - Adicionar campo de email visível no setup
   - Implementar fluxo de recuperação via email do Supabase

2. **Sincronização Realtime:**
   - Usar `supabase.channel()` para updates em tempo real
   - Atualizar lista quando novo log é criado (mesmo usuário, múltiplas abas)

3. **Filtros e Busca:**
   - Filtrar logs por projeto
   - Busca full-text em `last_task` e `next_steps`
   - Filtro por data range

4. **Export de Dados:**
   - Botão para exportar logs como JSON/CSV
   - Facilita backup e portabilidade

5. **PWA (Progressive Web App):**
   - Adicionar service worker
   - Instalável como app nativo
   - Ícones e splash screen

6. **Analytics:**
   - Rastreamento de uso (quantos logs por dia/semana)
   - Tags mais usadas
   - Projetos mais ativos

7. **Modo Escuro/Claro:**
   - Toggle de tema
   - Persiste preferência no localStorage

---

## Recursos e Referências

### Documentação
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Array Types](https://www.postgresql.org/docs/current/arrays.html)

### Exemplos de Código
- [Supabase Angular Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/angular)
- [Supabase Auth with Angular](https://supabase.com/docs/guides/auth/auth-helpers/angular)

### Ferramentas
- [Supabase CLI](https://supabase.com/docs/guides/cli) - Para migrations locais
- [Supabase Studio](https://supabase.com/docs/guides/database/overview#supabase-studio) - Interface visual do banco

---

**Data de Criação:** 18 de fevereiro de 2026  
**Status:** Pronto para implementação
