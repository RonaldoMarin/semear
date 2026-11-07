# Projeto Semear

Landing page institucional para apresentar a missão do Projeto Semear no Nordeste brasileiro e convidar pessoas a conhecer, orar, participar e contribuir.

## Estrutura

```
src/
├── app/
│   ├── layout.tsx     # layout raiz (fontes, metadados)
│   ├── globals.css    # tokens de cor/tipografia e utilitários
│   ├── (site)/        # páginas públicas com cabeçalho e rodapé
│   │   └── page.tsx   # home institucional
│   │                  # futuras: (site)/inscricoes, (site)/loja, (site)/minha-conta
│   └── admin/         # painel: (auth)/login e cadastro, (painel)/eventos e usuarios, actions/
├── components/
│   ├── site/          # cabeçalho, rodapé e logo (compartilhados)
│   ├── landing/       # seções da home (cada uma com seu .module.css)
│   ├── admin/         # layout do painel, assistente de eventos, usuários
│   └── ui/            # peças reutilizáveis (ícones)
├── lib/               # conteúdo (content.ts), db, auth/ e eventos/
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

- Edite `src/lib/content.ts` para trocar textos, números, menu e links oficiais.
- A foto do topo vem de `hero.image` em `src/lib/content.ts`.
- Os logos recortados (versão normal e clara para fundo escuro) ficam em `public/images/marca/`.
- Defina `NEXT_PUBLIC_SITE_URL` antes de publicar para que os metadados sociais usem o domínio final.

## Banco de dados

### Banco de testes local

Para desenvolver sem um banco na nuvem, há um PostgreSQL embutido. Num terminal (deixe aberto):

```bash
npm run db
```

E em outro terminal, `npm run dev`. Os dados ficam em `.pgdata/` (fora do git) e continuam lá entre uma execução e outra.
Na primeira vez (pasta `.pgdata/` vazia), crie as tabelas com `npx prisma migrate deploy`.

### Banco real

O projeto usa Prisma ORM. Crie um arquivo `.env` a partir de `.env.example` e rode:

```bash
npm run prisma:migrate
npm run prisma:generate
```

Em produção, aplique as migrações com `npx prisma migrate deploy` (não use `migrate dev` no banco real).

## Painel administrativo (`/admin`)

- **Quem cria conta:** só os e-mails listados em `ADMIN_EMAILS` (entram como Administrador) e as pessoas que um administrador liberar em **Usuários**. Qualquer outro e-mail é recusado em `/admin/cadastro`.
- **Permissões:**
  - **Acesso básico:** vê o painel e os eventos.
  - **Voluntário:** cria e edita eventos, que ficam como rascunho; não publica nem exclui.
  - **Administrador:** acesso total (status, exclusão e usuários).
- **Eventos:** o assistente tem 8 passos: dados gerais, datas e vagas, local e mídia, valores, programação, perguntas da inscrição, contatos e check-list, e revisão. As perguntas da inscrição começam iguais às do formulário do Google da missão (`src/lib/eventos/defaults.ts`).
- **Segurança:** senhas com scrypt; sessão em cookie httpOnly, com só o hash do token salvo no banco. As permissões são checadas no servidor em cada página e action (`src/lib/auth`).

## Plano Mantenedor

- Página pública em `/mantenedor`, com QR Code e "Pix copia e cola" gerados a partir de `src/lib/mantenedor.ts` (valor sugerido, chave e textos).
- **Convite automático:** 1 dia depois do fim de cada evento, os inscritos **confirmados** recebem por e-mail o convite para o plano. Cada pessoa recebe uma vez só; eventos que terminaram há mais de 14 dias são ignorados.
  - Enquanto o site está no ar, um agendador interno confere de hora em hora (`src/instrumentation.ts`).
  - Também dá para disparar pela rota `GET /api/tarefas/convite-mantenedor` com o cabeçalho `Authorization: Bearer <CRON_SECRET>` (a senha não é aceita na URL, para não ir parar em logs), por exemplo num cron da hospedagem. Nesse caso, defina `AGENDADOR_INTERNO=desligado`.
  - Prévia do e-mail: `/admin/emails?tipo=mantenedor`.

## Verificação

```bash
npm run lint
npm run typecheck
npm run build
```