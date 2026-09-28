# Danny Semijoias — Contexto do projeto

> **Para o Claude (ou quem for continuar):** este arquivo resume o projeto inteiro.
> Leia tudo antes de propor mudanças. Ao terminar cada mudança, atualize a seção
> "Histórico" e as outras que mudaram, e entregue este arquivo junto.
>
> Última atualização: 28/09/2026 (fim do dia) — **projeto no ar e em uso**.

## Quem é a cliente

**Danny Semijoias** (Daniella). Slogan da logo: *"seu estilo merece brilhar"*.
Vende em sistema de **consignação**: as peças são de um fornecedor (a marca Cianita
aparece no material dela), ela fica com o mostruário, vende, e no fim do mês recebe uma
**comissão** sobre o que vendeu.

- **WhatsApp:** (34) 99995-5420 → `5534999955420`
- **Login dela:** `ndaniella288@gmail.com` — admin, nome "Daniella"
- **O que ela vende:** semijoia **banhada** e **prata 925**. Não trabalha com aço inoxidável.

## A diferença deste projeto

Mesmo mecanismo do **FA Acessórios** e da **Caroline Acessórios** (estoque por
acabamento × aro), com uma mudança central:

- **Não existe lucro sobre custo.** O campo de custo continua no cadastro, mas some de
  todos os relatórios.
- No lugar entra a tela **Comissão**: ela lança, uma vez por mês, quanto recebeu.
  Porcentagem e total vendido são opcionais.
- Os meses ficam numa lista editável e o app soma o **acumulado sozinho** — no topo da
  tela e também linha a linha ("acumulado até aqui").
- Na tela Início, no lugar de "investido" e "lucro", aparecem **Comissão do mês** e
  **Acumulado**.
- Diferente da Caroline, este projeto **mantém quilates e garantia** no cadastro.

## Onde fica cada coisa

- **Supabase:** projeto `qgdjigwgtzykmrakqoep`
  URL `https://qgdjigwgtzykmrakqoep.supabase.co`
  chave anon `sb_publishable_PlBPM4YrjAPBS20KHEdQ6Q__YaYHhGC`
  Bucket de fotos: **`danny`** (contém `logo.jpg`, `icone.jpg`, `icone-192.png`,
  `icone-512.png` e `ABERTURA01.jpeg` a `ABERTURA06.jpeg`)
- **GitHub:** `https://github.com/DaniellaSemijoias/Danny-Semij-ias` (conta dela), branch `main`
- **Hospedagem:** **Cloudflare Workers** (não é Pages), projeto `danny-semijoias`,
  no subdomínio `daniella288.workers.dev`. Build `npm run build`, deploy `npx wrangler deploy`.
- **Catálogo:** o endereço do app com `/catalogo` no fim. O link pronto aparece em Ajustes.

## Tecnologia e padrão

React + Vite + `@supabase/supabase-js`, estilos inline, fontes Playfair Display e Inter.
`wrangler.toml` com `[assets]` e `not_found_handling = "single-page-application"` — é isso
que faz o `/catalogo` abrir sem 404. **Não criar `public/_redirects`** (os dois juntos dão
erro de laço infinito no deploy — já aconteceu na Udiflex).

**Paleta:** `bg #FDF4F7`, `bg2 #F9E9EF`, `vinho #6B1F4A`, `roxo #8E2D6B`, `rose #C9899B`,
`tinta #3B2230`, `linha #F0DDE5`.

## Arquivos

| Arquivo | Linhas | Situação |
|---|---|---|
| `index.html` | 28 | pronto — fontes, ícones, manifesto e registro do service worker |
| `package.json` | 16 | pronto |
| `vite.config.js` | 4 | pronto |
| `wrangler.toml` | 7 | pronto |
| `public/manifest.json` | 15 | pronto |
| `public/sw.js` | 44 | pronto — só para o Chrome oferecer "Instalar" |
| `src/config.js` | 6 | pronto, já com as chaves |
| `src/main.jsx` | 9 | pronto — `/catalogo` abre o Catalog, o resto abre o App |
| `src/api.js` | 305 | pronto |
| `src/App.jsx` | 2145 | pronto — as 8 telas |
| `src/Catalog.jsx` | 1116 | pronto |

## Banco (Supabase)

Scripts rodados, nesta ordem:

1. `danny_schema.sql` — tudo: tabelas, funções, RLS, bucket e dados iniciais.
2. `admin.sql` — garante perfil para toda conta de login e promove a Daniella a admin.
3. `banhos.sql` — tirou "Aço inoxidável" e "Aço inoxidável dourado", acrescentou Banho Rosé.
4. `prata.sql` — acrescentou **Prata 925**.

Tabelas: `profiles`, `categories`, `platings` (acabamentos), `sizes` (aros), `karats`
(quilates), `customers`, `settings`, `products`, `product_images`, `product_variations`
(acabamento × aro, com quantidade), `stock_movements`, **`commissions`**.

