# Documentação Técnica - EscalaApp

**Projeto:** Sistema de Gestão de Escalas Automáticas (NOC & Suporte)
**Versão:** 1.2 (Stable Production)
**Data da Documentação:** 05/12/2025
**Desenvolvedor Principal:** Alan Moreira & Antigravity AI

---

## 1. Visão Geral
O EscalaApp é uma aplicação web (Single Page Application - SPA) desenvolvida para substituir planilhas manuais na gestão de escalas de trabalho de equipes de TI (NOC, Suporte, Redes). Ele permite o cadastro de funcionários, turnos, e gera automaticamente a escala mensal baseada em regras complexas (12x36, alternado, folga FDS).

### Tecnologias Usadas
-   **Frontend:** HTML5, CSS3 (Variáveis CSS para temas), JavaScript (Vanilla ES6+).
-   **Backend/Banco de Dados:** Supabase (PostgreSQL + Auth).
-   **Hospedagem:** Vercel (Frontend), Supabase (Backend).
-   **Autenticação:** Supabase Auth (Email/Senha).

---

## 2. Estrutura do Projeto

```
/
├── index.html           # Estrutura única da aplicação (SPA)
├── style.css            # Estilização global, temas (Dark/Light) e componentes
├── app.js               # Lógica CORE: Conexão DB, Estado, Renderização, Eventos
├── import-data.js       # Script auxiliar para Reset, Importação Inicial e Auto-Cura
├── manifest.json        # Configuração PWA (Instalação no Desktop/Mobile)
└── sw.js                # Service Worker para cache e funcionamento offline (básico)
```

---

## 3. Fluxo de Funcionamento e Lógica Crítica

### 3.1. Carregamento de Dados (`loadAppData` em `app.js`)
Esta é a função mais crítica do sistema. Ela conecta no Supabase e baixa 5 tabelas simultaneamente (`employees`, `shifts`, `oncalls`, `holidays`, `monthly_schedules`).

**Problema Encontrado (Bug dos "Turnos Sumindo"):**
Durante o desenvolvimento, enfrentamos um problema onde o Supabase retornava dados vazios (`[]`) aleatoriamente, provavelmente devido a cache local ou instabilidade de rede, fazendo a interface "limpar" os turnos da tela.

**Solução Implementada (Auto-Cura / Self-Healing):**
Implementamos uma lógica de proteção robusta dentro de `loadAppData`:
1.  **Proteção de Sobrescrita:** Se o Supabase retornar vazio, mas a memória local (`AppState`) já tiver dados, o sistema IGNORA a resposta vazia e mantém os dados locais.
2.  **Auto-Recuperação:** Se o sistema detectar que a tabela de Turnos está realmente vazia (0 registros), ele aciona automaticamente a função `importCompleteData(true)` em modo silencioso para restaurar a estrutura básica do banco sem intervenção humana.

### 3.2. Importação e Reset (`importCompleteData` em `import-data.js`)
Função responsável por popular o banco de dados.

**Logica de Segurança:**
*   **Modo Manual:** Limpa TUDO e reimporta do zero (Reset de Fábrica).
*   **Modo Silencioso (Auto-Cura):** Restaura apenas dados estruturais (`shifts`, `oncalls`) se estiverem faltando. **NUNCA APAGA** `employees` (Funcionários) ou `vacations` (Férias) neste modo, preservando os dados cadastrados pelo usuário.

### 3.3. Geração de Escala (`generateSmartSchedule` em `import-data.js`)
O algoritmo que preenche a grade mensal:
1.  Verifica **Férias** primeiro (Regra Suprema).
2.  Verifica regra **12x36**.
3.  Aplica regras de **Fim de Semana** (Alternado, Folga Fixa, Trabalho no Domingo).
4.  Preenche dias úteis com o turno padrão do funcionário.

---

## 4. Banco de Dados (Supabase)

### Tabelas Principais
*   **employees:** `id` (uuid), `name`, `sector`, `shift_id` (vínculo com shifts), `weekend_rule`.
*   **shifts:** `id` (código ex: 't1', 'bh'), `name`, `time` (07:00 às 16:00), `color`.
    *   *Nota:* O turno 'BH' (Banco de Horas) tem cor fixa tratada no código para visibilidade (#9FA8DA).
*   **oncalls:** Plantões e rodízios.
*   **vacations:** Férias (`employeeName`, `start`, `end`).
*   **monthly_schedules:** Armazena o JSON da escala gerada para cada mês (`month_key`: '2025-12', `data`: JSON).

---

## 5. Erros Conhecidos e Soluções (Troubleshooting)

| Sintoma | Causa Provável | Solução |
| :--- | :--- | :--- |
| **Turnos desapareceram da tela** | Falha no carregamento do Supabase ou Cache. | O sistema deve se auto-curar em 2s. Se não, recarregue a página ou clique em "Importar Dados Completos" nas Configurações. |
| **Alteração de regra de funcionário não reflete na escala** | Escala do mês já estava gerada/salva. | Vá na "Escala do Mês", clique em "Gerar Escala" novamente e confirme a sobrescrita. |
| **Banco de dados retornando erro de permissão** | Token do Supabase expirou ou RLS mal configurado. | Verifique se as Policies (RLS) no Supabase estão como `public` para leitura/escrita (configuração atual simplificada). |
| **Dados salvos não persistem** | Falha de conexão na hora do `upsert`. | Verifique o console do navegador (F12). O sistema alerta se falhar. |

---

## 6. Como Manter e Ovoluir

1.  **Adicionar Novo Turno:**
    *   Adicione o objeto no array `shifts` dentro de `import-data.js` (para ser o padrão em novos resets).
    *   Ou adicione via interface gráfica na aba "Turnos".

2.  **Backup:**
    *   A tabela `monthly_schedules` é o backup histórico. Nunca a apague a menos que queira perder o histórico de quem trabalhou quando.

3.  **Local vs Produção:**
    *   O código detecta se está rodando local (`file://` ou `localhost`) e tenta contornar problemas de cache. Sempre teste as alterações de lógica de dados em aba anônima.

---

**Observação Final:** O sistema foi projetado para ser resiliente. A lógica de "Auto-Recuperação" é o coração da estabilidade atual. Ao alterar `loadAppData` ou `importCompleteData`, tenha extremo cuidado para não quebrar essa proteção.
