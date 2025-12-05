# 📘 Documentação Completa - EscalaApp

## 🌟 Visão Geral
O **EscalaApp** é uma aplicação web progressiva (PWA) desenvolvida para gerenciar escalas de trabalho, plantões e férias de equipes de TI/NOC. O sistema oferece controle de acesso baseado em funções (Admin/Visualizador), geração automática de escalas com regras complexas (12x36, FDS alternado) e exportação de relatórios.

**URL de Produção:** [https://escala-app-three.vercel.app/](https://escala-app-three.vercel.app/)

---

## 📂 Guia de Arquivos (Estrutura do Projeto)

Aqui está uma explicação detalhada de onde encontrar cada parte do código:

### 1. `index.html` (Estrutura)
*   É o arquivo principal e único da aplicação (SPA - Single Page Application).
*   Contém todo o esqueleto HTML:
    *   **Login Container:** Tela de login/cadastro.
    *   **Sidebar:** Menu lateral de navegação.
    *   **Views:** As diferentes telas do sistema (`dashboardView`, `calendarView`, `employeesView`, etc.), que são mostradas/ocultadas via JavaScript.
    *   **Modais:** Janelas flutuantes para adicionar funcionários, férias, etc.

### 2. `styles.css` (Estilo e Design)
*   Contém todo o CSS da aplicação.
*   **Variáveis (:root):** No topo do arquivo, você encontra as cores principais (`--primary`, `--bg-card`) e as **cores dos turnos** (`--shift-t1`, etc.).
*   **Responsividade:** No final do arquivo, existem as media queries (`@media`) que ajustam o layout para celulares.

### 3. `app.js` (Lógica Principal)
*   É o "cérebro" da aplicação.
*   **Supabase Config:** Inicialização da conexão com o banco de dados.
*   **AppState:** Objeto que guarda os dados carregados na memória (funcionários, turnos, escala atual).
*   **Funções Principais:**
    *   `initializeApp()`: Verifica login e carrega dados.
    *   `generateSchedule()`: O algoritmo que cria a escala automática respeitando férias e regras.
    *   `renderCalendar()`: Desenha a tabela de escala na tela.
    *   `saveAppData()`: Envia as alterações para o Supabase.

### 4. `import-data.js` (Dados e Importação)
*   Arquivo auxiliar usado para **Importação em Massa** ou **Reset** de dados.
*   Contém um objeto gigante `COMPLETE_IMPORT_DATA` com a lista padrão de funcionários, turnos e regras.
*   **Dica:** Se precisar mudar a cor de um turno permanentemente ou adicionar vários funcionários de uma vez, edite este arquivo e use a função "Importar Dados Completos" nas Configurações do app.

---

## 🚀 Funcionalidades Chave

### 1. Autenticação
*   **Login/Cadastro:** Integrado com Supabase Auth.
*   **Níveis de Acesso:**
    *   **Admin:** (Código `escala2025`) Pode editar tudo.
    *   **Visualizador:** Só pode ver.

### 2. Escala Mensal (Calendário)
*   **Visualização:** Tabela com cores vibrantes para fácil identificação.
*   **Horários:** A coluna exibe o horário exato (ex: "08:30 as 18:18").
*   **Geração Inteligente:**
    1.  **Férias:** Prioridade máxima (marca como `FE`).
    2.  **12x36:** Calcula dias de trabalho e folga automaticamente.
    3.  **FDS:** Alterna finais de semana conforme a regra do funcionário.

### 3. Gestão de Plantões (On-Call)
*   Linha de destaque no topo da escala.
*   Rotação automática de nomes baseada na data de início.

### 4. Relatórios
*   Gera CSV compatível com Excel contendo horas trabalhadas em finais de semana e horas de sobreaviso.

---

## 🗄️ Banco de Dados (Supabase)

Tabelas utilizadas:
1.  **`employees`**: Funcionários e suas regras.
2.  **`shifts`**: Definição dos turnos (Nome, Horário, Cor).
3.  **`oncalls`**: Configuração das equipes de plantão.
4.  **`holidays`**: Feriados cadastrados.
5.  **`monthly_schedules`**: O JSON da escala gerada para cada mês.
6.  **`vacations`**: Períodos de férias.

---

## ⚙️ Como Rodar Localmente

1.  **Clone o projeto:**
    ```bash
    git clone https://github.com/alankardecm/escala-app.git
    ```
2.  **Instale uma extensão de servidor local** (como "Live Server" no VS Code).
3.  **Abra o `index.html` com o Live Server.**
    *   *Importante:* O Login do Supabase pode não funcionar se abrir direto pelo arquivo (`file://`). Use `http://localhost` ou `http://127.0.0.1`.

---

## 🔄 Manutenção

### Mudar Cores dos Turnos
1.  Edite o arquivo `import-data.js` na seção `shifts`.
2.  Altere o código Hexadecimal (ex: `#E0AAFF`).
3.  No App, vá em **Configurações > Importar Dados Completos**.

### Atualizar no GitHub/Vercel
```bash
git add .
git commit -m "Descrição da mudança"
git push
```
A Vercel detectará o push e atualizará o site em produção automaticamente.
