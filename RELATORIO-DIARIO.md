# Relatório Diário - Nova Funcionalidade

## Visão Geral

Foi implementada uma nova funcionalidade de **Relatório Diário** que permite gerar um resumo do que foi feito durante o dia, organizando as informações em três categorias:

- 🗓️ **Hoje (Realizado)** - Tarefas concluídas no dia atual
- ➡️ **Próximo Dia (Foco)** - Tarefas planejadas para o próximo dia
- 🚫 **Impedimentos** - Bloqueios e problemas encontrados

## Mudanças Implementadas

### 1. Modelo de Dados (`LogEntry`)

Foram adicionados dois novos campos ao modelo `LogEntry`:

```typescript
interface LogEntry {
    // ... campos existentes
    is_next_day_task?: boolean;  // Marca se a tarefa é para o próximo dia
    impediments?: string;         // Registra impedimentos encontrados
}
```

### 2. Banco de Dados

Foi criado um script de migração (`schema-v3-migration.sql`) que adiciona as novas colunas à tabela `log_entries`:

```sql
ALTER TABLE log_entries 
ADD COLUMN IF NOT EXISTS is_next_day_task BOOLEAN DEFAULT false;

ALTER TABLE log_entries 
ADD COLUMN IF NOT EXISTS impediments TEXT;
```

**Como aplicar a migração:**

1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Execute o conteúdo do arquivo `database/schemas/schema-v3-migration.sql`

### 3. Formulário do Diário

O formulário de registro foi atualizado com:

- ✅ **Checkbox** "Adicionar ao foco do próximo dia" - Marca a tarefa como prioridade para o dia seguinte
- 📝 **Campo de Impedimentos** - Campo opcional para registrar bloqueios, dependências ou problemas

### 4. Novo Componente: Relatório Diário

Foi criado um novo componente (`DailyReportComponent`) que exibe:

- Lista de tarefas concluídas hoje (que não foram marcadas para o próximo dia)
- Lista de tarefas marcadas como foco do próximo dia
- Lista de impedimentos registrados hoje
- Botão para copiar o relatório em formato texto para a área de transferência

### 5. Navegação

- Um botão **"📊 Relatório Diário"** foi adicionado ao header do Diário
- O relatório pode ser visualizado e copiado facilmente para compartilhamento

## Como Usar

### Registrar uma Tarefa

1. Acesse o Diário do projeto
2. Preencha o formulário normalmente
3. **Novo:** Marque o checkbox "Adicionar ao foco do próximo dia" se a tarefa deve aparecer no relatório do próximo dia
4. **Novo:** Preencha o campo "Impedimentos" se encontrou algum bloqueio
5. Salve o registro

### Visualizar o Relatório Diário

1. No Diário, clique no botão **"📊 Relatório Diário"**
2. Visualize as três seções organizadas
3. Clique em **"Copiar Relatório"** para copiar o texto formatado para colar em reuniões, Slack, etc.

## Exemplo de Relatório Gerado

```
🗓️ Hoje (Realizado)
Desenvolvimento(CONV-639): Finalizado o conversor é liberado para validar
Desenvolvimento(SIA): Conectada a lista de versões do SOMBRA vinculadas a versão do Unifar
Reunião: Discutir e alinhar pontos do SIA e prioridades nas correções

➡️ Próximo Dia (Foco)
Desenvolvimento(XCopy): Criar tratamentos para erros informados nos tickets DES-1698 e DES-1699
Conversão(Troca de CNPJ): Será realizada por mim porque a correção ainda não foi liberada
Desenvolvimento(SIA): Iniciar testes de atualização do SOMBRA
Desenvolvimento(DES-1691): Liberação da versão em caso de sucesso dos testes

🚫 Impedimentos
Sem impedimentos.
```

## Arquivos Modificados

- `src/app/core/models/log-entry.model.ts` - Modelo atualizado
- `src/app/features/diary/diary.component.ts` - Lógica do formulário
- `src/app/features/diary/diary.component.html` - Campos adicionados
- `src/app/app.ts` - Navegação e importação do novo componente
- `src/app/app.html` - Rota do relatório
- `database/schemas/schema-v3-migration.sql` - Script de migração

## Arquivos Criados

- `src/app/features/diary/daily-report/daily-report.component.ts`
- `src/app/features/diary/daily-report/daily-report.component.html`

## Próximos Passos (Opcional)

- [ ] Adicionar filtro por data no relatório
- [ ] Exportar relatório em diferentes formatos (Markdown, JSON)
- [ ] Gráficos de produtividade baseados nos registros
- [ ] Notificações de impedimentos não resolvidos
