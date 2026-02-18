# Database Schemas

Versionamento de schemas do banco de dados Supabase para DevContext.

## 📋 Versões

### V1 - Schema Inicial
**Arquivo**: `schema-v1.sql`

Contém apenas a tabela `log_entries` para registro de entradas de diário.

**Use se**: Está iniciando um novo projeto do zero.

### V2 - Suporte a Múltiplos Projetos
**Arquivo**: `schema-v2.sql` (completo) ou `schema-v2-migration.sql` (migração)

Adiciona:
- Tabela `projects` com suporte a 5 status
- Relacionamento entre `log_entries` e `projects`
- Suporte a RLS (Row Level Security)
- Tabela de versionamento (`schema_versions`)

**Use se**: 
- Está iniciando um projeto novo → execute `schema-v2.sql`
- Já tem V1 criada → execute `schema-v2-migration.sql`

## 🚀 Como Usar

1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Abra seu projeto
3. Vá em **SQL Editor** → **New Query**
4. Copie o conteúdo do arquivo SQL desejado
5. Clique em **Run**

## 📊 Status do Projeto

- `Aguardando` - Projeto em fila
- `Em execução` - Projeto ativo
- `Pausado` - Projeto interrompido
- `Finalizado` - Projeto concluído
- `Cancelado` - Projeto cancelado

## 🔄 Migração

Para migrar de V1 para V2:

1. Execute `schema-v2-migration.sql` no Supabase
2. Atualize o código da aplicação para usar as novas tabelas

## 📝 Notas

- Todos os schemas têm RLS (Row Level Security) habilitado
- Usuários só podem ver/modificar seus próprios dados
- Índices são criados para otimizar consultas
