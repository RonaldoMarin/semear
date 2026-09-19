# Projeto Semear

Landing page institucional para apresentar a missão do Projeto Semear no Nordeste brasileiro e convidar pessoas a conhecer, orar, participar e contribuir.

## Estrutura

```
src/
├── app/               # rotas (page, layout, globals.css)
├── components/
│   └── landing/       # seções da página em componentes
├── lib/               # conteúdo e dados (content.ts)
└── types/             # tipos de domínio (content.ts)
prisma/                # schema e migrações
public/images/         # imagens estáticas
```

## Desenvolvimento

Requer Node.js 20 ou superior.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000` (ou a porta informada no terminal).
Para executar a versão de produção, use `npm run build` e depois `npm start`.

## Conteúdo e imagem

- Edite `src/lib/content.ts` para trocar textos, indicadores e links oficiais.
- Substitua `public/images/semear-hero.png` por uma fotografia oficial mantendo o mesmo nome, ou atualize o caminho no conteúdo.
- Defina `NEXT_PUBLIC_SITE_URL` antes de publicar para que os metadados sociais usem o domínio final.

## Banco de dados

O projeto usa Prisma ORM. Crie um arquivo `.env` a partir de `.env.example` e rode:

```bash
npm run prisma:migrate
npm run prisma:generate
```

## Verificação

```bash
npm run lint
npm run typecheck
npm run build
```

Esta primeira versão não inclui formulários com envio, autenticação ou integração de doações.