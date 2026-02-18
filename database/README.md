# Database

Configurações e schemas do banco de dados.

## 📁 Estrutura

```
database/
├── schemas/              # Schemas SQL versionados
│   ├── README.md        # Guia de uso
│   ├── schema-v1.sql    # Schema inicial
│   ├── schema-v2.sql    # Schema completo (v2)
│   └── schema-v2-migration.sql  # Migração v1 → v2
```

## 🚀 Primeira Execução

Se está iniciando um novo projeto:

1. Abra [Supabase Dashboard](https://app.supabase.com)
2. Vá em **SQL Editor** → **New Query**
3. Copie o conteúdo de `schemas/schema-v2.sql`
4. Execute

## 🔧 Migração

Se já tem V1 criada:

1. Execute `schemas/schema-v2-migration.sql`

Veja mais detalhes em `schemas/README.md`
