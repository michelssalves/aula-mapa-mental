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
