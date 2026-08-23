---
name: ACAP Futsal
description: Site institucional de um clube formador de futsal na Zona Leste de São Paulo — "A Toca do Lobo"
colors:
  verde-bandeira: "#008000"
  preto-quadra: "#0a0a0a"
  cinza-vestiario: "#161616"
  preto-input: "#131313"
  branco-osso: "#f5f5f4"
  cinza-arquibancada: "#9a9a9a"
  linha: "rgba(255,255,255,.10)"
typography:
  display:
    fontFamily: "Anton, Arial Narrow, sans-serif"
    fontSize: "clamp(2.4rem, 8.2vw, 6.4rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "0.01em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.74rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.06em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
  xl: "18px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "14px"
  md: "18px"
  lg: "24px"
  section: "140px"
components:
  button-primary:
    backgroundColor: "{colors.branco-osso}"
    textColor: "{colors.preto-quadra}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "15px 30px"
  button-primary-hover:
    backgroundColor: "{colors.verde-bandeira}"
    textColor: "{colors.branco-osso}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.branco-osso}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "15px 30px"
  tag-pill:
    backgroundColor: "rgba(0,128,0,.08)"
    textColor: "{colors.verde-bandeira}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  card:
    backgroundColor: "{colors.cinza-vestiario}"
    textColor: "{colors.branco-osso}"
    rounded: "{rounded.lg}"
    padding: "30px 24px"
  input-field:
    backgroundColor: "{colors.preto-input}"
    textColor: "{colors.branco-osso}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
---

# Design System: ACAP Futsal

## Overview

**Creative North Star: "A Toca do Lobo"**

O sistema é território de matilha: disciplinado, atlético, com a tensão contida de uma partida sob refletor à noite. A base é preto quase puro — a quadra vazia antes do apito — cortada por um único verde, usado com racionamento, como a única linha demarcada que importa. Anton em caixa-alta carrega o peso institucional (títulos, categorias, nomes de seção); Inter carrega a leitura corrida sem disputar espaço com o display.

A atmosfera não é decorativa por acaso: um grain sutil (mix-blend overlay, 5% de opacidade) cobre a página inteira como grão de transmissão esportiva, e um glow verde acompanha o cursor no desktop — o único elemento verdadeiramente "vivo" da interface em repouso. Nada mais brilha, pulsa ou chama atenção à toa; a disciplina visual é o ponto.

**Anti-referência confirmada:** um visualizador 3D de camisa (cilindro rotacionável com texto no verso) foi implementado e removido — não convenceu ("não ficou tão bom"). Fotografia real de atleta vestindo o uniforme substituiu a ideia. Não reintroduzir geometria 3D genérica como substituto de fotografia real.

**Key Characteristics:**
- Preto quase puro como base, verde como acento raro e deliberado — nunca decorativo
- Anton maiúsculo para todo peso institucional; Inter para leitura corrida
- Zero sombras estruturais — profundidade é borda + leve elevação, nunca `box-shadow` de card
- Grain + glow de cursor como única camada atmosférica "viva" da interface
- Pill (999px) como forma dominante de botões, tags e filtros

## Colors

Paleta quase monocromática (preto/branco, cores reais do clube) com um único acento verde usado com racionamento — a raridade é o ponto, não a variedade.

