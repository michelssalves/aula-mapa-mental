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

## Publicacao em tempo real com Cloudflare D1

O projeto agora pode publicar as aulas em tempo real usando `Cloudflare Pages Functions + D1`.

Arquivos principais dessa integracao:

- `functions/api/lesson.js`
  endpoint serverless que le e grava `content` e `layout` no D1
- `src/utils/liveLesson.js`
  chamadas do frontend para carregar e publicar aulas em tempo real
- `migrations/0001_create_lessons.sql`
  schema inicial da tabela de aulas
- `wrangler.toml`
  configuracao base do projeto para Cloudflare e referencia do binding D1

Rodando localmente com Cloudflare:

```bash
npm.cmd install
npm.cmd run build
npm.cmd run cf:dev
```

### Criar o banco D1

1. Crie um banco D1 no Cloudflare, por exemplo `aula-mapa-mental`.
2. Aplique a migration:

```bash
npx wrangler d1 execute aula-mapa-mental --file=./migrations/0001_create_lessons.sql
```

3. No Cloudflare Pages, adicione um binding D1 com:
- nome: `DB`
- banco: `aula-mapa-mental`

Se quiser usar o binding localmente, preencha o bloco comentado em `wrangler.toml`.

No editor, use o botao de nuvem para `Publicar no site`.

A apresentacao passa a ler a aula publicada do D1 quando ela existir. Se ainda nao houver registro no D1, o app usa os arquivos locais como fallback.

## Backup opcional no GitHub

O endpoint `functions/api/save-lesson.js` continua no projeto como base para backup/versionamento no GitHub, se voce quiser manter esse fluxo depois.

## Deploy no Cloudflare Pages

1. conecte o repositorio no Cloudflare Pages
2. use `npm run build` como build command
3. use `dist` como output directory
4. configure o binding D1 `DB`
5. se quiser backup GitHub, mantenha tambem as variaveis do GitHub no painel do Cloudflare
