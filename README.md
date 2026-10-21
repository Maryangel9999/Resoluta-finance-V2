# Resoluta AGI — Resoluta Finance

> **Entenda seus números. Tome melhores decisões.**

Site institucional e plataforma de gestão financeira da **RESOLUTA AGI** (Administração, Gestão e Inovação), microempresa de São Luís–MA, voltada a microempreendedores, autônomos e pequenos negócios.

A solução financeira integrada **RESOLUTA FINANCE** reúne calculadoras, controles e relatórios para transformar a gestão do dia a dia em decisões mais seguras.

---

## ✨ Visão geral

O projeto é uma aplicação web **100% front-end** (HTML5 + CSS3 + JavaScript puro, sem frameworks), com arquitetura PWA, acessibilidade avançada (VLibras, leitor de tela, TTS) e conformidade com a LGPD.

- **Landing page** (`index.html`) — apresentação, ferramentas, planos, contato e autenticação.
- **Aplicação** (`app.html`) — painel com 15 módulos financeiros em SPA (roteamento por hash).
- **Área educativa** (`aprenda.html`) — 5 módulos de conteúdo, exercícios, quizzes e glossário.
- **Páginas legais** — `privacidade.html` (LGPD) e `termos.html` (Termos de Uso).

---

## 🧮 Módulos financeiros

| # | Módulo | Descrição |
|---|--------|-----------|
| 1 | **Calculadora de Precificação por Markup** | Markup divisor, multiplicador e preço sugerido |
| 2 | **Fluxo de Caixa** | Entradas, saídas e saldo por período |
| 3 | **Contas a Pagar e Receber** | Controle de vencimentos e status |
| 4 | **Capital de Giro** | CGL, liquidez corrente e diagnóstico |
| 5 | **Ticket Médio** | Faturamento ÷ nº de vendas, com evolução |
| 6 | **Margem de Contribuição** | Unitária e percentual |
| 7 | **Margem de Lucro** | Líquida e operacional |
| 8 | **Ponto de Equilíbrio** | Em receita e em unidades |
| 9 | **Diagnóstico Financeiro** | Score e recomendações |
| 10 | **Planejamento e Metas** | Metas com progresso |
| 11 | **Simulador de Cenários** | Otimista / realista / pessimista |
| 12 | **Dashboard Financeiro** | Indicadores e gráficos |
| 13 | **Relatórios** | Exportação CSV e PDF/impressão |
| 14 | **Assistente de IA** | Base de conhecimento + estrutura para API |
| 15 | **Aprenda** | 5 módulos educativos |

### Fórmulas de markup

```
Markup Divisor      = 1 − (% Despesas Variáveis + % Despesas Fixas + % Lucro Desejado)
Markup Multiplicador = 1 / Markup Divisor
Preço de Venda       = Custo Direto Unitário / Markup Divisor
```

---

## 🎨 Identidade visual

- **Vinho / Bordô** (`#581124`) — cor primária
- **Dourado** (`#d4af37`) — destaques
- **Branco / Bege** — fundos
- **Marrom-escuro** — texto
- Tipografia: **Plus Jakarta Sans** + **FontAwesome 6.5.1**
- Slogan: *"Entenda seus números. Tome melhores decisões."*
- Instagram: [@resoluta.agi](https://instagram.com/resoluta.agi) · DDD 98

---

## ♿ Acessibilidade

- Widget **VLibras** (Libras) integrado
- **Text-to-Speech** (ouvir conteúdo, play/pause/stop) em pt-BR
- Temas **claro / escuro / alto contraste**
- Escala de fonte (0,85× a 1,6×)
- Navegação por teclado, foco visível, atalhos (Alt+A)
- ARIA, `prefers-reduced-motion`, link "pular para conteúdo"

---

## 🔐 Autenticação e segurança

- Cadastro, login, logout e recuperação de senha (pergunta de segurança)
- Indicador de força de senha
- Bloqueio após **3 tentativas** falhas (5 minutos)
- Hashing com **Web Crypto API — PBKDF2-SHA256** (150.000 iterações + salt)
- Sanitização anti-XSS, isolamento de dados por usuário (localStorage)
- Chaves de API mantidas no backend (nunca no cliente)

---

## 📱 PWA

- `manifest.webmanifest` + `sw.js` (Service Worker com estratégias cache-first / network-first)
- Instalável em **Android, iOS e Desktop**
- Ícones 192/512, favicons e tema

---

## 💳 Planos

| Plano | Preço | Público |
|-------|-------|---------|
| Free | R$ 0 | Todos |
| Pro PF | R$ 19,90/mês | Pessoa física |
| Pro PJ | R$ 29,90/mês | Pessoa jurídica |
| Premium | R$ 49,90/mês | (futuro) |

---

## 🗂️ Estrutura de arquivos

```
.
├── index.html              # Landing page
├── app.html                # Aplicação (SPA, 15 módulos)
├── aprenda.html            # Área educativa
├── privacidade.html        # Política de Privacidade (LGPD)
├── termos.html             # Termos de Uso
├── style.css               # Design system da landing
├── app.css                 # Estilos do app, aprenda e páginas legais
├── script.js               # Interações da landing
├── app.js                  # Roteador SPA + renderização dos módulos
├── aprenda.js              # Lógica da área educativa
├── finance.js              # Motor de cálculo (puro)
├── store.js                # Camada de dados (localStorage)
├── auth.js                 # Autenticação e segurança
├── a11y.js                 # Acessibilidade (tema, fonte, TTS)
├── charts.js               # Gráficos em Canvas (bar/line/donut)
├── pwa.js                  # Registro do Service Worker
├── sw.js                   # Service Worker
├── manifest.webmanifest    # Manifesto PWA
└── assets/                 # Logo, equipe e ícones
```

---

## 🚀 Como executar localmente

```bash
# Na raiz do projeto
python3 -m http.server 8080
# Abra http://localhost:8080
```

Não há etapa de build: é tudo estático. Para produção, publique em GitHub Pages, Vercel, Render ou Azure.

---

## 🧪 Testes

Validação executada com **Playwright (Chromium)**:

- Todas as 5 páginas carregam sem erros de JavaScript
- 15 ferramentas e 4 planos renderizados na landing
- Calculadora de markup: custo R$ 12 + 8% + 12% + 20% → **preço R$ 20,00**
- Ponto de equilíbrio: R$ 3.000 fixos, preço R$ 100, custo variável R$ 40 → **50 unidades**
- Capital de giro: ativo R$ 8.000 / passivo R$ 5.000 → **CGL R$ 3.000, liquidez 1,6**
- Cadastro/login, bloqueio após 3 tentativas e recuperação de senha
- Aprenda: 5 módulos, 20 termos no glossário, quizzes e progresso
- Service Worker registrado; exportação CSV validada

---

## 📄 Licença e conformidade

Projeto em conformidade com a **LGPD** (Lei 13.709/2018). Consulte `privacidade.html` e `termos.html`.

© Resoluta AGI — Administração, Gestão e Inovação. São Luís–MA.
