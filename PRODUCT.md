# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary:** pais e responsáveis buscando matricular um atleta (Sub-7 a Sub-18), avaliando o caminho formativo do clube (escolinha → ACAP Academy → Federação) antes de decidir. **Também primário:** torcida e comunidade do clube acompanhando jogos, resultados e a trajetória do time.

Um painel administrativo interno (`admin.html`, não indexado, fora da navegação) atende a equipe do clube para gestão de jogos/resultados — é uma ferramenta operacional, não uma superfície voltada a um público de marketing.

## Product Purpose

Site institucional do ACAP Futsal: apresentar o clube, converter interesse em inscrições de avaliação/matrícula (formulário em `avaliacao.html`), manter a torcida informada sobre calendário e resultados (`jogos.html`) e notícias (`noticias.html`), captar novos patrocinadores (`patrocinadores.html`) e sustentar um painel interno para gestão desses dados. Sucesso é medido por avaliações agendadas e propostas de patrocínio via formulário, e por uma presença institucional que reflita com precisão a trajetória e os números reais do clube.

## Positioning

Clube formador desde 1995 na Zona Leste de São Paulo, com um caminho competitivo documentado e específico: **Escolinha** (iniciação recreativa, sem pressão) → **ACAP Academy** (formação PARA o alto rendimento, Sub-9–16) → **Federação** (o alto rendimento em si, Time 2 e depois Time 1). 16× campeão FPFS, arena própria, +1000 atletas formados. Essa distinção — a Academy forma *para* o alto rendimento, não *é* o alto rendimento, que só se realiza na Federação — é central ao posicionamento e não pode ser comprimida ou simplificada em copy futura.

## Operating Context

Site estático (HTML/CSS/JS, sem framework) com backend real no Supabase (projeto "siteacap"): tabelas `jogos`, `jogos_resultados`, `noticias`, `patrocinadores`, `avaliacao_inscricoes` e `patrocinador_leads`; Auth para login do admin; Storage (buckets `escudos`, `noticias`, `patrocinadores`). O painel admin (`admin.html`, com abas Jogos/Notícias/Patrocinadores/Leads) faz CRUD de todo esse conteúdo e não é linkado na navegação pública. Suíte de testes Playwright cobre os fluxos de admin e das páginas públicas contra um mock do Supabase (os testes nunca tocam o projeto real).

## Capabilities and Constraints

- Estático (HTML/CSS/JS), sem framework, sem build step.
- Backend real Supabase: `jogos`, `jogos_resultados` (placar por categoria), `noticias`, `patrocinadores`, inscrições de `avaliacao.html` (`avaliacao_inscricoes`) e propostas de `patrocinadores.html` (`patrocinador_leads`); Auth; Storage.
- Regra de negócio: um jogo com 0–1 categoria selecionada usa placar único (`jogos.placar_*`); 2+ categorias usa uma linha por categoria em `jogos_resultados`.
- Regra de RLS para leads (`avaliacao_inscricoes`, `patrocinador_leads`): INSERT público (formulário aberto), SELECT só autenticado — dados de contato de terceiros nunca ficam publicamente legíveis. Vitrines públicas (`jogos`, `noticias`, `patrocinadores`) são o oposto: SELECT público, escrita só autenticada. Qualquer tabela nova de captação de leads segue o padrão de leads; qualquer tabela nova de conteúdo público segue o padrão de vitrine.
- Branding por time é condicional (`time1` / `time2` / `academy`) em cartões de jogo — qualquer novo campo específico de time segue o mesmo padrão condicional, não hardcoded.
- Não documentado — não inventar: preço/mensalidade, horários de treino (distintos do horário de funcionamento da sede), condições de bolsa, benefícios concretos de patrocínio (ex: logo no uniforme) além dos genéricos já publicados em `patrocinadores.html`. Confirmado explicitamente como ausente; registrar como não documentado até o usuário fornecer.

## Brand Commitments

Nome "ACAP Futsal" (Associação Contra Ataque Paulista), CNPJ 32.640.747/0001-09, escudo oficial existente (cores originais preservadas), fundação em 1995, sede/arena própria — "Toca do Lobo" — na Rua Mendonça Corte Real, 368, Zona Leste de São Paulo (@arenaacap), funcionamento Seg a Sex das 17h às 22h30, canais oficiais WhatsApp, Instagram (@acap_futsal) e Facebook (facebook.com/acapfutsalecampo).

## Evidence on Hand

16× campeão da Federação Paulista de Futebol de Salão (FPFS), +1.000 atletas formados, +70 "revelados", ~26 mil seguidores no Instagram, fundação em 1995. Dois times na Federação: Time 1 (elenco principal) e Time 2 (também compete, dobra como formação de alto rendimento para atletas nunca federados). Duas competições: Campeonato Paulista (principal, os 16 títulos) e Copa União (secundária). Endereço da sede (Rua Mendonça Corte Real, 368) e horário de funcionamento (Seg a Sex, 17h às 22h30) fornecidos pelo usuário e publicados no rodapé de todas as páginas. **Ausência que trabalhos futuros não devem preencher com invenção:** nenhum depoimento real de pai/atleta foi fornecido — não fabricar citações, fotos ou casos até haver conteúdo real; nenhum preço/mensalidade ou horário de treino documentado.

## Product Principles

1. Precisão factual antes de apelo visual — nunca inventar depoimentos, preços/mensalidade ou horários de treino; qualquer alegação específica (números de camisa, estatísticas, nomes de cargos) deve ser conferida contra o ativo real antes de virar copy.
2. A distinção Academy (formação PARA o alto rendimento) vs. Federação (o alto rendimento em si) é estrutural ao posicionamento e deve se manter coerente em qualquer copy nova.
3. O caminho competitivo (Escolinha → Academy → Federação / Time 2 / Time 1) é a espinha dorsal narrativa do site — páginas novas devem reforçá-lo, não fragmentá-lo.
4. Dados operacionais (jogos, resultados, inscrições) vivem no Supabase real; qualquer feature de dados nova segue o mesmo padrão (single-vs-multi score, RLS) em vez de um export local.
5. O painel admin é ferramenta interna operacional — não precisa da mesma pressão de conversão/persuasão das páginas públicas.
