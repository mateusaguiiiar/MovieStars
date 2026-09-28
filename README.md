# MovieStars — Sistema de Avaliação e Gestão de Filmes

Módulo completo de gerenciamento e avaliação de filmes desenvolvido para a atividade do **Rocket Lab 2026-2**. A aplicação é uma SPA (*Single Page Application*) Full-Stack que permite navegar pelo catálogo, buscar filmes por título, visualizar detalhes e avaliações, cadastrar novos filmes (com geração automática de UUID), editar dados existentes, excluir registros e adicionar resenhas com notas de 1 a 5 estrelas.

---

## 🛠️ Stack Tecnológica

- **Backend:** Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy, SQLite, Uvicorn.
- **Frontend:** Vite, React, TypeScript (modo `strict`), React Router DOM, Axios.

---

## 📁 Estrutura do Projeto

```text
.
├── backend/                  # API REST em FastAPI e camada de dados
│   ├── main.py               # Instância principal, rotas (/movies) e manipuladores de erro
│   ├── database.py           # Conexão SQLite e sessão SQLAlchemy
│   ├── models.py             # Modelos de banco de dados (Movie, Review)
│   └── schemas.py            # Validações Pydantic (MovieCreate, MovieUpdate, ReviewCreate)
├── frontend/                 # Aplicação SPA em React com TypeScript
│   ├── src/
│   │   ├── pages/
│   │   │   ├── MovieList.tsx   # Catálogo principal com barra de busca
│   │   │   ├── MovieDetail.tsx # Detalhes do filme, resenhas e botões de ação (Editar/Excluir)
│   │   │   └── MovieForm.tsx   # Formulário unificado para Cadastro (POST) e Edição (PATCH)
│   │   ├── services/
│   │   │   └── api.ts          # Instância do Axios para comunicação com o backend
│   │   ├── App.tsx             # Configuração central de rotas (React Router)
│   │   └── main.tsx            # Ponto de entrada da aplicação React
│   ├── package.json          # Dependências do projeto (React, Axios, React Router)
│   └── tsconfig.json         # Configuração estrita do TypeScript
└── README.md                 # Documentação técnica do projeto

```

---

## 🚀 Como Executar o Projeto

Para executar o sistema completo, é necessário subir o servidor backend (FastAPI) e a interface frontend (React) em dois terminais distintos.

### 1. Backend (FastAPI)

Requer **Python 3.11** ou superior.

```bash
# Entrar na pasta do backend
cd backend

# Criar o ambiente virtual
python3 -m venv .venv

# Ativar o ambiente virtual
# Linux/macOS:
source .venv/bin/activate
# Windows (PowerShell):
.venv\Scripts\Activate.ps1

# Instalar dependências
pip install fastapi uvicorn sqlalchemy pydantic

# Iniciar a API com reload automático
uvicorn main:app --reload

```

* **API Base:** `http://localhost:8000`
* **Documentação Interativa (Swagger):** `http://localhost:8000/docs`

---

### 2. Frontend (React + TypeScript)

Requer **Node.js** (v18+) ou **Bun**.

```bash
# Entrar na pasta do frontend
cd frontend

# Instalar dependências
npm install
# ou com Bun:
bun install

# Iniciar o servidor de desenvolvimento
npm run dev
# ou com Bun:
bun run dev

```

* **Aplicação Web:** `http://localhost:5173`

---

## 📡 Rotas e Endpoints da API

| Método | Rota | Descrição | Payload / Parâmetros | Status HTTP |
| --- | --- | --- | --- | --- |
| `GET` | `/movies` | Lista filmes do catálogo | Query param opcional: `search` | `200 OK` |
| `GET` | `/movies/{id}` | Retorna detalhes e resenhas de um filme | Path param: `id` | `200 OK` / `404 Not Found` |
| `POST` | `/movies` | Cadastra um novo filme no banco | Body JSON (`id_filme`, `titulo`, `ano_lancamento`, etc.) | `201 Created` / `422 Error` |
| `PATCH` | `/movies/{id}` | Atualiza dados de um filme existente | Path param: `id` + Body JSON parcial | `200 OK` / `404` / `422 Error` |
| `DELETE` | `/movies/{id}` | Apaga um filme e suas avaliações | Path param: `id` | `200 OK` / `204 No Content` / `404` |
| `POST` | `/movies/{id}/reviews` | Adiciona uma avaliação ao filme | Path param: `id` + Body JSON (`nota`, `comentario`) | `201 Created` / `422 Error` |

---

## 💻 Funcionalidades do Frontend

1. **Catálogo e Busca (`MovieList`):**
* Grade interativa exibindo títulos, ano de lançamento e atalhos para detalhes.
* Campo de busca em tempo real conectado ao parâmetro `search` da API.


2. **Cadastro e Edição Unificados (`MovieForm`):**
* Componente inteligente que reusa a interface tanto para inserção (`POST`) quanto para atualização (`PATCH`).
* Identificação automática do modo através da presença do parâmetro `:id` na URL.
* **Geração Automática de ID:** Para atender à exigência de chave primária do backend sem comprometer a experiência do usuário, o frontend gera automaticamente identificadores UUID usando `crypto.randomUUID()`.
* **Tratamento de Validação Pydantic:** Captura erros HTTP 422 do backend e exibe alertas claros informando exatamente quais campos falharam na validação.


3. **Detalhes e Ações (`MovieDetail`):**
* Exibição de informações completas do filme, sinopse e cálculo da média de notas.
* **Exclusão Definitiva:** Botão de remoção com confirmação via modal (`window.confirm`) que dispara o método `DELETE` e redireciona o usuário para o catálogo.
* **Avaliações em Tempo Real:** Formulário integrado para envio de nota (1 a 5 estrelas) e comentário, atualizando a listagem e a média imediatamente após o envio.



---

## ⚙️ Decisões de Arquitetura e Engenharia

* **Desativação de ID Manual no Cliente:** A exigência do backend por uma chave `id_filme` no cadastro foi solucionada no React via `crypto.randomUUID()`, garantindo a integridade dos dados sem expor a complexidade da chave primária para o usuário final.
* **Roteamento SPA:** Utilização de navegação declarativa com `react-router-dom`, permitindo links diretos para a edição (`/movies/edit/:id`) e atualização sem recarregar a página.
* **Normalização de Erros:** Formatação dinâmica das mensagens de erro do Pydantic para exibir alertas amigáveis em português caso dados numéricos ou textos obrigatórios venham em formato inválido.

```

```
