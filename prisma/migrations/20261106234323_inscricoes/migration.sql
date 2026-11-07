-- CreateEnum
CREATE TYPE "StatusInscricao" AS ENUM ('PENDENTE', 'CONFIRMADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "inscricoes" (
    "id" TEXT NOT NULL,
    "evento_id" TEXT NOT NULL,
    "status" "StatusInscricao" NOT NULL DEFAULT 'PENDENTE',
    "nome" TEXT,
    "email" TEXT,
    "cpf" TEXT,
    "telefone" TEXT,
    "respostas" JSONB NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscricoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inscricoes_evento_id_status_idx" ON "inscricoes"("evento_id", "status");

-- CreateIndex
CREATE INDEX "inscricoes_evento_id_cpf_idx" ON "inscricoes"("evento_id", "cpf");

-- CreateIndex
CREATE INDEX "inscricoes_evento_id_email_idx" ON "inscricoes"("evento_id", "email");

-- AddForeignKey
ALTER TABLE "inscricoes" ADD CONSTRAINT "inscricoes_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "eventos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
