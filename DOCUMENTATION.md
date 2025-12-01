# 📘 Documentação Completa - EscalaApp

## 🌟 Visão Geral
O **EscalaApp** é uma aplicação web progressiva (PWA) desenvolvida para gerenciar escalas de trabalho, plantões e férias de equipes de TI/NOC. O sistema oferece controle de acesso baseado em funções (Admin/Visualizador), geração automática de escalas com regras complexas (12x36, FDS alternado) e exportação de relatórios.

**URL de Produção:** [https://escala-app-three.vercel.app/](https://escala-app-three.vercel.app/)

---

## 🚀 Funcionalidades

### 1. Autenticação e Segurança
*   **Login/Cadastro:** Sistema integrado com Supabase Auth.
*   **Roles (Funções):**
    *   **Admin:** Acesso total (Editar, Salvar, Gerar Escala, Configurações). Código de cadastro: `escala2025`.
    *   **Visualizador:** Acesso somente leitura (Vê escalas e relatórios, mas não edita).
*   **Confirmação de E-mail:** Obrigatória para novos cadastros.

### 2. Escala Mensal (Calendário)
*   **Visualização:** Tabela dinâmica com cores por tipo de turno.
*   **Edição (Admin):** Clique em qualquer célula para alterar o turno manualmente.
*   **Geração Automática:** Algoritmo que respeita:
    1.  Férias (Prioridade máxima).
    2.  Escala 12x36 (Cálculo automático).
    3.  Regras de Fim de Semana (Alternado, Sábado Alternado, Folga Fixa).
    4.  Feriados (Vira Banco de Horas `BH` se trabalhado).
*   **Persistência:** As escalas geradas devem ser **SALVAS** para ficarem visíveis para outros usuários.

### 3. Gestão de Plantões (On-Call)
*   **Rotação Automática:** Define quem está de plantão a cada semana.
*   **Visualização:** Linha dedicada no topo da escala mensal.
*   **Cálculo Dinâmico:** Baseado na data de início e ordem da equipe.

### 4. Relatórios
*   **Exportação Excel:** Gera um arquivo `.csv` detalhado com:
    *   Horas trabalhadas em FDS e Feriados.
    *   Horas de sobreaviso (Plantão) calculadas por regra (NOC, Voz, Tech).

---

## 🛠️ Stack Tecnológica

*   **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (ES6+).
*   **Backend/Database:** Supabase (PostgreSQL + Auth).
*   **Hospedagem:** Vercel.

---

## 📂 Estrutura do Projeto

*   `index.html`: Estrutura única da aplicação (SPA - Single Page Application).
*   `styles.css`: Estilização completa, incluindo temas Claro/Escuro e responsividade mobile.
*   `app.js`: **Núcleo da aplicação.** Contém:
    *   Configuração do Supabase.
    *   Lógica de Autenticação (`signUp`, `signIn`, `applyPermissions`).
    *   Gerenciamento de Estado (`AppState`).
    *   Regras de Negócio (Geração de escala, cálculo de plantão).
    *   Manipulação do DOM e Eventos.
*   `manifest.json` & `sw.js`: Configurações para instalação como App (PWA).

---

## 🗄️ Banco de Dados (Supabase)

O sistema utiliza as seguintes tabelas no Supabase:

1.  **`employees`**: Cadastro de funcionários.
    *   `id`, `name`, `sector`, `shift_id` (turno padrão), `weekend_rule`.
2.  **`shifts`**: Definição dos turnos.
    *   `id` (ex: T1), `name`, `time` (ex: 07:00-16:00), `color`.
3.  **`oncalls`**: Configuração dos plantões.
    *   `name`, `start_date`, `rotation` (array de nomes).
4.  **`holidays`**: Feriados nacionais.
    *   `date`, `name`, `type`.
5.  **`monthly_schedules`**: Armazena as escalas geradas.
    *   `month_key` (ex: '2025-12'), `data` (JSON com a escala de cada funcionário).
6.  **`vacations`**: Períodos de férias.
    *   `employee_name`, `start_date`, `end_date`.

---

## ⚙️ Como Rodar Localmente

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/alankardecm/escala-app.git
    ```
2.  **Abra o arquivo `index.html`** no seu navegador.
    *   *Nota:* Para o Login funcionar perfeitamente localmente, recomenda-se usar uma extensão como "Live Server" no VS Code para servir os arquivos via `http://127.0.0.1:5500` em vez de `file://`.

---

## 🔄 Manutenção e Atualização

### Adicionar um Novo Turno
1.  No Supabase, adicione uma linha na tabela `shifts`.
2.  No arquivo `styles.css`, adicione a variável de cor correspondente (opcional, se quiser cor específica).

### Alterar Regra de Plantão
1.  No Supabase, edite a tabela `oncalls`.
2.  Altere o array `rotation` para mudar a ordem dos plantonistas.
3.  Altere `start_date` se precisar reiniciar o ciclo.

### Atualizar Código
1.  Edite os arquivos locais.
2.  Commit e Push para o GitHub.
3.  A Vercel fará o deploy automático.

```bash
git add .
git commit -m "Melhoria X"
git push
```

---

## 🐛 Solução de Problemas Comuns

*   **"Não consigo logar":** Verifique se confirmou o e-mail. Verifique se a senha tem 6+ caracteres.
*   **"Escala aparece vazia":** O Admin precisa clicar em **"Gerar Escala"** e depois **"Salvar"**. Se não salvar, os dados não vão para o banco.
*   **"Botão Cadastrar não funciona":** Limpe o cache do navegador (Ctrl+F5) para garantir que o script mais recente foi carregado.
