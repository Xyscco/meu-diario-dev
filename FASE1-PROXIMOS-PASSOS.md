# Próximos Passos - Fase 1: Configuração do Supabase

## ✅ O que já foi feito automaticamente:

1. ✅ Dependência `@supabase/supabase-js` instalada
2. ✅ Arquivo de configuração criado em `src/app/core/config/supabase.config.ts`
3. ✅ Arquivos de ambiente criados:
   - `src/environments/environment.ts` (produção)
   - `src/environments/environment.development.ts` (desenvolvimento)
4. ✅ Schema SQL criado em `supabase-schema.sql`

## 📋 O que você precisa fazer manualmente:

### 1. Criar Projeto no Supabase

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Faça login ou crie uma conta (gratuita)
3. Clique em "New Project"
4. Preencha:
   - **Name**: meu-diario-dev (ou nome de sua preferência)
   - **Database Password**: escolha uma senha forte
   - **Region**: escolha a região mais próxima
5. Aguarde a criação do projeto (~2 minutos)

### 2. Copiar Credenciais do Projeto

1. No dashboard do seu projeto, vá em **Settings** (ícone de engrenagem) → **API**
2. Copie as seguintes informações:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon/public key** (em "Project API keys") - use como publishable key

### 3. Atualizar Arquivos de Ambiente

Edite os seguintes arquivos com suas credenciais:

**`src/environments/environment.ts`:**
```typescript
export const environment = {
  production: true,
  supabase: {
    url: 'https://xxxxx.supabase.co',  // ← Cole sua Project URL aqui
    publishableKey: 'eyJhbGci...'       // ← Cole sua publishable key aqui
  }
};
```

**`src/environments/environment.development.ts`:**
```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'https://xxxxx.supabase.co',  // ← Cole sua Project URL aqui
    publishableKey: 'eyJhbGci...'       // ← Cole sua publishable key aqui
  }
};
```

### 4. Executar Schema SQL

1. No dashboard do Supabase, vá em **SQL Editor** (ícone de banco de dados)
2. Clique em "New Query"
3. Copie todo o conteúdo do arquivo `supabase-schema.sql` (criado na raiz do projeto)
4. Cole no editor SQL
5. Clique em "Run" ou pressione Ctrl+Enter
6. Verifique se a mensagem "Success. No rows returned" aparece

### 5. Verificar Configuração

1. Vá em **Table Editor** no dashboard
2. Você deve ver a tabela `log_entries` criada
3. Vá em **Authentication** → **Policies**
4. Verifique se as 4 policies foram criadas para `log_entries`:
   - Users can view own logs
   - Users can insert own logs
   - Users can update own logs
   - Users can delete own logs

## 🎉 Fase 1 Concluída!

Após completar esses passos manuais, a Fase 1 estará completa e você poderá prosseguir para a **Fase 2: Refatoração do LogService**.

---

**Dúvidas?** Consulte o arquivo `plan-migracaoSupabase.prompt.md` para mais detalhes.
