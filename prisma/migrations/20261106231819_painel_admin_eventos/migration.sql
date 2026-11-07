-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('ACESSO', 'VOLUNTARIO', 'ADM');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('VIAGEM_MISSIONARIA', 'TREINAMENTO', 'ENCONTRO', 'EVANGELISMO', 'ARRECADACAO', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusEvento" AS ENUM ('RASCUNHO', 'EM_BREVE', 'INSCRICOES_ABERTAS', 'INSCRICOES_ENCERRADAS', 'REALIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoPergunta" AS ENUM ('TEXTO_CURTO', 'PARAGRAFO', 'EMAIL', 'TELEFONE', 'CPF', 'DATA', 'ESCOLHA_UNICA', 'MULTIPLA_ESCOLHA');

-- CreateTable
CREATE TABLE "contatos" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lido_em" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "contatos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT,
    "papel" "Papel" NOT NULL DEFAULT 'ACESSO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_acesso_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessoes" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "expira_em" TIMESTAMP(3) NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "subtitulo" TEXT,
    "edicao" TEXT,
    "tipo" "TipoEvento" NOT NULL DEFAULT 'VIAGEM_MISSIONARIA',
    "status" "StatusEvento" NOT NULL DEFAULT 'RASCUNHO',
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "resumo" TEXT,
    "sobre" TEXT,
    "data_inicio" TIMESTAMP(3) NOT NULL,
    "data_fim" TIMESTAMP(3) NOT NULL,
    "inscricao_inicio" TIMESTAMP(3),
    "inscricao_fim" TIMESTAMP(3),
    "vagas" INTEGER,
    "idade_minima" INTEGER,
    "requisitos" TEXT,
    "imagem_url" TEXT,
    "video_url" TEXT,
    "valor_inscricao_centavos" INTEGER,
    "valor_pre_inscricao_centavos" INTEGER,
    "prazo_pre_inscricao_dias" INTEGER,
    "informacoes_pagamento" TEXT,
    "politica_cancelamento" TEXT,
    "checklist" TEXT,
    "criado_por_id" TEXT,
    "atualizado_por_id" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_locais" (
    "id" TEXT NOT NULL,
    "evento_id" TEXT NOT NULL,
    "etapa" TEXT,
    "nome" TEXT NOT NULL,
    "endereco" TEXT,
    "cidade" TEXT,
    "uf" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "eventos_locais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_programacao" (
    "id" TEXT NOT NULL,
    "evento_id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3),
    "descricao" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "eventos_programacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_perguntas" (
    "id" TEXT NOT NULL,
    "evento_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "ajuda" TEXT,
    "tipo" "TipoPergunta" NOT NULL,
    "opcoes" TEXT[],
    "obrigatoria" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "eventos_perguntas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_contatos" (
    "id" TEXT NOT NULL,
    "evento_id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "funcao" TEXT,
    "telefone" TEXT NOT NULL,
    "whatsapp" BOOLEAN NOT NULL DEFAULT true,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "eventos_contatos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessoes_token_hash_key" ON "sessoes"("token_hash");

-- CreateIndex
CREATE INDEX "sessoes_usuario_id_idx" ON "sessoes"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "eventos_slug_key" ON "eventos"("slug");

-- CreateIndex
CREATE INDEX "eventos_status_data_inicio_idx" ON "eventos"("status", "data_inicio");

-- AddForeignKey
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_criado_por_id_fkey" FOREIGN KEY ("criado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_atualizado_por_id_fkey" FOREIGN KEY ("atualizado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_locais" ADD CONSTRAINT "eventos_locais_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_programacao" ADD CONSTRAINT "eventos_programacao_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_perguntas" ADD CONSTRAINT "eventos_perguntas_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_contatos" ADD CONSTRAINT "eventos_contatos_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
