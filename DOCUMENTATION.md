# 📘 Documentação do Sistema EscalaApp

## 🌟 Visão Geral
O **EscalaApp** é uma aplicação web progressiva (PWA) desenvolvida para automatizar e gerenciar a escala de trabalho da equipe de TI/NOC. O sistema permite a visualização mensal, gestão de funcionários, turnos, plantões e feriados, com geração automática de escalas baseada em regras inteligentes.

---

## 🚀 Funcionalidades Principais

### 1. Dashboard
- **Visão Geral:** Cards com totais de funcionários, turnos, plantões e feriados.
- **Resumo de Setores:** Contagem rápida de colaboradores por equipe.
- **Próximos Feriados:** Lista dos feriados mais próximos.

### 2. Escala do Mês (Calendário)
- **Visualização Visual:** Tabela estilo Excel com cores para cada turno.
- **Responsividade:** Layout adaptado para Desktop e Mobile (com colunas fixas inteligentes).
- **Edição Rápida:** Clique em qualquer célula para alterar o turno manualmente.
- **Legenda:** Mostra todos os códigos de turno ativos.

### 3. Gestão de Funcionários
- Cadastro completo com Nome, Setor, Turno Padrão e Regra de Fim de Semana.
- **Programação de Férias:** Sistema de agendamento de férias que bloqueia automaticamente a escala do funcionário no período.

### 4. Automação (Gerador Inteligente V2)
O sistema utiliza um algoritmo de prioridades para gerar a escala:
1.  **Prioridade 1 - Férias:** Se o funcionário estiver de férias, o dia é marcado como `FE` (Férias).
2.  **Prioridade 2 - Escala 12x36:** Calcula automaticamente os dias de trabalho e folga baseados em uma data pivô (01/11/2025).
3.  **Prioridade 3 - Regras de Fim de Semana:**
    *   `alternating`: Trabalha um fim de semana sim, outro não.
    *   `alternating_sat`: Trabalha sábados alternados (Domingo é sempre folga).
    *   `off`: Folga todo sábado e domingo.
4.  **Prioridade 4 - Feriados:** Se for dia de trabalho e cair em feriado, vira `BH` (Banco de Horas).

### 5. Plantões (On-Call)
- Sistema de rotação semanal automática.
- Suporta múltiplas filas de plantão (NOC, N3, Voz, Tech).
- Visualização dedicada no topo da escala mensal.

---

## 🛠️ Tecnologias Utilizadas

*   **Frontend:** HTML5, CSS3 (Variáveis CSS, Grid, Flexbox), JavaScript (ES6+).
*   **Armazenamento:** Supabase (Banco de Dados em Nuvem) + LocalStorage (Cache de tema).
*   **PWA (Progressive Web App):** Funciona como aplicativo nativo no celular (Android/iOS), com ícone e tela cheia.
*   **Hospedagem:** Vercel (Frontend).

---

## 📱 Guia de Uso Mobile (PWA)

O sistema foi otimizado para celulares:
1.  **Instalação:** Abra no navegador (Chrome/Safari) e selecione "Adicionar à Tela Inicial".
2.  **Visualização:**
    *   A coluna **Funcionário** é fixa na esquerda.
    *   Role horizontalmente para ver os dias do mês.
    *   O cabeçalho (dias) acompanha a rolagem vertical.

---

## ⚙️ Regras de Negócio (Detalhado)

### Tipos de Escala de Fim de Semana
| Código Interno | Descrição | Comportamento |
| :--- | :--- | :--- |
| `alternating` | FDS Alternado | Trabalha Sáb e Dom sim, Sáb e Dom não. |
| `alternating_sat` | Sábado Alternado | Trabalha Sáb sim, Sáb não. Domingo sempre folga. |
| `off` | Folga Fixa | Sábado e Domingo sempre folga. |
| `12x36` | Plantão 12h | Trabalha 1 dia, folga 1 dia (independente de ser FDS). |

### Códigos de Turno Padrão
*   `T1`: 07:00 às 16:00
*   `T2`: 13:00 às 22:00
*   `T3`: 22:00 às 07:00 (Noturno)
*   `T4` a `T12`: Variações de horário.
*   `F`: Folga
*   `BH`: Banco de Horas (Feriado trabalhado)
*   `FE`: Férias

---

## 🔄 Como Atualizar o Sistema

O projeto está hospedado no GitHub e conectado à Vercel.

1.  **Faça as alterações** no código localmente (VS Code).
2.  **Salve** os arquivos.
3.  **Envie para o GitHub** (via terminal):
    ```bash
    git add .
    git commit -m "Descrição da mudança"
    git push
    ```
4.  **Aguarde:** A Vercel detecta o `git push` e atualiza o site automaticamente em cerca de 1-2 minutos.
5.  **No Celular:** Feche e abra o app para receber a nova versão.

---

## 📂 Estrutura de Pastas

*   `index.html`: Estrutura da página.
*   `styles.css`: Estilos, cores (Dark Mode) e regras responsivas.
*   `app.js`: Lógica da interface, renderização e eventos.
*   `import-data.js`: Lógica pesada de geração de escala ("Cérebro" do sistema) e dados iniciais.
*   `service-worker.js`: Configuração do PWA (Cache e funcionamento offline).
*   `manifest.json`: Configuração do ícone e nome do app para instalação no celular.
