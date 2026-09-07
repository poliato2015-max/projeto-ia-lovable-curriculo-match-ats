# projeto_ia_lovable_n8n_curriculo_match_ats

# RadarCV AI

## Sprint 01A — Foundation

### Contexto

Você está iniciando o desenvolvimento do RadarCV AI.

O objetivo desta sprint NÃO é criar funcionalidades.

O objetivo é criar uma fundação extremamente sólida, organizada, reutilizável e preparada para receber novas funcionalidades nas próximas sprints.

Pense como um arquiteto de software construindo a estrutura de um produto SaaS moderno.

Todo o código deve ser limpo, modular, escalável e reutilizável.

---

# Escopo desta Sprint

Construa apenas:

- Layout global

- Sidebar

- Header

- Dashboard

- Sistema de navegação

- Tema

- Componentes reutilizáveis

Todo o restante será implementado nas próximas sprints.

---

# Fora do Escopo

NÃO implementar:

- Login

- Cadastro

- Autenticação

- Supabase

- Banco de Dados

- APIs

- IA

- OpenAI

- Claude

- Gemini

- Upload

- Parser

- Matchmaking

- ATS

- Exportação

- Histórico

- Analytics reais

- IA Coach

Não simular funcionalidades complexas.

Não antecipar próximas sprints.

---

# Stack

Utilizar exclusivamente:

- React

- TypeScript

- Vite

- Tailwind CSS

- shadcn/ui

- React Router

- Lucide Icons

- Framer Motion

---

# Design

Utilizar obrigatoriamente o Design System do shadcn/ui.

Inspirar-se visualmente em:

- Linear

- Notion

- Stripe

- Vercel

Características:

- visual premium

- minimalista

- muito espaço em branco

- excelente hierarquia visual

- animações discretas

- bordas suaves

- cards elegantes

- aparência profissional

Paleta:

Primary

Roxo (#8B5CF6)

Secondary

Coral (#FF6B6B)

Background

Branco

Surface

#FAFAFA

Border

#E5E7EB

Text

#111827

Preparar Dark Mode.

---

# Layout

Criar um layout padrão para toda a aplicação.

Estrutura:

Sidebar fixa

↓

Header superior

↓

Área principal

↓

Footer discreto

A Sidebar deverá permanecer durante toda a navegação.

No Mobile ela deverá transformar-se em um Drawer.

---

# Sidebar

Adicionar apenas os menus abaixo.

Não desenvolver as páginas ainda.

- Dashboard

- Currículos

- Analisar Vaga

- Currículos ATS

- Histórico

- Analytics

- IA Coach

- Configurações

Utilizar ícones Lucide.

Adicionar estados:

- ativo

- hover

- focus

---

# Rotas

Criar todas as rotas.

Apenas a Dashboard deverá possuir conteúdo.

Todas as demais páginas deverão utilizar um componente reutilizável chamado:

ComingSoonPage

Este componente deverá conter:

- Ícone

- Título

- Texto curto

- Badge "Em desenvolvimento"

Não criar interfaces específicas para essas páginas nesta sprint.

---

# Dashboard

Criar uma Dashboard elegante utilizando apenas dados mockados.

Adicionar:

Hero principal.

Cards de estatísticas.

Atividades recentes.

Gráfico simples.

Cards modernos.

Utilizar componentes reutilizáveis.

Exemplo de estatísticas:

- Currículos

- Vagas analisadas

- Score médio ATS

- Currículos ATS gerados

Todos os números devem ser fictícios.

---

# Componentização

Criar componentes reutilizáveis.

Exemplos:

AppSidebar

AppHeader

PageContainer

PageTitle

SectionTitle

StatsCard

ContentCard

EmptyState

LoadingState

ComingSoonPage

ThemeToggle

Todos devem ser independentes.

Evitar duplicação de código.

---

# Estrutura

Organizar utilizando:

src/

components/

layouts/

pages/

hooks/

contexts/

services/

types/

lib/

utils/

assets/

---

# UX

Adicionar:

Skeletons

Hover Effects

Transições suaves

Microinterações

Cards responsivos

Feedback visual

Loading mockado

Estados vazios

---

# Responsividade

Desktop

Tablet

Mobile

A navegação deve funcionar perfeitamente em todos os tamanhos.

---

# Acessibilidade

Preparar toda a interface seguindo WCAG.

Focus visível.

Navegação por teclado.

Bom contraste.

---

# Código

Utilizar boas práticas React.

Componentes pequenos.

Código organizado.

Tipagem completa.

Baixo acoplamento.

Alta reutilização.

---

# Critérios de Aceitação

Ao finalizar esta sprint deverá existir:

✅ Layout completo

✅ Sidebar

✅ Header

✅ Dashboard moderna

✅ Navegação funcionando

✅ Rotas criadas

✅ Tema preparado

✅ Componentes reutilizáveis

✅ Responsividade

✅ Dados mockados

✅ ComingSoonPage reutilizável

---

# Importante

Esta sprint representa apenas a fundação da aplicação.

Não implemente nenhuma funcionalidade além do solicitado.

Preserve uma arquitetura preparada para receber novas funcionalidades nas próximas sprints sem necessidade de refatoração.

Ao finalizar, preserve toda a estrutura criada para que as próximas sprints apenas adicionem novas funcionalidades, sem alterar a arquitetura existente.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c5a20e7f-a799-4641-ad3d-0ecb4fd31e11).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
