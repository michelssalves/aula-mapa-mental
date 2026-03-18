# Aula Mapa Mental

Projeto React + Vite para apresentar varias aulas em formato de mapa mental progressivo, com deploy simples no GitHub Pages.

## Rodar localmente

```bash
npm.cmd install
npm.cmd run dev
```

## Build de producao

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

Edite `src/data/lessonBlueprint.js` para ajustar a aula atual.

Cadastre novas aulas em `src/data/lessonsCatalog.js`, apontando cada item para um blueprint.