### Primary
- **Verde Bandeira** (#008000): o único acento do sistema. Usado em: foco de campo (hover de botão sólido, borda ativa de card/input, texto de tag/label), nunca como cor de fundo em área grande exceto no hover do botão primário. Valor exato, sem tintas derivadas — aplicado literalmente em todo o site, sem variações de tom para glow/hover (glows reaproveitam o mesmo `#008000` só com alpha reduzido).

### Neutral
- **Preto Quadra** (#0a0a0a): fundo base de toda a página (`body`).
- **Cinza Vestiário** (#161616): fundo de painéis, cards, formulários — a superfície "elevada" um degrau acima do fundo.
- **Preto Input** (#131313): fundo de campos de formulário — um degrau entre o fundo base e o painel, para diferenciar input de card.
- **Branco Osso** (#f5f5f4): texto principal e elementos sólidos (fundo do botão primário, texto sobre verde).
- **Cinza Arquibancada** (#9a9a9a): texto secundário, labels, hints, placeholder — sempre este tom, nunca um cinza mais escuro que comprometa contraste (mede ~7:1 sobre Preto Quadra).
- **Linha** (rgba(255,255,255,.10)): toda borda de repouso — cards, inputs, divisores. Sobe para Verde Bandeira só em hover/focus/active.

### Named Rules
**The One Accent Rule.** Verde Bandeira é a única cor fora da escala de preto/branco no sistema inteiro. Se um elemento novo "precisa" de uma segunda cor de destaque, a resposta correta quase sempre é usar mais ou menos opacidade do próprio Verde Bandeira, não introduzir um novo matiz — exceção já aberta e confirmada: os badges de resultado de jogo (vitória/empate/derrota) usam verde/amarelo/vermelho como semântica de estado esportivo, não como paleta decorativa.

## Typography

**Display Font:** Anton (com Arial Narrow, sans-serif como fallback)
**Body Font:** Inter (com system-ui, sans-serif como fallback), pesos 400–800

**Character:** Anton é o grito institucional — condensado, maiúsculo, sem serifa, peso único mas visualmente pesado; Inter é a voz de apoio, neutra e altamente legível, carregando toda a leitura corrida sem competir com o display.

### Hierarchy
- **Display** (400, `clamp(2.4rem, 8.2vw, 6.4rem)`, line-height .98): títulos de hero (`h1`), sempre caixa-alta, quebrado em `<span class="line">` por linha para animação de entrada.
- **Headline** (400, 1.6–1.7rem, Anton): títulos de seção (`h2`), caixa-alta.
- **Title** (400, 1.1–1.3rem, Anton): títulos de card/componente (`h3`).
- **Body** (400–600, .92–1.05rem, Inter): parágrafos e leads de seção.
- **Label** (700, .72–.78rem, Inter, letter-spacing .06–.18em, caixa-alta): tags, labels de campo, kickers, badges.

### Named Rules
**The All-Caps Display Rule.** Todo texto em Anton é caixa-alta, sem exceção — é o único peso tipográfico que o sistema usa para carregar autoridade institucional (nomes de categoria, títulos de seção, CTAs).

## Layout

Container central (`.section__inner`) com `max-width: 1180px` e `padding: 0 24px`. Ritmo vertical dominante de seção: `140px 0` (a maioria das seções top-level usa esse valor; a página respira em blocos grandes, não em rolagem densa).

Breakpoints: `900px` (grids de 2–3 colunas colapsam), `720px` (nav vira menu lateral com burger; a maioria das seções reduz o padding vertical para `60px 0`), `480px` (grids viram coluna única; formulários empilham `.field--row` em vez de duas colunas lado a lado).

Conteúdo revela-se ao rolar (`.reveal`, IntersectionObserver com stagger de 60ms) — mas conteúdo crítico de conversão (o formulário de avaliação) nunca deve depender só disso: ele é visível por padrão, com o `.reveal` reservado a elementos decorativos que podem tolerar depender de JS.

## Elevation & Depth

Sistema flat por padrão — não há vocabulário de `box-shadow` estrutural em nenhum card, botão ou painel. Profundidade é comunicada por **cor de borda + deslocamento**, nunca por sombra.

A única família de sombras real no sistema é atmosférica, não estrutural: glows verdes com offset zero (`0 0 12px rgba(0,128,0,.6)` e variações) usados nos "olhos" do escudo do lobo e no glow que segue o cursor — decoração de personagem/ambiente, não uma linguagem de profundidade de UI. A exceção pontual é o tilt pseudo-3D dos cards de uniforme, que calcula uma sombra dinâmica via JS conforme o mouse se move — comportamento de um componente assinatura, não um padrão a repetir em outros cards.

### Named Rules
**The Border-Then-Lift Rule.** Todo estado de hover em card, painel ou botão segue a mesma dupla: a borda de repouso (`Linha`, rgba(255,255,255,.10)) sobe para Verde Bandeira (`rgba(0,128,0,.5)` em bordas, sólido em preenchimentos), e o elemento sobe `translateY(-3px)` a `-4px)`. Nenhum componente novo introduz `box-shadow` decorativo como substituto disso.

## Shapes

Dois extremos deliberados, sem meio-termo: **pill** (`border-radius: 999px`) para tudo que é ação ou filtro — botões, tags, filter-pills, badges de status — e **card retangular arredondado** (`16–18px`) para tudo que é conteúdo — cards, painéis, formulário, imagens de hero. Campos de input usam um raio intermediário (`10px`), levemente mais contido que um card completo. Bordas são sempre `1px`, nunca mais grossas; não há elementos com corte anguloso (clip-path) ou cantos retos convivendo com os arredondados.

## Components

### Buttons
- **Shape:** pill (`border-radius: 999px`), padding `15px 30px`, label em caixa-alta (.85rem, letter-spacing .08em, peso 700)
- **Primary (`.btn--solid`):** fundo Branco Osso, texto Preto Quadra em repouso; hover inverte para fundo Verde Bandeira + texto Branco Osso, com `translateY(-3px)`
- **Ghost (`.btn--ghost`):** transparente, borda `1px solid rgba(255,255,255,.35)`; hover clareia a borda para branco sólido + mesmo lift de -3px
- **Hover / Focus:** transição `.3s` em transform/background/color/border-color, sempre com a curva `var(--ease)` (`cubic-bezier(.16,1,.3,1)`)

### Tags / Filter Pills
- **Style:** pill, fundo `rgba(0,128,0,.08)`, borda `1px solid rgba(0,128,0,.4)`, texto Verde Bandeira, label em caixa-alta (.72rem, letter-spacing .18em) — usado como "tag" de seção (kicker) e como filtro clicável (`.filter-pill`) em `jogos.html`
- **State:** filtro ativo inverte para fundo Verde Bandeira sólido + texto Preto Quadra; estado ativo agora também expõe `aria-pressed`/`aria-selected` para leitor de tela, não só a classe visual

### Cards / Containers
- **Corner Style:** `16px` (pilar-card, bento-item) a `18px` (painéis maiores, lead-form)
- **Background:** Cinza Vestiário
- **Shadow Strategy:** nenhuma — ver Elevation & Depth
- **Border:** `1px solid` Linha em repouso, sobe pra Verde Bandeira (~50% opacidade) no hover
- **Internal Padding:** `30px 24px`

### Inputs / Fields
- **Style:** fundo Preto Input, borda `1px solid` Linha, raio `10px`, texto Branco Osso, placeholder em Cinza Arquibancada (mesma cor do texto secundário — nunca um cinza mais claro que o normal)
- **Focus:** borda sobe para Verde Bandeira + anel `box-shadow: 0 0 0 3px rgba(0,128,0,.35)` — o anel existe precisamente para que o foco não dependa só da borda fina de 1px, que sozinha é um sinal fraco
- **Error / Disabled:** mensagem de status usa `role="status" aria-live="polite"`; erro usa fundo `rgba(200,60,60,.12)` + texto `#ff9b9b`, sucesso usa fundo `rgba(0,128,0,.12)` + texto Verde Bandeira

### Navigation
- **Style:** header fixo, fundo transparente que ganha leitura contra o conteúdo por baixo; links em Inter peso médio, CTA final sempre destacado como pill sólido (verde, `.nav__cta--solid`)
- **Mobile (<720px):** colapsa para um painel lateral (`width: min(78vw, 320px)`, desliza da direita) atrás do botão burger

### Grain + Cursor Glow (signature)
Camada atmosférica fixa e global: um `<div class="grain">` com textura de ruído SVG (`mix-blend-mode: overlay`, opacidade .05) cobre a página inteira; no desktop, um `<div class="cursor-glow">` de 420px com gradiente radial verde (`rgba(0,128,0,.16)`) segue o cursor via JS. Nenhuma outra camada decorativa "viva" deve ser adicionada por cima dessas duas — elas já ocupam o espaço de personalidade ambiente do sistema.

### Ticker (signature)
Faixa horizontal invertida (fundo Branco Osso, texto Preto Quadra, bordas pretas) com texto em loop infinito — usada para reforçar identidade/categorias (times, competições) entre seções. É a única superfície do site com as cores base invertidas; não reutilizar essa inversão em outro componente sem motivo equivalente.

## Do's and Don'ts

### Do:
- **Do** usar Verde Bandeira (#008000) literalmente, sem criar tintas/tons derivados para glow, hover ou destaque — se precisar de intensidade diferente, ajuste o alpha, não o matiz.
- **Do** seguir a dupla borda+lift (The Border-Then-Lift Rule) para qualquer novo estado de hover em card/painel/botão.
- **Do** manter Cinza Arquibancada (#9a9a9a) como único tom de texto secundário — já mede ~7:1 de contraste sobre Preto Quadra, não precisa (nem deve) ficar mais claro ou mais escuro.
- **Do** expor estado de seleção/ativo em qualquer grupo de filtro ou tab via `aria-pressed`/`aria-selected`, não só via classe CSS `.active`.

### Don't:
- **Don't** adicionar `box-shadow` estrutural a cards, painéis ou botões — a profundidade do sistema é border+lift, não sombra.
- **Don't** introduzir uma segunda cor de acento fora da escala preto/branco/verde sem uma razão semântica equivalente à dos badges de resultado (vitória/empate/derrota).
- **Don't** reintroduzir um visualizador 3D genérico (geometria/cilindro) como substituto de fotografia real de atleta/uniforme — já foi tentado e rejeitado.
- **Don't** deixar conteúdo crítico de conversão (formulário, CTA principal) depender só de `.reveal`/IntersectionObserver para ficar visível — reserve esse padrão a conteúdo decorativo.
- **Don't** usar cantos retos/angulares nem clip-path como substituto de contorno fotográfico — sempre derive de um recorte real do asset (ver `craft-floor`).
