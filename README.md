# Aula Mapa Mental

Projeto React + Vite para apresentar varias aulas em formato de mapa mental progressivo, com deploy simples no GitHub Pages.

## Rodar localmente

```bash
npm.cmd install
npm.cmd run dev
```

## Build de produção

```bash
npm.cmd run build
```

## Publicar no GitHub Pages

1. Crie um repositorio no GitHub e envie este projeto.
2. Execute:

```bash
npm.cmd run deploy
```

3. No GitHub, habilite o Pages para a branch `gh-pages`.

## Onde editar o conteudo das aulas

Você pode fazer isso de 2 formas:

- Pelo editor visual dentro do app:
  abra o catálogo e clique em `Abrir editor`.
- Diretamente nos arquivos:

Para a aula atual, use esta divisão:

- `src/data/lessons/mordomiaContent.js`
  Conteúdo editorial da aula: título, descrição, etapas, cards, pontos e versículos.
- `src/data/lessons/mordomiaLayout.js`
  Posicionamento visual dos cards no mapa e conexões base.
- `src/data/lessonBlueprint.js`
  Arquivo final montado automaticamente a partir das duas camadas acima.

Cadastre novas aulas em `src/data/lessonsCatalog.js`, apontando cada item para um blueprint.

## Editor visual/admin

No catálogo inicial, cada aula agora tem:

- `Abrir aula`
- `Abrir editor`

No editor visual você consegue:

- salvar um rascunho local no navegador
- restaurar o último rascunho salvo
- voltar para a versão original da aula
- editar título e descrição da aula
- editar título, resumo e foco das etapas
- editar título, resumo, pontos, versículos, etapa e cor de cada card
- arrastar cards no mapa para ajustar a posição visual
- exportar `mordomiaContent.js` e `mordomiaLayout.js`

## Salvar no repositorio com Cloudflare

O projeto tambem esta preparado para usar `Cloudflare Pages Functions` e salvar a aula direto no repositorio GitHub.

Arquivos principais dessa integracao:

- `functions/api/save-lesson.js`
  endpoint serverless que grava `content` e `layout` via GitHub API
- `src/utils/cloudSave.js`
  chamada do frontend para `/api/save-lesson`
- `wrangler.toml`
  configuracao base do projeto para Cloudflare
- `.dev.vars.example`
  exemplo das variaveis necessarias

Variaveis de ambiente necessarias:

- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_BRANCH`
- `GITHUB_COMMIT_PREFIX`

Rodando localmente com Cloudflare:

```bash
npm.cmd install
npm.cmd run build
npm.cmd run cf:dev
```

No editor, use o botao de nuvem para `Salvar no repositorio`.

Para deploy no Cloudflare Pages:

1. conecte o repositorio no Cloudflare Pages
2. use `npm run build` como build command
3. use `dist` como output directory
4. cadastre as variaveis do GitHub no painel do Cloudflare
