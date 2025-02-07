/*
  Warnings:

  - Added the required column `email` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "evento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome_evento" TEXT NOT NULL,
    "data_evento" DATETIME NOT NULL,
    "local_evento" TEXT NOT NULL,
    "id_formulario" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "inscricao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "evento_id" INTEGER NOT NULL,
    "data_inscricao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantidade_camisas" INTEGER,
    "observacoes" TEXT,
    "experiencia_missionaria" TEXT,
    "experiencia_evangelistica" TEXT,
    "nome_pastor" TEXT,
    "telefone_pastor" TEXT,
    "area_atuacao_igreja" TEXT,
    "tamanho_camisa" TEXT,
    CONSTRAINT "inscricao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inscricao_evento_id_fkey" FOREIGN KEY ("evento_id") REFERENCES "evento" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "data_nascimento" DATETIME NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "igreja" TEXT NOT NULL,
    "data_cadastro" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" DATETIME NOT NULL
);
INSERT INTO "new_usuarios" ("cpf", "data_atualizacao", "data_cadastro", "data_nascimento", "id", "igreja", "nome", "telefone") SELECT "cpf", "data_atualizacao", "data_cadastro", "data_nascimento", "id", "igreja", "nome", "telefone" FROM "usuarios";
DROP TABLE "usuarios";
ALTER TABLE "new_usuarios" RENAME TO "usuarios";
CREATE UNIQUE INDEX "usuarios_cpf_key" ON "usuarios"("cpf");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