`commissions`: `ref_month` (dia 1 do mês, único), `gross_value`, `percent` (opcional),
`sales_base` (opcional), `note`.

Funções: `apply_movement(...)`, `reverse_movement(id)` (só admin), `is_admin()`,
`get_catalog()` e `get_store()` (públicas).

## Acabamentos — dois grupos

- **Banho:** Banho Ouro, Banho Prata, Banho Rosé, Ródio negro.
- **Prata:** Prata 925 (material, não banho — não tem banho para sair).

A divisão é só de rótulo: no banco é tudo linha em `platings`. O agrupamento é feito no
código pela função **`ehPrata`**, que existe igual no `App.jsx` e no `Catalog.jsx` e
reconhece pelo nome ("925", "prata esterlina" ou só "Prata"). Se acrescentar outro
material — ouro 18k de verdade, por exemplo — é lá que se mexe.

## Como as peças são organizadas

- **Categorias:** Brincos, Anéis, Colares, Pulseiras, Chocker, Braceletes, Conjuntos.
- **Aro:** só os anéis (detectado pela categoria conter "anel"); nas outras o aro é "Único"
  e nem aparece no formulário.
- **Código (SKU):** peça nova já abre com o próximo livre (DS-001, DS-002…).
- Quilates e garantia ficam no cadastro e aparecem na ficha.

## App de gestão — as 8 telas

1. **Início** — vendas do mês, comissão do mês, acumulado, peças no mostruário **com o
   valor total**, movimentações recentes e alertas de estoque baixo ou zerado.
2. **Peças** — busca, filtro por categoria, ficha com galeria e estoque por acabamento,
   cadastro com fotos e a grade acabamento × aro.
3. **Estoque** — quatro indicadores no topo (**valor em mostruário a preço de venda**,
   peças e modelos, preço médio, modelos esgotados), entrada e saída por variação com
   saldo previsto, e histórico filtrável.
4. **Vendas** — registro com baixa no estoque, cliente novo na hora, faturamento, ticket
   médio, mais vendidas e estorno (só admin).
5. **Clientes** — ficha com histórico de compras, total gasto e botão de WhatsApp.
6. **Comissão** — acumulado em destaque, lista de meses, acumulado até cada mês.
7. **Relatórios** — faturamento, peças vendidas, por categoria, comparativo por
   acabamento, **valor parado no mostruário** e estoque por categoria. **Sem custo ou lucro.**
8. **Ajustes** — dados da loja, texto de cuidados/garantia, listas (categorias,
   acabamentos, aros, quilates), usuários, link do catálogo e exportação CSV.

## Catálogo — como funciona

- **Abertura:** as seis fotos do bucket ao fundo em tela cheia, com zoom lento alternando
  direção (Ken Burns) e troca a cada 4,2 s, em laço. Por cima: logo redonda, nome da loja,
  slogan, texto de boas-vindas, botão "Ver a coleção" e seta pulsando. Não sai sozinha.
  Se os arquivos não carregarem, o catálogo abre direto — nada de imagem quebrada.
- **Seção "Seja bem-vinda"** com três cartões (peça escolhida a dedo, garantia,
  atendimento no WhatsApp), ícones flutuando com atraso diferente.
- **Vitrine:** as peças de cada categoria **deslizam para o lado** (trilhos horizontais) e
  a página desce pelas categorias.
- **Ficha:** galeria com setas, acabamento em dois grupos (Banho / Prata), aro só quando
  existe, quantidade e botão de sacola.
- **Ampliar a foto (componente `Lupa`):** o selo "⌕ Ampliar" aparece no cartão já na
  primeira olhada, e a ficha tem o mesmo botão sobre a foto. Abre em tela cheia, fundo
  escuro, com **um único nível de ampliação** (`ZOOM_LUPA`, 230%): o botão alterna entre
  "Ampliar" e "Reduzir", tocar na foto faz o mesmo, e a pessoa passeia pela **rolagem
  normal do navegador**. Ao ampliar, a foto já começa centralizada. Setas trocam de foto
  quando a peça tem mais de uma. Enquanto está aberta, a página atrás fica travada
  (`body` fixo, com a posição devolvida ao fechar) e o voltar do celular fecha a foto.
  **Não usar pinça nem `transform: scale`** — trava a tela em alguns celulares; já
  aconteceu na FA e na Paixão.
- **Fechamento em dois passos:** primeiro o aviso de **cuidados e garantia** (com
  confirmação obrigatória), depois a **forma de pagamento** (Pix, Dinheiro, Débito,
  Crédito com parcelamento) — só então o WhatsApp abre com o pedido montado.
- **Fim do catálogo:** seção **"Sobre o banho das suas peças"** com cinco cartões — perder
  brilho é normal, escurecer não é ferrugem, variações acontecem, como funciona a prata
  925, e o que a garantia cobre.
- **Rodapé:** nome da loja + **"Programa feito por Miguel Borges — (34) 9 9188-1557"**.

## Instalação no celular (PWA)

