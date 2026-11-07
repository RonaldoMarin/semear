-- CreateTable
CREATE TABLE "redefinicoes_senha" (
    "id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "expira_em" TIMESTAMP(3) NOT NULL,
    "usado_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "redefinicoes_senha_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "redefinicoes_senha_token_hash_key" ON "redefinicoes_senha"("token_hash");

-- CreateIndex
CREATE INDEX "redefinicoes_senha_usuario_id_criado_em_idx" ON "redefinicoes_senha"("usuario_id", "criado_em");

-- AddForeignKey
ALTER TABLE "redefinicoes_senha" ADD CONSTRAINT "redefinicoes_senha_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
