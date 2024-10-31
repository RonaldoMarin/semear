-- CreateTable
CREATE TABLE "usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "data_nascimento" DATETIME NOT NULL,
    "telefone" TEXT NOT NULL,
    "igreja" TEXT NOT NULL,
    "data_cadastro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "responsavel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome_responsavel" TEXT NOT NULL,
    "telefone_responsavel" TEXT NOT NULL,
    "dependente_id" INTEGER NOT NULL,
    CONSTRAINT "responsavel_dependente_id_fkey" FOREIGN KEY ("dependente_id") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cpf_key" ON "usuarios"("cpf");
