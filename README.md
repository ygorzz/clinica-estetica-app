# 🏥 Clínica App & Agente de IA (POC) 🤖

Este projeto é uma solução de gestão para clínicas de estética que une uma aplicação Full Stack robusta a uma **implementação inicial** de um Agente de IA para WhatsApp. O objetivo principal foi explorar a integração de LLMs em fluxos de negócios reais e validar a viabilidade de agendamentos automatizados.

---

## 🛠️ Estrutura do Ecossistema

### 1. Clínica App (Concluído ✅)
Um sistema de gerenciamento administrativo completo.
* **Backend:** API RESTful em **AdonisJS (v6)** com autenticação JWT e permissões de acesso (ACL).
* **Frontend:** Dashboard administrativo em **Vue.js 3** e **Pinia**.
* **Funcionalidades:** CRUD de clientes, serviços e funcionários, além de endpoints específicos para consumo da IA (verificação de horários e CPFs).

### 2. Agente de IA (Implementação Inicial 🚧)
Um protótipo de secretária virtual via WhatsApp para automação de triagem e agendamento.
* **Orquestração:** Fluxos construídos no **n8n**.
* **Inteligência:** Modelo **Gemini (Google AI)** via API.
* **Integração:** **Evolution API** para comunicação com o WhatsApp.
* **Status Atual:** O agente já realiza RAG (leitura de serviços da clínica).

---

## 🚀 Tecnologias e Linguagens

| Categoria | Tecnologia |
| :--- | :--- |
| **Linguagem Base** | TypeScript (90% do projeto) |
| **Backend** | AdonisJS v6 |
| **Frontend** | Vue.js 3 / Pinia |
| **Banco de Dados** | PostgreSQL & Redis |
| **Automação** | n8n |
| **IA** | Gemini (Google AI) |
| **Infraestrutura** | Docker & Docker Compose |

---

## 🧠 Vibe Coding e o Papel da IA

Este projeto foi desenvolvido utilizando a abordagem de **"Vibe Coding"**. O foco foi acelerar o processo de desenvolvimento de uma aplicação e compreender a capacidade das IAs no contexto do mercado atual para o auxílio do profissional.

Esta experiência permitiu entender profundamente:
1.  **Capacidade de Auxílio:** Como as IAs podem acelerar drasticamente o desenvolvimento de backends complexos e integrações de API.
2.  **Desenvolvedor como Arquiteto:** A mudança do papel do dev, que passa a focar mais na lógica de negócio e na conexão entre serviços do que em sintaxes repetitivas.
3.  **Limites e Potencial:** A aplicação serve como prova de que, embora a IA facilite a criação de protótipos funcionais rapidamente, o olhar humano é indispensável para a segurança e refinamento da lógica de agendamentos.

## 🕹️ Como rodar o projeto

### 1. Pré-requisitos
* **Docker & Docker Compose** instalados e rodando.
* Chave de API do **Google AI Studio** (para o Gemini).

### 2. Configuração Inicial
1.  Clone o repositório.
2.  Configure o `.env` seguindo os exemplos (`.env.example`).
3.  Suba os serviços via Docker: `docker-compose up -d`.
   
---
Desenvolvido por **Ygor** — [LinkedIn](https://www.linkedin.com/in/ygor-santos-869152325/) | [GitHub](https://github.com/ygorzz)