- **iPhone:** Safari → Compartilhar → Adicionar à Tela de Início (usa o `apple-touch-icon`).
- **Android e computador:** o `public/sw.js` existe só para o Chrome oferecer "Instalar".
  Só funciona em `https`, ou seja, no endereço do Cloudflare.
- O service worker busca a página **na rede primeiro**, então ninguém fica preso numa
  versão antiga depois de um deploy.

## Armadilhas conhecidas (já custaram tempo)

- **Cloudflare:** o **Retry build repete o commit antigo**. Para pegar código novo, use
  *Create deployment* ou faça um commit qualquer na `main`.
- **GitHub no celular:** o "Selecionar tudo" às vezes não pega o arquivo inteiro, e o
  editor pode vir marcado para criar um branch novo em vez de commitar na `main`.
  Conferir a última linha antes do commit e conferir se o commit apareceu na `main`.
- **Supabase:** "Run selected" roda só o trecho marcado. Selecionar tudo antes.
- **Arquivos do bucket:** o nome pode ter sido salvo em maiúsculo. O código tenta as
  grafias (`icone.jpg`, `ICONE.JPG`, `.jpeg`, `.png`…) até uma abrir, e cai no monograma
  "D" se nenhuma existir.
- **Logo com moldura:** a constante `ZOOM_LOGO` (1.12) recorta a logo dentro do círculo.
  Se sobrar fundo preto nas pontas, aumentar.
- **Marca d'água nas aberturas:** a constante `CORTE_RODAPE` (10) corta a faixa de baixo
  de cada quadro. Se ainda aparecer, aumentar.
- **CSS:** nada de `aspect-ratio` (quebra no Safari antigo) — usar `paddingTop` em
  porcentagem com filhos em `position: absolute`. Evitar `inset`; escrever
  `top/right/bottom/left`. Modais em `dvh`, não `vh`.
- **Modais no celular:** são desenhados no `body` via `createPortal`. Sem isso a barra de
  navegação de baixo cobre o botão de salvar e o cadastro não fecha.
- **Ampliação de foto:** nada de pinça nem `transform: scale` — travou a tela em alguns
  celulares na FA e na Paixão. O padrão dos projetos é um nível só, com a rolagem do
  navegador fazendo o passeio pela imagem.
- **Ao entregar código:** cuidado com `\n` escrito como texto no meio de uma linha —
  quebrou um build inteiro. Conferir sempre o arquivo final.

## Como o Miguel prefere trabalhar

Pelo celular, editando pelo GitHub no navegador. Para cada arquivo entregue:
**link pronto do GitHub para criar ou editar + o arquivo completo + o número da última
linha**, para conferir antes do commit. SQL sempre completo, com o link direto do projeto
certo no Supabase.

## Ideias pendentes

- Texto de "informações" próprio na abertura do catálogo (como na Paixão: horário,
  entrega, um parágrafo sobre a loja), editável em Ajustes — o SQL chegou a ser começado
  (`informacoes.sql`: coluna `about_note` em `settings` + `get_store()` devolvendo
  `aboutNote`), mas não foi aplicado.
- Cortar de vez a marca d'água dos arquivos de abertura no bucket, em vez de esconder por CSS.
- Confirmar com a Daniella o texto final de cuidados e garantia.

## Histórico

- **27/09/2026:** projeto criado a partir do FA/Caroline — banco, `api.js` e a parte 1 do
  `App.jsx` (sistema visual, navegação, login e tela Início).
- **28/09/2026 (manhã):** `App.jsx` terminado (Peças, Estoque, Vendas, Clientes, Comissão,
  Relatórios, Ajustes), `Catalog.jsx` criado, `admin.sql` para promover a Daniella,
  `sw.js` + registro no `index.html` para instalação no Android e no computador,
  publicado no Cloudflare Workers.
- **28/09/2026 (fim do dia):** ampliação de foto no catálogo, no mesmo padrão da Paixão —
  selo "Ampliar" já visível no cartão da vitrine, botão na ficha, tela cheia com
  Ampliar/Reduzir e rolagem. A primeira versão, com pinça e `scale`, foi descartada.
- **28/09/2026 (tarde):** aço removido e Banho Rosé acrescentado; abertura do catálogo
  refeita (Ken Burns, boas-vindas, botão) no lugar do flash de imagens; seções
  "Seja bem-vinda" e "Sobre o banho das suas peças"; ícones refeitos (joia, etiqueta,
  moeda, Pix); logo recortada em círculo e buscada em qualquer grafia; modais levados
  para o `body` (o cadastro não salvava no celular); **Prata 925** acrescentada com o
  agrupamento Banho/Prata; valor do estoque a preço de venda no Início, no Estoque, nos
  Relatórios e no CSV.

## Como continuar numa conta nova do Claude

1. No GitHub, baixe o projeto: **Code → Download ZIP**.
2. Numa conversa nova, envie o ZIP e escreva: *"Leia o CONTEXTO.md e vamos continuar o projeto."*
3.
